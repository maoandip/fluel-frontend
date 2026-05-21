import { For } from "solid-js";
import p from "../styles/page.module.css";
import s from "./Roadmap.module.css";
import { useCanonical } from "../lib/seo";

interface Phase {
  label: string;
  status: "done" | "current" | "next" | "planned";
  title: string;
  items: string[];
}

const phases: Phase[] = [
  {
    label: "Phase 1",
    status: "done",
    title: "EVM gas swaps",
    items: [
      "Swap USDC to native gas on 40+ EVM chains",
      "Telegram bot and mini-app",
      "Built-in wallet — no extensions or seed phrases",
      "Send gas directly to any wallet",
      "Volume-based fees with a $0.50 minimum per swap",
      "Gas price alerts and auto-refill",
      "Referral program — fee-free first swap for referred friends",
      "Gift gas via shareable links ($1–$25)",
      "USDC withdrawal to any wallet",
    ],
  },
  {
    label: "Phase 2",
    status: "done",
    title: "Stability + trust",
    items: [
      "Gas-free approvals and swaps — no ETH needed to get started",
      "Transaction history with live status tracking",
      "Help guides and supported chains page",
      "Works on mobile, tablet, and desktop",
      "Open source on GitHub",
    ],
  },
  {
    label: "Phase 3",
    status: "done",
    title: "Public launch",
    items: [
      "Open to everyone — no waitlist, no closed beta",
      "Fresh brand and visual refresh",
      "Smoother app experience",
      "Improved onboarding for new users",
      "Auto-refill safety limits — daily cap and cooldown",
      "Feedback collection and prioritisation",
    ],
  },
  {
    label: "Phase 4",
    status: "current",
    title: "Solana",
    items: [
      "Swap to SOL on Solana",
      "Pay with USDC on Solana",
      "Solana wallet support",
    ],
  },
  {
    label: "Phase 5",
    status: "planned",
    title: "More chains + integrations",
    items: [
      "Sui network support",
      "Bitcoin network support",
      "More stablecoins (USDT, DAI)",
      "WalletConnect support",
      "Public API for developers",
    ],
  },
];

const statusLabel: Record<string, string> = {
  done: "Complete",
  current: "In progress",
  next: "Up next",
  planned: "Planned",
};

export default function Roadmap() {
  document.title = "Roadmap — fluel";
  useCanonical("/roadmap");

  return (
    <div class={p.page}>
      <div class={p.wrapper}>
        <h1 class={p.title}>Roadmap</h1>
        <p class={p.subtitle}>Where we've been. Where we're going. Built in public.</p>

        <div class={s.timeline}>
          <For each={phases}>
            {(phase) => (
              <div class={`${s.phase} ${s[phase.status]}`}>
                <div class={s.phaseHeader}>
                  <span class={s.phaseLabel}>{phase.label}</span>
                  <span class={`${s.statusBadge} ${s[`badge_${phase.status}`]}`}>{statusLabel[phase.status]}</span>
                </div>
                <h2 class={s.phaseTitle}>{phase.title}</h2>
                <ul class={s.phaseItems}>
                  <For each={phase.items}>
                    {(item) => (
                      <li class={s.phaseItem}>
                        <span class={s.check}>{phase.status === "done" ? "✓" : "·"}</span>
                        {item}
                      </li>
                    )}
                  </For>
                </ul>
              </div>
            )}
          </For>
        </div>

        <div class={s.note}>
          <p>Roadmap is directional, not a promise. Priorities shift based on user feedback and Li.Fi protocol updates.</p>
          <p>Have a feature request? <a href="/feedback">Send feedback</a>.</p>
        </div>
      </div>
    </div>
  );
}
