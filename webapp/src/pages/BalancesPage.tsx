import { Component, Show, For, Suspense, ErrorBoundary, createMemo, createSignal } from "solid-js";
import { createAsync } from "@solidjs/router";
import { useApp } from "../stores/app";
import { balancesQuery, refetchBalances } from "../stores/balances";
import { postWithdraw } from "../api";
import { showToast } from "../stores/toast";
import { haptic } from "../lib/telegram";
import Skeleton from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
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
      if (r.token.address.toLowerCase() !== NATIVE_TOKEN) total += r.human;
    }
    return { hasUsdc: total > 0, totalUsdc: total };
  });

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

  async function handleWithdrawAll() {
    if (!destinationAddress()) {
      showToast("Set a destination wallet first");
      haptic("error");
      return;
    }
    setWithdrawing(true);
    try {
      const res = await postWithdraw();
      const summary = res.withdrawals.map(w => `${w.amount} ${w.symbol} on ${w.chainName}`).join(", ");
      haptic("success");
      showToast(`Withdrawn: ${summary}`);
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

      <ErrorBoundary fallback={(_err, reset) => (
        <div class="error-state">
          <span class="error-state-msg">Failed to load balances</span>
          <button class="retry-btn" onClick={() => { refetchBalances(); reset(); }}>Retry</button>
        </div>
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
              return (
                <div class={s.item}>
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

        {/* Withdraw */}
        <Show when={usdcSummary().hasUsdc && destinationAddress()}>
          <button
            class={s.withdrawBtn}
            onClick={handleWithdrawAll}
            disabled={withdrawing()}
          >
            {withdrawing() ? "Withdrawing..." : "Withdraw all USDC"}
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
