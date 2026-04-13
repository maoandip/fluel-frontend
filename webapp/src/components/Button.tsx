import type { JSX } from "solid-js";
import s from "./Button.module.css";

export interface ButtonProps {
  children: JSX.Element;
  variant?: "primary" | "secondary";
  size?: "default" | "sm";
  disabled?: boolean;
  onClick?: () => void;
  class?: string;
}

export default function Button(props: ButtonProps) {
  const variant = () => props.variant ?? "primary";
  const size = () => props.size ?? "default";

  const classes = () => {
    const base = variant() === "primary" ? s.primary : s.secondary;
    const sz = size() === "sm" ? s.sm : s.default;
    return [base, sz, props.class].filter(Boolean).join(" ");
  };

  return (
    <button
      class={classes()}
      disabled={props.disabled}
      onClick={() => !props.disabled && props.onClick?.()}
    >
      {props.children}
    </button>
  );
}
