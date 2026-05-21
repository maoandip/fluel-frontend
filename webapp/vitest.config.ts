import { defineConfig } from "vitest/config";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
  // vite-plugin-solid transforms JSX in imported .tsx modules (e.g.
  // lib/format.tsx). Without it, Vite 8's transformer leaves JSX intact
  // — honouring tsconfig's `jsx: preserve` — and import analysis fails.
  plugins: [solidPlugin()],
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
