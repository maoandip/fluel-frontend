import { env } from "./env";

// Beta mode: hides bot/mini-app access on the marketing site and swaps
// "Get gas now" CTAs for a waitlist signup. Flip to false to launch.
// Override at build time via VITE_BETA=false in your deploy env.
export const BETA_MODE: boolean = env.VITE_BETA === "true";
