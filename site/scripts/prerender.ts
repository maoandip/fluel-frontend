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
  // --no-sandbox is needed on GitHub Actions / Cloudflare Pages Ubuntu
  // runners because AppArmor blocks unprivileged user namespaces. Safe
  // here: the CI environment is already isolated and we only load our
  // own content.
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  // Intercept /prices and never respond — the fetch stays pending so the
  // AsyncSection captures its loading-fallback state in the prerendered
  // HTML. The client then does a fresh fetch on mount and shows real data.
  // This avoids baking stub content into the HTML that would differ from
  // what real users see and cause a "loads twice" flash.
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    const url = new URL(req.url());
    if (url.pathname === "/prices") {
      // Intentionally do nothing — request stays pending for the duration
      // of this page's capture.
      return;
    }
    req.continue();
  });

  for (const route of ALL_ROUTES) {
    const url = `${base}${route}`;
    // waitUntil: 'load' fires when HTML + scripts + stylesheets are loaded
    // but does NOT wait for the pending /prices fetch (we want that to
    // stay pending so the Suspense fallback is captured).
    await page.goto(url, { waitUntil: "load", timeout: 20_000 });
    // Give Solid's reactive graph a beat to mount and flush effects
    // (component trees, schema injection, Suspense fallbacks).
    await new Promise((r) => setTimeout(r, 500));

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
