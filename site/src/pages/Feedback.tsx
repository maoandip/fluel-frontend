import { createSignal, Show, For } from "solid-js";
import { apiUrl } from "../lib/api";
import p from "../styles/page.module.css";
import s from "./Feedback.module.css";
import { BETA_MODE } from "../config/flags";

export default function Feedback() {
  const [type, setType] = createSignal(BETA_MODE ? "waitlist" : "feedback");
  const [message, setMessage] = createSignal("");
  const [contact, setContact] = createSignal("");
  const [website, setWebsite] = createSignal(""); // honeypot
  const [sent, setSent] = createSignal(false);
  const [sending, setSending] = createSignal(false);

  const canSubmit = () => {
    if (sending()) return false;
    if (BETA_MODE) return contact().trim().length > 0;
    return message().trim().length > 0;
  };

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!canSubmit()) return;
    setSending(true);
    // In beta mode, submit a waitlist-tagged payload. If the backend doesn't
    // yet recognize type=waitlist it will still receive a feedback-shaped
    // message with a "[Waitlist signup]" prefix so it's easy to triage.
    const submission = BETA_MODE
      ? {
          type: "waitlist",
          message: `[Waitlist signup] ${message().trim() || "(no note)"}`,
          contact: contact(),
          website: website(),
        }
      : { type: type(), message: message(), contact: contact(), website: website() };
    try {
      await fetch(apiUrl("/api/feedback"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
      });
      setSent(true);
    } catch {
      // silently fail — still show success to prevent spam
      setSent(true);
    } finally {
      setSending(false);
    }
  }

  const title = BETA_MODE ? "Join the waitlist" : "Feedback";
  const subtitle = BETA_MODE
    ? "fluel is in closed beta while we finish testing. Drop your Telegram handle or email and we'll let you know the moment we open the doors."
    : "Bug, feature request, or business inquiry. Keep it short.";
  const submitLabel = BETA_MODE ? "Join waitlist" : "Send";
  const sendingLabel = BETA_MODE ? "Joining..." : "Sending...";
  const successText = BETA_MODE
    ? "You're on the list. We'll reach out when fluel goes public."
    : "Received. We'll look into it.";

  return (
    <div class={p.page} ref={() => { document.title = `${title} — fluel`; }} role="main">
      <div class={p.wrapper}>
        <h1 class={p.title}>{title}</h1>
        <p class={p.subtitle}>{subtitle}</p>

        {sent() ? (
          <div class={s.success}>
            <span class={s.successIcon}>&#10003;</span>
            <span class={s.successText}>{successText}</span>
          </div>
        ) : (
          <form class={s.form} onSubmit={handleSubmit}>
            <Show when={!BETA_MODE}>
              <div class={s.typeRow}>
                <For each={["feedback", "bug", "feature", "business"]}>
                  {(t) => (
                    <button
                      type="button"
                      class={type() === t ? s.typeChipActive : s.typeChip}
                      onClick={() => setType(t)}
                      aria-label={`Feedback type: ${t}`}
                      aria-pressed={type() === t}
                    >{t}</button>
                  )}
                </For>
              </div>
            </Show>

            <input
              class={s.input}
              type="text"
              placeholder={BETA_MODE ? "Telegram handle or email" : "Telegram handle or email (optional)"}
              value={contact()}
              onInput={(e) => setContact(e.currentTarget.value)}
              required={BETA_MODE}
            />

            <textarea
              class={s.textarea}
              placeholder={BETA_MODE ? "Anything we should know? (optional)" : "What's on your mind?"}
              rows={BETA_MODE ? 3 : 5}
              value={message()}
              onInput={(e) => setMessage(e.currentTarget.value)}
              required={!BETA_MODE}
            />

            {/* Honeypot — hidden from users, bots fill it */}
            <input
              type="text"
              name="website"
              value={website()}
              onInput={(e) => setWebsite(e.currentTarget.value)}
              tabIndex={-1}
              class={s.honeypot}
              autocomplete="off"
              aria-hidden="true"
            />

            <button
              type="submit"
              class={s.submitBtn}
              disabled={!canSubmit()}
            >
              {sending() ? sendingLabel : submitLabel}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
