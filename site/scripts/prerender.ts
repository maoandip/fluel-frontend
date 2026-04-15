// Prerender the SPA at build time.
//
// For each route in the site, spin up `vite preview`, load the page in
// puppeteer, let the Solid app run + any createAsync resolve, then capture
// the rendered HTML and write it to dist/<route>/index.html. Cloudflare
// Pages then serves the prerendered HTML to crawlers and pure-HTML
// consumers (social unfurlers) while JS clients still hydrate normally.
//
// The /prices endpoint is stubbed via puppeteer request interception so
// the prerender works offline and the chains grid shows a small sample
// of chains instead of the error fallback.

import { preview } from "vite";
import puppeteer from "puppeteer";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { guides } from "../src/pages/guides/data.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = resolve(__dirname, "..");
const DIST = resolve(SITE_ROOT, "dist");

// Mirror BETA_MODE logic from config/env.ts without touching import.meta.env
const BETA_MODE = process.env.VITE_BETA !== "false";

const STATIC_ROUTES = [
  "/",
  "/chains",
  "/how-it-works",
  "/roadmap",
  "/guides",
  "/terms",
  "/privacy",
  BETA_MODE ? "/waitlist" : "/feedback",
];

const GUIDE_ROUTES = guides.map((g) => `/guides/${g.slug}`);
const ALL_ROUTES = [...STATIC_ROUTES, ...GUIDE_ROUTES];

// Stub for /prices so prerendered HTML shows a real sample of chains.
// Real users still get live data on hydration.
const PRICES_STUB = JSON.stringify({
  prices: { 1: 15, 10: 0.001, 137: 30, 8453: 0.005, 42161: 0.1 },
  chains: [
    {
      id: 1,
      name: "Ethereum",
      icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/ethereum.svg",
    },
    {
      id: 10,
      name: "OP Mainnet",
      icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/optimism.svg",
    },
    {
      id: 137,
      name: "Polygon",
      icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/polygon.svg",
    },
    {
      id: 8453,
      name: "Base",
      icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/base.svg",
    },
    {
      id: 42161,
      name: "Arbitrum",
      icon: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/arbitrum.svg",
    },
  ],
});

function outputPathFor(route: string): string {
  if (route === "/") return resolve(DIST, "index.html");
  return resolve(DIST, route.replace(/^\//, ""), "index.html");
}

async function main() {
  console.log("→ starting vite preview");
  const server = await preview({
    root: SITE_ROOT,
    preview: { port: 4173, strictPort: true },
  });
  const base = server.resolvedUrls?.local[0]?.replace(/\/$/, "") ?? "http://localhost:4173";

  console.log("→ launching puppeteer");
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  // Intercept /prices and return a static sample so the chains grid
  // renders deterministic content.
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    const url = new URL(req.url());
    if (url.pathname === "/prices") {
      req.respond({
        status: 200,
        contentType: "application/json",
        body: PRICES_STUB,
      });
      return;
    }
    req.continue();
  });

  for (const route of ALL_ROUTES) {
    const url = `${base}${route}`;
    await page.goto(url, { waitUntil: "networkidle0", timeout: 20_000 });
    // Give Solid's reactive graph a beat to flush any trailing effects
    // (createAsync Suspense resolution, schema injection, etc.)
    await new Promise((r) => setTimeout(r, 300));

    const html = await page.content();
    const outPath = outputPathFor(route);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, html);
    console.log(`  ✓ ${route}  →  ${outPath.replace(DIST, "dist")}`);
  }

  await browser.close();
  await server.httpServer.close();
  console.log(`\n✓ prerendered ${ALL_ROUTES.length} routes`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
