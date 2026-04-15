// Valibot schemas for API responses.
// Applied in api.ts to catch backend shape drift at the seam. Schemas must
// stay in sync with ../types.ts.

import * as v from "valibot";

// ── Session ────────────────────────────────────────────────────────
export const SessionResponseSchema = v.object({
  walletAddress: v.string(),
  destinationAddress: v.nullable(v.string()),
  hasQuote: v.boolean(),
  lastTxHash: v.optional(v.string()),
});

// ── Chain ──────────────────────────────────────────────────────────
const ChainSchema = v.object({
  name: v.string(),
  id: v.number(),
  native: v.string(),
  icon: v.optional(v.string()),
  nativeIcon: v.optional(v.string()),
  stableIcon: v.optional(v.string()),
});

export const ChainsResponseSchema = v.object({
  chains: v.array(ChainSchema),
  receiveChains: v.array(ChainSchema),
  count: v.number(),
});

// ── Balances ───────────────────────────────────────────────────────
const TokenBalanceSchema = v.object({
  chainId: v.number(),
  address: v.string(),
  symbol: v.string(),
  decimals: v.number(),
  amount: v.string(),
  priceUSD: v.string(),
});

export const BalancesResponseSchema = v.object({
  balances: v.record(v.string(), v.array(TokenBalanceSchema)),
});

// ── Quote ──────────────────────────────────────────────────────────
export const QuoteResponseSchema = v.object({
  toAmount: v.string(),
  toAmountMin: v.string(),
  toAmountUsd: v.nullable(v.string()),
  toSymbol: v.string(),
  gasCostUsd: v.string(),
  feeCostUsd: v.string(),
  executionDuration: v.number(),
  tool: v.string(),
  toolIcon: v.nullable(v.string()),
});

// ── Swap status ────────────────────────────────────────────────────
export const SwapStatusSchema = v.object({
  status: v.string(),
  substatus: v.string(),
  message: v.string(),
});

// ── Confirm ────────────────────────────────────────────────────────
export const ConfirmResponseSchema = v.object({
  txHash: v.string(),
});
