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
        // Split Solid + router into their own chunk for long-term caching.
        // Vite 8's Rolldown bundler only accepts manualChunks as a function.
        manualChunks: (id) => {
          if (id.includes("node_modules/solid-js") || id.includes("node_modules/@solidjs/router")) {
            return "solid";
          }
        },
      },
    },
  },
  server: {
    port: 3001,
    proxy: {
      "/prices": "http://localhost:3000",
    },
  },
});
