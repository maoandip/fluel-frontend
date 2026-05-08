import { ApiError } from "../../api";

interface Props {
  err: unknown;
  reset: () => void;
  /** Lowercase noun for the failed query, e.g. "balances", "gas prices". */
  label: string;
  /** Re-runs the underlying query (typically refetchX or revalidate(...)). */
  refetch: () => void;
}

// Per-section ErrorBoundary fallback. Recognises 429s from ApiError so a
// rate-limited section doesn't read as a generic outage, and so the Retry
// button tells the user how long to wait if Retry-After was set.
export default function QueryErrorFallback(props: Props) {
  const isRateLimit = () => props.err instanceof ApiError && props.err.status === 429;
  const retryAfter = () => isRateLimit() ? (props.err as ApiError).retryAfter : undefined;

  const message = () => {
    if (isRateLimit()) {
      const sec = retryAfter();
      return sec
        ? `Too many requests — retry in about ${sec}s.`
        : "Too many requests — wait a moment.";
    }
    return `Failed to load ${props.label}`;
  };

  return (
    <div class="error-state">
      <span class="error-state-msg">{message()}</span>
      <button class="retry-btn" onClick={() => { props.refetch(); props.reset(); }}>
        Retry
      </button>
    </div>
  );
}
