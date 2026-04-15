import * as v from "valibot";
import { tg } from "./lib/telegram";
import type {
  Transaction,
  GasAlert,
  AutoRefill,
  GasPriceData,
  ReferralStats,
  Gift,
} from "./types";
import {
  SessionResponseSchema,
  ChainsResponseSchema,
  BalancesResponseSchema,
  QuoteResponseSchema,
  SwapStatusSchema,
  ConfirmResponseSchema,
} from "./lib/schemas";

// ── Fetch wrapper ──────────────────────────────────────────────────

import { env } from "./config/env";
const API_BASE = env.VITE_API_BASE;

// Optional response schema — if provided, the JSON body is validated at the
// seam and a shape mismatch throws a developer-friendly error (with the
// offending issues logged to the console for observability).
async function api<T>(
  path: string,
  options: RequestInit = {},
  schema?: v.GenericSchema<T>,
): Promise<T> {
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

  const data = await res.json();

  if (schema) {
    try {
      return v.parse(schema, data);
    } catch (err) {
      if (v.isValiError(err)) {
        const issues = err.issues
          .map((i) => `${i.path?.map((p) => p.key).join(".") ?? "<root>"}: ${i.message}`)
          .join("; ");
        console.error(`[api] ${path} response shape mismatch:`, err.issues);
        throw new Error(`Server returned unexpected data for ${path}: ${issues}`);
      }
      throw err;
    }
  }

  return data as T;
}

// ── Session ────────────────────────────────────────────────────────

export function getSession() {
  return api("/api/session", {}, SessionResponseSchema);
}

export function setDestination(address: string) {
  return api<{ destinationAddress: string }>("/api/destination", {
    method: "POST",
    body: JSON.stringify({ address }),
  });
}

// ── Chains ─────────────────────────────────────────────────────────

export function getChains() {
  return api("/api/chains", {}, ChainsResponseSchema);
}

// ── Balances ───────────────────────────────────────────────────────

export function getBalances() {
  return api("/api/balances", {}, BalancesResponseSchema);
}

// ── Quote ──────────────────────────────────────────────────────────

export function postQuote(amount: string, fromChain: string, toChain: string, signal?: AbortSignal) {
  return api(
    "/api/quote",
    {
      method: "POST",
      body: JSON.stringify({ amount, fromChain, toChain }),
      signal,
    },
    QuoteResponseSchema,
  );
}

// ── Confirm ────────────────────────────────────────────────────────

export function postConfirm() {
  return api("/api/confirm", { method: "POST" }, ConfirmResponseSchema);
}

// ── Swap status ───────────────────────────────────────────────────

export type SwapStatus = v.InferOutput<typeof SwapStatusSchema>;

export function getSwapStatus(txHash: string) {
  return api(`/api/status?txHash=${encodeURIComponent(txHash)}`, {}, SwapStatusSchema);
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
