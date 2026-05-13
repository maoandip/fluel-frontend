import { For, type JSX } from "solid-js";
import { A } from "@solidjs/router";
import { haptic } from "../../lib/telegram";
import s from "./TabLayout.module.css";

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

function InviteIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  );
}

interface TabDef {
  path: string;
  label: string;
  icon: () => JSX.Element;
  end?: boolean; // strict path match (used for the root "/" tab)
}

const tabs: TabDef[] = [
  { path: "/",         label: "Swap",     icon: SwapIcon,     end: true },
  { path: "/balance",  label: "Balance",  icon: BalanceIcon },
  { path: "/history",  label: "History",  icon: HistoryIcon },
  { path: "/automate", label: "Automate", icon: AutomateIcon },
  { path: "/invite",   label: "Invite",   icon: InviteIcon },
];

// ── Component ──────────────────────────────────────────────────────

export interface TabLayoutProps {
  children: JSX.Element;
}

export default function TabLayout(props: TabLayoutProps) {
  return (
    <div class={s.layout}>
      <div class={s.content}>{props.children}</div>

      <nav class={s.nav}>
        <For each={tabs}>
          {(tab) => (
            <A
              href={tab.path}
              end={tab.end}
              class={s.tabBtn}
              activeClass={s.tabBtnActive}
              onClick={() => haptic("selection")}
            >
              {tab.icon()}
              <span class={s.tabLabel}>{tab.label}</span>
            </A>
          )}
        </For>
      </nav>
    </div>
  );
}
