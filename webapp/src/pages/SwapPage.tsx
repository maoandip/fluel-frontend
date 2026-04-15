import { Component, Show, createSignal, createMemo, createEffect, onCleanup } from "solid-js";
import { useApp } from "../stores/app";
import { balances, refetchBalances } from "../stores/balances";
import { showToast } from "../stores/toast";
import { postQuote, postConfirm, getSwapStatus } from "../api";
import { BackButton, haptic } from "../telegram";
import { NATIVE_TOKEN, type QuoteResponse } from "../types";
import ChainSelectorModal from "../components/ChainSelectorModal";
import TokenChainIcon from "../components/TokenChainIcon";
import s from "./SwapPage.module.css";

type SelectorTarget = "from" | "to" | null;
type SwapProgress = "confirming" | "pending" | "done" | "failed";

const DEBOUNCE_MS = 500;
const QUOTE_TTL_MS = 30_000;
const STATUS_POLL_MS = 4_000;

const SwapPage: Component = () => {
  const { chains, receiveChains, destinationAddress, setDestinationAddress } = useApp();

  const savedFrom = localStorage.getItem("fluel:fromChain") ?? "";
  const savedTo = localStorage.getItem("fluel:toChain") ?? "";
  const [fromChain, setFromChain] = createSignal(savedFrom);
  const [toChain, setToChain] = createSignal(savedTo);
  const [destInput, setDestInput] = createSignal("");
  const [destSaving, setDestSaving] = createSignal(false);
  const [destEditing, setDestEditing] = createSignal(false);
  const [amount, setAmount] = createSignal("");
  const [quoteData, setQuoteData] = createSignal<QuoteResponse | null>(null);
  const [quoting, setQuoting] = createSignal(false);
  const [quoteAge, setQuoteAge] = createSignal(0);
  const [txHash, setTxHash] = createSignal("");
  const [progress, setProgress] = createSignal<SwapProgress | null>(null);
  const [statusMsg, setStatusMsg] = createSignal("");
  const [selectorOpen, setSelectorOpen] = createSignal<SelectorTarget>(null);

  // Persist chain selections and auto-select defaults
  const DEFAULT_FROM = ["Base", "Arbitrum", "Polygon", "OP Mainnet", "Ethereum"];
  const DEFAULT_TO = ["Ethereum", "Arbitrum", "Base", "OP Mainnet", "Polygon"];

  createEffect(() => {
    const pay = chains();
    const recv = receiveChains();
    if (pay.length > 0) {
      const cur = fromChain();
      // Clear saved value if it's no longer valid
      if (cur && !pay.some(c => c.name === cur)) setFromChain("");
      if (!fromChain()) {
        const match = DEFAULT_FROM.find(name => pay.some(c => c.name === name));
        if (match) setFromChain(match);
      }
    }
    if (recv.length > 0) {
      const cur = toChain();
      if (cur && !recv.some(c => c.name === cur)) setToChain("");
      if (!toChain()) {
        const from = fromChain();
        const match = DEFAULT_TO.find(name => name !== from && recv.some(c => c.name === name));
        if (match) setToChain(match);
      }
    }
  });

  createEffect(() => { const v = fromChain(); if (v) localStorage.setItem("fluel:fromChain", v); });
  createEffect(() => { const v = toChain(); if (v) localStorage.setItem("fluel:toChain", v); });

  let debounceTimer: ReturnType<typeof setTimeout> | undefined;
  let abortController: AbortController | undefined;
  let quoteVersion = 0;
  let quoteAgeTimer: ReturnType<typeof setInterval> | undefined;
  let statusPollTimer: ReturnType<typeof setInterval> | undefined;


  onCleanup(() => {
    clearTimeout(debounceTimer);
    clearInterval(quoteAgeTimer);
    clearInterval(statusPollTimer);
    abortController?.abort();
    BackButton.hide();
  });

  const fromBalance = createMemo(() => {
    const b = balances();
    if (!b) return undefined;
    const chain = chains().find(c => c.name === fromChain());
    if (!chain) return undefined;
    const tokens = b[String(chain.id)];
    if (!tokens) return undefined;
    const stable = tokens.find(t => t.address.toLowerCase() !== NATIVE_TOKEN);
    if (!stable || stable.amount === "0") return undefined;
    const human = Number(BigInt(stable.amount)) / 10 ** stable.decimals;
    return human > 0 ? String(human) : undefined;
  });

  const canQuote = createMemo(() => {
    const a = parseFloat(amount());
    return fromChain() && toChain() && fromChain() !== toChain() && a > 0;
  });

  // ── Auto-quote with freshness tracking ──

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
    if (!canQuote()) { setQuoteData(null); return; }
    abortController?.abort();
    abortController = new AbortController();
    const version = ++quoteVersion;
    setQuoting(true);
    try {
      const quote = await postQuote(amount(), fromChain(), toChain(), abortController.signal);
      if (version === quoteVersion) {
        setQuoteData(quote);
        startQuoteAge();
      }
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      if (version === quoteVersion) setQuoteData(null);
    } finally {
      if (version === quoteVersion) setQuoting(false);
    }
  }

  function scheduleQuote() {
    clearTimeout(debounceTimer);
    clearInterval(quoteAgeTimer);
    setQuoteData(null);
    if (!canQuote()) { setQuoting(false); return; }
    setQuoting(true);
    debounceTimer = setTimeout(fetchQuote, DEBOUNCE_MS);
  }

  createEffect(() => { amount(); fromChain(); toChain(); scheduleQuote(); });

  // ── Post-swap status polling ──

  function startStatusPoll(hash: string) {
    clearInterval(statusPollTimer);
    statusPollTimer = setInterval(async () => {
      try {
        const res = await getSwapStatus(hash);
        setStatusMsg(res.message || res.substatus || res.status);
        const st = res.status.toLowerCase();
        if (st === "done" || st === "completed") {
          clearInterval(statusPollTimer);
          setProgress("done");
          haptic("success");
          refetchBalances();
        } else if (st === "failed") {
          clearInterval(statusPollTimer);
          setProgress("failed");
          haptic("error");
        }
      } catch {
        // keep polling on network errors
      }
    }, STATUS_POLL_MS);
  }

  // ── Actions ──

  function setMax() {
    const b = fromBalance();
    if (b) { setAmount(b); haptic("light"); }
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
    setProgress("confirming");
    try {
      const result = await postConfirm();
      setTxHash(result.txHash);
      setProgress("pending");
      setStatusMsg("Transaction submitted...");
      startStatusPoll(result.txHash);
    } catch (err: any) {
      showToast(err.message || "Swap failed");
      setProgress(null);
      haptic("error");
    }
  }

  function resetSwap() {
    setAmount(""); setQuoteData(null); setTxHash(""); setProgress(null);
    setStatusMsg(""); clearInterval(statusPollTimer); clearInterval(quoteAgeTimer);
    refetchBalances(); BackButton.hide();
  }

  function retrySwap() {
    setTxHash(""); setProgress(null); setStatusMsg("");
    clearInterval(statusPollTimer);
    scheduleQuote();
  }

  createEffect(() => {
    if (progress()) BackButton.show(resetSwap);
    else BackButton.hide();
  });

  // ── Chain selector ──

  const getPayChain = (name: string) => chains().find(c => c.name === name);
  const getReceiveChain = (name: string) => receiveChains().find(c => c.name === name);
  function openSelector(target: "from" | "to") { haptic("light"); setSelectorOpen(target); }
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

  async function saveDestination() {
    const addr = destInput().trim();
    if (!isValidAddress(addr)) { showToast("Invalid Ethereum address"); haptic("error"); return; }
    setDestSaving(true);
    try {
      await setDestinationAddress(addr);
      setDestInput("");
      setDestEditing(false);
      haptic("success");
      showToast("Destination wallet saved");
    } catch (err: any) { showToast(err.message || "Failed"); haptic("error"); }
    finally { setDestSaving(false); }
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
        <div class={s.destIndicator} onClick={() => { setDestEditing(true); haptic("light"); }}>
          <span class={s.destIndicatorLabel}>To wallet</span>
          <span class={s.destIndicatorAddr}>{destinationAddress().slice(0, 6)}...{destinationAddress().slice(-4)} &#9998;</span>
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
          {/* Confirming / Pending — spinner */}
          <Show when={progress() === "confirming" || progress() === "pending"}>
            <div class={s.progressSpinner} />
            <h3>{progress() === "confirming" ? "Confirming..." : "Swapping"}</h3>
            <p class={s.statusText}>{statusMsg() || "Waiting for confirmation..."}</p>
            <Show when={txHash()}>
              <div class={s.hash}>{txHash()}</div>
            </Show>
          </Show>

          {/* Done */}
          <Show when={progress() === "done"}>
            <div class={s.progressIconSuccess}>
              <svg viewBox="0 0 24 24" stroke="#3CE3AB"><path d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3>Swap Complete</h3>
            <p class={s.statusText}>{statusMsg() || "Your gas has arrived!"}</p>
            <div class={s.hash}>{txHash()}</div>
            <button class={s.actionBtn} onClick={resetSwap}>New Swap</button>
          </Show>

          {/* Failed */}
          <Show when={progress() === "failed"}>
            <div class={s.progressIconFail}>
              <svg viewBox="0 0 24 24" stroke="#F23674"><path d="M18 6L6 18M6 6l12 12" /></svg>
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
