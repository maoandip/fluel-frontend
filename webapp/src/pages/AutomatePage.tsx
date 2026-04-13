import {
  Component, Show, For,
  createSignal, createResource, onMount, onCleanup,
} from "solid-js";
import { useApp } from "../stores/app";
import { showToast } from "../stores/toast";
import { haptic, showConfirm } from "../telegram";
import {
  getGasPrices, getAlerts, postAlert, deleteAlert,
  getRefills, postRefill, deleteRefill,
} from "../api";
import { fmtGwei, gweiLevel } from "../lib/format";
import type { GasAlert, AutoRefill, GasPriceData } from "../types";
import EmptyState from "../components/EmptyState";
import Skeleton from "../components/Skeleton";
import ChainPicker from "../components/ChainPicker";
import s from "./AutomatePage.module.css";

type Section = "alerts" | "refill";
const TOP_CHAINS = 10;

const AutomatePage: Component = () => {
  const { chains } = useApp();

  const [section, setSection] = createSignal<Section>("alerts");
  const [showAllPrices, setShowAllPrices] = createSignal(false);
  const [gasPrices, { refetch: refetchGasPrices }] = createResource<GasPriceData>(() => getGasPrices());
  const [alerts, { refetch: refetchAlerts }] = createResource<GasAlert[]>(async () => (await getAlerts()).alerts);
  const [alertChain, setAlertChain] = createSignal("");
  const [alertThreshold, setAlertThreshold] = createSignal("");
  const [alertLoading, setAlertLoading] = createSignal(false);

  const [refills, { refetch: refetchRefills }] = createResource<AutoRefill[]>(async () => (await getRefills()).refills);
  const [refillGasChain, setRefillGasChain] = createSignal("");
  const [refillSourceChain, setRefillSourceChain] = createSignal("");
  const [refillThreshold, setRefillThreshold] = createSignal("");
  const [refillAmount, setRefillAmount] = createSignal("");
  const [refillLoading, setRefillLoading] = createSignal(false);

  let gasPriceTimer: ReturnType<typeof setInterval> | undefined;

  onMount(() => {
    const c = chains();
    if (c.length > 0) {
      setAlertChain(c[0].name);
      setRefillGasChain(c[0].name);
      setRefillSourceChain(c.length > 1 ? c[1].name : c[0].name);
    }
    gasPriceTimer = setInterval(() => refetchGasPrices(), 60_000);
  });

  onCleanup(() => clearInterval(gasPriceTimer));

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
    if (!gasChain || !sourceChain || isNaN(threshold) || threshold <= 0 || isNaN(amount) || amount <= 0) { showToast("Fill in all fields"); return; }
    setRefillLoading(true);
    try {
      await postRefill(gasChain, threshold, amount, sourceChain);
      setRefillThreshold(""); setRefillAmount(""); haptic("success"); showToast("Auto-refill created"); refetchRefills();
    } catch (err: any) { showToast(err.message || "Failed"); haptic("error"); }
    finally { setRefillLoading(false); }
  }

  async function handleDeleteRefill(chainName: string) {
    if (!(await showConfirm(`Remove auto-refill for ${chainName}?`))) return;
    try { await deleteRefill(chainName); haptic("success"); showToast("Refill removed"); refetchRefills(); }
    catch (err: any) { showToast(err.message || "Failed"); haptic("error"); }
  }

  function levelColor(level: "low" | "mid" | "high"): string {
    return level === "low" ? "#3CE3AB" : level === "mid" ? "#FFB900" : "#F23674";
  }
  function levelBg(level: "low" | "mid" | "high"): string {
    return level === "low" ? "rgba(60,227,171,.1)" : level === "mid" ? "rgba(255,185,0,.1)" : "rgba(242,54,116,.1)";
  }

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
        <Show when={gasPrices.loading}><div class={s.card}><Skeleton rows={3} /></div></Show>
        <Show when={!gasPrices.loading && gasPrices.error}>
          <div class="error-state">
            <span class="error-state-msg">Failed to load gas prices</span>
            <button class="retry-btn" onClick={() => refetchGasPrices()}>Retry</button>
          </div>
        </Show>

        <Show when={!gasPrices.loading && !gasPrices.error && gasPrices()}>
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
                    <div class={s.hint}>Sorted by cheapest gas</div>
                  </div>
                  <Show when={total() > TOP_CHAINS}>
                    <button class={s.toggleBtn} onClick={() => { setShowAllPrices(!showAllPrices()); haptic("selection"); }}>
                      {showAllPrices() ? "Show less" : `All ${total()}`}
                    </button>
                  </Show>
                </div>
                <div class={s.gasGrid}>
                  <For each={display()}>
                    {(chain) => {
                      const priceGwei = data.prices[chain.id] ?? 0;
                      const level = gweiLevel(priceGwei);
                      return (
                        <div class={s.gasTile} style={{ background: levelBg(level), "border-color": `${levelColor(level)}22` }}>
                          <div class={s.gasTileHeader}>
                            <Show when={chain.icon}>
                              <img class={s.gasTileIcon} src={chain.icon!} alt="" loading="lazy" />
                            </Show>
                            <span class={s.gasTileChain}>{chain.name}</span>
                          </div>
                          <span class={s.gasTileValue} style={{ color: levelColor(level) }}>{fmtGwei(priceGwei)}</span>
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

        {/* Create alert */}
        <div class={s.card}>
          <div class={s.label}>Set Gas Alert</div>
          <div class={s.hint}>Get notified when gas drops below your threshold</div>
          <div class={s.formRow}>
            <div style={{ flex: "1" }}>
              <ChainPicker chains={chains()} value={alertChain()} onChange={setAlertChain} label="Chain" />
            </div>
            <div class={s.inputGroup} style={{ flex: "1" }}>
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
        <Show when={alerts.loading}><div class={s.card}><Skeleton rows={2} /></div></Show>
        <Show when={!alerts.loading && alerts() && alerts()!.length === 0}>
          <EmptyState icon={<span>&#128276;</span>} message="No gas alerts" hint="Create an alert to get notified when gas prices drop." />
        </Show>
        <Show when={!alerts.loading && alerts() && alerts()!.length > 0}>
          <div class={s.card}>
            <div class={s.label}>Your Alerts</div>
            <div class="item-list">
              <For each={alerts()}>
                {(alert) => (
                  <div class="list-item">
                    <div class="list-item-info">
                      <span class="list-item-primary">{alert.chainName}</span>
                      <span class="list-item-secondary">Below {fmtGwei(alert.thresholdGwei)} gwei</span>
                    </div>
                    <button class="remove-btn" onClick={() => handleDeleteAlert(alert.chainName)}>Remove</button>
                  </div>
                )}
              </For>
            </div>
          </div>
        </Show>
      </Show>

      {/* ═══ AUTO-REFILL ═══ */}
      <Show when={section() === "refill"}>
        <div class={s.card}>
          <div class={s.label}>Create Auto-Refill</div>
          <div class={s.hint}>Automatically swap USDC for gas when your balance drops</div>
          <div class={s.formRow} style={{ "margin-bottom": "10px" }}>
            <div style={{ flex: "1" }}>
              <ChainPicker chains={chains()} value={refillGasChain()} onChange={setRefillGasChain} label="Gas Chain" />
            </div>
            <div style={{ flex: "1" }}>
              <ChainPicker chains={chains()} value={refillSourceChain()} onChange={setRefillSourceChain} label="Source Chain" />
            </div>
          </div>
          <div class={s.formRow}>
            <div class={s.inputGroup}>
              <label class={s.inputLabel}>Threshold (native)</label>
              <input class={s.input} type="text" inputMode="decimal" placeholder="e.g. 0.005"
                value={refillThreshold()} onInput={(e) => setRefillThreshold(e.currentTarget.value)} />
            </div>
            <div class={s.inputGroup}>
              <label class={s.inputLabel}>Refill (USD)</label>
              <input class={s.input} type="text" inputMode="decimal" placeholder="e.g. 5"
                value={refillAmount()} onInput={(e) => setRefillAmount(e.currentTarget.value)} />
            </div>
          </div>
          <button class={s.cta} onClick={handleCreateRefill}
            disabled={refillLoading() || !refillGasChain() || !refillSourceChain() || !refillThreshold() || !refillAmount()}>
            {refillLoading() ? "Creating..." : "Create Refill"}
          </button>
        </div>

        <Show when={refills.loading}><div class={s.card}><Skeleton rows={2} /></div></Show>
        <Show when={!refills.loading && refills() && refills()!.length === 0}>
          <EmptyState icon={<span>&#9889;</span>} message="No auto-refills" hint="Set up automatic gas refills to never run out." />
        </Show>
        <Show when={!refills.loading && refills() && refills()!.length > 0}>
          <div class={s.card}>
            <div class={s.label}>Your Refills</div>
            <div class="item-list">
              <For each={refills()}>
                {(refill) => (
                  <div class="list-item">
                    <div class="list-item-info">
                      <span class="list-item-primary">{refill.chainName}</span>
                      <span class="list-item-secondary">
                        Below {refill.thresholdNative} native, refill ${refill.refillAmountUsd} from {refill.sourceChainName}
                      </span>
                    </div>
                    <button class="remove-btn" onClick={() => handleDeleteRefill(refill.chainName)}>Remove</button>
                  </div>
                )}
              </For>
            </div>
          </div>
        </Show>
      </Show>
    </div>
  );
};

export default AutomatePage;
