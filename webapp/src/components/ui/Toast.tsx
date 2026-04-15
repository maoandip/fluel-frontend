import { Show } from "solid-js";
import { message, visible, hideToast } from "../../stores/toast";
import s from "./Toast.module.css";

export default function Toast() {
  return (
    <Show when={visible()}>
      <div class={s.pill} role="alert" aria-live="polite" onClick={hideToast}>
        {message()}
      </div>
    </Show>
  );
}
