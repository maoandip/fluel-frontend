import { Component, Show, For, createSignal, createMemo, onMount, onCleanup } from "solid-js";
import { revalidate } from "@solidjs/router";
import type { HistoryTx } from "../api";
import { queries } from "../lib/queries";
import { useApp } from "../stores/app";
import { showToast } from "../stores/toast";
import { haptic } from "../lib/telegram";
import EmptyState from "../components/ui/EmptyState";
import Skeleton from "../components/ui/Skeleton";
import QueryErrorFallback from "../components/ui/QueryErrorFallback";
import { txStatusClass } from "../lib/status";
import { timeAgo } from "../lib/format";
import { explorerTxUrl } from "../lib/explorers";
import s from "./HistoryPage.module.css";

const PAGE_SIZE = 20;
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

  const [txs, setTxs] = createSignal<HistoryTx[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [loadingMore, setLoadingMore] = createSignal(false);
  const [hasMore, setHasMore] = createSignal(true);
  // Raw error (not boolean) so QueryErrorFallback can detect ApiError(429).
  const [error, setError] = createSignal<unknown>(null);
  const [page, setPage] = createSignal(1);

  let alive = true;
  onCleanup(() => { alive = false; });

  async function loadPage(p: number) {
    try {
      const res = await queries.history(p, PAGE_SIZE);
      if (!alive) return;
      const items = res.transactions ?? [];
      if (p === 1) {
        setTxs(items);
      } else {
        setTxs((prev) => [...prev, ...items]);
      }
      setHasMore(items.length >= PAGE_SIZE);
    } catch (err) {
      if (!alive) return;
      if (p === 1) setError(err);
    }
  }

  onMount(async () => {
    await loadPage(1);
    if (alive) setLoading(false);
  });

  async function retryLoad() {
    setError(null);
    setLoading(true);
    setPage(1);
    setHasMore(true);
    revalidate("history");
    await loadPage(1);
    if (alive) setLoading(false);
  }

  let loadMorePromise: Promise<void> | null = null;

  async function loadMore() {
    if (loadingMore() || !hasMore() || loadMorePromise) return;
    setLoadingMore(true);
    const next = page() + 1;
    setPage(next);
    loadMorePromise = loadPage(next).finally(() => {
      loadMorePromise = null;
      if (alive) setLoadingMore(false);
    });
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
      <Show when={loading()}>
        <div class={s.loadingCard}><Skeleton rows={5} /></div>
      </Show>

      <Show when={!loading() && error()}>
        <QueryErrorFallback
          err={error()}
          reset={() => setError(null)}
          label="history"
          refetch={retryLoad}
        />
      </Show>

      <Show when={!loading() && !error() && txs().length === 0}>
        <EmptyState
          icon={<span>&#128203;</span>}
          message="No transactions yet"
          hint="Your swaps and withdrawals will appear here."
        />
      </Show>

      <Show when={!loading() && !error() && txs().length > 0}>
        <div class={s.list} onScroll={onScroll}>
          <For each={txs()}>
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
          <Show when={loadingMore()}>
            <div class={s.loadingMore}>Loading...</div>
          </Show>
          <Show when={!hasMore() && txs().length > 0}>
            <div class={s.endMarker}>No more transactions</div>
          </Show>
        </div>
      </Show>
    </div>
  );
};

export default HistoryPage;
