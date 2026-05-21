import * as v from "valibot";

// Schema for build-time env vars consumed by the marketing site.
// All vars must be prefixed VITE_ to be exposed to client code.
const EnvSchema = v.object({
  VITE_API_BASE: v.optional(
    v.union([
      v.literal(""),
      v.pipe(v.string(), v.url("VITE_API_BASE must be empty or a valid URL")),
    ]),
    "",
  ),
});

function parseEnv() {
  try {
    return v.parse(EnvSchema, {
      VITE_API_BASE: import.meta.env.VITE_API_BASE,
    });
  } catch (err) {
    if (v.isValiError(err)) {
      const issues = err.issues.map((i) => `  - ${i.path?.map((p) => p.key).join(".")}: ${i.message}`).join("\n");
      throw new Error(`[fluel] invalid environment variables:\n${issues}\n\nSet them in your .env / Cloudflare Pages env settings.`);
    }
    throw err;
  }
}

export const env = parseEnv();
