import { tg } from "./telegram";
import type {
  Chain,
  BalancesByChain,
  QuoteResponse,
  ConfirmResponse,
  Transaction,
  GasAlert,
  AutoRefill,
  GasPriceData,
  ReferralStats,
  Gift,
} from "./types";

// ── Fetch wrapper ──────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "X-Telegram-Init-Data": tg.initData,
    ...((options.headers as Record<string, string>) ?? {}),
  };

  if (options.body && typeof options.body === "string") {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ── Session ────────────────────────────────────────────────────────

export function getSession() {
  return api<{ walletAddress: string; destinationAddress: string | null; hasQuote: boolean; lastTxHash?: string }>("/api/session");
}

export function setDestination(address: string) {
  return api<{ destinationAddress: string }>("/api/destination", {
    method: "POST",
    body: JSON.stringify({ address }),
  });
}

// ── Chains ─────────────────────────────────────────────────────────

export function getChains() {
  return api<{ chains: Chain[]; receiveChains: Chain[]; count: number }>("/api/chains");
}

// ── Balances ───────────────────────────────────────────────────────

export function getBalances() {
  return api<{ balances: BalancesByChain }>("/api/balances");
}

// ── Quote ──────────────────────────────────────────────────────────

export function postQuote(amount: string, fromChain: string, toChain: string, signal?: AbortSignal) {
  return api<QuoteResponse>("/api/quote", {
    method: "POST",
    body: JSON.stringify({ amount, fromChain, toChain }),
    signal,
  });
}

// ── Confirm ────────────────────────────────────────────────────────

export function postConfirm() {
  return api<ConfirmResponse>("/api/confirm", { method: "POST" });
}

// ── Swap status ───────────────────────────────────────────────────

export interface SwapStatus {
  status: string;
  substatus: string;
  message: string;
}

export function getSwapStatus(txHash: string) {
  return api<SwapStatus>(`/api/status?txHash=${encodeURIComponent(txHash)}`);
}

// ── History ────────────────────────────────────────────────────────

export function getHistory() {
  return api<{ history: Transaction[] }>("/api/history");
}

export interface LifiToken {
  address: string;
  chainId: number;
  symbol: string;
  decimals: number;
  name: string;
  logoURI?: string;
  priceUSD?: string;
}

export interface LifiTransferStep {
  txHash: string;
  txLink: string;
  token: LifiToken;
  chainId: number;
  amount: string;
  amountUSD: string;
  gasAmountUSD?: string;
  timestamp: number;
}

export interface LifiTransfer {
  transactionId: string;
  sending: LifiTransferStep;
  receiving: LifiTransferStep;
  lifiExplorerLink: string;
  fromAddress: string;
  toAddress: string;
  tool: string;
  status: string;
  substatus?: string;
  substatusMessage?: string;
}

export interface LifiHistoryResponse {
  transfers: LifiTransfer[];
}

export function getLifiHistory(page = 1, pageSize = 20) {
  return api<LifiHistoryResponse>(`/api/lifi-history?page=${page}&pageSize=${pageSize}`);
}

// ── Gas prices ─────────────────────────────────────────────────────

export function getGasPrices() {
  return api<GasPriceData>("/api/gas-prices");
}

// ── Alerts ─────────────────────────────────────────────────────────

export function getAlerts() {
  return api<{ alerts: GasAlert[] }>("/api/alerts");
}

export function postAlert(chainName: string, thresholdGwei: number) {
  return api<GasAlert>("/api/alerts", {
    method: "POST",
    body: JSON.stringify({ chainName, thresholdGwei }),
  });
}

export function deleteAlert(chainName: string) {
  return api<{ ok: boolean }>("/api/alerts", {
    method: "DELETE",
    body: JSON.stringify({ chainName }),
  });
}

// ── Auto-refills ───────────────────────────────────────────────────

export function getRefills() {
  return api<{ refills: AutoRefill[] }>("/api/refills");
}

export function postRefill(chainName: string, thresholdNative: number, refillAmountUsd: number, sourceChainName: string) {
  return api<AutoRefill>("/api/refills", {
    method: "POST",
    body: JSON.stringify({ chainName, thresholdNative, refillAmountUsd, sourceChainName }),
  });
}

export function deleteRefill(chainName: string) {
  return api<{ ok: boolean }>("/api/refills", {
    method: "DELETE",
    body: JSON.stringify({ chainName }),
  });
}

// ── Referrals ─────────────────────────────────────────────────────

export function getReferralStats() {
  return api<ReferralStats>("/api/referrals");
}

// ── Gifts ─────────────────────────────────────────────────────────

export function getGifts() {
  return api<{ gifts: Gift[] }>("/api/gifts");
}

export function postGift(amountUsd: number, chain: string) {
  return api<{ gift: Gift; claimLink: string }>("/api/gifts", {
    method: "POST",
    body: JSON.stringify({ amountUsd, chain }),
  });
}

// ── Withdraw ─────────────────────────────────────────────────────

export interface WithdrawResult {
  txHash: string;
  chainId: number;
  chainName: string;
  amount: string;
  symbol: string;
}

export function postWithdraw(chain?: string) {
  return api<{ withdrawals: WithdrawResult[] }>("/api/withdraw", {
    method: "POST",
    body: JSON.stringify(chain ? { chain } : {}),
  });
}
