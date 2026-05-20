import { query } from "@solidjs/router";
import {
  getSession,
  getChains,
  getBalances,
  getGasPrices,
  getAlerts,
  getRefills,
  getReferralStats,
  getGifts,
  getHistory,
} from "../api";

// Cached async queries. Solid Router's query() memoizes by call arguments
// so concurrent calls dedupe and switching routes reuses the cached data
// until revalidate(<key>) is called explicitly.

export const queries = {
  session: query(() => getSession(), "session"),
  chains: query(() => getChains(), "chains"),
  balances: query(() => getBalances(), "balances"),
  gasPrices: query(() => getGasPrices(), "gasPrices"),
  alerts: query(async () => (await getAlerts()).alerts, "alerts"),
  refills: query(async () => (await getRefills()).refills, "refills"),
  referralStats: query(() => getReferralStats(), "referralStats"),
  gifts: query(async () => (await getGifts()).gifts, "gifts"),
  history: query(
    (page: number, pageSize: number) => getHistory(page, pageSize),
    "history",
  ),
};
