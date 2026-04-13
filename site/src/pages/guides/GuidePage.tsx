import { Show, For } from "solid-js";
import { useParams, A } from "@solidjs/router";
import { guides } from "./data";
import p from "../../styles/page.module.css";
import s from "./Guides.module.css";

const BOT_URL = "https://t.me/FluelBot";

export default function GuidePage() {
  const params = useParams<{ slug: string }>();
  const guide = () => guides.find(g => g.slug === params.slug);

  // Set page title and meta for SEO
  const g = guide();
  if (g) {
    document.title = `${g.title} — fluel`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", g.description);
  }

  return (
    <Show when={guide()} fallback={
      <div class={p.page}>
        <div class={p.wrapper}>
          <h1 class={p.title}>Guide not found</h1>
          <p class={p.subtitle}>This guide doesn't exist.</p>
          <A href="/guides" class={s.backLink}>&larr; All guides</A>
        </div>
      </div>
    }>
      {(g) => (
        <div class={p.page}>
          <div class={p.wrapper}>
            <A href="/guides" class={s.backLink}>&larr; All guides</A>

            <article class={s.article}>
              <h1 class={s.articleTitle}>{g().title}</h1>
              <p class={s.articleDesc}>{g().description}</p>

              <For each={g().sections}>
                {(section) => (
                  <>
                    <h2 class={s.sectionHeading}>{section.heading}</h2>
                    <For each={section.body.split("\n")}>
                      {(para) => <p class={s.sectionBody}>{para}</p>}
                    </For>
                  </>
                )}
              </For>

              <div class={s.cta}>
                <h3 class={s.ctaTitle}>Never get stranded again.</h3>
                <p class={s.ctaDesc}>Open the fluel bot and get gas on any chain in seconds.</p>
                <a href={BOT_URL} class={s.ctaBtn} target="_blank" rel="noopener">Get gas now</a>
              </div>
            </article>
          </div>
        </div>
      )}
    </Show>
  );
}
