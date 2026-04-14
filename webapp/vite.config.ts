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
        manualChunks: {
          "solid": ["solid-js", "solid-js/web"],
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
