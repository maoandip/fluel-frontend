import { Component, Show, For, createSignal, createMemo, onMount, onCleanup } from "solid-js";
import { getLifiHistory, type LifiTransfer } from "../api";
import { useApp } from "../stores/app";
import EmptyState from "../components/ui/EmptyState";
import Skeleton from "../components/ui/Skeleton";
import { txStatusClass } from "../lib/status";
import s from "./HistoryPage.module.css";

const PAGE_SIZE = 20;

const HistoryPage: Component = () => {
  const { chains, receiveChains } = useApp();

  const chainNameById = createMemo(() => {
    const map = new Map<number, string>();
    for (const c of chains()) map.set(c.id, c.name);
    for (const c of receiveChains()) if (!map.has(c.id)) map.set(c.id, c.name);
    return map;
  });

  function chainName(id: number): string {
    return chainNameById().get(id) ?? `#${id}`;
  }

  const [transfers, setTransfers] = createSignal<LifiTransfer[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [loadingMore, setLoadingMore] = createSignal(false);
  const [hasMore, setHasMore] = createSignal(true);
  const [error, setError] = createSignal(false);
  const [page, setPage] = createSignal(1);

  let alive = true;
  onCleanup(() => { alive = false; });

  async function loadPage(p: number) {
    try {
      const res = await getLifiHistory(p, PAGE_SIZE);
      if (!alive) return;
      const items = res.transfers ?? [];
      if (p === 1) {
        setTransfers(items);
      } else {
        setTransfers((prev) => [...prev, ...items]);
      }
      setHasMore(items.length >= PAGE_SIZE);
    } catch {
      if (!alive) return;
      if (p === 1) setError(true);
    }
  }

  onMount(async () => {
    await loadPage(1);
    if (alive) setLoading(false);
  });

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

  function timeAgo(ts: number): string {
    const diffMs = Date.now() - ts * 1000;
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(ts * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }


  function statusLabel(status: string): string {
    switch (status) {
      case "DONE": return "Done";
      case "PENDING": return "Pending";
      case "FAILED": return "Failed";
      case "NOT_FOUND": return "Not found";
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
        <div class="error-state">
          <span class="error-state-msg">Failed to load history</span>
          <button class="retry-btn" onClick={() => location.reload()}>Retry</button>
        </div>
      </Show>

      <Show when={!loading() && !error() && transfers().length === 0}>
        <EmptyState
          icon={<span>&#128203;</span>}
          message="No swaps yet"
          hint="Your LI.FI swap history will appear here."
        />
      </Show>

      <Show when={!loading() && !error() && transfers().length > 0}>
        <div class={s.list} onScroll={onScroll}>
          <For each={transfers()}>
            {(tx) => (
              <div class={s.txItem}>
                <div class={s.txTopRow}>
                  <span class={s.txRoute}>
                    {tx.sending.token.symbol}
                    <span class={s.txArrow}>&rarr;</span>
                    {tx.receiving.token.symbol}
                  </span>
                  <span class={`${s.txStatus} ${s[txStatusClass(tx.status)]}`}>
                    {statusLabel(tx.status)}
                  </span>
                </div>
                <div class={s.txBottomRow}>
                  <span class={s.txChains}>
                    {chainName(tx.sending.chainId)} &rarr; {chainName(tx.receiving.chainId)}
                  </span>
                  <span class={s.txTime}>{timeAgo(tx.sending.timestamp)}</span>
                </div>
                <div class={s.txBottomRow}>
                  <a
                    class={s.txHash}
                    href={tx.sending.txLink}
                    target="_blank"
                    rel="noopener"
                    title={tx.sending.txHash}
                  >
                    {truncHash(tx.sending.txHash)}
                  </a>
                  <span class={s.txTool}>{tx.tool}</span>
                </div>
              </div>
            )}
          </For>
          <Show when={loadingMore()}>
            <div class={s.loadingMore}>Loading...</div>
          </Show>
          <Show when={!hasMore() && transfers().length > 0}>
            <div class={s.endMarker}>No more swaps</div>
          </Show>
        </div>
      </Show>
    </div>
  );
};

export default HistoryPage;
