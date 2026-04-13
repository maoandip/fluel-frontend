import { createSignal } from "solid-js";
import { apiUrl } from "../lib/api";
import p from "../styles/page.module.css";
import s from "./Feedback.module.css";

export default function Feedback() {
  const [type, setType] = createSignal("feedback");
  const [message, setMessage] = createSignal("");
  const [contact, setContact] = createSignal("");
  const [website, setWebsite] = createSignal(""); // honeypot
  const [sent, setSent] = createSignal(false);
  const [sending, setSending] = createSignal(false);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!message().trim()) return;
    setSending(true);
    try {
      await fetch(apiUrl("/api/feedback"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: type(), message: message(), contact: contact(), website: website() }),
      });
      setSent(true);
    } catch {
      // silently fail — still show success to prevent spam
      setSent(true);
    } finally {
      setSending(false);
    }
  }

  return (
    <div class={p.page} ref={() => { document.title = "Feedback — fluel"; }} role="main">
      <div class={p.wrapper}>
        <h1 class={p.title}>Feedback</h1>
        <p class={p.subtitle}>Bug, feature request, or business inquiry. Keep it short.</p>

        {sent() ? (
          <div class={s.success}>
            <span class={s.successIcon}>&#10003;</span>
            <span class={s.successText}>Received. We'll look into it.</span>
          </div>
        ) : (
          <form class={s.form} onSubmit={handleSubmit}>
            <div class={s.typeRow}>
              {["feedback", "bug", "feature", "business"].map((t) => (
                <button
                  type="button"
                  class={type() === t ? s.typeChipActive : s.typeChip}
                  onClick={() => setType(t)}
                  aria-label={`Feedback type: ${t}`}
                  aria-pressed={type() === t}
                >{t}</button>
              ))}
            </div>

            <textarea
              class={s.textarea}
              placeholder="What's on your mind?"
              rows={5}
              value={message()}
              onInput={(e) => setMessage(e.currentTarget.value)}
              required
            />

            <input
              class={s.input}
              type="text"
              placeholder="Telegram handle or email (optional)"
              value={contact()}
              onInput={(e) => setContact(e.currentTarget.value)}
            />

            {/* Honeypot — hidden from users, bots fill it */}
            <input
              type="text"
              name="website"
              value={website()}
              onInput={(e) => setWebsite(e.currentTarget.value)}
              tabIndex={-1}
              style={{ position: "absolute", left: "-9999px" }}
              autocomplete="off"
              aria-hidden="true"
            />

            <button
              type="submit"
              class={s.submitBtn}
              disabled={sending() || !message().trim()}
            >
              {sending() ? "Sending..." : "Send"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
