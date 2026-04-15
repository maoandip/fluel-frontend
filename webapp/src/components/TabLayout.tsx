import { createSignal, For, type JSX } from "solid-js";
import { haptic } from "../telegram";
import s from "./TabLayout.module.css";

export type TabId = "swap" | "balance" | "history" | "automate" | "earn";

interface TabDef {
  id: TabId;
  label: string;
  icon: () => JSX.Element;
}

const [currentTab, setCurrentTab] = createSignal<TabId>("swap");

export { currentTab };

// ── SVG icons ──────────────────────────────────────────────────────

function SwapIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M16 3l4 4-4 4" /><path d="M20 7H4" /><path d="M8 21l-4-4 4-4" /><path d="M4 17h16" />
    </svg>
  );
}

function BalanceIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 10h20" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function AutomateIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2v4" /><path d="M12 18v4" /><path d="M4.93 4.93l2.83 2.83" /><path d="M16.24 16.24l2.83 2.83" />
      <path d="M2 12h4" /><path d="M18 12h4" /><path d="M4.93 19.07l2.83-2.83" /><path d="M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

function EarnIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
  );
}

const tabs: TabDef[] = [
  { id: "swap", label: "Swap", icon: SwapIcon },
  { id: "balance", label: "Balance", icon: BalanceIcon },
  { id: "history", label: "History", icon: HistoryIcon },
  { id: "automate", label: "Automate", icon: AutomateIcon },
  { id: "earn", label: "Earn", icon: EarnIcon },
];

// ── Component ──────────────────────────────────────────────────────

export interface TabLayoutProps {
  children: (tab: () => TabId) => JSX.Element;
}

export default function TabLayout(props: TabLayoutProps) {
  function switchTab(id: TabId) {
    if (currentTab() === id) return;
    haptic("selection");
    setCurrentTab(id);
  }

  return (
    <div class={s.layout}>
      <div class={s.content} data-tab={currentTab()}>
        {props.children(currentTab)}
      </div>

      <nav class={s.nav}>
        <For each={tabs}>
          {(tab) => (
            <button
              class={currentTab() === tab.id ? s.tabBtnActive : s.tabBtn}
              onClick={() => switchTab(tab.id)}
            >
              {tab.icon()}
              <span class={currentTab() === tab.id ? s.tabLabelActive : s.tabLabel}>{tab.label}</span>
            </button>
          )}
        </For>
      </nav>
    </div>
  );
}
