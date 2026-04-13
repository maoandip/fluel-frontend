import {
  createContext,
  createSignal,
  useContext,
  onMount,
  type JSX,
} from "solid-js";
import { getSession, getChains, setDestination as apiSetDestination } from "../api";
import type { Chain } from "../types";

interface AppContextValue {
  walletAddress: () => string;
  destinationAddress: () => string;
  chains: () => Chain[];
  receiveChains: () => Chain[];
  isReady: () => boolean;
  setDestinationAddress: (address: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue>();

export function AppProvider(props: { children: JSX.Element }) {
  const [walletAddress, setWalletAddress] = createSignal("");
  const [destinationAddress, setDestinationAddress] = createSignal("");
  const [chains, setChains] = createSignal<Chain[]>([]);
  const [receiveChains, setReceiveChains] = createSignal<Chain[]>([]);
  const [isReady, setIsReady] = createSignal(false);

  onMount(async () => {
    try {
      const [session, chainsRes] = await Promise.all([
        getSession(),
        getChains(),
      ]);
      setWalletAddress(session.walletAddress);
      setDestinationAddress(session.destinationAddress ?? "");
      setChains(chainsRes.chains);
      setReceiveChains(chainsRes.receiveChains);
    } catch (err) {
      console.error("Failed to initialize app:", err);
    } finally {
      setIsReady(true);
    }
  });

  async function updateDestination(address: string) {
    const res = await apiSetDestination(address);
    setDestinationAddress(res.destinationAddress);
  }

  const value: AppContextValue = {
    walletAddress,
    destinationAddress,
    chains,
    receiveChains,
    isReady,
    setDestinationAddress: updateDestination,
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return ctx;
}
