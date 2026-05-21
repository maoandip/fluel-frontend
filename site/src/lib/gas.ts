// Shared gas-price formatting for the live-price grids on the Landing and
// Chains pages.

/**
 * Format a gwei value compactly. Sub-0.1 values use subscript notation for the
 * run of leading zeros, e.g. 0.00031 → "0.0₃31".
 */
export function fmtGwei(g: number): string {
  if (g >= 1) return g.toFixed(1);
  if (g >= 0.1) return g.toFixed(2);

  const s = g.toFixed(12).replace(/0+$/, "");
  const match = s.match(/^0\.(0*)(\d{1,3})/);
  if (!match) return g.toPrecision(3);

  const leadingZeros = match[1].length;
  const significant = match[2];
  if (leadingZeros === 0) return `0.${significant}`;

  // Subscript digits: U+2080 through U+2089
  const subscriptDigits = "₀₁₂₃₄₅₆₇₈₉";
  const subscript = String(leadingZeros).split("").map((d) => subscriptDigits[parseInt(d)]).join("");
  return `0.0${subscript}${significant}`;
}

/** Classify a gwei value into a low / mid / high band. */
export function gweiLevel(g: number): "low" | "mid" | "high" {
  if (g < 10) return "low";
  if (g < 50) return "mid";
  return "high";
}

/** CSS-module class keys per gas level — for price cards and gwei text. */
export const cardLevelClass = { low: "cardLow", mid: "cardMid", high: "cardHigh" } as const;
export const gweiLevelClass = { low: "gweiLow", mid: "gweiMid", high: "gweiHigh" } as const;
