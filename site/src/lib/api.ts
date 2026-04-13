// API base URL — configurable via VITE_API_BASE env var.
// In local dev, defaults to empty (Vite proxy forwards /prices to localhost:3000).
// In production, set VITE_API_BASE=https://api.fluel.io
export const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}
