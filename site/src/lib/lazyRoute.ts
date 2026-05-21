import { lazy, type Component } from "solid-js";

// Resilient route-level code splitting.
//
// Each deploy gives chunks new hashed filenames. A visitor still on an older
// page will 404 when it tries to dynamically import the next route's chunk
// ("Failed to fetch dynamically imported module"). That's not a real error —
// the fix is to reload, which pulls the fresh index.html and its new chunk
// names, landing the user on the route they asked for.
//
// A sessionStorage flag ensures we only auto-reload once, so a genuine,
// persistent import failure still surfaces instead of looping.

const RELOAD_FLAG = "fluel:chunk-reloaded";

function reloadedAlready(): boolean {
  try { return sessionStorage.getItem(RELOAD_FLAG) === "1"; } catch { return false; }
}
function markReloaded(): void {
  try { sessionStorage.setItem(RELOAD_FLAG, "1"); } catch { /* storage unavailable */ }
}
function clearReloaded(): void {
  try { sessionStorage.removeItem(RELOAD_FLAG); } catch { /* storage unavailable */ }
}

function isChunkLoadError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /dynamically imported module|module script failed|error loading dynamically/i.test(msg);
}

/** Like solid-js `lazy`, but reloads once on a stale-chunk import failure. */
export function lazyRoute(importFn: () => Promise<{ default: Component }>) {
  return lazy(() =>
    importFn()
      .then((mod) => {
        clearReloaded(); // a fresh load succeeded — re-arm for the next deploy
        return mod;
      })
      .catch((err: unknown) => {
        if (isChunkLoadError(err) && !reloadedAlready()) {
          markReloaded();
          window.location.reload();
          // Never resolve — let the reload navigate away rather than flash
          // the route error fallback.
          return new Promise<{ default: Component }>(() => {});
        }
        throw err;
      }),
  );
}
