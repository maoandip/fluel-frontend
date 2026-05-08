import { useApp } from "../../stores/app";
import { haptic } from "../../lib/telegram";
import { showToast } from "../../stores/toast";
import s from "./WalletBar.module.css";

function truncateAddress(addr: string): string {
  if (addr.length <= 14) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function WalletBar() {
  const { walletAddress } = useApp();

  async function handleCopy() {
    const addr = walletAddress();
    if (!addr) return;
    try {
      await navigator.clipboard.writeText(addr);
      haptic("light");
      showToast("Deposit address copied");
    } catch {
      showToast("Failed to copy");
    }
  }

  return (
    <div class={s.bar} onClick={handleCopy} role="button" aria-label="Copy deposit address" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleCopy(); } }}>
      <div class={s.dot} />
      <div class={s.info}>
        <span class={s.label}>Deposit Address</span>
        <span class={s.addr}>{truncateAddress(walletAddress())}</span>
      </div>
      <span class={s.copy} aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      </span>
    </div>
  );
}
