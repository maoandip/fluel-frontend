import { createSignal, createMemo, For, Show } from "solid-js";
import { createAsync } from "@solidjs/router";
import p from "../styles/page.module.css";
import s from "./Chains.module.css";
import CtaButton from "../components/CtaButton";
import { getPrices } from "../lib/queries";

interface ChainInfo {
  id: number;
  name: string;
  icon?: string;
  gwei: number | null;
}

function fmtGwei(g: number): string {
  if (g >= 1) return g.toFixed(1);
  if (g >= 0.1) return g.toFixed(2);

  const str = g.toFixed(12).replace(/0+$/, "");
  const match = str.match(/^0\.(0*)(\d{1,3})/);
  if (!match) return g.toPrecision(3);

  const leadingZeros = match[1].length;
  const significant = match[2];

  if (leadingZeros === 0) return `0.${significant}`;

  const subscriptDigits = "\u2080\u2081\u2082\u2083\u2084\u2085\u2086\u2087\u2088\u2089";
  const subscript = String(leadingZeros)
    .split("")
    .map((d) => subscriptDigits[parseInt(d)])
    .join("");
  return `0.0${subscript}${significant}`;
}

function gweiLevel(g: number): "low" | "mid" | "high" {
  if (g < 10) return "low";
  if (g < 50) return "mid";
  return "high";
}

const cardLevelClass = { low: "cardLow", mid: "cardMid", high: "cardHigh" } as const;
const gweiLevelClass = { low: "gweiLow", mid: "gweiMid", high: "gweiHigh" } as const;

export default function Chains() {
  document.title = "Supported Chains — fluel";
  const meta = document.querySelector('meta[name="description"]');
  if (meta) {
    meta.setAttribute(
      "content",
      "Browse all EVM chains supported by Fluel. Live gas prices, native tokens, and real-time network status for 40+ blockchains.",
    );
  }

  // createAsync feeds through the outer <Suspense>/<ErrorBoundary> at the
  // route level, so no manual loading/error state is needed in this file.
  const prices = createAsync(() => getPrices());

  const chains = createMemo<ChainInfo[]>(() => {
    const data = prices();
    if (!data) return [];
    return data.chains
      .map((c) => ({
        id: c.id,
        name: c.name,
        icon: c.icon,
        gwei: data.prices[c.id] ?? null,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  const [search, setSearch] = createSignal("");
  const [sortBy, setSortBy] = createSignal<"name" | "gas">("name");

  const filtered = createMemo(() => {
    const q = search().toLowerCase().trim();
    let list = chains();
    if (q) list = list.filter((c) => c.name.toLowerCase().includes(q));
    if (sortBy() === "gas") {
      list = [...list].sort((a, b) => (a.gwei ?? Infinity) - (b.gwei ?? Infinity));
    } else {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  });

  return (
    <div class={p.page}>
      <div class={s.hero}>
        <h1 class={p.title}>Supported Chains</h1>
        <p class={s.subtitle}>
          Fluel supports {chains().length || "40+"} EVM chains. Swap USDC for native gas tokens on any of them — directly from Telegram.
          This list updates automatically as new chains are added.
        </p>
      </div>

      <div class={s.wrapper}>
        {/* Controls */}
        <div class={s.controls}>
          <div class={s.searchWrap}>
            <input
              class={s.search}
              type="text"
              placeholder="Search chains..."
              value={search()}
              onInput={(e) => setSearch(e.currentTarget.value)}
            />
            <Show when={search()}>
              <button class={s.clearBtn} onClick={() => setSearch("")} aria-label="Clear search">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </Show>
          </div>
          <div class={s.sortGroup}>
            <button
              class={`${s.sortBtn} ${sortBy() === "name" ? s.sortActive : ""}`}
              onClick={() => setSortBy("name")}
            >A–Z</button>
            <button
              class={`${s.sortBtn} ${sortBy() === "gas" ? s.sortActive : ""}`}
              onClick={() => setSortBy("gas")}
            >Gas price</button>
          </div>
        </div>

        {/* Chain count */}
        <p class={s.count}>
          {filtered().length === chains().length
            ? `${chains().length} chains supported`
            : `${filtered().length} of ${chains().length} chains`}
        </p>

        {/* Grid */}
        <Show when={chains().length > 0} fallback={<p class={s.loading}>Chain data unavailable</p>}>
          <Show when={filtered().length > 0} fallback={
            <p class={s.loading}>No chains match "{search()}"</p>
          }>
            <div class={s.grid}>
              <For each={filtered()}>
                {(chain) => {
                  const hasGas = chain.gwei != null;
                  const level = hasGas ? gweiLevel(chain.gwei!) : null;
                  return (
                    <div class={`${s.card} ${level ? s[cardLevelClass[level]] : ""}`}>
                      <div class={s.cardTop}>
                        <Show when={chain.icon}>
                          <img class={s.chainIcon} src={chain.icon!} alt="" loading="lazy" />
                        </Show>
                        <div class={s.chainInfo}>
                          <span class={s.chainName}>{chain.name}</span>
                          <span class={s.chainId}>Chain ID: {chain.id}</span>
                        </div>
                      </div>
                      <Show when={hasGas && level}>
                        <div class={s.cardBottom}>
                          <div class={`${s.gweiVal} ${s[gweiLevelClass[level!]]}`}>
                            {fmtGwei(chain.gwei!)}
                            <span class={s.gweiUnit}> gwei</span>
                          </div>
                          <span class={`${s.levelBadge} ${s[level!]}`}>{level}</span>
                        </div>
                      </Show>
                      <Show when={!hasGas}>
                        <div class={s.cardBottom}>
                          <span class={s.noPrice}>Price unavailable</span>
                        </div>
                      </Show>
                    </div>
                  );
                }}
              </For>
            </div>
          </Show>
        </Show>

        {/* Legend */}
        <div class={s.legend}>
          <span class={s.legendLabel}>Gas levels:</span>
          <span class={`${s.legendItem} ${s.low}`}>Low (&lt;10 gwei)</span>
          <span class={`${s.legendItem} ${s.mid}`}>Mid (10–50 gwei)</span>
          <span class={`${s.legendItem} ${s.high}`}>High (&gt;50 gwei)</span>
        </div>

        {/* Info */}
        <div class={s.infoSection}>
          <h2 class={p.sectionTitle}>How chain support works</h2>
          <p class={p.sectionDesc}>
            Fluel dynamically loads supported chains from <a href="https://li.fi" target="_blank" rel="noopener">LI.FI</a>,
            a battle-tested cross-chain aggregator. When LI.FI adds a new chain, it automatically becomes available on Fluel — no manual updates needed.
            Gas prices are polled in real-time from each chain's RPC nodes.
          </p>

          <h2 class={p.sectionTitle}>Deposit and receive chains</h2>
          <p class={p.sectionDesc}>
            You can deposit USDC on any chain that supports it (most chains above). Gas tokens can be received on all listed chains.
            Fluel handles the cross-chain routing automatically — deposit on one chain, receive gas on another.
          </p>
        </div>

        {/* CTA */}
        <div class={p.ctaBox}>
          <h2 class={p.ctaTitle}>Need gas on any of these chains?</h2>
          <p class={p.ctaDesc}>Swap USDC for native gas tokens in under a minute. No bridging, no wallet extensions — just Telegram.</p>
          <CtaButton class={p.ctaBtn} />
        </div>
      </div>
    </div>
  );
}
