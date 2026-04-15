import { Show } from "solid-js";
import { A } from "@solidjs/router";
import { BOT_URL } from "../config/links";
import { BETA_MODE } from "../config/flags";

interface Props {
  class?: string;
  botLabel?: string;      // shown when NOT in beta mode
  waitlistLabel?: string; // shown when in beta mode
  onClick?: () => void;
}

export default function CtaButton(props: Props) {
  return (
    <Show when={BETA_MODE} fallback={
      <a
        href={BOT_URL}
        class={props.class}
        target="_blank"
        rel="noopener"
        onClick={props.onClick}
      >
        {props.botLabel ?? "Get gas now"}
      </a>
    }>
      <A href="/feedback" class={props.class} onClick={props.onClick}>
        {props.waitlistLabel ?? "Join waitlist"}
      </A>
    </Show>
  );
}
