import { Component, Show, For, createSignal, createMemo, onMount, onCleanup } from "solid-js";
import { haptic } from "../telegram";
import type { Chain } from "../types";
import s from "./ChainSelectorModal.module.css";

export interface ChainSelectorModalProps {
  chains: Chain[];
  value: string;
  onSelect: (name: string) => void;
  onClose: () => void;
}

const ChainSelectorModal: Component<ChainSelectorModalProps> = (props) => {
  const [search, setSearch] = createSignal("");
  let inputRef: HTMLInputElement | undefined;

  onMount(() => {
    setTimeout(() => inputRef?.focus(), 50);
  });

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") props.onClose();
  };
  document.addEventListener("keydown", handleKeyDown);
  onCleanup(() => document.removeEventListener("keydown", handleKeyDown));

  const filtered = createMemo(() => {
    const q = search().toLowerCase().trim();
    const list = q
      ? props.chains.filter((c) => c.name.toLowerCase().includes(q))
      : [...props.chains];
    return list.sort((a, b) => a.name.localeCompare(b.name));
  });

  function select(name: string) {
    haptic("light");
    props.onSelect(name);
    props.onClose();
  }

  return (
    <div class={s.overlay}>
      {/* Header */}
      <div class={s.header}>
        <button class={s.back} onClick={() => props.onClose()} aria-label="Close chain selector">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <span class={s.title}>Select Chain</span>
        <div class={s.spacer} />
      </div>

      {/* Search bar */}
      <div class={s.search}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          class={s.searchInput}
          type="text"
          placeholder="Search"
          autocomplete="off"
          value={search()}
          onInput={(e) => setSearch(e.currentTarget.value)}
        />
        <Show when={search()}>
          <button class={s.clearBtn} onClick={() => { setSearch(""); inputRef?.focus(); }} aria-label="Clear search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </Show>
      </div>

      {/* Chain list */}
      <div class={s.list}>
        <Show when={filtered().length === 0}>
          <div class={s.empty}>No chains found</div>
        </Show>

        <For each={filtered()}>
          {(chain) => (
            <div
              class={chain.name === props.value ? s.rowSelected : s.row}
              onClick={() => select(chain.name)}
            >
              <div class={s.chainIcon}>
                <Show when={chain.icon} fallback={
                  <span class={s.iconFallback}>{chain.name.charAt(0)}</span>
                }>
                  <img src={chain.icon!} alt={chain.name} />
                </Show>
              </div>
              <div class={s.info}>
                <div class={s.chainName}>{chain.name}</div>
              </div>
              <Show when={chain.name === props.value}>
                <div class={s.check}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </Show>
            </div>
          )}
        </For>
      </div>
    </div>
  );
};

export default ChainSelectorModal;
