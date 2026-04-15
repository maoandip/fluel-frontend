import { createSignal, createEffect, onCleanup, type Accessor } from "solid-js";

/**
 * Returns a debounced version of a reactive accessor. The returned accessor
 * lags the source by `ms` milliseconds after the last change.
 *
 * Use when you want to react to a rapidly changing signal (text input, slider)
 * without firing effects on every keystroke.
 */
export function useDebounced<T>(source: Accessor<T>, ms: number): Accessor<T> {
  const [debounced, setDebounced] = createSignal<T>(source());

  createEffect(() => {
    const v = source();
    const t = setTimeout(() => setDebounced(() => v), ms);
    onCleanup(() => clearTimeout(t));
  });

  return debounced;
}
