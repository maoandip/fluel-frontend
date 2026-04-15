// Valibot schemas for API responses.
// Applied in api.ts to catch backend shape drift at the seam. Schemas must
// stay in sync with ../types.ts for the cross-file types, and with the
// gas-station backend's handler return shapes in src/api.ts for the
// envelope/wrapper shapes that live only on the wire.
//
// Nullable vs optional: the backend uses explicit null as "no value yet"
// (e.g. lastTxHash, claimedAt), so prefer v.nullish(T) over v.optional(T)
// for any field that could be absent or null — nullish covers both. Reserve
// v.optional for strictly-undefined cases where the backend would omit the
// key entirely.

import * as v from "valibot";

// ── Session ────────────────────────────────────────────────────────

export const SessionResponseSchema = v.object({
  walletAddress: v.string(),
  destinationAddress: v.nullable(v.string()),
  hasQuote: v.boolean(),
  // Backend sends explicit null for users with no swap history.
  lastTxHash: v.nullish(v.string()),
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
// substatus and message come from LI.FI and may be absent or null until the
// route resolves — nullish covers all three possibilities (string | null |
// undefined) without forcing the backend to coerce missing values to "".

export const SwapStatusSchema = v.object({
  status: v.string(),
  substatus: v.nullish(v.string()),
  message: v.nullish(v.string()),
});

// ── Confirm ────────────────────────────────────────────────────────

export const ConfirmResponseSchema = v.object({
  txHash: v.string(),
});

// ── Destination ────────────────────────────────────────────────────

export const DestinationResponseSchema = v.object({
  destinationAddress: v.string(),
});

// ── Gas prices ─────────────────────────────────────────────────────
// Backend serializes keys of the `prices` record as JSON strings even though
// they're conceptually numeric chain IDs.

const GasPriceChainSchema = v.object({
  id: v.number(),
  name: v.string(),
  icon: v.optional(v.string()),
});

export const GasPricesResponseSchema = v.object({
  prices: v.record(v.string(), v.number()),
  chains: v.array(GasPriceChainSchema),
});

// ── Gas alerts ─────────────────────────────────────────────────────

const GasAlertSchema = v.object({
  id: v.number(),
  userId: v.number(),
  chainId: v.number(),
  chainName: v.string(),
  thresholdGwei: v.number(),
  lastNotifiedAt: v.number(),
  createdAt: v.number(),
});

export const AlertListResponseSchema = v.object({
  alerts: v.array(GasAlertSchema),
});

export const AlertCreateResponseSchema = v.object({
  ok: v.boolean(),
});

export const AlertDeleteResponseSchema = v.object({
  removed: v.boolean(),
});

// ── Auto-refills ───────────────────────────────────────────────────
// `enabled` is stored as INTEGER (0/1) in SQLite, so it comes across as a
// number, not a boolean — don't "fix" this without also changing the backend.

const AutoRefillSchema = v.object({
  id: v.number(),
  userId: v.number(),
  chainId: v.number(),
  chainName: v.string(),
  thresholdNative: v.number(),
  refillAmountUsd: v.number(),
  sourceChainId: v.number(),
  sourceChainName: v.string(),
  enabled: v.number(),
  lastTriggeredAt: v.number(),
  createdAt: v.number(),
});

export const RefillListResponseSchema = v.object({
  refills: v.array(AutoRefillSchema),
});

export const RefillCreateResponseSchema = v.object({
  refill: AutoRefillSchema,
});

export const RefillDeleteResponseSchema = v.object({
  removed: v.boolean(),
});

// ── Referrals ──────────────────────────────────────────────────────

export const ReferralStatsResponseSchema = v.object({
  inviteCount: v.number(),
  activatedCount: v.number(),
  totalFeesEarned: v.string(),
  slotsRemaining: v.number(),
  refLink: v.string(),
});

// ── Gifts ──────────────────────────────────────────────────────────
// recipientId, txHash, claimedAt, senderDestination can all be null for
// pending gifts; status may be 'pending' | 'claiming' | 'claimed' | 'expired'
// | 'error' but the schema leaves it as a free-form string so new states
// don't break the seam.

const GiftSchema = v.object({
  id: v.number(),
  code: v.string(),
  senderId: v.number(),
  amountUsd: v.number(),
  chainId: v.number(),
  chainName: v.string(),
  status: v.string(),
  recipientId: v.nullable(v.number()),
  txHash: v.nullable(v.string()),
  createdAt: v.number(),
  claimedAt: v.nullable(v.number()),
  senderDestination: v.nullish(v.string()),
});

export const GiftListResponseSchema = v.object({
  gifts: v.array(GiftSchema),
});

export const GiftCreateResponseSchema = v.object({
  gift: GiftSchema,
  claimLink: v.string(),
});

// ── Withdraw ───────────────────────────────────────────────────────

const WithdrawResultSchema = v.object({
  txHash: v.string(),
  chainId: v.number(),
  chainName: v.string(),
  amount: v.string(),
  symbol: v.string(),
});

export const WithdrawResponseSchema = v.object({
  withdrawals: v.array(WithdrawResultSchema),
});

// ── LI.FI history ──────────────────────────────────────────────────
// This endpoint is a pass-through from LI.FI's /analytics/transfers. Their
// shape is large and evolving, so we validate only the top-level envelope
// — `transfers` must be an array — and let the inner objects flow through
// typed by the LifiTransfer interface in api.ts. A stricter schema would
// drift every time LI.FI adds a field.

export const LifiHistoryResponseSchema = v.object({
  transfers: v.array(v.unknown()),
});
