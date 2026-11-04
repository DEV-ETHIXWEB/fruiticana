"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { AnimatePresence, motion } from "motion/react";
import { useActionState, useEffect, useState } from "react";
import { track } from "@/lib/track";
import { keepValues } from "./useKeepValues";
import { subscribe, type FormState } from "@/app/actions";
import { Icon } from "@/components/ui/Icon";

/** `interest` marks a special list (e.g. "rajan-mango-alert"); the server accepts known values only. */
export function NewsletterForm({ tone = "dark", compact = false, stacked = false, interest, button, note, noteClass }: { tone?: "dark" | "light"; compact?: boolean; stacked?: boolean; interest?: string; button?: string; note?: string; noteClass?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(subscribe, { status: "idle" });
  const { t, lang } = useI18n();
  const [startedAt] = useState(() => Date.now());
  const dark = tone === "dark";
  const id = `${tone}${interest ? `-${interest}` : ""}`;
  useEffect(() => {
    if (state.status === "success") track(interest ? "Alert sign-up" : "Newsletter sign-up", interest ? { list: interest } : {});
  }, [state.status, interest]);

  return (
    <div className="relative">
      <AnimatePresence mode="wait" initial={false}>
        {state.status === "success" ? (
          <motion.p
            key="ok"
            role="status"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-3 rounded-full px-5 py-4 text-[0.95rem] font-medium ${dark ? "bg-cream/10 text-cream" : "bg-leaf/10 text-forest"}`}
          >
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-turmeric text-forest">
              <Icon name="check" className="size-4" strokeWidth={2.4} />
            </span>
            {state.message}
          </motion.p>
        ) : (
          <motion.form key="form" action={action} onSubmit={keepValues(action)} exit={{ opacity: 0, y: -8 }} noValidate>
            <input type="hidden" name="_t" value={startedAt} />
            <input type="hidden" name="lang" value={lang} />
            {interest && <input type="hidden" name="interest" value={interest} />}
            <label className="sr-only" htmlFor={`company_website-${id}`}>
              {t.forms.leaveEmpty}
            </label>
            <input id={`company_website-${id}`} name="company_website" tabIndex={-1} autoComplete="off" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
            <div
              className={`flex ${stacked ? "flex-col items-stretch rounded-3xl" : "items-center rounded-full"} gap-1.5 p-1.5 ring-1 transition-shadow focus-within:ring-2 ${
                dark ? "bg-cream/[0.07] ring-cream/20 focus-within:ring-turmeric" : "bg-white ring-ink/10 focus-within:ring-leaf"
              } ${state.fieldErrors?.email ? (dark ? "ring-chili" : "ring-chili") : ""}`}
            >
              <label htmlFor={`nl-email-${id}`} className="sr-only">
                {t.forms.emailAddress}
              </label>
              <input
                id={`nl-email-${id}`}
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder={t.forms.emailPlaceholder}
                aria-invalid={Boolean(state.fieldErrors?.email)}
                aria-describedby={`nl-msg-${id}`}
                className={`min-w-0 flex-1 bg-transparent ${compact ? "px-3.5 py-2 text-[0.9rem]" : "px-4 py-2.5 text-[0.95rem]"} outline-none ${dark ? "text-cream placeholder:text-cream/45" : "text-ink placeholder:text-muted"}`}
              />
              <button
                type="submit"
                disabled={pending}
                className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-full btn-3d btn-chili bg-chili ${compact ? "px-4 py-2.5" : "px-5 py-3"} text-sm font-semibold text-white hover:bg-chili-deep disabled:opacity-70`}
              >
                {pending ? <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : (button ?? t.forms.subscribe)}
              </button>
            </div>
            <p id={`nl-msg-${id}`} aria-live="polite" className={`mt-2.5 px-5 text-[0.8rem] ${compact && state.status !== "error" ? "sr-only" : "min-h-5"} ${state.status === "error" ? (dark ? "text-[#ff8a80]" : "text-chili-deep") : (noteClass ?? (dark ? "text-cream/65" : "text-muted"))}`}>
              {state.status === "error" ? state.message : (note ?? t.forms.newsletterNote)}
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
