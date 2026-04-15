import { Suspense, ErrorBoundary, type JSX } from "solid-js";
import { revalidate } from "@solidjs/router";
import s from "./AsyncSection.module.css";

interface Props {
  /** Query cache key(s) to revalidate when the user hits retry. */
  queryKey: string | string[];
  /** Rendered while the data is loading. */
  fallback: JSX.Element;
  /** User-facing error copy. Defaults to a generic message. */
  errorMessage?: string;
  children: JSX.Element;
}

/**
 * Section-scoped async boundary.
 *
 * Wraps data-dependent children in ErrorBoundary + Suspense so a failed
 * fetch only blanks this section — the surrounding page keeps rendering.
 * Retry calls revalidate(queryKey) to bust the cache, then reset() so the
 * subtree re-renders and re-fetches. Using plain ErrorBoundary.reset()
 * without revalidate is the footgun this component prevents.
 */
export default function AsyncSection(props: Props) {
  const keys = () => (Array.isArray(props.queryKey) ? props.queryKey : [props.queryKey]);

  const handleRetry = async (reset: () => void) => {
    await Promise.all(keys().map((k) => revalidate(k)));
    reset();
  };

  return (
    <ErrorBoundary
      fallback={(_err, reset) => (
        <div class={s.error} role="alert">
          <p class={s.errorMsg}>{props.errorMessage ?? "Couldn't load this section."}</p>
          <button class={s.retry} onClick={() => handleRetry(reset)}>
            Try again
          </button>
        </div>
      )}
    >
      <Suspense fallback={props.fallback}>{props.children}</Suspense>
    </ErrorBoundary>
  );
}
