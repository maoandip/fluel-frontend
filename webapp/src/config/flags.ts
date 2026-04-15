import { env } from "./env";

// Beta mode: blocks non-tester access to the Mini App.
// Testers bypass by visiting with ?tester=1 once (persisted in localStorage).
// Override at build time via VITE_BETA=false in your deploy env.
export const BETA_MODE: boolean = env.VITE_BETA === "true";

const TESTER_KEY = "fluel:tester";

export function isTester(): boolean {
  try {
    return localStorage.getItem(TESTER_KEY) === "1";
  } catch {
    return false;
  }
}

export function markTester(): void {
  try {
    localStorage.setItem(TESTER_KEY, "1");
  } catch {
    // ignore (private mode, disabled storage)
  }
}
