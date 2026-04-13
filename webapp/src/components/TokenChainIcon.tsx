import { Show } from "solid-js";

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

export default function TokenChainIcon(props: TokenChainIconProps) {
  const size = () => props.size ?? 28;
  const badge = () => props.badgeSize ?? 12;
  const gap = 2;
  const maskRadius = () => badge() / 2 + gap;

  return (
    <div
      class="tci"
      style={{
        position: "relative",
        width: `${size()}px`,
        height: `${size()}px`,
        "flex-shrink": "0",
      }}
    >
      {/* Main token icon with mask cutout */}
      <Show when={props.tokenIcon} fallback={
        <div
          style={{
            width: `${size()}px`,
            height: `${size()}px`,
            "border-radius": "50%",
            background: "rgba(0,255,178,0.1)",
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
            "font-family": "var(--font)",
            "font-size": `${Math.round(size() * 0.4)}px`,
            "font-weight": "700",
            color: "var(--c-accent)",
            mask: `radial-gradient(circle ${maskRadius()}px at calc(100% - 14%) calc(100% - 14%), transparent 96%, white) 100% 100% / 100% 100% no-repeat`,
            "-webkit-mask": `radial-gradient(circle ${maskRadius()}px at calc(100% - 14%) calc(100% - 14%), transparent 96%, white) 100% 100% / 100% 100% no-repeat`,
          }}
        >
          {(props.tokenSymbol ?? "?")[0]}
        </div>
      }>
        <img
          src={props.tokenIcon}
          alt=""
          style={{
            width: `${size()}px`,
            height: `${size()}px`,
            "border-radius": "50%",
            "object-fit": "contain",
            mask: `radial-gradient(circle ${maskRadius()}px at calc(100% - 14%) calc(100% - 14%), transparent 96%, white) 100% 100% / 100% 100% no-repeat`,
            "-webkit-mask": `radial-gradient(circle ${maskRadius()}px at calc(100% - 14%) calc(100% - 14%), transparent 96%, white) 100% 100% / 100% 100% no-repeat`,
          }}
        />
      </Show>

      {/* Chain badge */}
      <Show when={props.chainIcon}>
        <img
          src={props.chainIcon}
          alt=""
          style={{
            position: "absolute",
            bottom: "0",
            right: "0",
            width: `${badge()}px`,
            height: `${badge()}px`,
            "border-radius": "50%",
            "object-fit": "contain",
            background: "var(--c-bg)",
          }}
        />
      </Show>
    </div>
  );
}
