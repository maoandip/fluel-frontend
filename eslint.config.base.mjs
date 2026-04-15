// Shared ESLint flat-config base for site/ and webapp/.
// Each project extends this with its own tsconfig path.

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import solid from "eslint-plugin-solid/configs/typescript";
import prettier from "eslint-config-prettier";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    ...solid,
  },
  prettier,
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        fetch: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        AbortController: "readonly",
        Buffer: "readonly",
        process: "readonly",
        HTMLElement: "readonly",
        HTMLScriptElement: "readonly",
        HTMLInputElement: "readonly",
        HTMLTextAreaElement: "readonly",
        Element: "readonly",
        Event: "readonly",
        navigator: "readonly",
      },
    },
    rules: {
      // Unused vars: allow when prefixed with _
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
      // Allow `any` for now (we use it for transient API types) — tighten later.
      "@typescript-eslint/no-explicit-any": "off",
      // Solid uses createMemo/createSignal heavily — empty interfaces are common in props.
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
  {
    ignores: ["dist/**", "node_modules/**", "scripts/**", "src/styles/_tokens.css"],
  },
];
