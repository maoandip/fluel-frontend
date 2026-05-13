import {
  Component, Show, For, Suspense, ErrorBoundary,
  createSignal, createEffect, on, onMount, onCleanup,
} from "solid-js";
import { createAsync, revalidate } from "@solidjs/router";
import { useApp } from "../stores/app";
import { showToast } from "../stores/toast";
import { haptic, showConfirm } from "../lib/telegram";
import { postAlert, deleteAlert, postRefill, deleteRefill } from "../api";
import { fmtSmallEl, gweiLevel } from "../lib/format";
import { queries } from "../lib/queries";
import EmptyState from "../components/ui/EmptyState";
import Skeleton from "../components/ui/Skeleton";
import QueryErrorFallback from "../components/ui/QueryErrorFallback";
import ChainPicker from "../components/chain/ChainPicker";
import s from "./AutomatePage.module.css";

const refetchGasPrices = () => revalidate("gasPrices");
const refetchAlerts = () => revalidate("alerts");
const refetchRefills = () => revalidate("refills");

type Section = "alerts" | "refill";
const TOP_CHAINS = 10;

const AutomatePage: Component = () => {
  const { chains } = useApp();

  const [section, setSection] = createSignal<Section>("alerts");
  const [showAllPrices, setShowAllPrices] = createSignal(false);
  const gasPrices = createAsync(() => queries.gasPrices());
  const alerts = createAsync(() => queries.alerts());
  const [alertChain, setAlertChain] = createSignal("");
  const [alertThreshold, setAlertThreshold] = createSignal("");
  const [alertLoading, setAlertLoading] = createSignal(false);

  const refills = createAsync(() => queries.refills());
  const [refillGasChain, setRefillGasChain] = createSignal("");
  const [refillSourceChain, setRefillSourceChain] = createSignal("");
  const [refillThreshold, setRefillThreshold] = createSignal("");
  const [refillAmount, setRefillAmount] = createSignal("");
  const [refillMaxPerDay, setRefillMaxPerDay] = createSignal("10");
  const [refillCooldownMin, setRefillCooldownMin] = createSignal("30");
  const [refillLoading, setRefillLoading] = createSignal(false);

  const [isRefreshing, setIsRefreshing] = createSignal(false);
  const [isStale, setIsStale] = createSignal(false);
  const STALE_AFTER_MS = 5 * 60_000;
  let staleTimer: ReturnType<typeof setTimeout> | undefined;

  async function refreshGasPrices() {
    if (isRefreshing()) return;
    setIsRefreshing(true);
    try { await refetchGasPrices(); }
    finally { setIsRefreshing(false); }
  }

  createEffect(() => {
    if (!gasPrices()) return;
    setIsStale(false);
    clearTimeout(staleTimer);
    staleTimer = setTimeout(() => setIsStale(true), STALE_AFTER_MS);
  });

  createEffect(on(section, (s) => {
    if (s === "alerts") refreshGasPrices();
  }, { defer: true }));

  const onVisibility = () => {
    if (document.visibilityState === "visible" && section() === "alerts") {
      refreshGasPrices();
    }
  };

  onMount(() => {
    const c = chains();
    if (c.length > 0) {
      setAlertChain(c[0].name);
      setRefillGasChain(c[0].name);
      setRefillSourceChain(c.length > 1 ? c[1].name : c[0].name);
    }
    document.addEventListener("visibilitychange", onVisibility);
  });

  onCleanup(() => {
    clearTimeout(staleTimer);
    document.removeEventListener("visibilitychange", onVisibility);
  });

  async function handleCreateAlert() {
    const chain = alertChain();
    const threshold = parseFloat(alertThreshold());
    if (!chain || isNaN(threshold) || threshold <= 0) { showToast("Enter a valid chain and gwei threshold"); return; }
    setAlertLoading(true);
    try {
      await postAlert(chain, threshold);
      setAlertThreshold(""); haptic("success"); showToast("Alert created"); refetchAlerts();
    } catch (err: any) { showToast(err.message || "Failed"); haptic("error"); }
    finally { setAlertLoading(false); }
  }

  async function handleDeleteAlert(chainName: string) {
    if (!(await showConfirm(`Remove gas alert for ${chainName}?`))) return;
    try { await deleteAlert(chainName); haptic("success"); showToast("Alert removed"); refetchAlerts(); }
    catch (err: any) { showToast(err.message || "Failed"); haptic("error"); }
  }

  async function handleCreateRefill() {
    const gasChain = refillGasChain(), sourceChain = refillSourceChain();
    const threshold = parseFloat(refillThreshold()), amount = parseFloat(refillAmount());
    const maxPerDay = parseInt(refillMaxPerDay(), 10);
    const cooldownMin = parseInt(refillCooldownMin(), 10);
    if (!gasChain || !sourceChain || isNaN(threshold) || threshold <= 0 || isNaN(amount) || amount <= 0) { showToast("Fill in all fields"); return; }
    if (isNaN(maxPerDay) || maxPerDay < 1) { showToast("Max per day must be at least 1"); return; }
    if (isNaN(cooldownMin) || cooldownMin < 5) { showToast("Cooldown must be at least 5 minutes"); return; }
    setRefillLoading(true);
    try {
      await postRefill(gasChain, threshold, amount, sourceChain, maxPerDay, cooldownMin);
      setRefillThreshold(""); setRefillAmount(""); haptic("success"); showToast("Auto-refill created"); refetchRefills();
    } catch (err: any) { showToast(err.message || "Failed"); haptic("error"); }
    finally { setRefillLoading(false); }
  }

  async function handleDeleteRefill(chainName: string) {
    if (!(await showConfirm(`Remove auto-refill for ${chainName}?`))) return;
    try { await deleteRefill(chainName); haptic("success"); showToast("Refill removed"); refetchRefills(); }
    catch (err: any) { showToast(err.message || "Failed"); haptic("error"); }
  }

  const tileLevelClass = { low: "gasTileLow", mid: "gasTileMid", high: "gasTileHigh" } as const;
  const tileValueClass = { low: "gasTileValueLow", mid: "gasTileValueMid", high: "gasTileValueHigh" } as const;

  const nativeSymbolFor = (chainName: string) =>
    chains().find((c) => c.name === chainName)?.native?.toUpperCase() || "native";

  // Treat the count as 0 when the backend's stored date is from a prior day —
  // the backend resets on the next fire, not on the read path.
  const firesTodayCount = (refill: { firesToday: number; firesTodayDate: number }) => {
    const d = new Date();
    const todayEpoch = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 1000;
    return refill.firesTodayDate === todayEpoch ? refill.firesToday : 0;
  };

  return (
    <div class="page">
      {/* Segmented toggle */}
      <div class="segment-toggle">
        <button class={`segment-btn ${section() === "alerts" ? "active" : ""}`}
          onClick={() => { setSection("alerts"); haptic("selection"); }}>Gas Alerts</button>
        <button class={`segment-btn ${section() === "refill" ? "active" : ""}`}
          onClick={() => { setSection("refill"); haptic("selection"); }}>Auto-Refill</button>
      </div>

      {/* ═══ GAS ALERTS ═══ */}
      <Show when={section() === "alerts"}>
        <ErrorBoundary fallback={(err, reset) => (
          <QueryErrorFallback err={err} reset={reset} label="gas prices" refetch={refetchGasPrices} />
        )}>
        <Suspense fallback={<div class={s.card}><Skeleton rows={3} /></div>}>
        <Show when={gasPrices()}>
          {(() => {
            const data = gasPrices()!;
            const sorted = () => [...data.chains]
              .filter((c) => data.prices[c.id] != null)
              .sort((a, b) => (data.prices[a.id] ?? 0) - (data.prices[b.id] ?? 0));
            const display = () => showAllPrices() ? sorted() : sorted().slice(0, TOP_CHAINS);
            const total = () => sorted().length;

            return (
              <div class={s.card}>
                <div class={s.cardHeader}>
                  <div>
                    <div class={s.label}>Current Gas Prices</div>
                    <Show when={isStale()} fallback={<div class={s.hint}>Sorted by cheapest gas</div>}>
                      <div class={s.staleHint}>Stale — tap refresh</div>
                    </Show>
                  </div>
                  <div class={s.headerActions}>
                    <button
                      class={`${s.refreshBtn} ${isRefreshing() ? s.refreshBtnSpinning : ""}`}
                      onClick={() => { refreshGasPrices(); haptic("light"); }}
                      disabled={isRefreshing()}
                      title="Refresh gas prices"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
                    </button>
                    <Show when={total() > TOP_CHAINS}>
                      <button class={s.toggleBtn} onClick={() => { setShowAllPrices(!showAllPrices()); haptic("selection"); }}>
                        {showAllPrices() ? "Show less" : `All ${total()}`}
                      </button>
                    </Show>
                  </div>
                </div>
                <div class={s.gasGrid}>
                  <For each={display()}>
                    {(chain) => {
                      const priceGwei = data.prices[chain.id] ?? 0;
                      const level = gweiLevel(priceGwei);
                      return (
                        <div class={`${s.gasTile} ${s[tileLevelClass[level]]}`}>
                          <div class={s.gasTileHeader}>
                            <Show when={chain.icon}>
                              <img class={s.gasTileIcon} src={chain.icon!} alt="" loading="lazy" />
                            </Show>
                            <span class={s.gasTileChain}>{chain.name}</span>
                          </div>
                          <span class={`${s.gasTileValue} ${s[tileValueClass[level]]}`}>{fmtSmallEl(priceGwei)}</span>
                          <span class={s.gasTileUnit}>gwei</span>
                        </div>
                      );
                    }}
                  </For>
                </div>
              </div>
            );
          })()}
        </Show>
        </Suspense>
        </ErrorBoundary>

        {/* Create alert */}
        <div class={s.card}>
          <div class={s.label}>Set Gas Alert</div>
          <div class={s.hint}>Get notified when gas drops below your threshold</div>
          <div class={s.formRow}>
            <div class={s.flexItem}>
              <ChainPicker chains={chains()} value={alertChain()} onChange={setAlertChain} label="Chain" />
            </div>
            <div class={`${s.inputGroup} ${s.flexItem}`}>
              <label class={s.inputLabel}>Threshold (gwei)</label>
              <input class={s.input} type="text" inputMode="decimal" placeholder="e.g. 20"
                value={alertThreshold()} onInput={(e) => setAlertThreshold(e.currentTarget.value)} />
            </div>
          </div>
          <button class={s.cta} onClick={handleCreateAlert}
            disabled={alertLoading() || !alertChain() || !alertThreshold()}>
            {alertLoading() ? "Creating..." : "Set Alert"}
          </button>
        </div>

        {/* Alert list */}
        <ErrorBoundary fallback={(err, reset) => (
          <QueryErrorFallback err={err} reset={reset} label="alerts" refetch={refetchAlerts} />
        )}>
        <Suspense fallback={<div class={s.card}><Skeleton rows={2} /></div>}>
        <Show when={alerts() && alerts()!.length === 0}>
          <EmptyState icon={<span>&#128276;</span>} message="No gas alerts" hint="Create an alert to get notified when gas prices drop." />
        </Show>
        <Show when={alerts() && alerts()!.length > 0}>
          <div class={s.card}>
            <div class={s.label}>Your Alerts</div>
            <div class="item-list">
              <For each={alerts()}>
                {(alert) => (
                  <div class="list-item">
                    <div class="list-item-info">
                      <span class="list-item-primary">{alert.chainName}</span>
                      <span class="list-item-secondary">Below {fmtSmallEl(alert.thresholdGwei)} gwei</span>
                    </div>
                    <button class="remove-btn" onClick={() => handleDeleteAlert(alert.chainName)}>Remove</button>
                  </div>
                )}
              </For>
            </div>
          </div>
        </Show>
        </Suspense>
        </ErrorBoundary>
      </Show>

      {/* ═══ AUTO-REFILL ═══ */}
      <Show when={section() === "refill"}>
        <div class={s.card}>
          <div class={s.label}>Create Auto-Refill</div>
          <div class={s.hint}>Automatically swap USDC for gas when your balance drops</div>
          <div class={`${s.formRow} ${s.formRowSpaced}`}>
            <div class={s.flexItem}>
              <ChainPicker chains={chains()} value={refillGasChain()} onChange={setRefillGasChain} label="Gas Chain" />
            </div>
            <div class={s.flexItem}>
              <ChainPicker chains={chains()} value={refillSourceChain()} onChange={setRefillSourceChain} label="Source Chain" />
            </div>
          </div>
          <div class={`${s.formRow} ${s.formRowSpaced}`}>
            <div class={s.inputGroup}>
              <label class={s.inputLabel}>Threshold ({nativeSymbolFor(refillGasChain())})</label>
              <input class={s.input} type="text" inputMode="decimal" placeholder="e.g. 0.005"
                value={refillThreshold()} onInput={(e) => setRefillThreshold(e.currentTarget.value)} />
            </div>
            <div class={s.inputGroup}>
              <label class={s.inputLabel}>Refill (USD)</label>
              <input class={s.input} type="text" inputMode="decimal" placeholder="e.g. 5"
                value={refillAmount()} onInput={(e) => setRefillAmount(e.currentTarget.value)} />
            </div>
          </div>
          <div class={s.formRow}>
            <div class={s.inputGroup}>
              <label class={s.inputLabel}>Max per day</label>
              <input class={s.input} type="text" inputMode="numeric" placeholder="10"
                value={refillMaxPerDay()} onInput={(e) => setRefillMaxPerDay(e.currentTarget.value)} />
            </div>
            <div class={s.inputGroup}>
              <label class={s.inputLabel}>Cooldown (min)</label>
              <input class={s.input} type="text" inputMode="numeric" placeholder="30"
                value={refillCooldownMin()} onInput={(e) => setRefillCooldownMin(e.currentTarget.value)} />
            </div>
          </div>
          <button class={s.cta} onClick={handleCreateRefill}
            disabled={refillLoading() || !refillGasChain() || !refillSourceChain() || !refillThreshold() || !refillAmount() || !refillMaxPerDay() || !refillCooldownMin()}>
            {refillLoading() ? "Creating..." : "Create Refill"}
          </button>
        </div>

        <ErrorBoundary fallback={(err, reset) => (
          <QueryErrorFallback err={err} reset={reset} label="refills" refetch={refetchRefills} />
        )}>
        <Suspense fallback={<div class={s.card}><Skeleton rows={2} /></div>}>
        <Show when={refills() && refills()!.length === 0}>
          <EmptyState icon={<span>&#9889;</span>} message="No auto-refills" hint="Set up automatic gas refills to never run out." />
        </Show>
        <Show when={refills() && refills()!.length > 0}>
          <div class={s.card}>
            <div class={s.label}>Your Refills</div>
            <div class="item-list">
              <For each={refills()}>
                {(refill) => (
                  <div class="list-item">
                    <div class="list-item-info">
                      <span class="list-item-primary">{refill.chainName}</span>
                      <span class="list-item-secondary">
                        Below {fmtSmallEl(refill.thresholdNative)} {nativeSymbolFor(refill.chainName)}, refill ${refill.refillAmountUsd} from {refill.sourceChainName}
                      </span>
                      <span class="list-item-secondary">
                        Today {firesTodayCount(refill)}/{refill.maxPerDay} · {refill.cooldownMinutes} min cooldown
                      </span>
                    </div>
                    <button class="remove-btn" onClick={() => handleDeleteRefill(refill.chainName)}>Remove</button>
                  </div>
                )}
              </For>
            </div>
          </div>
        </Show>
        </Suspense>
        </ErrorBoundary>
      </Show>
    </div>
  );
};

export default AutomatePage;
