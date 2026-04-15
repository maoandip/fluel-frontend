import { query } from "@solidjs/router";
import { apiUrl } from "./api";

export interface PriceChain {
  id: number;
  name: string;
  icon?: string;
}

export interface PricesResponse {
  prices: Record<string, number>;
  chains: PriceChain[];
}

/**
 * Cached prices fetch. Both /chains and / (Landing) consume this — the
 * Solid Router `query()` wrapper dedupes concurrent calls and memoizes
 * the result by the call arguments (none, here), so switching between
 * pages reuses the first fetch.
 */
export const getPrices = query(async (): Promise<PricesResponse> => {
  const res = await fetch(apiUrl("/prices"));
  if (!res.ok) throw new Error(`Failed to load prices (${res.status})`);
  return res.json();
}, "prices");
