import type { JSX } from "solid-js";

type SmallParts =
  | { kind: "plain"; text: string }
  | { kind: "sub"; zeros: number; sig: string };

function parseSmall(n: number): SmallParts {
  if (n >= 1) return { kind: "plain", text: n.toFixed(1) };
  if (n >= 0.1) return { kind: "plain", text: n.toFixed(2) };

  const s = n.toFixed(12).replace(/0+$/, "");
  const match = s.match(/^0\.(0*)(\d{1,3})/);
  if (!match) return { kind: "plain", text: n.toPrecision(3) };

  const leadingZeros = match[1].length;
  const significant = match[2];

  if (leadingZeros === 0) return { kind: "plain", text: `0.${significant}` };

  return { kind: "sub", zeros: leadingZeros, sig: significant };
}

// String form with Unicode subscripts (e.g. "0.0₃31"). In JSX contexts prefer
// fmtSmallEl — the Unicode glyphs are too small to read at body text sizes.
export function fmtSmall(n: number): string {
  const p = parseSmall(n);
  if (p.kind === "plain") return p.text;
  const subscriptDigits = "₀₁₂₃₄₅₆₇₈₉";
  const subscript = String(p.zeros)
    .split("")
    .map((d) => subscriptDigits[parseInt(d)])
    .join("");
  return `0.0${subscript}${p.sig}`;
}

export function fmtSmallEl(n: number): JSX.Element {
  const p = parseSmall(n);
  if (p.kind === "plain") return p.text;
  return (
    <>
      0.0<sub class="fmt-sub">{p.zeros}</sub>{p.sig}
    </>
  );
}

export function gweiLevel(g: number): "low" | "mid" | "high" {
  if (g < 10) return "low";
  if (g < 50) return "mid";
  return "high";
}

export function timeAgo(tsSeconds: number): string {
  const diffMs = Date.now() - tsSeconds * 1000;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(tsSeconds * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
