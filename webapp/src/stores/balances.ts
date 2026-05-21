import { queries } from "../lib/queries";
import { revalidateNow } from "../lib/refresh";

// Thin re-export so components can consume balances through the unified query
// cache. Use `balancesQuery()` from a createAsync call in a component, and
// call refetchBalances() to mark the cache stale after a mutation.

export const balancesQuery = queries.balances;

export function refetchBalances() {
  return revalidateNow(["balances"]);
}
