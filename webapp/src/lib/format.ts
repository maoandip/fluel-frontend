/**
 * Format gwei with subscript-zero notation for tiny values.
 *
 * Examples:
 *   fmtGwei(23.5)    -> "23.5"
 *   fmtGwei(1.2)     -> "1.2"
 *   fmtGwei(0.042)   -> "0.042"
 *   fmtGwei(0.00031) -> "0.0₃31"   (3 leading zeros after decimal → subscript)
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
  const subscript = String(leadingZeros)
    .split("")
    .map((d) => subscriptDigits[parseInt(d)])
    .join("");

  return `0.0${subscript}${significant}`;
}

/**
 * Classify a gwei value as low/mid/high for visual styling.
 */
export function gweiLevel(g: number): "low" | "mid" | "high" {
  if (g < 10) return "low";
  if (g < 50) return "mid";
  return "high";
}
