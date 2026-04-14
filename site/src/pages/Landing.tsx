import { onMount, createSignal, For, Show } from "solid-js";
import { apiUrl } from "../lib/api";
import s from "./Landing.module.css";
import { BOT_URL } from "../config/links";

const TOP_CHAINS = 10;

interface ChainPrice {
  id: number;
  name: string;
  icon?: string;
  gwei: number | null;
}

function fmtGwei(g: number): string {
  if (g >= 1) return g.toFixed(1);
  if (g >= 0.1) return g.toFixed(2);

  const s = g.toFixed(12).replace(/0+$/, "");
  const match = s.match(/^0\.(0*)(\d{1,3})/);
  if (!match) return g.toPrecision(3);

  const leadingZeros = match[1].length;
  const significant = match[2];

  if (leadingZeros === 0) return `0.${significant}`;

  // Subscript digits: U+2080 through U+2089
  const subscriptDigits = "\u2080\u2081\u2082\u2083\u2084\u2085\u2086\u2087\u2088\u2089";
  const subscript = String(leadingZeros).split("").map((d) => subscriptDigits[parseInt(d)]).join("");
  return `0.0${subscript}${significant}`;
}

function gweiLevel(g: number): "low" | "mid" | "high" {
  if (g < 10) return "low";
  if (g < 50) return "mid";
  return "high";
}

function levelColor(level: "low" | "mid" | "high"): string {
  return level === "low" ? "#3CE3AB" : level === "mid" ? "#FFB900" : "#F23674";
}

function levelBg(level: "low" | "mid" | "high"): string {
  return level === "low" ? "rgba(60,227,171,.08)" : level === "mid" ? "rgba(255,185,0,.08)" : "rgba(242,54,116,.08)";
}

export default function Landing() {
  const [allPrices, setAllPrices] = createSignal<ChainPrice[]>([]);
  const [showAll, setShowAll] = createSignal(false);
  const [loaded, setLoaded] = createSignal(false);

  const displayPrices = () => {
    const prices = allPrices();
    return showAll() ? prices : prices.slice(0, TOP_CHAINS);
  };

  // Scroll reveal
  function setupReveal() {
    const els = document.querySelectorAll(`.${s.reveal}`);
    if (!els.length) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add(s.visible); obs.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    els.forEach(el => obs.observe(el));
  }

  onMount(async () => {
    document.title = "fluel — Never get stranded on a chain again";
    try {
      const res = await fetch(apiUrl("/prices"));
      const { prices, chains } = await res.json();
      const list: ChainPrice[] = chains
        .filter((c: any) => prices[c.id] != null)
        .map((c: any) => ({
          id: c.id, name: c.name, icon: c.icon,
          gwei: prices[c.id],
        }));
      list.sort((a, b) => a.gwei! - b.gwei!);
      setAllPrices(list);
      setLoaded(true);
    } catch { setLoaded(true); }

    // Delay reveal setup to let DOM render
    requestAnimationFrame(setupReveal);
  });

  return (
    <div class={s.page}>
      {/* Hero */}
      <section class={s.hero}>
        <div class={s.wrapper}>
          <p class={s.label}>Cross-chain gas</p>
          <h1 class={s.heroTitle}>Never get stranded<br />on a chain again.</h1>
          <p class={s.heroSub}>Stablecoins in. Gas out. Usually in under a minute. No manual bridging — just Telegram.</p>
          <div class={s.heroCtas}>
            <a href={BOT_URL} class={s.btnPrimary} target="_blank" rel="noopener">Get gas now</a>
            <a href="/how-it-works" class={s.btnGhost}>How it works &rarr;</a>
          </div>
          <p class={s.heroProof}><a href="/chains">40+ EVM chains supported</a> &middot; Powered by <a href="https://li.fi" target="_blank" rel="noopener">Li.Fi</a></p>
        </div>
      </section>

      {/* Steps */}
      <section class={`${s.section} ${s.reveal}`}>
        <div class={s.wrapper}>
          <h2 class={s.sectionLabel}>How it works</h2>
          <div class={s.stepsGrid}>
            <div class={s.stepCard}>
              <span class={s.stepNum}>01</span>
              <span class={s.stepTitle}>Open the bot</span>
              <p class={s.stepText}>Type /start in Telegram. A wallet is created for you by <a href="https://privy.io" target="_blank" rel="noopener">Privy</a>, a third-party wallet provider. No seed phrases.</p>
              <p class={s.stepLoss}>Never fumble with wallet extensions again.</p>
            </div>
            <div class={s.stepCard}>
              <span class={s.stepNum}>02</span>
              <span class={s.stepTitle}>Deposit USDC</span>
              <p class={s.stepText}>Send stablecoins to your deposit address on any chain.</p>
              <p class={s.stepLoss}>Never lose funds to wrong token formats.</p>
            </div>
            <div class={s.stepCard}>
              <span class={s.stepNum}>03</span>
              <span class={s.stepTitle}>Get gas</span>
              <p class={s.stepText}>Type a command. Gas typically arrives in your wallet within 30 seconds to 2 minutes.</p>
              <p class={s.stepLoss}>Never pay for failed transactions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Prices */}
      <section class={`${s.section} ${s.reveal}`}>
        <div class={s.wrapper}>
          <div class={s.sectionHeader}>
            <h2 class={s.sectionLabel}>Live gas prices</h2>
            <Show when={allPrices().length > TOP_CHAINS}>
              <button class={s.toggleBtn} onClick={() => setShowAll(!showAll())}>
                {showAll() ? "Show less" : `Show all ${allPrices().length} chains`}
              </button>
            </Show>
          </div>
          <Show when={loaded()} fallback={<p class={s.loading}>Loading prices...</p>}>
            <Show when={allPrices().length > 0} fallback={<p class={s.loading}>Prices unavailable</p>}>
              <div class={s.pricesGrid}>
                <For each={displayPrices()}>
                  {(chain) => {
                    const level = gweiLevel(chain.gwei!);
                    return (
                      <div class={s.priceCard} style={{ background: levelBg(level), "border-color": `${levelColor(level)}22` }}>
                        <div class={s.chainLabel}>
                          <Show when={chain.icon}>
                            <img class={s.chainIcon} src={chain.icon!} alt="" loading="lazy" />
                          </Show>
                          {chain.name}
                        </div>
                        <div class={s.gweiVal} style={{ color: levelColor(level) }}>
                          {fmtGwei(chain.gwei!)}
                          <span class={s.gweiUnit}> gwei</span>
                        </div>
                        <span class={`${s.levelBadge} ${s[level]}`}>{level}</span>
                      </div>
                    );
                  }}
                </For>
              </div>
            </Show>
          </Show>
        </div>
      </section>

      {/* Features */}
      <section class={`${s.section} ${s.reveal}`}>
        <div class={s.wrapper}>
          <h2 class={s.sectionLabel}>Features</h2>
          <div class={s.featGrid}>
            <div class={s.featCard}>
              <span class={s.featTitle}>Volume discounts</span>
              <p class={s.featText}>$0–10: 2.5% · $10–100: 1.5% · $100–500: 1.0% · $500+: 0.75%. Exact fee shown before every swap.</p>
              <p class={s.featLoss}>Never overpay for gas.</p>
            </div>
            <div class={s.featCard}>
              <span class={s.featTitle}>Auto-refill</span>
              <p class={s.featText}>Configure a threshold balance and target chain. When your gas drops below it, your pre-set standing instruction is executed automatically via third-party protocols.</p>
              <p class={s.featLoss}>Never run out of gas mid-transaction.</p>
            </div>
            <div class={s.featCard}>
              <span class={s.featTitle}>Gift gas</span>
              <p class={s.featText}>Send $1–$25 gas to anyone via a link. They claim instantly.</p>
              <p class={s.featLoss}>Never leave a friend stranded.</p>
            </div>
            <div class={s.featCard}>
              <span class={s.featTitle}>Referrals</span>
              <p class={s.featText}>Friends get a free first swap. You earn 20% of the Fluel service fee on their swaps.</p>
              <p class={s.featLoss}>Never miss out on passive income.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section class={`${s.section} ${s.reveal}`}>
        <div class={s.wrapper}>
          <h2 class={s.sectionLabel}>Built on trusted infrastructure</h2>
          <div class={s.trustGrid}>
            <div class={s.trustCard}>
              <span class={s.trustBadge}>Secured</span>
              <span class={s.trustTitle}>Hardware-backed keys</span>
              <p class={s.trustText}>Wallet keys are held exclusively by Privy in hardware security enclaves (TEE). Fluel never has access to your private keys.</p>
            </div>
            <div class={s.trustCard}>
              <span class={s.trustBadge}>Verified</span>
              <span class={s.trustTitle}>Li.Fi protocol</span>
              <p class={s.trustText}>Your instructions are relayed to Li.Fi — trusted by Jumper, 1inch, and major DeFi apps. All execution is on-chain.</p>
            </div>
            <div class={s.trustCard}>
              <span class={s.trustBadge}>On-chain</span>
              <span class={s.trustTitle}>Fully verifiable</span>
              <p class={s.trustText}>Every transaction on public blockchains. Verify on any explorer, anytime.</p>
            </div>
            <div class={s.trustCard}>
              <span class={s.trustBadge}>Instant</span>
              <span class={s.trustTitle}>Withdraw anytime</span>
              <p class={s.trustText}>Your USDC is never locked. Withdraw your full balance with one command.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section class={`${s.section} ${s.ctaSection} ${s.reveal}`}>
        <div class={s.wrapper}>
          <div class={s.ctaBox}>
            <h2 class={s.ctaTitle}>Stop losing gas to failed swaps.</h2>
            <p class={s.ctaSub}>Swap USDC for gas on any chain in under a minute. One bot. No friction.</p>
            <a href={BOT_URL} class={s.btnPrimary} target="_blank" rel="noopener">Get gas now</a>
            <p class={s.ctaDisclosure}>Fluel is a non-custodial technical interface. We do not hold, control, or insure your crypto-assets. Crypto-assets are high risk. You may lose all your money. This service is not regulated by the Financial Conduct Authority (FCA). <a href="/terms">Terms</a></p>
          </div>
        </div>
      </section>
    </div>
  );
}
