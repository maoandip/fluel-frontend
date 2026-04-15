import { revalidate } from "@solidjs/router";
import { queries } from "../lib/queries";

// Thin re-export so components can consume balances through the unified query
// cache. Use `balancesQuery()` from a createAsync call in a component, and
// call refetchBalances() to mark the cache stale after a mutation.

export const balancesQuery = queries.balances;

export function refetchBalances() {
  return revalidate("balances");
}
