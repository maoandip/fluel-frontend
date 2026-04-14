// Generates site/public/sitemap.xml at build time.
// Static routes are listed below; guide routes are auto-discovered from data.ts.
// lastmod for each URL is derived from `git log -1` against the page's source file.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = resolve(__dirname, "..");
const ORIGIN = "https://fluel.io";

const STATIC_ROUTES = [
  { path: "/",             source: "src/pages/Landing.tsx",          changefreq: "weekly",  priority: "1.0" },
  { path: "/chains",       source: "src/pages/Chains.tsx",           changefreq: "daily",   priority: "0.9" },
  { path: "/how-it-works", source: "src/pages/HowItWorks.tsx",       changefreq: "monthly", priority: "0.8" },
  { path: "/roadmap",      source: "src/pages/Roadmap.tsx",          changefreq: "monthly", priority: "0.7" },
  { path: "/guides",       source: "src/pages/guides/GuideList.tsx", changefreq: "weekly",  priority: "0.9" },
  { path: "/feedback",     source: "src/pages/Feedback.tsx",         changefreq: "monthly", priority: "0.5" },
  { path: "/terms",        source: "src/pages/Terms.tsx",            changefreq: "yearly",  priority: "0.3" },
  { path: "/privacy",      source: "src/pages/Privacy.tsx",          changefreq: "yearly",  priority: "0.3" },
];

const GUIDES_DATA = "src/pages/guides/data.ts";
const GUIDE_PAGE = "src/pages/guides/GuidePage.tsx";

function gitLastMod(relPath) {
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

function extractGuideSlugs() {
  const content = readFileSync(resolve(SITE_ROOT, GUIDES_DATA), "utf8");
  const slugs = [...content.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
  if (slugs.length === 0) {
    throw new Error(`No guide slugs found in ${GUIDES_DATA}`);
  }
  return slugs;
}

function dateOnly(iso) {
  return iso ? iso.split("T")[0] : new Date().toISOString().split("T")[0];
}

const guideSlugs = extractGuideSlugs();
const guideRoutes = guideSlugs.map((slug) => ({
  path: `/guides/${slug}`,
  // Guide content lives in data.ts; layout in GuidePage.tsx — use whichever changed last.
  source: [GUIDES_DATA, GUIDE_PAGE],
  changefreq: "monthly",
  priority: "0.7",
}));

const allRoutes = [...STATIC_ROUTES, ...guideRoutes];

function lastModFor(source) {
  const sources = Array.isArray(source) ? source : [source];
  const dates = sources.map(gitLastMod).filter(Boolean).sort();
  return dates[dates.length - 1] ?? null;
}

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
console.log(`✓ wrote sitemap.xml — ${allRoutes.length} routes (${guideSlugs.length} guides)`);
