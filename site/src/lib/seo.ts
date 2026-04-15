import { onMount, onCleanup } from "solid-js";

export const SITE_ORIGIN = "https://fluel.io";

/**
 * Imperative low-level: write the canonical link tag and return a restore
 * function. Use directly inside createEffect when the canonical depends on
 * reactive state (e.g. route params on a dynamic route).
 */
export function setCanonical(pathOrUrl: string): () => void {
  const href = pathOrUrl.startsWith("http") ? pathOrUrl : `${SITE_ORIGIN}${pathOrUrl}`;
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  const previous = link?.getAttribute("href") ?? null;
  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
  return () => {
    if (previous !== null) link!.setAttribute("href", previous);
    else link!.remove();
  };
}

/**
 * Set <link rel="canonical"> for the duration of a page's lifetime.
 * Restores the previous value on unmount so the next page can set its own.
 *
 * Pass either an absolute URL or a path (which will be prefixed with
 * SITE_ORIGIN). For static canonicals only — for params-dependent routes,
 * call setCanonical() from inside createEffect.
 */
export function useCanonical(pathOrUrl: string): void {
  onMount(() => {
    const restore = setCanonical(pathOrUrl);
    onCleanup(restore);
  });
}
