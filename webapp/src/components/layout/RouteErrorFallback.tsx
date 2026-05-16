import { ApiError } from "../../api";
import s from "./RouteErrorFallback.module.css";

interface Props {
  err: unknown;
  reset: () => void;
}

export default function RouteErrorFallback(props: Props) {
  const isRateLimit = () => props.err instanceof ApiError && props.err.status === 429;

  const kicker = () => isRateLimit() ? "Slow down a sec" : "Something went wrong";
  const title = () => isRateLimit() ? "Too many requests" : "We hit a snag.";
  const message = () => {
    if (isRateLimit()) {
      const sec = (props.err as ApiError).retryAfter;
      return sec
        ? `Please wait about ${sec}s and try again.`
        : "Please wait a moment and try again.";
    }
    // ApiError messages were already cleaned server-side; show as-is.
    // Anything else (frontend JS bug, schema-mismatch from valibot) gets a
    // generic message so internal paths don't leak through the top-level boundary.
    if (props.err instanceof ApiError) return props.err.message;
    return "Something went wrong. Please try again. If it persists, contact contact@fluel.io.";
  };

  return (
    <div class={s.root} role="alert">
      <div class={s.box}>
        <div class={s.kicker}>{kicker()}</div>
        <h1 class={s.title}>{title()}</h1>
        <p class={s.body}>{message()}</p>
        <button class={s.retry} onClick={() => props.reset()}>
          Try again
        </button>
      </div>
    </div>
  );
}
