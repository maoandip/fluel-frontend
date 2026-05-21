import { Component, createSignal } from "solid-js";
import { haptic } from "../../lib/telegram";
import s from "./RefreshButton.module.css";

/**
 * Small refresh-icon button. Spins while the onRefresh promise is pending
 * (with a short minimum so a fast refetch still registers as feedback). The
 * icon is the same circular-arrow used for quote refresh on the swap page.
 */
const RefreshButton: Component<{
  onRefresh: () => Promise<unknown>;
  label?: string;
}> = (props) => {
  const [busy, setBusy] = createSignal(false);

  async function handleClick() {
    if (busy()) return;
    setBusy(true);
    haptic("light");
    try {
      await Promise.all([
        props.onRefresh(),
        new Promise((r) => setTimeout(r, 450)),
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      class={s.btn}
      classList={{ [s.spinning]: busy() }}
      onClick={handleClick}
      disabled={busy()}
      aria-label={props.label ?? "Refresh"}
      title={props.label ?? "Refresh"}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
    </button>
  );
};

export default RefreshButton;
