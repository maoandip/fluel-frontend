import type { JSX } from "solid-js";
import { Show } from "solid-js";
import s from "./EmptyState.module.css";

export interface EmptyStateProps {
  icon?: JSX.Element;
  message: string;
  hint?: string;
}

export default function EmptyState(props: EmptyStateProps) {
  return (
    <div class={s.container}>
      <Show when={props.icon}>
        <div class={s.icon}>{props.icon}</div>
      </Show>
      <div class={s.message}>{props.message}</div>
      <Show when={props.hint}>
        <div class={s.hint}>{props.hint}</div>
      </Show>
    </div>
  );
}
