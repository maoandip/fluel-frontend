import { Component, Show, For, Suspense, ErrorBoundary, createSignal } from "solid-js";
import { createAsync, revalidate } from "@solidjs/router";
import { useApp } from "../stores/app";
import { showToast } from "../stores/toast";
import { haptic } from "../lib/telegram";
import { postGift } from "../api";
import EmptyState from "../components/ui/EmptyState";
import Skeleton from "../components/ui/Skeleton";
import ChainPicker from "../components/chain/ChainPicker";
import { giftStatusClass } from "../lib/status";
import { queries } from "../lib/queries";
import s from "./EarnPage.module.css";

const refetchStats = () => revalidate("referralStats");
const refetchGifts = () => revalidate("gifts");

type Section = "referrals" | "gifts";
const GIFT_AMOUNTS = [1, 3, 5, 10, 25];


function timeAgo(ts: number): string {
  const s = Math.floor(Date.now() / 1000) - ts;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const EarnPage: Component = () => {
  const { chains } = useApp();

  const [section, setSection] = createSignal<Section>("referrals");
  const refStats = createAsync(() => queries.referralStats());
  const gifts = createAsync(() => queries.gifts());
  const [giftChain, setGiftChain] = createSignal("");
  const [giftAmount, setGiftAmount] = createSignal(3);
  const [giftLoading, setGiftLoading] = createSignal(false);
  const [lastClaimLink, setLastClaimLink] = createSignal("");

  const chainList = () => {
    const c = chains();
    if (c.length > 0 && !giftChain()) setGiftChain(c[0].name);
    return c;
  };

  function copyRefLink() {
    const stats = refStats();
    if (!stats?.refLink) return;
    navigator.clipboard.writeText(stats.refLink).then(() => { haptic("success"); showToast("Referral link copied!"); })
      .catch(() => showToast("Failed to copy"));
  }

  function shareRefLink() {
    const stats = refStats();
    if (!stats?.refLink) return;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(stats.refLink)}&text=${encodeURIComponent("Get free gas for your first crypto swap!")}`, "_blank");
  }

  async function handleCreateGift() {
    const chain = giftChain(), amount = giftAmount();
    if (!chain) { showToast("Select a chain"); return; }
    setGiftLoading(true);
    try {
      const res = await postGift(amount, chain);
      haptic("success"); setLastClaimLink(res.claimLink);
      showToast(`$${amount} gift created!`); refetchGifts();
    } catch (err: any) { showToast(err.message || "Failed"); haptic("error"); }
    finally { setGiftLoading(false); }
  }

  function copyClaimLink() {
    const link = lastClaimLink();
    if (!link) return;
    navigator.clipboard.writeText(link).then(() => { haptic("success"); showToast("Gift link copied!"); })
      .catch(() => showToast("Failed to copy"));
  }

  function shareClaimLink() {
    const link = lastClaimLink();
    if (!link) return;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent("I'm sending you free gas for crypto!")}`, "_blank");
  }

  return (
    <div class="page">
      {/* Toggle */}
      <div class="segment-toggle">
        <button class={`segment-btn ${section() === "referrals" ? "active" : ""}`}
          onClick={() => { setSection("referrals"); haptic("selection"); }}>Referrals</button>
        <button class={`segment-btn ${section() === "gifts" ? "active" : ""}`}
          onClick={() => { setSection("gifts"); haptic("selection"); }}>Gift Gas</button>
      </div>

      {/* ═══ REFERRALS ═══ */}
      <Show when={section() === "referrals"}>
        <ErrorBoundary fallback={(_err, reset) => (
          <div class="error-state">
            <span class="error-state-msg">Failed to load referral stats</span>
            <button class="retry-btn" onClick={() => { refetchStats(); reset(); }}>Retry</button>
          </div>
        )}>
        <Suspense fallback={<div class={s.card}><Skeleton rows={3} /></div>}>
        <Show when={refStats()}>
          <div class={s.card}>
            <div class={s.label}>Your Referrals</div>
            <div class={s.hint}>Earn 20% of swap fees from your referrals</div>
            <div class={s.statsGrid}>
              <div class={s.statTile}><span class={s.statLabel}>Invited</span><span class={s.statValue}>{refStats()!.inviteCount}</span></div>
              <div class={s.statTile}><span class={s.statLabel}>Activated</span><span class={s.statValue}>{refStats()!.activatedCount}</span></div>
              <div class={s.statTile}><span class={s.statLabel}>Earned</span><span class={s.statValueAccent}>${refStats()!.totalFeesEarned}</span></div>
              <div class={s.statTile}><span class={s.statLabel}>Slots Left</span><span class={s.statValue}>{refStats()!.slotsRemaining}</span></div>
            </div>
            <div class={s.linkBox}>
              <span class={s.linkText} title={refStats()!.refLink}>{refStats()!.refLink}</span>
              <div class={s.linkActions}>
                <button class={s.iconBtnCopy} onClick={copyRefLink} aria-label="Copy referral link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                </button>
                <button class={s.iconBtnShare} onClick={shareRefLink} aria-label="Share referral link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
                </button>
              </div>
            </div>
          </div>

          <div class={s.card}>
            <div class={s.label}>How it works</div>
            <div class={s.howList}>
              <div class={s.howItem}><span class={s.howNum}>1</span><span class={s.howText}>Share your referral link with friends</span></div>
              <div class={s.howItem}><span class={s.howNum}>2</span><span class={s.howText}>They get their first swap fee-free</span></div>
              <div class={s.howItem}><span class={s.howNum}>3</span><span class={s.howText}>You earn 20% of their swap fees for their first 15 swaps</span></div>
            </div>
          </div>
        </Show>
        </Suspense>
        </ErrorBoundary>
      </Show>

      {/* ═══ GIFTS ═══ */}
      <Show when={section() === "gifts"}>
        <div class={s.card}>
          <div class={s.label}>Send Gas Gift</div>
          <div class={s.hint}>Send gas tokens to a friend via a claim link</div>
          <div class={s.giftChainPicker}>
            <ChainPicker chains={chainList()} value={giftChain()} onChange={setGiftChain} label="Chain" />
          </div>
          <div class={s.amountSelector}>
            <For each={GIFT_AMOUNTS}>
              {(amt) => (
                <button class={giftAmount() === amt ? s.amountChipActive : s.amountChip}
                  onClick={() => { setGiftAmount(amt); haptic("selection"); }}>${amt}</button>
              )}
            </For>
          </div>
          <button class={s.cta} onClick={handleCreateGift} disabled={giftLoading() || !giftChain()}>
            {giftLoading() ? "Creating..." : `Create $${giftAmount()} Gift`}
          </button>
        </div>

        <Show when={lastClaimLink()}>
          <div class={s.claimCard}>
            <div class={s.claimHeader}>Gift created! Share this link:</div>
            <div class={s.claimLinkBox}>
              <span class={s.linkText} title={lastClaimLink()}>{lastClaimLink()}</span>
              <div class={s.linkActions}>
                <button class={s.iconBtnCopy} onClick={copyClaimLink} aria-label="Copy gift link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                </button>
                <button class={s.iconBtnShare} onClick={shareClaimLink} aria-label="Share gift link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
                </button>
              </div>
            </div>
          </div>
        </Show>

        <ErrorBoundary fallback={(_err, reset) => (
          <div class="error-state">
            <span class="error-state-msg">Failed to load gifts</span>
            <button class="retry-btn" onClick={() => { refetchGifts(); reset(); }}>Retry</button>
          </div>
        )}>
        <Suspense fallback={<div class={s.card}><Skeleton rows={2} /></div>}>
        <Show when={gifts() && gifts()!.length === 0}>
          <EmptyState icon={<span>&#127873;</span>} message="No gifts yet" hint="Create a gas gift to send to a friend." />
        </Show>
        <Show when={gifts() && gifts()!.length > 0}>
          <div class={s.card}>
            <div class={s.label}>Your Gifts</div>
            <div class="item-list">
              <For each={gifts()}>
                {(gift) => (
                  <div class="list-item">
                    <div class="list-item-info">
                      <span class="list-item-primary">${gift.amountUsd} on {gift.chainName}</span>
                      <span class="list-item-secondary">{timeAgo(gift.createdAt)}</span>
                    </div>
                    <span class={`status-badge ${s[giftStatusClass(gift.status)]}`}>
                      {gift.status}
                    </span>
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

export default EarnPage;
