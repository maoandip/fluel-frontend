# Instructions for Claude

## Commits

- Do not add `Co-Authored-By: Claude` trailers to commit messages.
- Do not add `🤖 Generated with Claude Code` footers.
- Keep commit messages clean and focused on the change, not the tooling.

## Pull requests

- Do not add `Generated with Claude Code` footers to PR descriptions.

## Project context

This is the **public frontend** for fluel — a cross-chain gas top-up service via Telegram. The private backend lives in a separate repo.

- `site/` — public marketing site, deployed to `fluel.io` via Cloudflare Pages
- `webapp/` — Telegram Mini App, deployed to `webapp.fluel.io` via Cloudflare Pages

Both are SolidJS + Vite projects with CSS Modules. They communicate with the private backend at `api.fluel.io` via HTTPS. The Mini App authenticates using Telegram `initData`, verified server-side.

Brand tokens live in `site/src/styles/global.css` and `webapp/src/styles/shared.css`. Electric Mint `#00FFB2`, Coral Fire `#FF7A5C`, Chain Blue `#60A5FA`, Void `#080B10`, Panel `#111820`.
