import {
  createContext,
  createSignal,
  createEffect,
  onMount,
  onCleanup,
  useContext,
  type JSX,
} from "solid-js";
import { createAsync, revalidate, useLocation } from "@solidjs/router";
import { setDestination as apiSetDestination } from "../api";
import { queries } from "../lib/queries";
import { keysForTab, revalidateStale } from "../lib/refresh";
import type { Chain } from "../types";

interface AppContextValue {
  walletAddress: () => string;
  destinationAddress: () => string;
  chains: () => Chain[];
  receiveChains: () => Chain[];
  /** True once both session and chains queries have resolved. */
  isReady: () => boolean;
  setDestinationAddress: (address: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue>();

export function AppProvider(props: { children: JSX.Element }) {
  // Initial load — createAsync feeds through Solid Router's cache so the
  // session/chains fetches run once per mount and integrate with Suspense.
  const session = createAsync(() => queries.session());
  const chainsData = createAsync(() => queries.chains());

  // destinationAddress is mutable after initial load; seed it from the
  // session query result on first arrival.
  const [destinationAddress, setDestinationAddressSignal] = createSignal("");

  createEffect(() => {
    const s = session();
    if (s && !destinationAddress()) {
      setDestinationAddressSignal(s.destinationAddress ?? "");
    }
  });

  // The keep-alive tab shell keeps every page mounted, so a Telegram Mini App
  // that's been backgrounded shows stale data on return. Revalidate the
  // current tab's data — plus the money-critical balances/history — whenever
  // the app regains focus. The TTL guard makes a quick tab-out/in a no-op.
  const location = useLocation();
  onMount(() => {
    const refreshOnFocus = () => {
      if (document.visibilityState !== "visible") return;
      const keys = new Set([...keysForTab(location.pathname), "balances", "history"]);
      revalidateStale([...keys], 10_000);
    };
    document.addEventListener("visibilitychange", refreshOnFocus);
    window.addEventListener("focus", refreshOnFocus);
    onCleanup(() => {
      document.removeEventListener("visibilitychange", refreshOnFocus);
      window.removeEventListener("focus", refreshOnFocus);
    });
  });

  async function updateDestination(address: string) {
    const res = await apiSetDestination(address);
    setDestinationAddressSignal(res.destinationAddress);
    // Session contains the destinationAddress — mark it stale so anything
    // reading through the session query gets the fresh value on next read.
    revalidate("session");
  }

  const value: AppContextValue = {
    walletAddress: () => session()?.walletAddress ?? "",
    destinationAddress,
    chains: () => chainsData()?.chains ?? [],
    receiveChains: () => chainsData()?.receiveChains ?? [],
    isReady: () => session() !== undefined && chainsData() !== undefined,
    setDestinationAddress: updateDestination,
  };

  return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return ctx;
}
