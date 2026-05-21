import { BOT_URL } from "../config/links";

interface Props {
  class?: string;
  botLabel?: string;
  onClick?: () => void;
}

export default function CtaButton(props: Props) {
  return (
    <a
      href={BOT_URL}
      class={props.class}
      target="_blank"
      rel="noopener"
      onClick={() => props.onClick?.()}
    >
      {props.botLabel ?? "Get gas now"}
    </a>
  );
}
