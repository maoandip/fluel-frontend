import { useApp } from "../stores/app";
import { haptic } from "../telegram";
import { showToast } from "../stores/toast";
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
      <span class={s.copy}>Copy</span>
    </div>
  );
}
