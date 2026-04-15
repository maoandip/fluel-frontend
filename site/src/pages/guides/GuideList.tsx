import { For } from "solid-js";
import { A } from "@solidjs/router";
import { guides } from "./data";
import p from "../../styles/page.module.css";
import s from "./Guides.module.css";
import { useCanonical } from "../../lib/seo";

const categoryLabel: Record<string, string> = {
  "getting-started": "Getting started",
  chain: "Chain guides",
  troubleshooting: "Troubleshooting",
  tips: "Tips",
};

export default function GuideList() {
  document.title = "Guides — fluel";
  useCanonical("/guides");

  const categories = () => {
    const cats = new Map<string, typeof guides>();
    for (const g of guides) {
      if (!cats.has(g.category)) cats.set(g.category, []);
      cats.get(g.category)!.push(g);
    }
    return cats;
  };

  return (
    <div class={p.page}>
      <div class={p.wrapper}>
        <h1 class={p.title}>Guides</h1>
        <p class={p.subtitle}>Everything you need to know about getting gas on any chain.</p>

        <For each={[...categories().entries()]}>
          {([cat, items]) => (
            <>
              <h2 class={s.catLabel}>{categoryLabel[cat] ?? cat}</h2>
              <div class={s.grid}>
                <For each={items}>
                  {(guide) => (
                    <A href={`/guides/${guide.slug}`} class={s.card}>
                      <span class={s.cardTitle}>{guide.title}</span>
                      <p class={s.cardDesc}>{guide.description}</p>
                      <span class={s.cardLink}>Read guide &rarr;</span>
                    </A>
                  )}
                </For>
              </div>
            </>
          )}
        </For>
      </div>
    </div>
  );
}
