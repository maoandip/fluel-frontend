import { createSignal, createEffect, type Signal } from "solid-js";

/**
 * Persisted signal backed by localStorage.
 * Reads the initial value synchronously on first call, writes back on change.
 * If localStorage throws (private mode, disabled), the signal still works in-memory.
 */
export function useLocalStorage<T extends string>(
  key: string,
  initial: T,
): Signal<T> {
  let first: T = initial;
  try {
    const stored = localStorage.getItem(key);
    if (stored !== null) first = stored as T;
  } catch {
    // storage disabled
  }

  const [value, setValue] = createSignal<T>(first);

  createEffect(() => {
    try {
      localStorage.setItem(key, value());
    } catch {
      // storage disabled
    }
  });

  return [value, setValue];
}
