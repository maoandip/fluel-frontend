import { createResource } from "solid-js";
import { getBalances } from "../api";
import type { BalancesByChain } from "../types";

async function fetchBalances(): Promise<BalancesByChain> {
  const res = await getBalances();
  return res.balances;
}

const [balances, { refetch: refetchBalances }] = createResource(fetchBalances);

export { balances, refetchBalances };
