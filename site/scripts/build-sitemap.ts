// Generates site/public/sitemap.xml at build time.
// Static routes are listed below; guide routes are auto-discovered by importing
// guides/data.ts directly (via tsx). lastmod for each URL is derived from
// `git log -1` against the page's source file.

import { writeFileSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { guides } from "../src/pages/guides/data.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = resolve(__dirname, "..");
const ORIGIN = "https://fluel.io";

// Mirror the same logic as src/config/env.ts. We can't import from there
// because that file uses import.meta.env (Vite). At build time we read
// process.env directly.
const BETA_MODE = process.env.VITE_BETA !== "false";

interface Route {
  path: string;
  source: string | string[];
  changefreq: string;
  priority: string;
}

const STATIC_ROUTES: Route[] = [
  { path: "/",             source: "src/pages/Landing.tsx",          changefreq: "weekly",  priority: "1.0" },
  { path: "/chains",       source: "src/pages/Chains.tsx",           changefreq: "daily",   priority: "0.9" },
  { path: "/how-it-works", source: "src/pages/HowItWorks.tsx",       changefreq: "monthly", priority: "0.8" },
  { path: "/roadmap",      source: "src/pages/Roadmap.tsx",          changefreq: "monthly", priority: "0.7" },
  { path: "/guides",       source: "src/pages/guides/GuideList.tsx", changefreq: "weekly",  priority: "0.9" },
  // During beta, /waitlist is the canonical alias of /feedback.
  ...(BETA_MODE
    ? [{ path: "/waitlist", source: "src/pages/Feedback.tsx", changefreq: "weekly", priority: "0.7" } as Route]
    : [{ path: "/feedback", source: "src/pages/Feedback.tsx", changefreq: "monthly", priority: "0.5" } as Route]),
  { path: "/terms",        source: "src/pages/Terms.tsx",            changefreq: "yearly",  priority: "0.3" },
  { path: "/privacy",      source: "src/pages/Privacy.tsx",          changefreq: "yearly",  priority: "0.3" },
];

const GUIDE_PAGE = "src/pages/guides/GuidePage.tsx";
const GUIDES_DATA = "src/pages/guides/data.ts";

function gitLastMod(relPath: string): string | null {
  try {
    const iso = execSync(`git log -1 --format=%cI -- "${relPath}"`, {
      cwd: SITE_ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return iso || null;
  } catch {
    return null;
  }
}

function dateOnly(iso: string | null): string {
  return iso ? iso.split("T")[0] : new Date().toISOString().split("T")[0];
}

function lastModFor(source: string | string[]): string | null {
  const sources = Array.isArray(source) ? source : [source];
  const dates = sources.map(gitLastMod).filter((d): d is string => Boolean(d)).sort();
  return dates[dates.length - 1] ?? null;
}

const guideRoutes: Route[] = guides.map((g) => ({
  path: `/guides/${g.slug}`,
  // Guide content lives in data.ts; layout in GuidePage.tsx — use whichever changed last.
  source: [GUIDES_DATA, GUIDE_PAGE],
  changefreq: "monthly",
  priority: "0.7",
}));

const allRoutes: Route[] = [...STATIC_ROUTES, ...guideRoutes];

const entries = allRoutes
  .map((r) => {
    const lastmod = dateOnly(lastModFor(r.source));
    return `  <url><loc>${ORIGIN}${r.path}</loc><lastmod>${lastmod}</lastmod><changefreq>${r.changefreq}</changefreq><priority>${r.priority}</priority></url>`;
  })
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;

const outPath = resolve(SITE_ROOT, "public/sitemap.xml");
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, xml);
console.log(`✓ wrote sitemap.xml — ${allRoutes.length} routes (${guides.length} guides)`);
