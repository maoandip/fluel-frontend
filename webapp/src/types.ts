export const NATIVE_TOKEN = "0x0000000000000000000000000000000000000000";

export interface Chain {
  name: string;
  id: number;
  native: string;
  icon?: string;
  nativeIcon?: string;
  stableIcon?: string;
}

export interface TokenBalance {
  chainId: number;
  address: string;
  symbol: string;
  decimals: number;
  amount: string; // raw amount in smallest unit
  priceUSD: string;
}

export interface QuoteResponse {
  toAmount: string;
  toAmountMin: string;
  toAmountUsd: string | null;
  toSymbol: string;
  gasCostUsd: string;
  feeCostUsd: string;
  executionDuration: number;
  tool: string;
  toolIcon: string | null;
}

export interface GasAlert {
  chainName: string;
  thresholdGwei: number;
}

export interface AutoRefill {
  chainName: string;
  thresholdNative: number;
  refillAmountUsd: number;
  sourceChainName: string;
}

export interface GasPriceData {
  prices: Record<number, number>;
  chains: Array<{ id: number; name: string; icon?: string }>;
}

export interface ReferralStats {
  inviteCount: number;
  activatedCount: number;
  totalFeesEarned: string;
  slotsRemaining: number;
  refLink: string;
}

export interface Gift {
  id: number;
  code: string;
  senderId: number;
  amountUsd: number;
  chainId: number;
  chainName: string;
  status: string;
  recipientId: number | null;
  txHash: string | null;
  createdAt: number;
  claimedAt: number | null;
}
