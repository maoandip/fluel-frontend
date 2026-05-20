import { Component, Show, createSignal, createMemo, createEffect, onCleanup } from "solid-js";
import { createAsync, revalidate } from "@solidjs/router";
import { useMachine } from "@xstate/solid";
import { useApp } from "../stores/app";
import { balancesQuery, refetchBalances } from "../stores/balances";
import { showToast } from "../stores/toast";
import { postQuote, postConfirm, getSwapStatus, getTxState } from "../api";
import { haptic } from "../lib/telegram";
import { NATIVE_TOKEN } from "../types";
import { useLocalStorage } from "../lib/hooks/useLocalStorage";
import { swapMachine } from "../lib/machines/swap";
import ChainSelectorModal from "../components/chain/ChainSelectorModal";
import TokenChainIcon from "../components/chain/TokenChainIcon";
import s from "./SwapPage.module.css";

type SelectorTarget = "from" | "to" | null;

const DEBOUNCE_MS = 500;
const QUOTE_TTL_MS = 30_000;
const LONG_POLL_SEC = 30;
const POLL_RETRY_MS = 1_000;
const TERMINAL_TX_STATUSES = new Set(["confirmed", "completed", "done"]);
const FAILED_TX_STATUSES = new Set(["failed", "reverted", "error"]);

const SwapPage: Component = () => {
  const { chains, receiveChains, destinationAddress, setDestinationAddress } = useApp();
  const balances = createAsync(() => balancesQuery().then((b) => b.balances));

  // ── Machine: source of truth for swap-flow state ──
  const [state, send] = useMachine(swapMachine);

  // Derived accessors so the JSX can keep reading quoteData(), progress(), etc.
  const quoteData = () => state.context.quote;
  const quoting = () => state.matches("quoting");
  const txHash = () => state.context.txHash;
  const statusMsg = () => state.context.statusMsg;
  const progress = (): "confirming" | "submitting" | "pending" | "done" | "failed" | null => {
    if (state.matches("confirming")) return "confirming";
    if (state.matches("submitting")) return "submitting";
    if (state.matches("pending")) return "pending";
    if (state.matches("done")) return "done";
    if (state.matches("failed")) return "failed";
    return null;
  };

  // ── User inputs (regular signals) ──
  const [fromChain, setFromChain] = useLocalStorage<string>("fluel:fromChain", "");
  const [toChain, setToChain] = useLocalStorage<string>("fluel:toChain", "");
  const [destInput, setDestInput] = createSignal("");
  const [destSaving, setDestSaving] = createSignal(false);
  const [destEditing, setDestEditing] = createSignal(false);
  const [amount, setAmount] = createSignal("");
  const [quoteAge, setQuoteAge] = createSignal(0);
  const [selectorOpen, setSelectorOpen] = createSignal<SelectorTarget>(null);

  // Default chain selection on first load
  const DEFAULT_FROM = ["Base", "Arbitrum", "Polygon", "OP Mainnet", "Ethereum"];
  const DEFAULT_TO = ["Ethereum", "Arbitrum", "Base", "OP Mainnet", "Polygon"];

  // ?chain={chainId} arrives from gas-alert bot notifications. Treat the
  // alerted chain as the destination (toChain); fall back to fromChain if
  // it isn't a valid receive chain.
  const initialUrlChainId = (() => {
    if (typeof window === "undefined") return null;
    const v = parseInt(new URLSearchParams(window.location.search).get("chain") ?? "", 10);
    if (isNaN(v)) return null;
    const url = new URL(window.location.href);
    url.searchParams.delete("chain");
    window.history.replaceState({}, "", url.toString());
    return v;
  })();
  let urlChainConsumed = false;

  createEffect(() => {
    const pay = chains();
    const recv = receiveChains();

    if (!urlChainConsumed && initialUrlChainId !== null && (pay.length > 0 || recv.length > 0)) {
      const recvMatch = recv.find((c) => c.id === initialUrlChainId);
      if (recvMatch) {
        setToChain(recvMatch.name);
      } else {
        const payMatch = pay.find((c) => c.id === initialUrlChainId);
        if (payMatch) setFromChain(payMatch.name);
      }
      urlChainConsumed = true;
    }

    // Clear a stale selection only if the chain no longer exists. A same-chain
    // selection is left intact — it's a valid swap. The defaults below still
    // seed *different* from/to chains for a fresh user.
    if (pay.length > 0) {
      const cur = fromChain();
      if (cur && !pay.some((c) => c.name === cur)) setFromChain("");
      if (!fromChain()) {
        const to = toChain();
        const match = DEFAULT_FROM.find((name) => name !== to && pay.some((c) => c.name === name));
        if (match) setFromChain(match);
      }
    }
    if (recv.length > 0) {
      const cur = toChain();
      if (cur && !recv.some((c) => c.name === cur)) setToChain("");
      if (!toChain()) {
        const from = fromChain();
        const match = DEFAULT_TO.find((name) => name !== from && recv.some((c) => c.name === name));
        if (match) setToChain(match);
      }
    }
  });

  // ── Quote fetch orchestration ──
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;
  let abortController: AbortController | undefined;
  let quoteVersion = 0;
  let quoteAgeTimer: ReturnType<typeof setInterval> | undefined;
  let txStateAbort: AbortController | undefined;
  let statusAbort: AbortController | undefined;

  function stopTxStatePoll() { txStateAbort?.abort(); txStateAbort = undefined; }
  function stopStatusPoll() { statusAbort?.abort(); statusAbort = undefined; }

  onCleanup(() => {
    clearTimeout(debounceTimer);
    clearInterval(quoteAgeTimer);
    stopTxStatePoll();
    stopStatusPoll();
    abortController?.abort();
  });

  const fromBalance = createMemo(() => {
    const b = balances();
    if (!b) return undefined;
    const chain = chains().find((c) => c.name === fromChain());
    if (!chain) return undefined;
    const tokens = b[String(chain.id)];
    if (!tokens) return undefined;
    const stable = tokens.find((t) => t.address.toLowerCase() !== NATIVE_TOKEN);
    if (!stable || stable.amount === "0") return undefined;
    const human = Number(BigInt(stable.amount)) / 10 ** stable.decimals;
    return human > 0 ? String(human) : undefined;
  });

  // Same-chain swaps are allowed (e.g. USDC -> native gas on one chain) —
  // LI.FI treats them as a plain DEX swap. Only require both chains + amount.
  const canQuote = createMemo(() => {
    const a = parseFloat(amount());
    return fromChain() && toChain() && a > 0;
  });

  function startQuoteAge() {
    clearInterval(quoteAgeTimer);
    setQuoteAge(0);
    quoteAgeTimer = setInterval(() => {
      const age = quoteAge() + 1;
      setQuoteAge(age);
      if (age * 1000 >= QUOTE_TTL_MS && canQuote() && !quoting()) {
        fetchQuote();
      }
    }, 1000);
  }

  async function fetchQuote() {
    if (!canQuote()) {
      send({ type: "CLEAR" });
      return;
    }
    abortController?.abort();
    abortController = new AbortController();
    const version = ++quoteVersion;
    send({ type: "QUOTE_REQUEST" });
    try {
      const quote = await postQuote(amount(), fromChain(), toChain(), abortController.signal);
      if (version === quoteVersion) {
        send({ type: "QUOTE_SUCCESS", quote });
        startQuoteAge();
      }
    } catch (err: unknown) {
      if ((err as { name?: string })?.name === "AbortError") return;
      if (version === quoteVersion) {
        const msg = err instanceof Error ? err.message : "Quote failed";
        send({ type: "QUOTE_FAILURE", error: msg });
      }
    }
  }

  function scheduleQuote() {
    clearTimeout(debounceTimer);
    clearInterval(quoteAgeTimer);
    if (!canQuote()) {
      send({ type: "CLEAR" });
      return;
    }
    send({ type: "QUOTE_REQUEST" });
    debounceTimer = setTimeout(fetchQuote, DEBOUNCE_MS);
  }

  createEffect(() => {
    amount();
    fromChain();
    toChain();
    scheduleQuote();
  });

  // ── Post-swap long-poll loops ──
  // Phase 1 polls /api/tx until txHash arrives; phase 2 polls /api/status
  // for LI.FI substatus until the swap settles. Each loop owns an
  // AbortController so cleanup/reset/retry can cancel an in-flight request.

  function isAborted(err: unknown): boolean {
    return (err as { name?: string })?.name === "AbortError";
  }

  async function startTxStatePoll(submitId: string) {
    stopTxStatePoll();
    const ctl = new AbortController();
    txStateAbort = ctl;
    while (!ctl.signal.aborted) {
      try {
        const res = await getTxState(submitId, LONG_POLL_SEC, ctl.signal);
        if (ctl.signal.aborted) return;
        const st = res.status.toLowerCase();
        if (res.txHash) {
          send({ type: "TX_HASH_READY", txHash: res.txHash });
          startStatusPoll(res.txHash);
          return;
        }
        if (TERMINAL_TX_STATUSES.has(st)) {
          send({ type: "STATUS_DONE" });
          haptic("success");
          refetchBalances();
          revalidate("history");
          return;
        }
        if (FAILED_TX_STATUSES.has(st)) {
          send({ type: "STATUS_FAILED", message: res.status });
          haptic("error");
          return;
        }
        // Long-poll timed out with no transition — loop and re-issue.
      } catch (err) {
        if (isAborted(err)) return;
        await new Promise((r) => setTimeout(r, POLL_RETRY_MS));
      }
    }
  }

  async function startStatusPoll(hash: string) {
    stopStatusPoll();
    const ctl = new AbortController();
    statusAbort = ctl;
    while (!ctl.signal.aborted) {
      try {
        const res = await getSwapStatus(hash, LONG_POLL_SEC, ctl.signal);
        if (ctl.signal.aborted) return;
        const msg = res.message || res.substatus || res.status;
        const st = res.status.toLowerCase();
        if (st === "done" || st === "completed") {
          send({ type: "STATUS_DONE", message: msg });
          haptic("success");
          refetchBalances();
          revalidate("history");
          return;
        }
        if (st === "failed") {
          send({ type: "STATUS_FAILED", message: msg });
          haptic("error");
          return;
        }
        send({ type: "STATUS_UPDATE", message: msg });
      } catch (err) {
        if (isAborted(err)) return;
        await new Promise((r) => setTimeout(r, POLL_RETRY_MS));
      }
    }
  }

  // ── Actions ──
  function setMax() {
    const b = fromBalance();
    if (b) {
      setAmount(b);
      haptic("light");
    }
  }

  async function handleConfirm() {
    if (!quoteData()) return;
    const bal = fromBalance();
    const amt = parseFloat(amount());
    if (!bal || parseFloat(bal) < amt) {
      showToast("Insufficient USDC balance");
      haptic("error");
      return;
    }
    send({ type: "CONFIRM" });
    try {
      const result = await postConfirm();
      send({ type: "SUBMIT_ACCEPTED", submitId: result.submitId });
      // Synchronous txHash means an idempotent hit on an already-submitted swap.
      if (result.txHash) {
        send({ type: "TX_HASH_READY", txHash: result.txHash });
        startStatusPoll(result.txHash);
      } else {
        startTxStatePoll(result.submitId);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Swap failed";
      showToast(msg);
      send({ type: "CONFIRM_FAILURE", error: msg });
      haptic("error");
    }
  }

  function resetSwap() {
    setAmount("");
    stopStatusPoll();
    stopTxStatePoll();
    clearInterval(quoteAgeTimer);
    send({ type: "RESET" });
    refetchBalances();
  }

  function retrySwap() {
    stopStatusPoll();
    stopTxStatePoll();
    send({ type: "RESET" });
    scheduleQuote();
  }

  // ── Chain selector ──
  const getPayChain = (name: string) => chains().find((c) => c.name === name);
  const getReceiveChain = (name: string) => receiveChains().find((c) => c.name === name);
  function openSelector(target: "from" | "to") {
    haptic("light");
    setSelectorOpen(target);
  }
  function handleSelectorSelect(name: string) {
    const target = selectorOpen();
    if (target === "from") setFromChain(name);
    else if (target === "to") setToChain(name);
    setSelectorOpen(null);
  }

  const PayChainPill = () => {
    const c = () => getPayChain(fromChain());
    return (
      <button class={s.chainPill} onClick={() => openSelector("from")}>
        <TokenChainIcon
          tokenIcon={c()?.stableIcon}
          tokenSymbol="USDC"
          chainIcon={c()?.icon}
          size={28}
          badgeSize={12}
        />
        <div class={s.chainPillText}>
          <span class={s.chainName}>USDC</span>
          <span class={s.chainSub} title={fromChain()}>{fromChain()}</span>
        </div>
        <svg class={s.chainChevron} width="14" height="14" viewBox="0 0 256 256" fill="currentColor"><path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"/></svg>
      </button>
    );
  };

  const ReceiveChainPill = () => {
    const c = () => getReceiveChain(toChain());
    return (
      <button class={s.chainPill} onClick={() => openSelector("to")}>
        <TokenChainIcon
          tokenIcon={c()?.nativeIcon}
          tokenSymbol={c()?.native ?? "?"}
          chainIcon={c()?.icon}
          size={28}
          badgeSize={12}
        />
        <div class={s.chainPillText}>
          <span class={s.chainName}>{c()?.native?.toUpperCase() || "Select"}</span>
          <span class={s.chainSub} title={toChain()}>{toChain()}</span>
        </div>
        <svg class={s.chainChevron} width="14" height="14" viewBox="0 0 256 256" fill="currentColor"><path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"/></svg>
      </button>
    );
  };

  // ── Display values ──
  const quoteDisplay = createMemo(() => {
    const q = quoteData();
    const isQuoting = quoting();
    if (!q || isQuoting) {
      return { receiveAmount: "", receiveSymbol: "", receiveUsd: "", exchangeRate: "", freshSeconds: -1 };
    }
    const usdVal = q.toAmountUsd ? parseFloat(q.toAmountUsd) : 0;
    const amt = parseFloat(amount());
    const to = parseFloat(q.toAmount);
    const rate = amt && to && !isNaN(amt) && !isNaN(to) ? `1 USDC ≈ ${(to / amt).toFixed(6)} ${q.toSymbol}` : "";
    return {
      receiveAmount: q.toAmount ?? "",
      receiveSymbol: q.toSymbol ?? "",
      receiveUsd: usdVal > 0 ? `~$${usdVal.toFixed(2)}` : "",
      exchangeRate: rate,
      freshSeconds: Math.max(0, Math.ceil((QUOTE_TTL_MS / 1000) - quoteAge())),
    };
  });

  const isValidAddress = (addr: string) => /^0x[0-9a-fA-F]{40}$/.test(addr);

  async function copyDestination(e: MouseEvent) {
    e.stopPropagation();
    const addr = destinationAddress();
    if (!addr) return;
    try {
      await navigator.clipboard.writeText(addr);
      haptic("light");
      showToast("Destination address copied");
    } catch {
      showToast("Failed to copy");
    }
  }

  async function saveDestination() {
    const addr = destInput().trim();
    if (!isValidAddress(addr)) {
      showToast("Invalid Ethereum address");
      haptic("error");
      return;
    }
    setDestSaving(true);
    try {
      await setDestinationAddress(addr);
      setDestInput("");
      setDestEditing(false);
      haptic("success");
      showToast("Destination wallet saved");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed";
      showToast(msg);
      haptic("error");
    } finally {
      setDestSaving(false);
    }
  }

  return (
    <div class="page">
      {/* ── DESTINATION WALLET SETUP / EDIT ── */}
      <Show when={!destinationAddress() || destEditing()}>
        <div class={s.destCard}>
          <div class={s.destLabel}>{destinationAddress() ? "Change destination wallet" : "Set your destination wallet"}</div>
          <div class={s.destHint}>Gas tokens will be sent directly to this address</div>
          <input
            class={s.destInput}
            type="text"
            placeholder="0x..."
            value={destInput()}
            onInput={(e) => setDestInput(e.currentTarget.value)}
          />
          <button class={s.cta} onClick={saveDestination} disabled={destSaving() || !destInput().trim()}>
            {destSaving() ? "Saving..." : "Save Wallet"}
          </button>
          <Show when={destinationAddress()}>
            <button class={s.destCancel} onClick={() => { setDestEditing(false); setDestInput(""); }}>
              Cancel
            </button>
          </Show>
        </div>
      </Show>

      {/* ── FORM ── */}
      <Show when={!progress() && destinationAddress() && !destEditing()}>
        {/* Destination */}
        <div
          class={s.destIndicator}
          onClick={() => { setDestEditing(true); haptic("light"); }}
          role="button"
          aria-label="Edit destination wallet"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setDestEditing(true); haptic("light"); } }}
        >
          <div class={s.destIndicatorDot} />
          <div class={s.destIndicatorInfo}>
            <span class={s.destIndicatorLabel}>To Wallet</span>
            <span class={s.destIndicatorAddr}>
              {destinationAddress().slice(0, 6)}...{destinationAddress().slice(-4)}
            </span>
          </div>
          <button
            type="button"
            class={s.destIndicatorIconBtn}
            onClick={copyDestination}
            aria-label="Copy destination address"
            title="Copy address"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
          <span class={s.destIndicatorIcon} aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
          </span>
        </div>

        <div class={s.card}>
          {/* Pay */}
          <div class={s.tokenBoxPay}>
            <div class={s.tokenInput}>
              <div class={s.tokenInputLabel}>
                <span>You pay</span>
              </div>
              <div class={s.tokenRow}>
                <div class={s.tokenAmount}>
                  <input
                    class={s.tokenAmountInput}
                    type="number"
                    inputmode="decimal"
                    placeholder="0.00"
                    value={amount()}
                    onInput={(e) => setAmount(e.currentTarget.value)}
                  />
                </div>
                <PayChainPill />
              </div>
              <Show when={fromBalance()}>
                <div class={s.usdValue}>
                  Balance: <b class={s.balanceMax} onClick={setMax}>{fromBalance()} USDC</b>
                </div>
              </Show>
            </div>
          </div>

          {/* Receive */}
          <div class={s.tokenBoxReceive}>
            <div class={s.tokenInput}>
              <div class={s.tokenInputLabel}>
                <span>You get</span>
              </div>
              <div class={s.tokenRow}>
                <div class={s.tokenAmount}>
                  <Show when={quoting() && canQuote()}>
                    <div class={s.quotingDots}><span /><span /><span /></div>
                  </Show>
                  <Show when={!quoting() || !canQuote()}>
                    <div class={quoteDisplay().receiveAmount ? s.receiveValue : s.receiveValueEmpty}>
                      {quoteDisplay().receiveAmount || "—"}
                    </div>
                  </Show>
                </div>
                <ReceiveChainPill />
              </div>
              <Show when={quoteDisplay().receiveUsd}>
                <div class={s.usdValue}>{quoteDisplay().receiveUsd}</div>
              </Show>
            </div>
          </div>
        </div>

        {/* Quote details */}
        <Show when={quoteData() && !quoting()}>
          <div class={s.quoteBox}>
            {/* Exchange rate + freshness */}
            <div class={s.quoteRateRow}>
              <span class={s.quoteRate}>{quoteDisplay().exchangeRate}</span>
              <div class={s.quoteFreshness}>
                <button class={s.quoteRefreshBtn} onClick={() => { fetchQuote(); haptic("light"); }} title="Refresh quote">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
                </button>
                <Show when={quoteDisplay().freshSeconds > 5} fallback={
                  <div class={s.quoteRefreshSpinner} />
                }>
                  <span class={s.quoteFreshnessDot} />
                  <span>{quoteDisplay().freshSeconds}s</span>
                </Show>
              </div>
            </div>

            {/* Stats: gas | fee | via | time */}
            <div class={s.quoteStats}>
              <div class={s.quoteStatsLeft}>
                <div class={s.quoteStat}>
                  <svg width="13" height="13" viewBox="0 0 256 256" fill="currentColor"><path d="M241,69.66,221.66,50.34a8,8,0,0,0-11.32,11.32L229.66,81A8,8,0,0,1,232,86.63V168a8,8,0,0,1-16,0V128a24,24,0,0,0-24-24H176V56a24,24,0,0,0-24-24H72A24,24,0,0,0,48,56V208H32a8,8,0,0,0,0,16H192a8,8,0,0,0,0-16H176V120h16a8,8,0,0,1,8,8v40a24,24,0,0,0,48,0V86.63A23.85,23.85,0,0,0,241,69.66ZM64,56a8,8,0,0,1,8-8h80a8,8,0,0,1,8,8v72a8,8,0,0,1-8,8H72a8,8,0,0,1-8-8Z"/></svg>
                  <span class={s.quoteStatValue}>{parseFloat(quoteData()!.gasCostUsd) < 0.01 ? "<$0.01" : `$${quoteData()!.gasCostUsd}`}</span>
                </div>
                <div class={s.quoteDivider} />
                <div class={s.quoteStat}>
                  <svg width="13" height="13" viewBox="0 0 256 256" fill="currentColor"><path d="M152,120H136V56h8a32,32,0,0,1,32,32,8,8,0,0,0,16,0,48.05,48.05,0,0,0-48-48h-8V24a8,8,0,0,0-16,0V40h-8A48,48,0,0,0,104,136h16v64H112a32,32,0,0,1-32-32,8,8,0,0,0-16,0,48.05,48.05,0,0,0,48,48h8v16a8,8,0,0,0,16,0V216h8a48,48,0,0,0,0-96Zm-48,0a32,32,0,0,1,0-64h16v64Zm48,80H136V136h16a32,32,0,0,1,0,64Z"/></svg>
                  <span class={s.quoteStatValue}>{parseFloat(quoteData()!.feeCostUsd) === 0 ? "Free" : parseFloat(quoteData()!.feeCostUsd) < 0.01 ? "<$0.01" : `$${quoteData()!.feeCostUsd}`}</span>
                </div>
                <div class={s.quoteDivider} />
                <div class={s.quoteStat}>
                  <Show when={quoteData()!.toolIcon} fallback={
                    <svg width="13" height="13" viewBox="0 0 256 256" fill="currentColor"><path d="M229.66,189.66l-32,32a8,8,0,0,1-11.32,0l-32-32a8,8,0,0,1,11.32-11.32L184,196.69V128A40,40,0,0,0,144,88H48a8,8,0,0,1,0-16h96a56.06,56.06,0,0,1,56,56v68.69l18.34-18.35a8,8,0,0,1,11.32,11.32Z"/></svg>
                  }>
                    <img class={s.toolIcon} src={quoteData()!.toolIcon!} alt="" />
                  </Show>
                  <span class={s.quoteStatValue}>{quoteData()!.tool}</span>
                </div>
              </div>
              <div class={s.quoteStat}>
                <svg width="13" height="13" viewBox="0 0 256 256" fill="currentColor"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"/></svg>
                <span class={s.quoteStatValue}>{quoteData()!.executionDuration}s</span>
              </div>
            </div>
          </div>
        </Show>

        <button
          class={s.cta}
          onClick={handleConfirm}
          disabled={!quoteData() || quoting() || !!progress()}
        >
          {!fromChain() || !toChain() ? "Select chains" : quoting() ? "Getting price..." : quoteData() ? "Swap" : "Enter amount"}
        </button>
      </Show>

      {/* ── PROGRESS / RESULT ── */}
      <Show when={progress()}>
        <div class={s.swapProgress}>
          {/* Confirming / Submitting / Pending — spinner */}
          <Show when={progress() === "confirming" || progress() === "submitting" || progress() === "pending"}>
            <div class={s.progressSpinner} />
            <h3>
              {progress() === "confirming"
                ? "Confirming..."
                : progress() === "submitting"
                  ? "Submitting"
                  : "Swapping"}
            </h3>
            <p class={s.statusText}>{statusMsg() || "Waiting for confirmation..."}</p>
            <Show when={txHash()}>
              <div class={s.hash}>{txHash()}</div>
            </Show>
          </Show>

          {/* Done */}
          <Show when={progress() === "done"}>
            <div class={s.progressIconSuccess}>
              <svg viewBox="0 0 24 24" stroke="currentColor"><path d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3>Swap Complete</h3>
            <p class={s.statusText}>{statusMsg() || "Your gas has arrived!"}</p>
            <div class={s.hash}>{txHash()}</div>
            <button class={s.actionBtn} onClick={resetSwap}>New Swap</button>
          </Show>

          {/* Failed */}
          <Show when={progress() === "failed"}>
            <div class={s.progressIconFail}>
              <svg viewBox="0 0 24 24" stroke="currentColor"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </div>
            <h3>Swap Failed</h3>
            <p class={s.statusText}>{statusMsg() || "Something went wrong"}</p>
            <Show when={txHash()}>
              <div class={s.hash}>{txHash()}</div>
            </Show>
            <button class={s.actionBtn} onClick={retrySwap}>Try Again</button>
            <button class={s.actionBtnSecondary} onClick={resetSwap}>New Swap</button>
          </Show>
        </div>
      </Show>

      <Show when={selectorOpen()}>
        <ChainSelectorModal
          chains={selectorOpen() === "from" ? chains() : receiveChains()}
          value={selectorOpen() === "from" ? fromChain() : toChain()}
          onSelect={handleSelectorSelect}
          onClose={() => setSelectorOpen(null)}
        />
      </Show>
    </div>
  );
};

export default SwapPage;
