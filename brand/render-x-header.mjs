import puppeteer from "puppeteer";
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { resolve, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const FONTS = `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">`;

// Real icons used by the Mini App, sourced from the same CDNs the API returns.
const ICON_URLS = {
  usdc:     "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
  eth:      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
  base:     "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/base.svg",
  ethereum: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/ethereum.svg",
  relay:    "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/bridges/relay.svg",
};

const iconDir = resolve(__dirname, "icons");
mkdirSync(iconDir, { recursive: true });

async function loadIcon(name, url) {
  const ext = extname(new URL(url).pathname) || ".bin";
  const path = resolve(iconDir, `${name}${ext}`);
  if (!existsSync(path)) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
    writeFileSync(path, Buffer.from(await res.arrayBuffer()));
    console.log("cached", path);
  }
  const mime = ext === ".svg" ? "image/svg+xml" : ext === ".png" ? "image/png" : "application/octet-stream";
  return `data:${mime};base64,${readFileSync(path).toString("base64")}`;
}

const icons = {};
for (const [name, url] of Object.entries(ICON_URLS)) {
  icons[name] = await loadIcon(name, url);
}

// Real Mini App screenshot (saved manually to brand/screenshots/)
function loadLocalImage(relPath, mime) {
  const path = resolve(__dirname, relPath);
  if (!existsSync(path)) return null;
  return `data:${mime};base64,${readFileSync(path).toString("base64")}`;
}
const miniappScreenshot =
  loadLocalImage("screenshots/miniapp-real.jpeg", "image/jpeg") ??
  loadLocalImage("screenshots/miniapp-real.png", "image/png");

const BASE = `
  html, body { margin: 0; padding: 0; }
  body {
    width: 100vw; height: 100vh;
    background: #080B10;
    font-family: 'Inter', sans-serif;
    color: #E5E7EB;
    overflow: hidden;
    position: relative;
    -webkit-font-smoothing: antialiased;
  }
`;

function bold() {
  return `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>
    ${BASE}
    .glow { position:absolute; right:-200px; top:50%; transform:translateY(-50%);
      width:900px; height:900px;
      background: radial-gradient(circle, rgba(0,255,178,0.18) 0%, rgba(0,255,178,0.06) 30%, rgba(0,255,178,0) 60%);
      pointer-events:none; }
    .grid { position:absolute; inset:0;
      background-image:
        linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
      background-size:60px 60px;
      mask-image: linear-gradient(90deg, transparent 0%, black 30%, black 70%, transparent 100%);
      -webkit-mask-image: linear-gradient(90deg, transparent 0%, black 30%, black 70%, transparent 100%); }
    .content { position:absolute; left:380px; top:50%; transform:translateY(-50%); max-width:900px; }
    .eyebrow { font-family:'JetBrains Mono',monospace; font-size:16px; font-weight:500;
      letter-spacing:0.18em; text-transform:uppercase; color:#00FFB2;
      margin:0 0 18px 0; display:flex; align-items:center; gap:12px; }
    .eyebrow::before { content:""; display:inline-block; width:28px; height:1px; background:#00FFB2; }
    h1 { font-family:'Inter',sans-serif; font-weight:900; font-size:84px; line-height:0.95;
      letter-spacing:-0.035em; margin:0 0 22px 0; color:#FFFFFF; }
    h1 .accent { color:#00FFB2; }
    .sub { font-family:'Inter',sans-serif; font-weight:500; font-size:24px; line-height:1.4;
      color:#9CA3AF; margin:0 0 26px 0; max-width:780px; }
    .meta { font-family:'JetBrains Mono',monospace; font-size:14px; font-weight:500;
      letter-spacing:0.08em; color:#6B7280; text-transform:uppercase;
      display:flex; align-items:center; gap:18px; }
    .meta .dot { width:4px; height:4px; border-radius:50%; background:#374151; }
    .meta .live { color:#00FFB2; display:flex; align-items:center; gap:8px; }
    .meta .live::before { content:""; width:8px; height:8px; border-radius:50%;
      background:#00FFB2; box-shadow:0 0 12px #00FFB2; }
    .mark { position:absolute; right:80px; top:50%; transform:translateY(-50%); }
  </style></head><body>
    <div class="glow"></div><div class="grid"></div>
    <div class="content">
      <p class="eyebrow">fluel · cross-chain gas</p>
      <h1>Gas, without<br>the <span class="accent">hassle.</span></h1>
      <p class="sub">Stablecoins in. Native gas out. Top up 40+ EVM chains directly from Telegram — no bridges, no wallet extensions, no friction.</p>
      <div class="meta">
        <span class="live">live on telegram</span>
        <span class="dot"></span><span>t.me/fluelapp</span>
        <span class="dot"></span><span>fluel.io</span>
      </div>
    </div>
    <svg class="mark" width="280" height="420" viewBox="0 0 48 72" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 68 C14 68 6 60 6 50 C6 40 14 32 24 18 C34 32 42 40 42 50 C42 60 34 68 24 68Z" fill="#00FFB2"/>
      <path d="M24 18 C24 18 19 8 19 4 C19 1.5 21.2 0 24 0 C26.8 0 29 1.5 29 4 C29 8 24 18 24 18Z" fill="#FF7A5C"/>
    </svg>
  </body></html>`;
}

function minimal() {
  return `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>
    ${BASE}
    .glow { position:absolute; inset:0;
      background: radial-gradient(ellipse 60% 80% at 50% 50%, rgba(0,255,178,0.10) 0%, rgba(0,255,178,0) 60%); }
    .wrap { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; }
    .stack { text-align:center; position:relative; }
    .wordmark { font-family:'JetBrains Mono',monospace; font-weight:700; font-size:240px;
      line-height:0.85; letter-spacing:-0.04em; color:#FFFFFF; }
    .wordmark .dot { color:#00FFB2; }
    .rule { margin:36px auto 0; height:1px; width:280px;
      background: linear-gradient(90deg, transparent, #00FFB2, transparent); }
    .tag { margin-top:24px; font-family:'Inter',sans-serif; font-weight:500; font-size:22px;
      letter-spacing:0.08em; color:#9CA3AF; text-transform:lowercase; }
    .corner { position:absolute; top:32px; right:40px;
      font-family:'JetBrains Mono',monospace; font-size:13px; font-weight:500;
      letter-spacing:0.18em; text-transform:uppercase; color:#374151;
      display:flex; align-items:center; gap:10px; }
    .corner::before { content:""; width:6px; height:6px; border-radius:50%;
      background:#00FFB2; box-shadow:0 0 10px #00FFB2; }
  </style></head><body>
    <div class="glow"></div>
    <div class="corner">live · t.me/fluelapp</div>
    <div class="wrap"><div class="stack">
      <div class="wordmark">fluel<span class="dot">.</span></div>
      <div class="rule"></div>
      <div class="tag">gas, without the hassle</div>
    </div></div>
  </body></html>`;
}

function miniapp() {
  if (!miniappScreenshot) {
    throw new Error("Missing brand/screenshots/miniapp-real.png — drop the real screenshot there before rendering.");
  }
  return `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>
    ${BASE}
    :root {
      --c-bg: #080B10;
      --c-accent: #00FFB2;
      --c-text: #E2EDF8;
      --c-muted: #96AAC0;
      --c-dim: #6E8CA8;
      --font: 'Inter', sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }
    .glow { position:absolute; right:-150px; top:50%; transform:translateY(-50%);
      width:900px; height:900px;
      background: radial-gradient(circle, rgba(0,255,178,0.16) 0%, rgba(0,255,178,0) 55%); }
    .left { position:absolute; left:380px; top:50%; transform:translateY(-50%); max-width:480px; }
    .eyebrow { font-family:var(--font-mono); font-size:13px; font-weight:500;
      letter-spacing:0.18em; text-transform:uppercase; color:var(--c-accent);
      margin:0 0 14px 0; display:flex; align-items:center; gap:10px; }
    .eyebrow::before { content:""; width:24px; height:1px; background:var(--c-accent); }
    h1 { font-family:var(--font); font-weight:900; font-size:60px; line-height:0.95;
      letter-spacing:-0.035em; margin:0 0 16px 0; color:#FFFFFF; }
    h1 .accent { color:var(--c-accent); }
    .sub { font-family:var(--font); font-weight:500; font-size:17px; line-height:1.45;
      color:var(--c-muted); margin:0 0 16px 0; }
    .url { font-family:var(--font-mono); font-size:12px; font-weight:500;
      letter-spacing:0.08em; color:var(--c-dim); text-transform:uppercase; }
    .url .mint { color:var(--c-accent); }

    /* Source: 921×2048 mobile screenshot. Boundaries detected by pixel analysis.
       Showing native 194..1281 (Telegram header cropped, Swap button at y=1117-1235 fully visible).
       Width 420 → scale 420/921 ≈ 0.456 → visible height = (1281-194) × 0.456 ≈ 495. */
    .shotFrame { position:absolute; right:70px; top:50%; transform:translateY(-50%);
      width:420px; height:495px; overflow:hidden;
      border-radius:12px;
      background:#080B10;
      box-shadow:
        0 30px 80px rgba(0,255,178,0.24),
        0 0 0 1px rgba(0,255,178,0.18),
        0 8px 28px rgba(0,0,0,0.55); }
    .shotFrame img { display:block; width:420px; height:auto; margin-top:-89px; }
  </style></head><body>
    <div class="glow"></div>
    <div class="left">
      <p class="eyebrow">live on telegram</p>
      <h1>Gas, without<br>the <span class="accent">hassle.</span></h1>
      <p class="sub">Stablecoins in. Native gas out. Top up 40+ EVM chains right inside Telegram.</p>
      <div class="url"><span class="mint">▸</span> t.me/fluelapp · fluel.io</div>
    </div>
    <div class="shotFrame"><img src="${miniappScreenshot}" alt=""></div>
  </body></html>`;
}

function og() {
  return `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>
    ${BASE}
    .glow { position:absolute; right:-260px; bottom:-260px;
      width:1100px; height:1100px;
      background: radial-gradient(circle, rgba(0,255,178,0.22) 0%, rgba(0,255,178,0.06) 35%, rgba(0,255,178,0) 60%);
      pointer-events:none; }
    .grid { position:absolute; inset:0;
      background-image:
        linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
      background-size:60px 60px;
      mask-image: linear-gradient(180deg, transparent 0%, black 25%, black 75%, transparent 100%);
      -webkit-mask-image: linear-gradient(180deg, transparent 0%, black 25%, black 75%, transparent 100%); }
    .content { position:absolute; left:80px; right:80px; top:50%; transform:translateY(-50%); }
    .eyebrow { font-family:'JetBrains Mono',monospace; font-size:18px; font-weight:500;
      letter-spacing:0.18em; text-transform:uppercase; color:#00FFB2;
      margin:0 0 22px 0; display:flex; align-items:center; gap:14px; }
    .eyebrow::before { content:""; display:inline-block; width:36px; height:1px; background:#00FFB2; }
    h1 { font-family:'Inter',sans-serif; font-weight:900; font-size:108px; line-height:0.93;
      letter-spacing:-0.04em; margin:0 0 28px 0; color:#FFFFFF; max-width:920px; }
    h1 .accent { color:#00FFB2; }
    .sub { font-family:'Inter',sans-serif; font-weight:500; font-size:28px; line-height:1.4;
      color:#9CA3AF; margin:0 0 32px 0; max-width:840px; }
    .meta { font-family:'JetBrains Mono',monospace; font-size:16px; font-weight:500;
      letter-spacing:0.08em; color:#6B7280; text-transform:uppercase;
      display:flex; align-items:center; gap:20px; }
    .meta .dot { width:5px; height:5px; border-radius:50%; background:#374151; }
    .meta .live { color:#00FFB2; display:flex; align-items:center; gap:10px; }
    .meta .live::before { content:""; width:10px; height:10px; border-radius:50%;
      background:#00FFB2; box-shadow:0 0 14px #00FFB2; }
    .mark { position:absolute; right:90px; top:50%; transform:translateY(-50%); opacity:0.95; }
    .domain { position:absolute; bottom:30px; right:40px;
      font-family:'JetBrains Mono',monospace; font-size:14px; font-weight:600;
      color:#374151; letter-spacing:0.1em; text-transform:uppercase; }
    .domain .mint { color:#00FFB2; }
  </style></head><body>
    <div class="glow"></div>
    <div class="grid"></div>
    <div class="content">
      <p class="eyebrow">fluel · cross-chain gas</p>
      <h1>Gas, without<br>the <span class="accent">hassle.</span></h1>
      <p class="sub">Stablecoins in. Native gas out. Top up 40+ EVM chains directly from Telegram.</p>
      <div class="meta">
        <span class="live">live on telegram</span>
        <span class="dot"></span><span>t.me/fluelapp</span>
      </div>
    </div>
    <svg class="mark" width="320" height="480" viewBox="0 0 48 72" xmlns="http://www.w3.org/2000/svg" style="opacity:0.18">
      <path d="M24 68 C14 68 6 60 6 50 C6 40 14 32 24 18 C34 32 42 40 42 50 C42 60 34 68 24 68Z" fill="#00FFB2"/>
      <path d="M24 18 C24 18 19 8 19 4 C19 1.5 21.2 0 24 0 C26.8 0 29 1.5 29 4 C29 8 24 18 24 18Z" fill="#FF7A5C"/>
    </svg>
    <div class="domain"><span class="mint">▸</span> fluel.io</div>
  </body></html>`;
}

// Each design: { fn: () => html, width, height, filename }
const designs = {
  "x-header-bold":    { fn: bold,    width: 1500, height: 500 },
  "x-header-minimal": { fn: minimal, width: 1500, height: 500 },
  "x-header-miniapp": { fn: miniapp, width: 1500, height: 500 },
  "og":               { fn: og,      width: 1200, height: 630 },
};

const outDir = resolve(process.argv[2] || ".");
mkdirSync(outDir, { recursive: true });

const browser = await puppeteer.launch({ headless: "new" });
for (const [name, { fn, width, height }] of Object.entries(designs)) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 2 });
  await page.setContent(fn(width, height), { waitUntil: "networkidle0" });
  await page.evaluateHandle("document.fonts.ready");
  await new Promise(r => setTimeout(r, 400));
  const buf = await page.screenshot({ type: "png", clip: { x: 0, y: 0, width, height } });
  const out = resolve(outDir, `${name}.png`);
  writeFileSync(out, buf);
  console.log("wrote", out);
  await page.close();
}
await browser.close();
