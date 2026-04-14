import { type JSX, createSignal, Show } from "solid-js";
import { A } from "@solidjs/router";
import s from "./Layout.module.css";
import { BOT_URL, X_URL, TG_CHANNEL_URL, GITHUB_URL } from "../config/links";

function Logo(props: { size?: number }) {
  const h = props.size ?? 28;
  const w = Math.round(h * 48 / 72);
  return (
    <svg width={w} height={h} viewBox="0 0 48 72" fill="none">
      <path d="M24 68 C14 68 6 60 6 50 C6 40 14 32 24 18 C34 32 42 40 42 50 C42 60 34 68 24 68Z" fill="#00FFB2"/>
      <path d="M24 18 C24 18 19 8 19 4 C19 1.5 21.2 0 24 0 C26.8 0 29 1.5 29 4 C29 8 24 18 24 18Z" fill="#FF7A5C"/>
    </svg>
  );
}

export default function Layout(props: { children?: JSX.Element }) {
  const [menuOpen, setMenuOpen] = createSignal(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div class={s.root}>
      <nav class={s.nav}>
        <div class={s.navInner}>
          <A href="/" class={s.navBrand} onClick={closeMenu}>
            <Logo /> <span class={s.wordmark}>fluel</span>
          </A>
          <div class={s.navRight}>
            <A href="/how-it-works" class={s.navLink}>How it works</A>
            <A href="/chains" class={s.navLink}>Chains</A>
            <a href={BOT_URL} class={s.navCta} target="_blank" rel="noopener">Get gas now</a>
            <button class={`${s.burger} ${menuOpen() ? s.burgerOpen : ""}`} onClick={() => setMenuOpen(!menuOpen())} aria-label="Menu">
              <span /><span /><span />
            </button>
          </div>
        </div>

        <Show when={menuOpen()}>
          <div class={s.mobileMenu}>
            <A href="/how-it-works" class={s.mobileLink} onClick={closeMenu}>How it works</A>
            <A href="/chains" class={s.mobileLink} onClick={closeMenu}>Chains</A>
            <A href="/roadmap" class={s.mobileLink} onClick={closeMenu}>Roadmap</A>
            <A href="/guides" class={s.mobileLink} onClick={closeMenu}>Guides</A>
            <A href="/feedback" class={s.mobileLink} onClick={closeMenu}>Feedback</A>
            <a href={BOT_URL} class={s.mobileCta} target="_blank" rel="noopener" onClick={closeMenu}>Get gas now</a>
          </div>
        </Show>
      </nav>

      <main>{props.children}</main>

      <footer class={s.footer}>
        <div class={s.footerInner}>
          {/* Top row: columns + socials */}
          <div class={s.footerTop}>
            <div class={s.footerBrand}>
              <Logo size={24} />
              <span class={s.footerWordmark}>fluel</span>
              <p class={s.footerTagline}>Gas, without the hassle.</p>
            </div>
            <div class={s.footerCol}>
              <span class={s.footerColTitle}>Product</span>
              <A href="/how-it-works">How it works</A>
              <A href="/chains">Supported chains</A>
              <A href="/guides">Guides</A>
              <A href="/roadmap">Roadmap</A>
              <A href="/feedback">Feedback</A>
            </div>
            <div class={s.footerCol}>
              <span class={s.footerColTitle}>Legal</span>
              <A href="/terms">Terms</A>
              <A href="/privacy">Privacy</A>
            </div>
            <div class={s.footerCol}>
              <span class={s.footerColTitle}>Connect</span>
              <a href={X_URL} target="_blank" rel="noopener" class={s.footerIconLink}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                X (Twitter)
              </a>
              <a href={TG_CHANNEL_URL} target="_blank" rel="noopener" class={s.footerIconLink}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                Telegram
              </a>
              <a href={GITHUB_URL} target="_blank" rel="noopener" class={s.footerIconLink}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                GitHub
              </a>
            </div>
          </div>
          {/* Bottom row: company info + risk warning (UK compliance) */}
          <div class={s.footerBottom}>
            <div class={s.footerCompany}>
              <span class={s.riskWarning}>Not regulated by the FCA. Crypto-assets are high risk. <A href="/terms">Full disclosure</A></span>
              <span class={s.companyInfo}>MAD Protocol Ltd (trading as Fluel) is registered in England and Wales (No. 11232367). Registered address: Apollo House, Hallam Way, Whitehills Business Park, Blackpool, England, FY4 5FS. <a href="mailto:contact@fluel.io">contact@fluel.io</a></span>
              <span class={s.copyright}>&copy; MAD Protocol Ltd {new Date().getFullYear()}. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export { Logo };
