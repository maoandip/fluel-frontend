export interface Guide {
  slug: string;
  title: string;
  description: string;
  keywords: string;
  category: "getting-started" | "chain" | "troubleshooting" | "tips";
  publishedAt: string;     // ISO date (YYYY-MM-DD) — required for Article schema
  dateModified?: string;   // ISO date (YYYY-MM-DD) — optional, falls back to publishedAt
  sections: Array<{ heading: string; body: string }>;
}

export const guides: Guide[] = [
  {
    slug: "how-to-get-gas-on-any-chain",
    publishedAt: "2026-04-14",
    title: "How to Get Gas on Any Chain with USDC",
    description: "Stop struggling with bridges. Get native gas tokens on Ethereum, Arbitrum, Base, Polygon, and 60+ chains using USDC via Telegram.",
    keywords: "get gas tokens, buy gas with USDC, cross-chain gas, crypto gas tokens",
    category: "getting-started",
    sections: [
      {
        heading: "The gas problem",
        body: "Every blockchain transaction needs gas — the native token used to pay network fees. ETH on Ethereum, MATIC on Polygon, AVAX on Avalanche. Without it, you can't do anything: no swaps, no mints, no transfers. And getting gas on a new chain usually means finding a bridge, swapping on a DEX, or buying from an exchange. That's friction you don't need."
      },
      {
        heading: "The Fluel solution",
        body: "Fluel converts your USDC into native gas tokens on any supported chain. One Telegram bot. One deposit. Gas delivered to your wallet in seconds. No bridges. No DEX hunting. No seed phrases to manage."
      },
      {
        heading: "How it works",
        body: "1. Open the Fluel Telegram bot and type /start.\n2. Set your destination wallet with /setwallet 0xYourAddress.\n3. Deposit USDC to your Fluel deposit address.\n4. Type /gas 5 base arbitrum to get a quote.\n5. Type /confirm to execute. Gas arrives in your wallet within seconds."
      },
      {
        heading: "Supported chains",
        body: "Fluel supports 61+ EVM chains including Ethereum, Arbitrum, Base, Optimism, Polygon, Avalanche, BSC, zkSync, Mantle, Scroll, Linea, Mode, and many more. The full list updates automatically from Li.Fi's cross-chain protocol."
      },
      {
        heading: "Fees",
        body: "Transparent, volume-based pricing. $0–10: 2.5%. $10–100: 1.5%. $100–500: 1.0%. $500+: 0.75%. The exact fee is shown before you confirm. Your first swap is free if you join via a referral link."
      }
    ]
  },
  {
    slug: "stuck-on-chain-with-no-gas",
    publishedAt: "2026-04-14",
    title: "Stuck on a Chain With No Gas? Here's How to Fix It",
    description: "Bridged tokens to a new chain but can't do anything because you have no gas? fluel fixes this in seconds — no bridges needed.",
    keywords: "stuck on chain no gas, no ETH for gas, can't pay gas fees, stranded crypto, need gas tokens",
    category: "troubleshooting",
    sections: [
      {
        heading: "You're not alone",
        body: "It's one of crypto's most common frustrations. You bridge USDC or an NFT to a new chain, only to realize you can't do anything because you don't have the native gas token. No ETH on Arbitrum. No MATIC on Polygon. No AVAX on Avalanche. Your tokens are there, but they're useless without gas."
      },
      {
        heading: "The usual workarounds (and why they're painful)",
        body: "Buy the gas token on a centralized exchange, withdraw to the right chain, wait for confirmations. Or find a gas faucet that gives you $0.001 worth. Or bridge from another chain — but you need gas on THAT chain to start the bridge. It's a chicken-and-egg problem."
      },
      {
        heading: "The fix: Fluel",
        body: "Fluel takes USDC (which you probably already have) and converts it into native gas on any chain. The swap is handled by Li.Fi's cross-chain routing — it finds the best bridge and DEX combination automatically. Gas arrives directly in your wallet."
      },
      {
        heading: "Step by step",
        body: "1. Open @FluelBot on Telegram.\n2. Type /start to create your wallet.\n3. Set your destination: /setwallet 0xYourStuckWallet\n4. Deposit USDC to your Fluel address (from any chain where you DO have gas).\n5. Type /gas 2 base (or whatever chain you're stuck on).\n6. Confirm. Gas arrives in seconds."
      },
      {
        heading: "Pro tip",
        body: "Keep $5–10 USDC in your Fluel wallet at all times. When you get stuck on a new chain, you can get gas instantly without having to find a bridge or exchange. Think of it as a prepaid gas card for all of crypto."
      }
    ]
  },
  {
    slug: "cheapest-way-to-get-eth-for-gas",
    publishedAt: "2026-04-14",
    title: "Cheapest Way to Get ETH for Gas Fees",
    description: "Compare the cost of getting ETH for gas: CEX withdrawal vs bridge vs Fluel. Find the cheapest option for small gas amounts.",
    keywords: "cheap ETH gas, cheapest gas fees, buy small amount ETH, gas fee solution, low cost gas tokens",
    category: "tips",
    sections: [
      {
        heading: "The real cost of getting gas",
        body: "When you need $2 of ETH for gas on Arbitrum, the acquisition cost often exceeds the gas itself. A CEX withdrawal might cost $5–15 in fees. A bridge costs gas on the source chain plus bridge fees. And DEX swaps have slippage on small amounts."
      },
      {
        heading: "Option 1: Centralized exchange",
        body: "Buy ETH on Coinbase/Binance, withdraw to L2. Cost: $5–15 withdrawal fee + time (10–30 minutes). Works but expensive for small amounts. You're paying $15 to get $2 of gas."
      },
      {
        heading: "Option 2: Bridge from another chain",
        body: "Use a bridge like Hop or Stargate. Cost: gas on source chain + bridge fee (usually $1–5) + 1–10 minute wait. Better than CEX but still requires gas on the source chain — which is the problem you're trying to solve."
      },
      {
        heading: "Option 3: Fluel",
        body: "Deposit USDC once, get gas on any chain via Telegram. Cost: 1.5% fee on a $10 swap = $0.15. Gas arrives in seconds. No source chain gas needed — fluel covers the transaction fees. For small gas amounts ($1–20), this is the cheapest option."
      },
      {
        heading: "When to use what",
        body: "Need $100+ of ETH? Use a CEX — the flat withdrawal fee becomes negligible.\nNeed $10–50? A bridge is reasonable if you have gas on the source chain.\nNeed $1–20 of gas and you're stuck? Fluel. The percentage fee on small amounts is lower than any flat fee alternative."
      }
    ]
  },
  {
    slug: "how-to-get-gas-on-base",
    publishedAt: "2026-04-14",
    title: "How to Get Gas on Base Chain",
    description: "Get ETH for gas on Base chain instantly using USDC. No bridge needed. Works from any chain via Telegram.",
    keywords: "Base chain gas, get ETH on Base, Base gas fees, Base chain bridge, Coinbase Base gas",
    category: "chain",
    sections: [
      {
        heading: "Base needs ETH for gas",
        body: "Base is Coinbase's Layer 2 built on Optimism. Like all L2s, it uses ETH for gas fees. Gas on Base is cheap — usually under $0.01 per transaction — but you still need some ETH in your wallet to do anything."
      },
      {
        heading: "Getting ETH on Base the hard way",
        body: "Bridge from Ethereum mainnet (costs $5–15 in mainnet gas). Bridge from another L2 via Hop/Stargate (cheaper but requires gas on that L2). Buy on Coinbase and withdraw to Base (requires Coinbase account + verification)."
      },
      {
        heading: "Getting ETH on Base with fluel",
        body: "1. Open @FluelBot on Telegram.\n2. Deposit USDC to your Fluel wallet (from any chain).\n3. Type /gas 2 arbitrum base\n4. Confirm. ETH arrives on Base in seconds.\n\nYou can swap from USDC on any chain — Arbitrum, Polygon, Ethereum, BSC — and receive ETH on Base. fluel uses Li.Fi to find the cheapest route automatically."
      },
      {
        heading: "How much gas do you need on Base?",
        body: "Base gas is extremely cheap. $0.50 of ETH will cover hundreds of transactions. A $2 swap gives you enough gas for weeks of typical usage. Unless you're deploying contracts, you'll rarely need more than $5 of ETH on Base."
      }
    ]
  },
  {
    slug: "how-to-get-gas-on-arbitrum",
    publishedAt: "2026-04-14",
    title: "How to Get Gas on Arbitrum",
    description: "Get ETH for gas on Arbitrum instantly. No mainnet bridge fees. Swap USDC to ETH on Arbitrum via Telegram.",
    keywords: "Arbitrum gas, get ETH on Arbitrum, Arbitrum bridge, Arbitrum gas fees",
    category: "chain",
    sections: [
      {
        heading: "Arbitrum uses ETH",
        body: "Arbitrum is Ethereum's leading Layer 2. Every transaction — swaps, transfers, contract interactions — requires ETH for gas. Gas costs are typically $0.01–0.10 per transaction, much cheaper than mainnet."
      },
      {
        heading: "Common ways to get ETH on Arbitrum",
        body: "Bridge from Ethereum mainnet using the official Arbitrum bridge (7-day withdrawal, instant deposit but costs mainnet gas). Use a third-party bridge like Hop or Stargate (faster, still needs gas on source chain). Withdraw from a CEX that supports Arbitrum (Binance, Coinbase)."
      },
      {
        heading: "Faster: fluel",
        body: "Deposit USDC to fluel from any chain. Type /gas 5 base arbitrum (or from any other chain). Gas arrives on Arbitrum in under 30 seconds. No bridge UI. No gas on the source chain. Just a Telegram command."
      },
      {
        heading: "Recommended gas amount",
        body: "$2–5 of ETH covers weeks of normal Arbitrum usage. Heavy DeFi users might want $10–20. The gas is delivered directly to your wallet — not the Fluel wallet — so you can use it immediately with any dApp."
      }
    ]
  },
  {
    slug: "bridge-gas-tokens-without-bridging",
    publishedAt: "2026-04-14",
    title: "Get Gas Tokens Without Using a Bridge",
    description: "Skip the bridge UI entirely. Get native gas tokens on any EVM chain by swapping USDC via Telegram. No bridging required.",
    keywords: "skip bridge, no bridge gas tokens, bridge alternative, cross-chain without bridge, avoid bridge fees",
    category: "tips",
    sections: [
      {
        heading: "Why bridges are painful",
        body: "Bridges require gas on the source chain to initiate. They have confusing UIs with multiple steps. Transaction times range from 1 minute to 7 days. And bridge exploits have lost billions in crypto history. For getting a few dollars of gas, bridges are overkill."
      },
      {
        heading: "fluel handles the bridging for you",
        body: "When you use fluel, Li.Fi's protocol finds the optimal route across bridges and DEXs automatically. You never interact with a bridge UI. You never approve bridge contracts. You just type a command and gas arrives."
      },
      {
        heading: "What happens behind the scenes",
        body: "1. Your USDC is swapped via Li.Fi's aggregator.\n2. Li.Fi selects the best bridge (Stargate, Hop, Across, etc.) based on cost, speed, and liquidity.\n3. The bridge moves funds cross-chain.\n4. A DEX swap converts to the native gas token.\n5. Gas arrives in your wallet.\n\nAll of this happens in one transaction from your perspective."
      },
      {
        heading: "When to still use a bridge",
        body: "If you're moving large amounts ($1000+) of specific tokens, a direct bridge is more cost-effective. fluel is optimized for gas amounts — $1 to $500 of native tokens. For that use case, it's faster, cheaper, and simpler than any bridge UI."
      }
    ]
  }
];
