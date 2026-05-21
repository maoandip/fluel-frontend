import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
  plugins: [solidPlugin()],
  base: "/",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    target: "esnext",
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // Split Solid into its own chunk for long-term caching. Vite 8's
        // Rolldown bundler only accepts manualChunks as a function, not the
        // object form.
        manualChunks: (id) => {
          if (id.includes("node_modules/solid-js")) return "solid";
        },
      },
    },
  },
  server: {
    allowedHosts: [".ngrok-free.app"],
    proxy: {
      "/api": "http://localhost:3000",
      "/prices": "http://localhost:3000",
    },
  },
});
