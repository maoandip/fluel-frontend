import { Component, Show, For, createSignal, onMount, onCleanup } from "solid-js";
import { revalidate } from "@solidjs/router";
import type { HistoryTx } from "../api";
import { queries } from "../lib/queries";
import EmptyState from "../components/ui/EmptyState";
import Skeleton from "../components/ui/Skeleton";
import QueryErrorFallback from "../components/ui/QueryErrorFallback";
import { txStatusClass } from "../lib/status";
import { timeAgo } from "../lib/format";
import s from "./HistoryPage.module.css";

const PAGE_SIZE = 20;

const HistoryPage: Component = () => {
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
    if (!hash || hash.length <= 12) return hash ?? "";
    return hash.slice(0, 6) + "..." + hash.slice(-4);
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
          message="No swaps yet"
          hint="Your swaps and withdrawals will appear here."
        />
      </Show>

      <Show when={!loading() && !error() && txs().length > 0}>
        <div class={s.list} onScroll={onScroll}>
          <For each={txs()}>
            {(tx) => (
              <div class={s.txItem}>
                <div class={s.txTopRow}>
                  <span class={s.txRoute}>
                    <Show
                      when={tx.type === "withdraw"}
                      fallback={<>USDC<span class={s.txArrow}>&rarr;</span>{tx.toToken ?? "gas"}</>}
                    >
                      Withdraw USDC
                    </Show>
                  </span>
                  <span class={`${s.txStatus} ${s[txStatusClass(tx.status)]}`}>
                    {statusLabel(tx.status)}
                  </span>
                </div>
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
                <div class={s.txBottomRow}>
                  <span class={s.txHash} title={tx.txHash}>{truncHash(tx.txHash)}</span>
                  <Show when={tx.tool}>
                    <span class={s.txTool}>{tx.tool}</span>
                  </Show>
                </div>
              </div>
            )}
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
