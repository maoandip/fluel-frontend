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
        body: "Transparent, volume-based pricing. $0–10: 2.5%. $10–100: 1.5%. $100–500: 1.0%. $500+: 0.75%, with a $0.50 minimum fee per swap. The exact fee is always shown before you confirm. Your first swap is free (up to $50) if you join via a referral link."
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
        body: "1. Open @fluelbot on Telegram.\n2. Type /start to create your wallet.\n3. Set your destination: /setwallet 0xYourStuckWallet\n4. Deposit USDC to your Fluel address (from any chain where you DO have gas).\n5. Type /gas 2 base (or whatever chain you're stuck on).\n6. Confirm. Gas arrives in seconds."
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
        body: "Deposit USDC once, get gas on any chain via Telegram. Cost: a $10 swap is $0.50 (the minimum fee); larger swaps are 0.75–2.5% volume-based. Gas arrives in seconds. No source chain gas needed — fluel covers the transaction fees. For small gas amounts ($1–20), this is the cheapest option."
      },
      {
        heading: "When to use what",
        body: "Need $100+ of ETH? Use a CEX — the flat withdrawal fee becomes negligible.\nNeed $10–50? A bridge is reasonable if you have gas on the source chain.\nNeed $1–20 of gas and you're stuck? Fluel. The $0.50 minimum fee is still well below any bridge or exchange's flat fee."
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
        body: "1. Open @fluelbot on Telegram.\n2. Deposit USDC to your Fluel wallet (from any chain).\n3. Type /gas 2 arbitrum base\n4. Confirm. ETH arrives on Base in seconds.\n\nYou can swap from USDC on any chain — Arbitrum, Polygon, Ethereum, BSC — and receive ETH on Base. fluel uses Li.Fi to find the cheapest route automatically."
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
  },
  {
    slug: "how-to-get-gas-on-optimism",
    publishedAt: "2026-05-21",
    title: "How to Get Gas on Optimism",
    description: "Get ETH for gas on Optimism (OP Mainnet) instantly using USDC. No mainnet bridge fees. Swap from any chain via Telegram.",
    keywords: "Optimism gas, get ETH on Optimism, OP Mainnet gas, Optimism gas fees, Optimism bridge",
    category: "chain",
    sections: [
      {
        heading: "Optimism runs on ETH",
        body: "Optimism (OP Mainnet) is one of Ethereum's leading Layer 2 networks. Every transaction is paid for in ETH — not OP. OP is the governance token; it does not pay gas. Fees are typically $0.01–0.05 per transaction, but with zero ETH in your wallet you can't transact at all."
      },
      {
        heading: "The usual ways to get ETH on Optimism",
        body: "Bridge from Ethereum mainnet using the Optimism Gateway — instant to deposit, but you pay mainnet gas ($5–15). Use a third-party bridge like Hop or Across — faster, but you still need gas on the source chain. Or withdraw ETH from a centralized exchange that supports Optimism, which means an account, verification, and a withdrawal fee."
      },
      {
        heading: "Getting ETH on Optimism with fluel",
        body: "1. Open the fluel Telegram bot and type /start.\n2. Set your destination wallet: /setwallet 0xYourAddress\n3. Deposit USDC to your fluel wallet from any chain you already use.\n4. Type /gas 3 base optimism (swap $3 of USDC on Base into ETH on Optimism).\n5. Type /confirm. ETH lands on Optimism in seconds — no source-chain gas required, because fluel covers the transaction fees."
      },
      {
        heading: "How much ETH you need on Optimism",
        body: "Optimism gas is cheap. $2–5 of ETH covers weeks of normal usage — swaps, transfers, NFT mints. Heavy DeFi users might keep $10–20. The ETH is delivered straight to your own wallet, so you can use it immediately with any dApp."
      }
    ]
  },
  {
    slug: "how-to-get-gas-on-polygon",
    publishedAt: "2026-05-21",
    title: "How to Get Gas on Polygon",
    description: "Get POL for gas on Polygon instantly using USDC. No bridge needed. Swap from Ethereum, Base, Arbitrum, or any chain via Telegram.",
    keywords: "Polygon gas, get POL for gas, MATIC gas, Polygon gas fees, Polygon bridge, POL token",
    category: "chain",
    sections: [
      {
        heading: "Polygon uses POL for gas",
        body: "The Polygon PoS network pays gas in POL — the token that replaced MATIC in 2024. Every transaction needs it. Polygon gas is famously cheap, often a fraction of a cent, but a wallet with no POL still can't move."
      },
      {
        heading: "Getting POL the traditional way",
        body: "Bridge from Ethereum via the Polygon Portal — but that costs Ethereum mainnet gas. Withdraw POL from a centralized exchange — account and withdrawal fee required. Or swap for it on a Polygon DEX — which only works if you already have POL to pay the swap fee. That last one is the catch most people hit."
      },
      {
        heading: "Getting POL with fluel",
        body: "1. Open the fluel Telegram bot and type /start.\n2. Set your destination: /setwallet 0xYourAddress\n3. Deposit USDC from any chain.\n4. Type /gas 2 arbitrum polygon to swap $2 of USDC into POL on Polygon.\n5. Confirm. POL arrives in your wallet in seconds, with no POL needed up front."
      },
      {
        heading: "How much POL to get",
        body: "Because Polygon fees are so low, even $1–2 of POL lasts a long time — typically hundreds of transactions. There's rarely a reason to hold more than $5 of POL just for gas."
      }
    ]
  },
  {
    slug: "how-to-get-gas-on-avalanche",
    publishedAt: "2026-05-21",
    title: "How to Get Gas on Avalanche",
    description: "Get AVAX for gas on the Avalanche C-Chain instantly using USDC. No bridge required. Swap from any chain via Telegram.",
    keywords: "Avalanche gas, get AVAX for gas, AVAX gas fees, Avalanche C-Chain gas, Avalanche bridge",
    category: "chain",
    sections: [
      {
        heading: "Avalanche needs AVAX",
        body: "The Avalanche C-Chain — the EVM-compatible chain where almost all Avalanche DeFi and NFTs live — pays gas in AVAX. Without AVAX in your wallet, you can't swap, transfer, or claim anything, even if you hold other tokens on the chain."
      },
      {
        heading: "The traditional routes",
        body: "Bridge to Avalanche using the official Avalanche Bridge or a third-party route — both need gas on the source chain to start. Or buy AVAX on a centralized exchange and withdraw it to the C-Chain, which means an account, verification, and a withdrawal fee that can dwarf the small amount of gas you actually need."
      },
      {
        heading: "Getting AVAX with fluel",
        body: "1. Open the fluel Telegram bot and type /start.\n2. Set your destination: /setwallet 0xYourAddress\n3. Deposit USDC from any chain you already use.\n4. Type /gas 4 base avalanche to swap $4 of USDC into AVAX.\n5. Confirm. AVAX arrives on the C-Chain in seconds — fluel covers the transaction fees, so you need no AVAX to begin."
      },
      {
        heading: "How much AVAX you need",
        body: "Avalanche gas is low but slightly higher than the cheapest L2s. $3–8 of AVAX comfortably covers weeks of typical activity. Keep more only if you're an active DeFi user or minting frequently."
      }
    ]
  },
  {
    slug: "how-to-get-gas-on-bnb-chain",
    publishedAt: "2026-05-21",
    title: "How to Get Gas on BNB Chain",
    description: "Get BNB for gas on BNB Chain (BSC) instantly using USDC. No bridge and no Binance account needed. Swap via Telegram.",
    keywords: "BNB Chain gas, get BNB for gas, BSC gas, Binance Smart Chain gas, BNB gas fees",
    category: "chain",
    sections: [
      {
        heading: "BNB Chain runs on BNB",
        body: "BNB Chain — still widely called BSC, or Binance Smart Chain — pays gas in BNB. Every swap, transfer, or contract call needs it. Fees are usually a few cents, but a wallet holding only USDC or tokens still can't transact without a little BNB."
      },
      {
        heading: "The usual ways to get BNB",
        body: "Withdraw BNB from Binance or another exchange — the obvious route, but it needs an account, identity verification, and a withdrawal fee. Or bridge to BNB Chain from another network — which requires gas on the source chain to start. Neither is convenient when you just need a couple of dollars of gas."
      },
      {
        heading: "Getting BNB with fluel",
        body: "1. Open the fluel Telegram bot and type /start.\n2. Set your destination: /setwallet 0xYourAddress\n3. Deposit USDC from any chain.\n4. Type /gas 3 polygon bnb to swap $3 of USDC into BNB.\n5. Confirm. BNB arrives in seconds — no exchange account, no source-chain gas."
      },
      {
        heading: "How much BNB you need",
        body: "BNB Chain fees are low. $3–5 of BNB covers weeks of normal usage. Active traders may prefer $10–20, but for getting un-stuck and transacting again, a few dollars is plenty."
      }
    ]
  },
  {
    slug: "no-gas-to-claim-airdrop",
    publishedAt: "2026-05-21",
    title: "No Gas to Claim an Airdrop? Here's the Fix",
    description: "Eligible for an airdrop but can't claim it because you have no gas on that chain? Get native gas in seconds with USDC — before the window closes.",
    keywords: "no gas to claim airdrop, claim airdrop no gas, airdrop gas fees, can't claim airdrop, airdrop stuck no gas",
    category: "troubleshooting",
    sections: [
      {
        heading: "The airdrop catch-22",
        body: "You qualified for an airdrop — but it's on a chain where your wallet has zero gas. Claiming an airdrop is an on-chain transaction, and every transaction needs the native gas token. No gas means no claim, even though the tokens are sitting right there waiting for you."
      },
      {
        heading: "Why this happens constantly",
        body: "Airdrops reward activity, and that activity is often spread across chains you rarely touch. The claim contract lives on one specific network — an L2, an alt-L1 — and if you've never transacted there, you have no ETH, no POL, no AVAX to pay the claim fee. It's one of the most common ways people miss out on tokens they earned."
      },
      {
        heading: "Fixing it with fluel",
        body: "1. Open the fluel Telegram bot and type /start.\n2. Set your destination to the wallet eligible for the airdrop: /setwallet 0xYourAddress\n3. Deposit USDC from any chain where you already have funds.\n4. Type /gas 2 base arbitrum — amount, source chain, and the chain the airdrop is on.\n5. Confirm. Native gas lands in your wallet in seconds, and you can claim."
      },
      {
        heading: "Beat the claim deadline",
        body: "Most airdrops have a claim window — miss it and the tokens are gone. fluel delivers gas in seconds rather than the 10–30 minutes a CEX withdrawal or bridge can take, so a closing deadline isn't a problem. A good habit: keep a small USDC balance in fluel as a standing gas buffer, so the next surprise airdrop is never blocked."
      }
    ]
  }
];
