import { Component } from "solid-js";
import s from "./BetaGate.module.css";

const BetaGate: Component = () => {
  return (
    <div class={s.gate}>
      <div class={s.glow} />
      <div class={s.inner}>
        <div class={s.logo}>
          <svg width="28" height="42" viewBox="0 0 48 72" fill="none">
            <path d="M24 68 C14 68 6 60 6 50 C6 40 14 32 24 18 C34 32 42 40 42 50 C42 60 34 68 24 68Z" fill="#00FFB2"/>
            <path d="M24 18 C24 18 19 8 19 4 C19 1.5 21.2 0 24 0 C26.8 0 29 1.5 29 4 C29 8 24 18 24 18Z" fill="#FF7A5C"/>
          </svg>
        </div>
        <div class={s.kicker}>Closed beta</div>
        <h1 class={s.title}>fluel is finishing testing.</h1>
        <p class={s.body}>
          We're putting the final touches on the app before opening it to everyone. Drop your Telegram handle or email on the site and we'll ping you the moment we go live.
        </p>
        <a class={s.cta} href="https://fluel.io/feedback" target="_blank" rel="noopener">
          Join the waitlist
        </a>
        <div class={s.foot}>
          <a href="https://fluel.io" target="_blank" rel="noopener">fluel.io</a>
        </div>
      </div>
    </div>
  );
};

export default BetaGate;
