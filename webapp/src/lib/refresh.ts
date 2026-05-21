import { revalidate } from "@solidjs/router";

// Centralised query-cache refresh. The keep-alive tab shell (App.tsx) mounts
// each page once and never unmounts it, so the old "navigate → remount →
// refetch" no longer happens. These helpers restore freshness explicitly:
// pages get revalidated when they're shown again, on app focus, and after a
// mutation — without spamming the API for data that was just fetched.

// Query keys (see lib/queries.ts) grouped by the tab that displays them.
const KEYS_BY_TAB: Record<string, string[]> = {
  "/": ["balances"],
  "/balance": ["balances"],
  "/history": ["history"],
  "/automate": ["gasPrices", "alerts", "refills"],
  "/invite": ["referralStats", "gifts"],
};

/** Query keys backing a given tab path (empty for unknown paths). */
export function keysForTab(path: string): string[] {
  return KEYS_BY_TAB[path] ?? [];
}

// When each key was last known-fresh (revalidated, or first observed).
const lastRefreshed = new Map<string, number>();

/**
 * Revalidate the given keys, but only those older than ttlMs — so switching
 * tabs or refocusing the app doesn't refetch data fetched moments ago.
 *
 * The first time a key is seen it is assumed fresh (the page that owns it is
 * loading it itself) and its clock simply starts, so initial mount and the
 * first visit to a tab never double-fetch.
 */
export function revalidateStale(keys: string[], ttlMs: number): void {
  const now = Date.now();
  const stale: string[] = [];
  for (const k of keys) {
    const last = lastRefreshed.get(k);
    if (last === undefined) lastRefreshed.set(k, now);
    else if (now - last >= ttlMs) stale.push(k);
  }
  if (stale.length === 0) return;
  for (const k of stale) lastRefreshed.set(k, now);
  void revalidate(stale);
}

/** Revalidate keys unconditionally (use after a mutation) and mark them fresh. */
export function revalidateNow(keys: string[]): Promise<void> {
  const now = Date.now();
  for (const k of keys) lastRefreshed.set(k, now);
  return revalidate(keys);
}
