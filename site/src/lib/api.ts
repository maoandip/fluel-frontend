import { env } from "../config/env";

// API base URL. In local dev, defaults to empty so Vite's proxy forwards /prices
// and /api to localhost:3000. In production, set VITE_API_BASE=https://api.fluel.io.
export const API_BASE = env.VITE_API_BASE;

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}
