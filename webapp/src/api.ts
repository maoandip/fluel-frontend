import * as v from "valibot";
import { tg } from "./lib/telegram";
import type {
  GasAlert,
  AutoRefill,
  GasPriceData,
  ReferralStats,
  Gift,
} from "./types";
import {
  SessionResponseSchema,
  ChainsResponseSchema,
  BalancesResponseSchema,
  QuoteResponseSchema,
  SwapStatusSchema,
  ConfirmResponseSchema,
  TxStateResponseSchema,
  DestinationResponseSchema,
  GasPricesResponseSchema,
  AlertListResponseSchema,
  AlertCreateResponseSchema,
  AlertDeleteResponseSchema,
  RefillListResponseSchema,
  RefillCreateResponseSchema,
  RefillDeleteResponseSchema,
  ReferralStatsResponseSchema,
  GiftListResponseSchema,
  GiftCreateResponseSchema,
  WithdrawResponseSchema,
  LifiHistoryResponseSchema,
} from "./lib/schemas";

// ── Fetch wrapper ──────────────────────────────────────────────────

import { env } from "./config/env";
const API_BASE = env.VITE_API_BASE;

export class ApiError extends Error {
  status: number;
  /** Seconds the server asked us to wait, if it sent a Retry-After header. */
  retryAfter?: number;
  constructor(message: string, status: number, retryAfter?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

// Backend emits Retry-After as seconds, never as an HTTP-date.
function parseRetryAfter(header: string | null): number | undefined {
  if (!header) return undefined;
  const n = parseInt(header, 10);
  if (!isNaN(n) && n >= 0 && n <= 600) return n;
  return undefined;
}

// Optional response schema — if provided, the JSON body is validated at the
// seam and a shape mismatch throws a developer-friendly error (with the
// offending issues logged to the console for observability).
async function api<T>(
  path: string,
  options: RequestInit = {},
  schema?: v.GenericSchema<T>,
): Promise<T> {
  const headers: Record<string, string> = {
    "X-Telegram-Init-Data": tg.initData,
    ...((options.headers as Record<string, string>) ?? {}),
  };

  if (options.body && typeof options.body === "string") {
    headers["Content-Type"] = "application/json";
  }

  const isIdempotent = !options.method || options.method.toUpperCase() === "GET";

  let res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  // Single 429 retry for GETs only — POST/DELETE could double-mutate.
  if (res.status === 429 && isIdempotent && !options.signal?.aborted) {
    const waitSec = parseRetryAfter(res.headers.get("Retry-After")) ?? 1;
    await new Promise((resolve) => setTimeout(resolve, waitSec * 1000));
    if (!options.signal?.aborted) {
      res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    const retryAfter = res.status === 429
      ? parseRetryAfter(res.headers.get("Retry-After"))
      : undefined;
    throw new ApiError(body.error ?? `HTTP ${res.status}`, res.status, retryAfter);
  }

  const data = await res.json();

  if (schema) {
    try {
      return v.parse(schema, data);
    } catch (err) {
      if (v.isValiError(err)) {
        const issues = err.issues
          .map((i) => `${i.path?.map((p) => p.key).join(".") ?? "<root>"}: ${i.message}`)
          .join("; ");
        console.error(`[api] ${path} response shape mismatch:`, err.issues);
        throw new Error(`Server returned unexpected data for ${path}: ${issues}`);
      }
      throw err;
    }
  }

  return data as T;
}

// ── Session ────────────────────────────────────────────────────────

export function getSession() {
  return api("/api/session", {}, SessionResponseSchema);
}

export function setDestination(address: string) {
  return api(
    "/api/destination",
    {
      method: "POST",
      body: JSON.stringify({ address }),
    },
    DestinationResponseSchema,
  );
}

// ── Chains ─────────────────────────────────────────────────────────

export function getChains() {
  return api("/api/chains", {}, ChainsResponseSchema);
}

// ── Balances ───────────────────────────────────────────────────────

export function getBalances() {
  return api("/api/balances", {}, BalancesResponseSchema);
}

// ── Quote ──────────────────────────────────────────────────────────

export function postQuote(amount: string, fromChain: string, toChain: string, signal?: AbortSignal) {
  return api(
    "/api/quote",
    {
      method: "POST",
      body: JSON.stringify({ amount, fromChain, toChain }),
      signal,
    },
    QuoteResponseSchema,
  );
}

// ── Confirm ────────────────────────────────────────────────────────

export type ConfirmResponse = v.InferOutput<typeof ConfirmResponseSchema>;

export function postConfirm() {
  return api("/api/confirm", { method: "POST" }, ConfirmResponseSchema);
}

// ── Tx state polling ──────────────────────────────────────────────
// /api/confirm returns before the on-chain hash is known. Poll /api/tx by
// submitId; pass waitSec to long-poll (server caps at 30s).

export type TxStateResponse = v.InferOutput<typeof TxStateResponseSchema>;

export function getTxState(submitId: string, waitSec = 0, signal?: AbortSignal) {
  const wait = waitSec > 0 ? `&wait=${waitSec}` : "";
  return api(
    `/api/tx?submitId=${encodeURIComponent(submitId)}${wait}`,
    { signal },
    TxStateResponseSchema,
  );
}

// ── Swap status ───────────────────────────────────────────────────

export type SwapStatus = v.InferOutput<typeof SwapStatusSchema>;

export function getSwapStatus(txHash: string, waitSec = 0, signal?: AbortSignal) {
  const wait = waitSec > 0 ? `&wait=${waitSec}` : "";
  return api(
    `/api/status?txHash=${encodeURIComponent(txHash)}${wait}`,
    { signal },
    SwapStatusSchema,
  );
}

// ── LI.FI history ──────────────────────────────────────────────────

export interface LifiToken {
  address: string;
  chainId: number;
  symbol: string;
  decimals: number;
  name: string;
  logoURI?: string;
  priceUSD?: string;
}

export interface LifiTransferStep {
  txHash: string;
  txLink: string;
  token: LifiToken;
  chainId: number;
  amount: string;
  amountUSD: string;
  gasAmountUSD?: string;
  timestamp: number;
}

export interface LifiTransfer {
  transactionId: string;
  sending: LifiTransferStep;
  receiving: LifiTransferStep;
  lifiExplorerLink: string;
  fromAddress: string;
  toAddress: string;
  tool: string;
  status: string;
  substatus?: string;
  substatusMessage?: string;
}

export interface LifiHistoryResponse {
  transfers: LifiTransfer[];
}

export function getLifiHistory(page = 1, pageSize = 20) {
  // The schema only validates the envelope — LI.FI transfer inner shapes
  // change over time and are consumed loosely by HistoryPage. The cast is
  // safe because LifiHistoryResponseSchema confirms `transfers` is an array;
  // element typing is enforced by TS at the call site via LifiTransfer.
  return api("/api/lifi-history?page=" + page + "&pageSize=" + pageSize, {}, LifiHistoryResponseSchema) as Promise<LifiHistoryResponse>;
}

// ── Gas prices ─────────────────────────────────────────────────────

export function getGasPrices() {
  return api("/api/gas-prices", {}, GasPricesResponseSchema) as Promise<GasPriceData>;
}

// ── Alerts ─────────────────────────────────────────────────────────

export function getAlerts() {
  return api("/api/alerts", {}, AlertListResponseSchema) as Promise<{ alerts: GasAlert[] }>;
}

export function postAlert(chain: string, thresholdGwei: number) {
  // Backend returns { ok: true } — not the alert object. Callers await this
  // for the side effect; nothing reads the return value.
  return api(
    "/api/alerts",
    {
      method: "POST",
      body: JSON.stringify({ chain, thresholdGwei }),
    },
    AlertCreateResponseSchema,
  );
}

export function deleteAlert(chain: string) {
  // Backend reads `chain` from the query string, not the request body.
  return api(
    `/api/alerts?chain=${encodeURIComponent(chain)}`,
    { method: "DELETE" },
    AlertDeleteResponseSchema,
  );
}

// ── Auto-refills ───────────────────────────────────────────────────

export function getRefills() {
  return api("/api/refills", {}, RefillListResponseSchema) as Promise<{ refills: AutoRefill[] }>;
}

export function postRefill(
  chain: string, threshold: number, amount: number, sourceChain: string,
  maxPerDay: number, cooldownMinutes: number,
) {
  // Backend returns { refill: AutoRefill } — envelope, not the bare object.
  return api(
    "/api/refills",
    {
      method: "POST",
      body: JSON.stringify({ chain, threshold, amount, sourceChain, maxPerDay, cooldownMinutes }),
    },
    RefillCreateResponseSchema,
  );
}

export function deleteRefill(chain: string) {
  // Same query-string convention as deleteAlert.
  return api(
    `/api/refills?chain=${encodeURIComponent(chain)}`,
    { method: "DELETE" },
    RefillDeleteResponseSchema,
  );
}

// ── Referrals ─────────────────────────────────────────────────────

export function getReferralStats() {
  return api("/api/referrals", {}, ReferralStatsResponseSchema) as Promise<ReferralStats & { refLink: string }>;
}

// ── Gifts ─────────────────────────────────────────────────────────

export function getGifts() {
  return api("/api/gifts", {}, GiftListResponseSchema) as Promise<{ gifts: Gift[] }>;
}

export function postGift(amountUsd: number, chain: string) {
  return api(
    "/api/gifts",
    {
      method: "POST",
      body: JSON.stringify({ amountUsd, chain }),
    },
    GiftCreateResponseSchema,
  ) as Promise<{ gift: Gift }>;
}

// ── Withdraw ─────────────────────────────────────────────────────

export interface WithdrawResult {
  txHash: string;
  chainId: number;
  chainName: string;
  amount: string;
  symbol: string;
}

// No args → withdraw every chain with a balance. With chains → withdraw only
// that subset. The backend does it in one request, one on-chain tx per chain.
export function postWithdraw(chains?: string[]) {
  return api(
    "/api/withdraw",
    {
      method: "POST",
      body: JSON.stringify(chains && chains.length > 0 ? { chains } : {}),
    },
    WithdrawResponseSchema,
  ) as Promise<{ withdrawals: WithdrawResult[] }>;
}
