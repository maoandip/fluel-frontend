import { Show } from "solid-js";
import s from "./TokenChainIcon.module.css";

export interface TokenChainIconProps {
  /** Main token image URL (optional — shows fallback letter if missing) */
  tokenIcon?: string;
  /** Fallback letter if no token icon */
  tokenSymbol?: string;
  /** Chain badge image URL */
  chainIcon?: string;
  /** Main icon size in px */
  size?: number;
  /** Badge size in px */
  badgeSize?: number;
}

const GAP = 2;

export default function TokenChainIcon(props: TokenChainIconProps) {
  const size = () => props.size ?? 28;
  const badge = () => props.badgeSize ?? 12;
  const maskRadius = () => badge() / 2 + GAP;

  // Per-instance CSS variables — visual styling lives in TokenChainIcon.module.css.
  const cssVars = () => ({
    "--tci-size": `${size()}px`,
    "--tci-badge": `${badge()}px`,
    "--tci-mask-r": `${maskRadius()}px`,
    "--tci-fallback-font": `${Math.round(size() * 0.4)}px`,
  } as Record<string, string>);

  return (
    <div class={s.root} style={cssVars()}>
      <Show when={props.tokenIcon} fallback={
        <div class={s.fallback}>{(props.tokenSymbol ?? "?")[0]}</div>
      }>
        <img class={s.token} src={props.tokenIcon} alt="" />
      </Show>
      <Show when={props.chainIcon}>
        <img class={s.badge} src={props.chainIcon} alt="" />
      </Show>
    </div>
  );
}
