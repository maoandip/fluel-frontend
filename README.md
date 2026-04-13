# fluel — Frontend

The public marketing site and Telegram Mini App for [fluel](https://fluel.io) — cross-chain gas top-up via Telegram.

This repo contains the user-facing code. The backend (Telegram bot, API, database, swap execution) is maintained privately — see [architecture](#architecture) below for the split.

## What's in here

```
fluel-frontend/
├── site/      Public marketing site (SolidJS + Vite) — fluel.io
├── webapp/    Telegram Mini App (SolidJS + Vite) — webapp.fluel.io
└── package.json   Convenience scripts for local dev
```

### site — Public marketing site

**Stack:** SolidJS · Vite · CSS Modules

**Pages:**
- Landing (with live gas prices from the public `/prices` endpoint)
- How it works
- Supported chains
- Roadmap
- Guides
- Feedback form
- Terms & Privacy Policy
- Animated 404 page

### webapp — Telegram Mini App

**Stack:** SolidJS · Vite · CSS Modules · Telegram WebApp SDK

**Tabs:**
- **Swap** — USDC → native gas via Li.Fi
- **Balances** — USDC across all chains, withdraw to destination wallet
- **History** — transaction history with live status tracking
- **Automate** — gas price alerts and auto-refill rules
- **Earn** — referrals and gift gas

All API calls go to the backend via cryptographically-validated Telegram `initData` authentication.

## Architecture

```
┌─────────────────────┐          ┌──────────────────────┐
│  Cloudflare Pages   │          │  DigitalOcean        │
│                     │          │                      │
│  fluel.io (site)    │◄────────►│  api.fluel.io        │
│  webapp.fluel.io    │   HTTPS  │  (private backend)   │
│                     │          │                      │
└─────────────────────┘          └──────────────────────┘
      ▲                                    ▲
      │                                    │
      │ cached globally                    │ Telegram webhook
      │                                    │
   Users                              @FluelBot
```

**Public (this repo):**
- Everything users see and run in their browser / Telegram client
- Deployed to Cloudflare Pages for global CDN + free SSL

**Private:**
- Telegram bot command handlers
- REST API (`src/api.ts`)
- Swap execution and guards
- Rate limits, fee calculation, referral logic
- Database (SQLite)
- Privy and Li.Fi SDK integrations

The private backend exposes a REST API at `api.fluel.io`. The Mini App authenticates requests using Telegram's `initData` hash, verified on the server with HMAC-SHA256 against the bot token.

## Local development

```bash
npm install   # installs for both site and webapp

# Run the site (localhost:3001)
npm run dev:site

# Run the webapp (localhost:5173)
npm run dev:webapp
```

Both frontends need the backend running somewhere for API calls. By default they proxy to `http://localhost:3000`. If you're only contributing to the frontend, you can ignore the backend — most pages render without API data.

## Build

```bash
npm run build:site      # outputs to site/dist
npm run build:webapp    # outputs to webapp/dist
npm run build           # builds both
```

## Deployment

Both frontends are deployed to [Cloudflare Pages](https://pages.cloudflare.com). Every push to `main` triggers an automatic rebuild and deploy.

- **site** — build command: `cd site && npm ci && npm run build`, output: `site/dist`
- **webapp** — build command: `cd webapp && npm ci && npm run build`, output: `webapp/dist`

Custom domains:
- `fluel.io` → site project
- `webapp.fluel.io` → webapp project

## Brand

fluel uses the **S2 Electric Mint** palette and the **Drop-to-Flame** mark. See [`site/src/styles/global.css`](./site/src/styles/global.css) for the canonical CSS variables.

| Token | Hex | Role |
|-------|-----|------|
| Electric Mint | `#00FFB2` | Primary CTAs, mark body |
| Coral Fire | `#FF7A5C` | Mark tip, urgency, receive-side |
| Chain Blue | `#60A5FA` | Verified / trust states |
| Void | `#080B10` | Background |
| Panel | `#111820` | Cards, surfaces |

## Contributing

Pull requests welcome. For larger changes, please open an issue first.

Before submitting:

```bash
npm run typecheck   # tsc --noEmit in both projects
```

## Security

If you find a security issue, please **do not open a public issue**. See [SECURITY.md](./SECURITY.md).

## License

[MIT](./LICENSE) — Copyright (c) 2026 MAD Protocol Ltd.

fluel is a trading name of MAD Protocol Ltd, registered in England and Wales (No. 11232367).

---

**Disclaimer:** fluel is a non-custodial technical interface. It is not regulated by the Financial Conduct Authority (FCA). Crypto-assets are high risk. You may lose all your money. See [Terms](https://fluel.io/terms).
