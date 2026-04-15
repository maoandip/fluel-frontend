// Copies brand/tokens.css into src/styles/_tokens.css before build.
// _tokens.css is gitignored — it's a generated artifact mirroring the
// canonical palette so both projects stay in lock-step.

import { copyFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WEBAPP_ROOT = resolve(__dirname, "..");

const src = resolve(WEBAPP_ROOT, "../brand/tokens.css");
const dest = resolve(WEBAPP_ROOT, "src/styles/_tokens.css");

mkdirSync(dirname(dest), { recursive: true });
copyFileSync(src, dest);
console.log(`✓ synced tokens → src/styles/_tokens.css`);
