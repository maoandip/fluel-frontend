import { Component, Show, For, createSignal, createMemo, Suspense, ErrorBoundary, useTransition } from "solid-js";
import { createAsync } from "@solidjs/router";
import type { HistoryTx } from "../api";
import { queries } from "../lib/queries";
import { revalidateNow } from "../lib/refresh";
import { useApp } from "../stores/app";
import { showToast } from "../stores/toast";
import { haptic } from "../lib/telegram";
import EmptyState from "../components/ui/EmptyState";
import Skeleton from "../components/ui/Skeleton";
import QueryErrorFallback from "../components/ui/QueryErrorFallback";
import RefreshButton from "../components/ui/RefreshButton";
import PullToRefresh from "../components/ui/PullToRefresh";
import { txStatusClass } from "../lib/status";
import { timeAgo, dateBucket } from "../lib/format";
import { explorerTxUrl } from "../lib/explorers";
import s from "./HistoryPage.module.css";

const PAGE_SIZE = 20;
// Hard ceiling on accumulated rows — infinite scroll stops here so the DOM
// can't grow without bound on a very long history.
const MAX_TXS = 200;
const FAILED_STATUSES = new Set(["reverted", "failed", "error"]);

const HistoryPage: Component = () => {
  const { chains, receiveChains } = useApp();

  // Resolve a chain name (as stored on a tx row) back to its EVM id, so we
  // can build an explorer link. Covers both pay and receive chain lists.
  const chainIdByName = createMemo(() => {
    const map = new Map<string, number>();
    for (const c of chains()) map.set(c.name.toLowerCase(), c.id);
    for (const c of receiveChains()) if (!map.has(c.name.toLowerCase())) map.set(c.name.toLowerCase(), c.id);
    return map;
  });

  // Infinite scroll as a growing window: the page always fetches rows
  // 1..loadedCount as a single query. Reading it through createAsync +
  // queries.history means revalidate("history") — fired after a swap, on
  // app focus, or on tab switch — refreshes the list automatically.
  const [loadedCount, setLoadedCount] = createSignal(PAGE_SIZE);
  const [loadingMore, startLoadMore] = useTransition();
  const history = createAsync(() => queries.history(1, loadedCount()));

  const txs = (): HistoryTx[] => history()?.transactions ?? [];

  // A full window back means there may be more; stop at the MAX_TXS ceiling.
  const hasMore = (): boolean => {
    const n = txs().length;
    return n >= loadedCount() && n < MAX_TXS;
  };

  // Rows grouped into date sections (Today / Yesterday / This week / month).
  // txs() is already newest-first, so a section break is just a label change.
  const sections = createMemo(() => {
    const out: { label: string; items: HistoryTx[] }[] = [];
    for (const tx of txs()) {
      const label = dateBucket(tx.createdAt);
      const last = out[out.length - 1];
      if (last && last.label === label) last.items.push(tx);
      else out.push({ label, items: [tx] });
    }
    return out;
  });

  // Growing loadedCount re-runs the query. The transition keeps the current
  // rows on screen (no skeleton flash) while the wider window loads.
  function loadMore() {
    if (loadingMore() || !hasMore()) return;
    startLoadMore(() => setLoadedCount((c) => Math.min(c + PAGE_SIZE, MAX_TXS)));
  }

  function onScroll(e: Event) {
    const el = e.target as HTMLDivElement;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 100) {
      loadMore();
    }
  }

  function statusLabel(status: string): string {
    switch (status) {
      case "confirmed": return "Done";
      case "pending":
      case "submitting":
      case "broadcasted": return "Pending";
      case "reverted": return "Reverted";
      case "failed":
      case "error": return "Failed";
      default: return status;
    }
  }

  function truncHash(hash: string): string {
    if (!hash || hash.length <= 14) return hash ?? "";
    return hash.slice(0, 8) + "…" + hash.slice(-6);
  }

  // The recorded txHash lives on the source chain (fromChain) — for a withdraw
  // fromChain and toChain are the same, so this is right either way.
  function txExplorerUrl(tx: HistoryTx): string | null {
    if (!tx.fromChain) return null;
    return explorerTxUrl(chainIdByName().get(tx.fromChain.toLowerCase()), tx.txHash);
  }

  function copyHash(hash: string) {
    navigator.clipboard.writeText(hash)
      .then(() => { haptic("success"); showToast("Transaction hash copied"); })
      .catch(() => showToast("Failed to copy"));
  }

  return (
    <div class="page">
      <div class={s.refreshRow}>
        <RefreshButton onRefresh={() => revalidateNow(["history"])} label="Refresh history" />
      </div>

      <ErrorBoundary fallback={(err, reset) => (
        <QueryErrorFallback
          err={err}
          reset={reset}
          label="history"
          refetch={() => revalidateNow(["history"])}
        />
      )}>
        <Suspense fallback={<div class={s.loadingCard}><Skeleton rows={5} /></div>}>
          <Show when={txs().length === 0}>
            <EmptyState
              icon={<span>&#128203;</span>}
              message="No transactions yet"
              hint="Your swaps and withdrawals will appear here."
            />
          </Show>

          <Show when={txs().length > 0}>
            <PullToRefresh
              class={s.list}
              onScroll={onScroll}
              onRefresh={() => revalidateNow(["history"])}
            >
              <For each={sections()}>
                {(section) => (
                  <div class={s.section}>
                    <div class={s.sectionHeader}>{section.label}</div>
                    <div class={s.sectionCard}>
                      <For each={section.items}>
                        {(tx) => {
                        const failed = FAILED_STATUSES.has(tx.status);
                        const explorer = txExplorerUrl(tx);
                        return (
                          <div class={s.txItem}>
                            {/* Headline: what moved + status */}
                            <div class={s.txTopRow}>
                              <span class={s.txRoute}>
                                <Show
                                  when={tx.type === "withdraw"}
                                  fallback={
                                    <>
                                      <span class={s.txAmt}>{tx.fromAmount ?? "—"} USDC</span>
                                      <span class={s.txArrow}>&rarr;</span>
                                      <span class={s.txAmt}>{tx.toAmount ?? "—"} {tx.toToken ?? "gas"}</span>
                                    </>
                                  }
                                >
                                  <span class={s.txAmt}>Withdraw {tx.fromAmount ?? ""} USDC</span>
                                </Show>
                              </span>
                              <span class={`${s.txStatus} ${s[txStatusClass(tx.status)]}`}>
                                {statusLabel(tx.status)}
                              </span>
                            </div>

                            {/* Chain route + when */}
                            <div class={s.txBottomRow}>
                              <span class={s.txChains}>
                                <Show
                                  when={tx.type === "withdraw"}
                                  fallback={<>{tx.fromChain ?? "—"} &rarr; {tx.toChain ?? "—"}</>}
                                >
                                  {tx.fromChain ?? "—"}
                                </Show>
                              </span>
                              <span class={s.txTime}>{timeAgo(tx.createdAt)}</span>
                            </div>

                            {/* Fee + routing tool, when known */}
                            <Show when={(tx.feeUsd && tx.feeUsd !== "0") || (tx.tool && !failed)}>
                              <div class={s.txMeta}>
                                <Show when={tx.feeUsd && tx.feeUsd !== "0"}>
                                  <span>Fee ${tx.feeUsd}</span>
                                </Show>
                                <Show when={tx.tool && !failed}>
                                  <span class={s.txTool}>via {tx.tool}</span>
                                </Show>
                              </div>
                            </Show>

                            {/* Hash + trace actions */}
                            <div class={s.txActions}>
                              <span class={s.txHash} title={tx.txHash}>{truncHash(tx.txHash)}</span>
                              <div class={s.txActionBtns}>
                                <button class={s.iconBtn} onClick={() => copyHash(tx.txHash)} aria-label="Copy transaction hash">
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                                </button>
                                <Show when={explorer}>
                                  <a class={s.iconBtn} href={explorer!} target="_blank" rel="noopener" aria-label="View on block explorer">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                                  </a>
                                </Show>
                              </div>
                            </div>
                          </div>
                        );
                        }}
                      </For>
                    </div>
                  </div>
                )}
              </For>
              <Show when={loadingMore()}>
                <div class={s.loadingMore}>Loading...</div>
              </Show>
              <Show when={!hasMore() && txs().length > 0}>
                <div class={s.endMarker}>
                  {txs().length >= MAX_TXS
                    ? `Showing your ${MAX_TXS} most recent transactions`
                    : "No more transactions"}
                </div>
              </Show>
            </PullToRefresh>
          </Show>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

export default HistoryPage;
