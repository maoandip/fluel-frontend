import { Component, Show, For, Suspense, ErrorBoundary, createMemo, createSignal } from "solid-js";
import { createAsync } from "@solidjs/router";
import { useApp } from "../stores/app";
import { balancesQuery, refetchBalances } from "../stores/balances";
import { postWithdraw } from "../api";
import { showToast } from "../stores/toast";
import { haptic } from "../lib/telegram";
import Skeleton from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import QueryErrorFallback from "../components/ui/QueryErrorFallback";
import WalletBar from "../components/layout/WalletBar";
import TokenChainIcon from "../components/chain/TokenChainIcon";
import { NATIVE_TOKEN, type TokenBalance } from "../types";
import s from "./BalancesPage.module.css";

function humanAmount(token: TokenBalance): number {
  if (token.amount === "0") return 0;
  return Number(BigInt(token.amount)) / 10 ** token.decimals;
}

interface DisplayRow {
  chainId: number;
  token: TokenBalance;
  human: number;
}

const BalancesPage: Component = () => {
  const { chains, destinationAddress } = useApp();
  const balances = createAsync(() => balancesQuery());
  const getChain = (chainId: number) => chains().find((c) => c.id === chainId);

  const [withdrawing, setWithdrawing] = createSignal(false);
  const [selectedChains, setSelectedChains] = createSignal<Set<number>>(new Set());

  const isUsdc = (token: TokenBalance) => token.address.toLowerCase() !== NATIVE_TOKEN;

  function toggleChain(chainId: number) {
    const next = new Set(selectedChains());
    if (next.has(chainId)) next.delete(chainId);
    else next.add(chainId);
    setSelectedChains(next);
    haptic("selection");
  }

  const rows = createMemo((): DisplayRow[] => {
    const data = balances()?.balances;
    if (!data) return [];
    const result: DisplayRow[] = [];
    for (const [chainId, tokens] of Object.entries(data)) {
      for (const token of tokens) {
        const human = humanAmount(token);
        if (human > 0) {
          result.push({ chainId: Number(chainId), token, human });
        }
      }
    }
    return result;
  });

  const usdcSummary = createMemo(() => {
    let total = 0;
    for (const r of rows()) {
      if (isUsdc(r.token)) total += r.human;
    }
    return { hasUsdc: total > 0, totalUsdc: total };
  });

  // USD total + count of currently-selected USDC rows. Recomputed against the
  // live row list so a stale selection (chain withdrawn elsewhere) drops out.
  const selected = createMemo(() => {
    const sel = selectedChains();
    let total = 0, count = 0;
    for (const r of rows()) {
      if (isUsdc(r.token) && sel.has(r.chainId)) { total += r.human; count++; }
    }
    return { total, count };
  });

  const withdrawLabel = () => {
    if (withdrawing()) return "Withdrawing...";
    const { count, total } = selected();
    return count === 0 ? "Withdraw all" : `Withdraw $${total.toFixed(2)}`;
  };

  function formatUsd(token: TokenBalance, human: number): string {
    const price = parseFloat(token.priceUSD);
    if (!price || price <= 0) return "";
    return `$${(human * price).toFixed(2)}`;
  }

  function formatAmount(token: TokenBalance, human: number): string {
    return `${human} ${token.symbol}`;
  }

  function tokenIcon(row: DisplayRow): string | undefined {
    const chain = getChain(row.chainId);
    if (row.token.address.toLowerCase() === NATIVE_TOKEN) return chain?.nativeIcon;
    return chain?.stableIcon;
  }

  async function handleWithdraw() {
    if (!destinationAddress()) {
      showToast("Set a destination wallet first");
      haptic("error");
      return;
    }
    // No selection → withdraw everything. Otherwise → only the picked chains.
    const sel = selectedChains();
    const chainNames = sel.size > 0
      ? rows()
          .filter((r) => isUsdc(r.token) && sel.has(r.chainId))
          .map((r) => getChain(r.chainId)?.name)
          .filter((n): n is string => !!n)
      : undefined;
    setWithdrawing(true);
    try {
      const res = await postWithdraw(chainNames);
      const summary = res.withdrawals.map(w => `${w.amount} ${w.symbol} on ${w.chainName}`).join(", ");
      haptic("success");
      showToast(`Withdrawn: ${summary}`);
      setSelectedChains(new Set<number>());
      refetchBalances();
    } catch (err: any) {
      showToast(err.message || "Withdraw failed");
      haptic("error");
    } finally {
      setWithdrawing(false);
    }
  }

  return (
    <div class="page">
      <div class={s.walletRow}><WalletBar /></div>

      <ErrorBoundary fallback={(err, reset) => (
        <QueryErrorFallback err={err} reset={reset} label="balances" refetch={refetchBalances} />
      )}>
        <Suspense fallback={<div class={s.card}><Skeleton rows={4} /></div>}>
      {/* Empty */}
      <Show when={rows().length === 0}>
        <EmptyState
          icon={<span>&#128176;</span>}
          message="No balances yet"
          hint="Deposit USDC to your wallet to get started."
        />
      </Show>

      {/* Balances */}
      <Show when={rows().length > 0}>
        <div class={s.card}>
          <For each={rows()}>
            {(row) => {
              const chain = getChain(row.chainId);
              const usd = formatUsd(row.token, row.human);
              // Accessor, not a const — destinationAddress() can change while
              // the page is open (set via WalletBar), and rows must react.
              const selectable = () => isUsdc(row.token) && !!destinationAddress();
              return (
                <div
                  class={`${s.item} ${selectable() ? s.itemSelectable : ""}`}
                  onClick={() => { if (selectable()) toggleChain(row.chainId); }}
                >
                  <Show when={selectable()}>
                    <input
                      type="checkbox"
                      class={s.checkbox}
                      checked={selectedChains().has(row.chainId)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => toggleChain(row.chainId)}
                      aria-label={`Select ${chain?.name ?? "chain"} for withdrawal`}
                    />
                  </Show>
                  <div class={s.chain}>
                    <TokenChainIcon
                      tokenIcon={tokenIcon(row)}
                      tokenSymbol={row.token.symbol}
                      chainIcon={chain?.icon}
                      size={32}
                      badgeSize={14}
                    />
                    <div class={s.chainInfo}>
                      <div class={s.chainName}>{row.token.symbol}</div>
                      <div class={s.chainSub}>{chain?.name ?? `Chain ${row.chainId}`}</div>
                    </div>
                  </div>
                  <div class={s.amounts}>
                    <Show when={usd}>
                      <div class={s.usdValue}>{usd}</div>
                    </Show>
                    <div class={usd ? s.tokenAmount : s.usdValue}>
                      {formatAmount(row.token, row.human)}
                    </div>
                  </div>
                </div>
              );
            }}
          </For>

          <Show when={usdcSummary().totalUsdc > 0 && rows().length > 1}>
            <div class={s.total}>
              <span class={s.totalLabel}>Total USDC</span>
              <span class={s.totalValue}>${usdcSummary().totalUsdc.toFixed(2)}</span>
            </div>
          </Show>
        </div>

        {/* Withdraw — withdraws the checked chains, or all USDC if none checked */}
        <Show when={usdcSummary().hasUsdc && destinationAddress()}>
          <button
            class={s.withdrawBtn}
            onClick={handleWithdraw}
            disabled={withdrawing()}
          >
            {withdrawLabel()}
          </button>
          <div class={s.withdrawHint}>
            Sends to {destinationAddress().slice(0, 6)}...{destinationAddress().slice(-4)}
          </div>
        </Show>
      </Show>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

export default BalancesPage;
