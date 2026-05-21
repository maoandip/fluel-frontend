import { createSignal } from "solid-js";
import { getTxState, getSwapStatus, ApiError } from "../api";
import { showToast } from "./toast";
import { revalidateNow } from "../lib/refresh";
import { haptic } from "../lib/telegram";

// In-flight swaps store.
//
// A swap's journey is two halves: submission (fast — the form waits for it)
// and settlement (slow — cross-chain bridging). Once submitted, a swap is
// handed here. This store polls each one to completion in the background, so
// the user is free to compose another swap immediately. The list is persisted
// to localStorage so a swap survives the Mini App being closed and reopened.

export interface InFlightSwap {
  submitId: string;
  fromChain: string;
  toChain: string;
  /** USDC committed — held against the source-chain balance until settled. */
  amountUsdc: number;
  toSymbol: string;
  /** On-chain hash once known; "" while still resolving. */
  txHash: string;
  /** epoch ms — drives the poll deadline and stale-entry pruning. */
  startedAt: number;
}

const STORAGE_KEY = "fluel:inflight-swaps";
const POLL_DEADLINE_MS = 3 * 60_000;
const STALE_MS = 30 * 60_000;
const LONG_POLL_SEC = 30;
const POLL_RETRY_MS = 1_000;
const MAX_BACKOFF_MS = 30_000;
const TERMINAL_TX = new Set(["confirmed", "completed", "done"]);
const FAILED_TX = new Set(["failed", "reverted", "error"]);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Delay before retrying a failed poll request. A 429 carries the server's
// Retry-After — honor it exactly. Any other failure (network blip, 5xx) gets
// exponential backoff so a persistent error can't become a 1/sec retry storm
// that itself sustains the rate limit.
function retryDelayMs(err: unknown, attempt: number): number {
  if (err instanceof ApiError && err.retryAfter !== undefined) {
    return err.retryAfter * 1000;
  }
  return Math.min(POLL_RETRY_MS * 2 ** attempt, MAX_BACKOFF_MS);
}

function loadPersisted(): InFlightSwap[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as InFlightSwap[];
    if (!Array.isArray(list)) return [];
    // Drop entries old enough that the backend reconciler has long resolved
    // them — they live on in History, not here.
    const now = Date.now();
    return list.filter((s) => s && typeof s.submitId === "string" && now - s.startedAt < STALE_MS);
  } catch {
    return [];
  }
}

const persisted = loadPersisted();
const [swaps, setSwaps] = createSignal<InFlightSwap[]>(persisted);

/** Reactive list of swaps still settling in the background. */
export const inFlightSwaps = swaps;

function write(next: InFlightSwap[]): void {
  setSwaps(next);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage full / unavailable — the list still works in-memory */
  }
}

function patch(submitId: string, fields: Partial<InFlightSwap>): void {
  write(swaps().map((s) => (s.submitId === submitId ? { ...s, ...fields } : s)));
}

function remove(submitId: string): void {
  write(swaps().filter((s) => s.submitId !== submitId));
}

/** Total USDC committed to still-settling swaps from a given chain. The swap
 * form subtracts this from the wallet balance so funds can't be double-spent. */
export function inFlightUsdc(chainName: string): number {
  const key = chainName.toLowerCase();
  return swaps()
    .filter((s) => s.fromChain.toLowerCase() === key)
    .reduce((sum, s) => sum + s.amountUsdc, 0);
}

/** Begin tracking a freshly-submitted swap; it polls to completion on its own. */
export function trackSwap(swap: Omit<InFlightSwap, "startedAt">): void {
  const entry: InFlightSwap = { ...swap, startedAt: Date.now() };
  write([...swaps().filter((s) => s.submitId !== entry.submitId), entry]);
  void poll(entry);
}

function settle(submitId: string, outcome: "done" | "failed" | "slow", message: string): void {
  remove(submitId);
  if (outcome === "done") haptic("success");
  else if (outcome === "failed") haptic("error");
  showToast(message);
  // Balances and history both move when a swap settles.
  void revalidateNow(["balances", "history"]);
}

async function poll(swap: InFlightSwap): Promise<void> {
  const deadline = swap.startedAt + POLL_DEADLINE_MS;
  let txHash = swap.txHash;
  let errors = 0; // consecutive failures — drives backoff, reset on success

  // Phase 1 — wait for the on-chain hash. Always make at least one attempt
  // (a swap resumed from a previous session may already be well past it).
  while (!txHash) {
    try {
      const res = await getTxState(swap.submitId, LONG_POLL_SEC);
      errors = 0;
      const st = res.status.toLowerCase();
      if (res.txHash) {
        txHash = res.txHash;
        patch(swap.submitId, { txHash });
        break;
      }
      if (TERMINAL_TX.has(st)) return settle(swap.submitId, "done", "Swap complete — gas delivered.");
      if (FAILED_TX.has(st)) return settle(swap.submitId, "failed", "A swap failed. See History for details.");
    } catch (err) {
      if (Date.now() >= deadline) break;
      await sleep(retryDelayMs(err, errors++));
      continue;
    }
    if (Date.now() >= deadline) break;
  }
  if (!txHash) {
    return settle(swap.submitId, "slow", "A swap is taking longer than usual — track it in History.");
  }

  // Phase 2 — wait for cross-chain settlement.
  errors = 0;
  for (;;) {
    try {
      const res = await getSwapStatus(txHash, LONG_POLL_SEC);
      errors = 0;
      const st = res.status.toLowerCase();
      if (st === "done" || st === "completed") return settle(swap.submitId, "done", "Swap complete — gas delivered.");
      if (st === "failed") return settle(swap.submitId, "failed", "A swap failed. See History for details.");
    } catch (err) {
      if (Date.now() >= deadline) break;
      await sleep(retryDelayMs(err, errors++));
      continue;
    }
    if (Date.now() >= deadline) break;
  }
  settle(swap.submitId, "slow", "A swap is taking longer than usual — track it in History.");
}

// Resume polling for swaps persisted from a previous session. poll() drives
// the list through setSwaps, which works regardless of call site — this
// one-time module-init kick-off is intentional, not a tracked scope.
// eslint-disable-next-line solid/reactivity
for (const s of persisted) void poll(s);
