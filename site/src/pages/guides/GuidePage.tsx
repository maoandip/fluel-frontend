import { Show, For, createEffect, onCleanup } from "solid-js";
import { useParams, A } from "@solidjs/router";
import { guides, type Guide } from "./data";
import p from "../../styles/page.module.css";
import s from "./Guides.module.css";
import CtaButton from "../../components/CtaButton";

const SITE = "https://fluel.io";
const OG_IMAGE = `${SITE}/og.png`;
const LOGO = `${SITE}/favicon-512.png`;

function buildBreadcrumb(g: Guide) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": `${SITE}/` },
      { "@type": "ListItem", "position": 2, "name": "Guides", "item": `${SITE}/guides` },
      { "@type": "ListItem", "position": 3, "name": g.title, "item": `${SITE}/guides/${g.slug}` },
    ],
  };
}

function buildArticle(g: Guide) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": g.title,
    "description": g.description,
    "image": OG_IMAGE,
    "datePublished": g.publishedAt,
    "dateModified": g.dateModified ?? g.publishedAt,
    "author": { "@type": "Organization", "name": "fluel", "url": SITE },
    "publisher": {
      "@type": "Organization",
      "name": "fluel",
      "logo": { "@type": "ImageObject", "url": LOGO },
    },
    "mainEntityOfPage": { "@type": "WebPage", "@id": `${SITE}/guides/${g.slug}` },
    "articleBody": g.sections.map(sec => `${sec.heading}. ${sec.body}`).join("\n\n"),
    "keywords": g.keywords,
  };
}

function injectSchema(id: string, data: unknown): HTMLScriptElement {
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = id;
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
  return script;
}

export default function GuidePage() {
  const params = useParams<{ slug: string }>();
  const guide = () => guides.find(g => g.slug === params.slug);

  // Capture the original meta description once so we can restore on unmount.
  const metaEl = document.querySelector('meta[name="description"]');
  const originalDesc = metaEl?.getAttribute("content") ?? null;

  createEffect(() => {
    const g = guide();
    if (!g) return;

    document.title = `${g.title} — fluel`;
    metaEl?.setAttribute("content", g.description);

    const breadcrumbScript = injectSchema("guide-breadcrumb-schema", buildBreadcrumb(g));
    const articleScript = injectSchema("guide-article-schema", buildArticle(g));

    onCleanup(() => {
      breadcrumbScript.remove();
      articleScript.remove();
      if (originalDesc !== null) metaEl?.setAttribute("content", originalDesc);
    });
  });

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
                <CtaButton class={s.ctaBtn} />
              </div>
            </article>
          </div>
        </div>
      )}
    </Show>
  );
}
