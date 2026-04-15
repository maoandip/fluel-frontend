import s from "./RouteErrorFallback.module.css";

interface Props {
  err: unknown;
  reset: () => void;
}

export default function RouteErrorFallback(props: Props) {
  const message = () => {
    if (props.err instanceof Error) return props.err.message;
    if (typeof props.err === "string") return props.err;
    return "An unexpected error occurred.";
  };

  return (
    <div class={s.root} role="alert">
      <div class={s.box}>
        <div class={s.kicker}>Something went wrong</div>
        <h1 class={s.title}>We hit a snag.</h1>
        <p class={s.body}>{message()}</p>
        <button class={s.retry} onClick={() => props.reset()}>
          Try again
        </button>
      </div>
    </div>
  );
}
