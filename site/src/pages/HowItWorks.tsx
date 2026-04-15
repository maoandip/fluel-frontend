import { onMount, onCleanup } from "solid-js";
import p from "../styles/page.module.css";
import s from "./HowItWorks.module.css";
import { GITHUB_URL } from "../config/links";
import CtaButton from "../components/CtaButton";

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is my USDC safe?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Your USDC is held in a wallet secured by Privy's hardware enclaves (TEE). Fluel does not have access to your private keys and cannot unilaterally move or spend your funds. Every transaction requires your authenticated instruction via Telegram. You can withdraw your full balance at any time using /withdraw."
      }
    },
    {
      "@type": "Question",
      "name": "Why do I need to deposit USDC first?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The embedded wallet allows Fluel to relay your swap instructions to third-party protocols without requiring you to sign each transaction manually via a browser extension. This enables the simple Telegram command experience — just type a command and gas arrives in your wallet. Your deposit address is verifiable on any block explorer."
      }
    },
    {
      "@type": "Question",
      "name": "Which chains are supported?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Fluel supports 40+ EVM chains including Ethereum, Arbitrum, Base, Optimism, Polygon, Avalanche, BSC, zkSync, Mantle, and many more. You can swap USDC from any chain that supports it, and receive gas on any chain LI.FI can route to."
      }
    },
    {
      "@type": "Question",
      "name": "How fast are swaps?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Most swaps complete in under 30 seconds. Layer 2 to Layer 2 swaps are the fastest (a few seconds). Swaps involving Ethereum mainnet may take 1-2 minutes due to block confirmation times."
      }
    },
    {
      "@type": "Question",
      "name": "Can I get my USDC back?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, always. Use /withdraw to send all USDC back to your destination wallet. There is no lock-up period, no withdrawal fee, and no minimum balance requirement."
      }
    },
    {
      "@type": "Question",
      "name": "Do I need ETH to pay for gas fees?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Transaction gas fees for submitting swaps and withdrawals are covered through Privy's gas sponsorship. You only need USDC."
      }
    }
  ]
};

export default function HowItWorks() {
  document.title = "How it works — fluel";

  onMount(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "faq-schema";
    script.textContent = JSON.stringify(FAQ_SCHEMA);
    document.head.appendChild(script);
    onCleanup(() => script.remove());
  });

  return (
    <div class={p.page}>
      <div class={s.hero}>
        <h1 class={p.title}>How It Works</h1>
        <p class={s.subtitle}>
          Fluel provides a simple interface to swap your USDC for native gas tokens on any supported chain via third-party decentralised protocols.
          No bridges to figure out, no wallet extensions to install — just Telegram.
        </p>
      </div>

      {/* Steps */}
      <div class={s.wrapper}>
        <div class={s.steps}>
          <div class={s.step}>
            <div class={s.stepNum}>1</div>
            <div class={s.stepBody}>
              <div class={s.stepTitle}>Open the bot and set up your wallet</div>
              <p class={s.stepDesc}>
                Open our Telegram bot and type <code>/start</code>. A secure wallet is automatically created for you
                by <a href="https://privy.io" target="_blank" rel="noopener">Privy</a>, a third-party wallet infrastructure provider. No seed phrases to write down, no browser extensions to install.
                Your wallet keys are generated and held exclusively by Privy within hardware-backed enclaves (TEE) — Fluel never has access to your private keys.
              </p>
            </div>
          </div>

          <div class={s.step}>
            <div class={s.stepNum}>2</div>
            <div class={s.stepBody}>
              <div class={s.stepTitle}>Set your destination wallet</div>
              <p class={s.stepDesc}>
                Tell Fluel where to deliver gas tokens. This is <strong>your own wallet</strong> — MetaMask,
                Rainbow, Coinbase Wallet, or any EVM wallet you already use. Gas tokens are sent directly to this address,
                so you have full control from the moment they arrive.
              </p>
              <code>/setwallet 0xYourWalletAddress</code>
            </div>
          </div>

          <div class={s.step}>
            <div class={s.stepNum}>3</div>
            <div class={s.stepBody}>
              <div class={s.stepTitle}>Deposit USDC</div>
              <p class={s.stepDesc}>
                Send USDC to your Fluel deposit address on any supported chain. This is a standard blockchain transfer —
                you can verify your deposit address on any block explorer. Your USDC stays in your managed wallet until
                you swap or withdraw it. Type <code>/deposit</code> to see your address.
              </p>
            </div>
          </div>

          <div class={s.step}>
            <div class={s.stepNum}>4</div>
            <div class={s.stepBody}>
              <div class={s.stepTitle}>Swap USDC for gas</div>
              <p class={s.stepDesc}>
                Request a quote, review the details, and confirm. Fluel relays your instruction to <a href="https://li.fi" target="_blank" rel="noopener">LI.FI</a> —
                a leading cross-chain aggregator trusted by major DeFi protocols — which finds the best route across bridges and DEXs and executes the swap on-chain.
                Native gas tokens are delivered directly to your destination wallet, typically within 30 seconds to 2 minutes depending on the chains involved.
              </p>
              <code>/gas 5 base arbitrum</code>
            </div>
          </div>

          <div class={s.step}>
            <div class={s.stepNum}>5</div>
            <div class={s.stepBody}>
              <div class={s.stepTitle}>Use your gas — or withdraw your USDC</div>
              <p class={s.stepDesc}>
                Gas tokens arrive in your external wallet ready to use. Mint NFTs, interact with DeFi, bridge tokens —
                whatever you need gas for. Changed your mind? Withdraw your full USDC balance at any time with <code>/withdraw</code>.
                There is no lock-up period and no withdrawal fees.
              </p>
            </div>
          </div>
        </div>

        {/* Token flow */}
        <h2 class={p.sectionTitle}>Where do my tokens go?</h2>
        <p class={p.sectionDesc}>
          Your tokens follow a transparent, verifiable path. Every step happens on-chain and can be tracked with a block explorer.
        </p>
        <div class={s.flow}>
          <div class={`${s.flowBox} ${s.flowUser}`}>Your Wallet</div>
          <div class={s.flowArrow}>&rarr;</div>
          <div class={`${s.flowBox} ${s.flowDeposit}`}>Deposit USDC</div>
          <div class={s.flowArrow}>&rarr;</div>
          <div class={`${s.flowBox} ${s.flowLifi}`}>LI.FI Swap</div>
          <div class={s.flowArrow}>&rarr;</div>
          <div class={`${s.flowBox} ${s.flowDest}`}>Your Wallet (Gas)</div>
        </div>

        {/* Trust section */}
        <h2 class={p.sectionTitle}>Built on trusted infrastructure</h2>
        <div class={s.trustGrid}>
          <div class={s.trustCard}>
            <div class={s.trustIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            </div>
            <div class={s.trustTitle}>Hardware-secured keys</div>
            <p class={s.trustDesc}>Your wallet keys are generated and held exclusively by Privy inside hardware security enclaves (TEE). They never leave the secure environment — Fluel cannot access, view, or extract them.</p>
          </div>
          <div class={s.trustCard}>
            <div class={s.trustIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div class={s.trustTitle}>LI.FI protocol</div>
            <p class={s.trustDesc}>Your swap instructions are relayed to LI.FI, a battle-tested cross-chain aggregator used by Jumper, 1inch, and other major DeFi applications. All swap execution happens on-chain via decentralised protocols.</p>
          </div>
          <div class={s.trustCard}>
            <div class={s.trustIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"/></svg>
            </div>
            <div class={s.trustTitle}>On-chain and verifiable</div>
            <p class={s.trustDesc}>Every transaction is recorded on public blockchains. You can verify your deposits, swaps, and withdrawals on any block explorer at any time.</p>
          </div>
          <div class={s.trustCard}>
            <div class={s.trustIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            </div>
            <div class={s.trustTitle}>Withdraw anytime</div>
            <p class={s.trustDesc}>Your USDC is never locked. Withdraw your full balance to your own wallet at any time with a single command. No waiting periods, no fees.</p>
          </div>
        </div>

        {/* Fees */}
        <h2 class={p.sectionTitle}>Transparent fees</h2>
        <p class={p.sectionDesc}>
          Fluel charges a service fee on each swap. The fee is applied to the transaction amount before the swap is submitted to the underlying protocol — you see the exact amount in the quote before confirming. No hidden charges.
        </p>
        <div class={s.feeTable}>
          <div class={`${s.feeRow} ${s.feeHeader}`}><span>Swap size</span><span>Fee</span></div>
          <div class={s.feeRow}><span>$0 – $10</span><span class={s.feeValue}>2.5%</span></div>
          <div class={s.feeRow}><span>$10 – $100</span><span class={s.feeValue}>1.5%</span></div>
          <div class={s.feeRow}><span>$100 – $500</span><span class={s.feeValue}>1.0%</span></div>
          <div class={s.feeRow}><span>$500+</span><span class={s.feeValue}>0.75%</span></div>
          <div class={`${s.feeRow} ${s.feeHighlight}`}><span>First swap via referral</span><span class={s.feeValue}>Free</span></div>
        </div>
        <p class={s.feeNote}>Minimum fee: $0.10 per swap. Network gas costs and bridge fees (set by Li.Fi, not Fluel) are shown separately in the quote.</p>

        {/* Transparency */}
        <h2 class={p.sectionTitle}>Full transparency</h2>
        <div class={s.trustGrid}>
          <div class={s.trustCard}>
            <div class={s.trustIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            </div>
            <div class={s.trustTitle}>Open source</div>
            <p class={s.trustDesc}>All code is public on <a href={GITHUB_URL} target="_blank" rel="noopener">GitHub</a>. Verify exactly what runs.</p>
          </div>
          <div class={s.trustCard}>
            <div class={s.trustIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div class={s.trustTitle}>Non-custodial keys</div>
            <p class={s.trustDesc}>Wallet keys are held exclusively by <a href="https://privy.io" target="_blank" rel="noopener">Privy</a> in hardware enclaves (TEE). Fluel does not have access to private keys and cannot unilaterally access, move, or spend your funds.</p>
          </div>
          <div class={s.trustCard}>
            <div class={s.trustIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
            </div>
            <div class={s.trustTitle}>Li.Fi routing</div>
            <p class={s.trustDesc}>Your instructions are relayed to <a href="https://li.fi" target="_blank" rel="noopener">Li.Fi</a> — a battle-tested cross-chain aggregator used by Jumper, 1inch, and major DeFi protocols. All execution happens on-chain.</p>
          </div>
          <div class={s.trustCard}>
            <div class={s.trustIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div class={s.trustTitle}>On-chain proof</div>
            <p class={s.trustDesc}>Every deposit, swap, and withdrawal is recorded on public blockchains. Verify any transaction on a block explorer.</p>
          </div>
        </div>

        <h2 class={p.sectionTitle}>What we store</h2>
        <p class={p.sectionDesc}>Minimal data. No name, no email, no tracking.</p>
        <div class={s.feeTable}>
          <div class={s.feeRow}><span>Telegram user ID</span><span class={s.feeValue}>Links your wallet</span></div>
          <div class={s.feeRow}><span>Wallet addresses</span><span class={s.feeValue}>Deposit + destination</span></div>
          <div class={s.feeRow}><span>Swap history</span><span class={s.feeValue}>Amounts, chains, status</span></div>
          <div class={s.feeRow}><span>Private keys</span><span class={s.feeValue}>Never stored by Fluel</span></div>
        </div>
        <p class={s.feeNote}>Full details in our <a href="/privacy">Privacy Policy</a>. You can request deletion of your data at any time.</p>

        {/* FAQ */}
        <h2 class={p.sectionTitle}>Frequently Asked Questions</h2>
        <div class={s.faq}>
          <div class={s.faqItem}>
            <div class={s.faqQ}>Is my USDC safe?</div>
            <p class={s.faqA}>Your USDC is held in a wallet secured by Privy's hardware enclaves (TEE). Fluel does not have access to your private keys and cannot unilaterally move or spend your funds. Every transaction requires your authenticated instruction via Telegram. You can withdraw your full balance at any time using /withdraw.</p>
          </div>
          <div class={s.faqItem}>
            <div class={s.faqQ}>Why do I need to deposit USDC first?</div>
            <p class={s.faqA}>The embedded wallet allows Fluel to relay your swap instructions to third-party protocols without requiring you to sign each transaction manually via a browser extension. This enables the simple Telegram command experience — just type a command and gas arrives in your wallet. Your deposit address is verifiable on any block explorer.</p>
          </div>
          <div class={s.faqItem}>
            <div class={s.faqQ}>Which chains are supported?</div>
            <p class={s.faqA}>Fluel supports 40+ EVM chains including Ethereum, Arbitrum, Base, Optimism, Polygon, Avalanche, BSC, zkSync, Mantle, and many more. You can swap USDC from any chain that supports it, and receive gas on any chain LI.FI can route to.</p>
          </div>
          <div class={s.faqItem}>
            <div class={s.faqQ}>How fast are swaps?</div>
            <p class={s.faqA}>Most swaps complete in under 30 seconds. Layer 2 to Layer 2 swaps are the fastest (a few seconds). Swaps involving Ethereum mainnet may take 1-2 minutes due to block confirmation times.</p>
          </div>
          <div class={s.faqItem}>
            <div class={s.faqQ}>Can I get my USDC back?</div>
            <p class={s.faqA}>Yes, always. Use /withdraw to send all USDC back to your destination wallet. There is no lock-up period, no withdrawal fee, and no minimum balance requirement.</p>
          </div>
          <div class={s.faqItem}>
            <div class={s.faqQ}>Do I need ETH to pay for gas fees?</div>
            <p class={s.faqA}>No. Transaction gas fees for submitting swaps and withdrawals are covered through Privy's gas sponsorship. You only need USDC.</p>
          </div>
        </div>

        {/* CTA */}
        <div class={s.cta}>
          <h2 class={s.ctaTitle}>Ready to get gas?</h2>
          <p class={s.ctaDesc}>Open the Telegram bot to start swapping USDC for gas on any chain.</p>
          <CtaButton class={s.ctaBtn} botLabel="Open Bot" />
        </div>
      </div>
    </div>
  );
}
