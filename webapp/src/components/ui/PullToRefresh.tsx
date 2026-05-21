import { Component, type JSX, createSignal, onMount, onCleanup } from "solid-js";
import { haptic } from "../../lib/telegram";
import s from "./PullToRefresh.module.css";

// Pull-to-refresh wrapper. The rendered div IS the scroll viewport; dragging
// it down while already scrolled to the top reveals a spinner and, past a
// threshold, runs onRefresh. Relies on Telegram's vertical-swipe gesture
// being disabled (see initTelegram) — otherwise the drag is consumed by the
// minimise gesture.

const THRESHOLD = 64;   // px of pull before release triggers a refresh
const MAX_PULL = 96;    // px hard cap on the rubber-band
const DAMP = 0.5;       // finger-travel → pull-distance damping

const PullToRefresh: Component<{
  onRefresh: () => Promise<unknown>;
  /** Extra class for the scroll viewport — e.g. to set its max-height. */
  class?: string;
  /** Forwarded scroll handler, so the host can keep its own infinite scroll. */
  onScroll?: (e: Event) => void;
  children: JSX.Element;
}> = (props) => {
  let viewport: HTMLDivElement | undefined;
  const [pull, setPull] = createSignal(0);
  const [refreshing, setRefreshing] = createSignal(false);
  const [snapping, setSnapping] = createSignal(true);
  let startY = 0;
  let armed = false;

  function onTouchStart(e: TouchEvent) {
    if (refreshing()) return;
    // Only arm if the viewport is already at the very top.
    armed = !!viewport && viewport.scrollTop <= 0;
    startY = e.touches[0]?.clientY ?? 0;
    setSnapping(false);
  }

  function onTouchMove(e: TouchEvent) {
    if (!armed || refreshing()) return;
    const dy = (e.touches[0]?.clientY ?? startY) - startY;
    // Reversed direction, or the viewport scrolled off the top — disengage.
    if (dy <= 0 || (viewport && viewport.scrollTop > 0)) {
      armed = false;
      setSnapping(true);
      setPull(0);
      return;
    }
    // Non-passive listener (attached in onMount) makes this effective — it
    // stops the viewport's own overscroll while a pull is in progress.
    e.preventDefault();
    setPull(Math.min(MAX_PULL, dy * DAMP));
  }

  async function onTouchEnd() {
    if (!armed) return;
    armed = false;
    setSnapping(true);
    if (pull() < THRESHOLD || refreshing()) {
      setPull(0);
      return;
    }
    setRefreshing(true);
    setPull(THRESHOLD);
    haptic("light");
    try {
      // Hold the spinner briefly so a fast refetch still reads as feedback.
      await Promise.all([props.onRefresh(), new Promise((r) => setTimeout(r, 500))]);
    } finally {
      setRefreshing(false);
      setPull(0);
    }
  }

  onMount(() => {
    // touchmove must be non-passive for preventDefault to take effect.
    viewport?.addEventListener("touchmove", onTouchMove, { passive: false });
  });
  onCleanup(() => {
    viewport?.removeEventListener("touchmove", onTouchMove);
  });

  return (
    <div
      ref={viewport}
      class={`${s.viewport} ${props.class ?? ""}`}
      onScroll={(e) => props.onScroll?.(e)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    >
      <div
        class={s.indicator}
        classList={{ [s.snapping]: snapping() }}
        style={{ height: `${pull()}px` }}
      >
        <div
          class={s.spinner}
          classList={{ [s.spinning]: refreshing() }}
          style={{ opacity: String(Math.min(1, pull() / THRESHOLD)) }}
        />
      </div>
      {props.children}
    </div>
  );
};

export default PullToRefresh;
