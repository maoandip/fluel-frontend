# fluel — Frontend

Public frontend for [fluel](https://fluel.io) — cross-chain gas top-ups via Telegram.

This repo contains the marketing site and the Telegram Mini App. The bot, API, swap execution, and database live in a separate private repo.

## Projects

```
fluel-frontend/
├── site/          Marketing site                → fluel.io
├── webapp/        Telegram Mini App             → webapp.fluel.io
├── brand/         Brand asset tooling
└── package.json   Root orchestration scripts
```

### `site/` — Marketing site

SolidJS + Vite + CSS Modules. Every route is prerendered at build time via Puppeteer, so search engines and social crawlers see the real content (per-page `<title>`, canonical, meta description, and JSON-LD schemas) without executing JavaScript.

Pages: landing, how it works, supported chains, roadmap, guides, waitlist/feedback, terms, privacy, and an animated 404. Live gas prices come from the public `/prices` endpoint; everything else is static.

### `webapp/` — Telegram Mini App

SolidJS + Vite + CSS Modules + Telegram WebApp SDK. Five tabs:

- **Swap** — USDC → native gas via Li.Fi
- **Balances** — USDC across chains, withdraw to destination wallet
- **History** — transaction history with live status tracking
- **Automate** — gas price alerts and auto-refill rules
- **Earn** — referrals and gift gas

All API calls authenticate via cryptographically-verified Telegram `initData` on the server.

## Tech stack

**Both projects**
- [SolidJS](https://www.solidjs.com/) v1.9
- [Vite](https://vitejs.dev/) v6
- CSS Modules
- TypeScript (strict)
- [valibot](https://valibot.dev/) — env + API schema validation
- ESLint flat config + Prettier
- Vitest

**Marketing site**
- [@solidjs/router](https://github.com/solidjs/solid-router) with `createAsync` + `query()`
- Puppeteer for build-time prerendering

**Mini App**
- [@solidjs/router](https://github.com/solidjs/solid-router)
- [XState](https://xstate.js.org/) v5 — swap flow state machine
- [@kobalte/core](https://kobalte.dev/) — accessible primitives
- [Telegram WebApp SDK](https://core.telegram.org/bots/webapps)

## Architecture

```
                       ┌────────────────────┐
   Browsers  ────────► │ Cloudflare Pages   │
                       │ fluel.io  (site)   │
                       │ webapp.fluel.io    │
                       └─────────┬──────────┘
                                 │  HTTPS
                                 ▼
                       ┌────────────────────┐
   Telegram  ────────► │  Private backend   │
                       │  api.fluel.io      │
                       └────────────────────┘
```

Public (this repo): everything users see in their browser or Telegram client.

Private: Telegram bot handlers, REST API, swap execution, fee logic, database, Privy and Li.Fi integrations.

## Quickstart

```bash
# Install deps for root + site + webapp + brand
npm run install:all

# Marketing site (http://localhost:3001)
npm run dev:site

# Mini App (http://localhost:5173)
npm run dev:webapp
```

Both frontends proxy API calls to `http://localhost:3000` in dev. Without a backend, pages that depend on live data show a graceful fallback; the rest of each page renders fine.

## Scripts

Root orchestration:

| Command | Runs |
|---|---|
| `npm run install:all` | Install deps for root, site, webapp, and brand |
| `npm run dev:site` / `dev:webapp` | Dev server for one project |
| `npm run build` | Build both projects |
| `npm run lint` | ESLint on both |
| `npm run typecheck` | `tsc --noEmit` on both |
| `npm test` | Vitest on both |
| `npm run check` | lint → typecheck → test → build |

Per-project (run from `site/` or `webapp/`):
- `npm run dev` · `npm run build` · `npm run preview`
- `npm run lint` · `npm run typecheck` · `npm test` · `npm run format`

## Build pipeline

When you run `npm run build` inside `site/`:

1. **`prebuild`** — syncs `brand/tokens.css` into `src/styles/_tokens.css` and regenerates `public/sitemap.xml` from routes + guide metadata (`lastmod` derived from `git log`).
2. **`build`** — `vite build`.
3. **`postbuild`** — prerenders every route with Puppeteer (static pages + every guide) into `dist/<route>/index.html`. Canonical URLs, meta tags, and JSON-LD schemas are captured in the HTML.

`webapp/` has a lighter pipeline: `sync-tokens` → `vite build`. No prerendering since it's gated by Telegram auth.

## Folder structure — Mini App

```
webapp/src/
├── components/
│   ├── ui/        Primitives (Toast, Skeleton, EmptyState, …)
│   ├── chain/     Domain components (ChainPicker, TokenChainIcon, …)
│   └── layout/    App shell (TabLayout, WalletBar, Splash, …)
├── config/        env.ts · flags.ts
├── lib/
│   ├── hooks/     useLocalStorage, …
│   ├── machines/  swap.ts (XState)
│   ├── queries.ts Cached async queries
│   ├── schemas.ts valibot API response schemas
│   ├── format.ts · status.ts · telegram.ts
├── pages/         SwapPage, BalancesPage, HistoryPage, AutomatePage, EarnPage
├── stores/        app · balances · toast
└── styles/        shared.css, _tokens.css (synced from brand/)
```

## Brand

Canonical design tokens live in [`brand/tokens.css`](./brand/tokens.css) and are synced into each project at build time.

| Token | Hex | Role |
|---|---|---|
| Electric Mint | `#00FFB2` | Primary accent, CTAs, mark body |
| Coral Fire | `#FF7A5C` | Secondary accent, mark tip |
| Chain Blue | `#60A5FA` | Trust / verified states |
| Void | `#080B10` | Background |
| Panel | `#111820` | Cards, surfaces |

## Deployment

Both projects deploy automatically to [Cloudflare Pages](https://pages.cloudflare.com) on every push to `main`.

- `fluel.io` → marketing site
- `webapp.fluel.io` → Mini App

## Contributing

Pull requests welcome. For larger changes, please open an issue first.

Before submitting a PR, run:

```bash
npm run check
```

This runs lint, typecheck, tests, and build for both projects. CI runs the same checks on every PR.

## Security

If you find a security issue, please **do not open a public issue**. See [SECURITY.md](./SECURITY.md).

## License

[MIT](./LICENSE) — Copyright © 2026 MAD Protocol Ltd.

fluel is a trading name of MAD Protocol Ltd, registered in England and Wales (No. 11232367).

---

**Disclaimer:** fluel is a non-custodial technical interface. It is not regulated by the Financial Conduct Authority (FCA). Crypto-assets are high risk. You may lose all your money. See [Terms](https://fluel.io/terms).
