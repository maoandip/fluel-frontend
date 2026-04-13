import { onMount } from "solid-js";
import { A } from "@solidjs/router";
import s from "./NotFound.module.css";

export default function NotFound() {
  let starsRef: HTMLDivElement | undefined;
  let w1Ref: HTMLDivElement | undefined;
  let w2Ref: HTMLDivElement | undefined;
  let gaugeLabelRef: HTMLSpanElement | undefined;

  onMount(() => {
    document.title = "404 — Out of Gas · fluel";

    // Starfield
    if (starsRef) {
      for (let i = 0; i < 80; i++) {
        const star = document.createElement("div");
        star.className = s.star;
        const size = Math.random() * 2 + 0.5;
        star.style.cssText = `width:${size}px;height:${size}px;left:${Math.random() * 100}%;top:${Math.random() * 70}%;--dur:${2 + Math.random() * 4}s;--delay:${Math.random() * 5}s;--op:${0.15 + Math.random() * 0.5};`;
        starsRef.appendChild(star);
      }
    }

    // Stop wheels when "out of gas"
    setTimeout(() => {
      if (w1Ref) { w1Ref.classList.add(s.stopped); w1Ref.style.animationDuration = "3s"; }
      if (w2Ref) { w2Ref.classList.add(s.stopped); w2Ref.style.animationDuration = "3s"; }
      if (gaugeLabelRef) gaugeLabelRef.textContent = "fuel · empty";
    }, 3200);
  });

  return (
    <div class={s.page}>
      {/* Grid background */}
      <div class={s.gridBg} />

      {/* Ambient glows */}
      <div class={s.glowMint} />
      <div class={s.glowCoral} />

      {/* Starfield */}
      <div class={s.stars} ref={starsRef} />

      {/* Main scene */}
      <div class={s.scene}>
        {/* Content */}
        <div class={s.content}>
          <div class={s.errorCode} aria-label="404">
            <span class={s.errorNum} aria-hidden="true">4<span class={s.zeroCoral}>0</span>4</span>
            <span class={s.errorNumFill} aria-hidden="true">404</span>
            <span class={s.errorNumEmpty} aria-hidden="true">404</span>
          </div>

          <div class={s.statusLine}>
            <div class={s.statusDot} />
            <span class={s.statusTxt}>Out of Gas</span>
          </div>

          <h1 class={s.headline}>You've been <span>stranded.</span></h1>

          <p class={s.sub}>This page ran out of gas and couldn't make it to the destination. Let's get you back on the chain.</p>

          <div class={s.chainCtx}>
            <span class={s.chainTag}>ETH</span>
            <div class={s.chainSep} />
            <span class={s.chainTag}>ARB</span>
            <div class={s.chainSep} />
            <span class={s.chainTag}>OP</span>
            <div class={s.chainSep} />
            <span class={s.chainTag}>SOL</span>
            <div class={s.chainSep} />
            <span class={s.chainTag}>BASE</span>
          </div>

          <div class={s.ctaGroup}>
            <A href="/" class={s.ctaBtn}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 12h18M3 12l6-6M3 12l6 6" />
              </svg>
              Get Gas & Go Home
            </A>
            <A href="/how-it-works" class={s.ctaSecondary}>or check the docs →</A>
          </div>

          <div class={s.errorAddr}>error · page_not_found · 0x404</div>
        </div>

        {/* Road with chain nodes */}
        <div class={s.road}>
          <div class={s.roadLine} />
          <div class={s.roadDashes}>
            {Array.from({ length: 12 }).map(() => <div class={s.roadDash} />)}
          </div>
          <div class={s.chainNodes}>
            {Array.from({ length: 8 }).map(() => (
              <><div class={s.chainNode} /><div class={s.chainLink} /></>
            ))}
          </div>
        </div>

        {/* Car (the mark as a stranded vehicle) */}
        <div class={s.carWrap}>
          <div class={s.car}>
            <div class={s.markCar}>
              <svg width="28" height="42" viewBox="0 0 48 72" fill="none">
                <path d="M24 68 C14 68 6 60 6 50 C6 40 14 32 24 18 C34 32 42 40 42 50 C42 60 34 68 24 68Z" fill="#00FFB2" />
                <path d="M24 18 C24 18 19 8 19 4 C19 1.5 21.2 0 24 0 C26.8 0 29 1.5 29 4 C29 8 24 18 24 18Z" fill="#FF7A5C" />
              </svg>
              <div class={s.puff} />
              <div class={s.puff} />
              <div class={s.puff} />
            </div>
            <div class={s.wheels}>
              <div class={s.wheel} ref={w1Ref} />
              <div class={s.wheel} ref={w2Ref} />
            </div>
          </div>
        </div>
      </div>

      {/* Fuel gauge bar */}
      <div class={s.gaugeTrack}>
        <div class={s.gaugeFill} />
      </div>
      <span class={s.gaugeLabel} ref={gaugeLabelRef}>fuel · draining</span>
    </div>
  );
}
