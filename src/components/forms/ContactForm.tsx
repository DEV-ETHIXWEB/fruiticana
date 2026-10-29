"use client";

import { AnimatePresence, motion } from "motion/react";
import { useActionState, useState } from "react";
import { sendContact, type FormState } from "@/app/actions";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

const topics = ["General", "Store feedback", "Product request", "Careers", "Media & partnerships"] as const;

function Field({ label, name, error, required, children }: { label: string; name: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={name} className="flex items-baseline justify-between text-sm font-medium text-ink">
        {label}
        {required ? <span className="text-xs font-normal text-muted">Required</span> : <span className="text-xs font-normal text-muted">Optional</span>}
      </label>
      <div className="mt-2">{children}</div>
      <AnimatePresence>
        {error && (
          <motion.p id={`${name}-error`} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-1.5 text-sm text-chili">
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

const input =
  "w-full rounded-2xl bg-cream px-4 py-3.5 text-[0.95rem] text-ink ring-1 ring-ink/10 outline-none transition-shadow placeholder:text-muted focus:ring-2 focus:ring-leaf aria-[invalid=true]:ring-chili";

export function ContactForm({ stores }: { stores: string[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(sendContact, { status: "idle" });
  const [t] = useState(() => Date.now());
  const e = state.fieldErrors ?? {};

  if (state.status === "success") {
    return (
      <motion.div role="status" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="grid place-items-center rounded-[var(--radius-card)] bg-leaf p-12 text-center text-white">
        <span className="grid size-16 place-items-center rounded-full bg-turmeric text-forest">
          <Icon name="check" className="size-8" strokeWidth={2.4} />
        </span>
        <p className="mt-6 font-display text-3xl">Message sent</p>
        <p className="mt-3 max-w-sm text-white/80">{state.message}</p>
      </motion.div>
    );
  }

  return (
    <form action={action} noValidate className="space-y-5">
      <input type="hidden" name="_t" value={t} />
      <div aria-hidden className="absolute -left-[9999px]">
        <label htmlFor="company_website">Website</label>
        <input id="company_website" name="company_website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" name="name" error={e.name} required>
          <input id="name" name="name" autoComplete="name" required aria-invalid={Boolean(e.name)} aria-describedby={e.name ? "name-error" : undefined} className={input} />
        </Field>
        <Field label="Email" name="email" error={e.email} required>
          <input id="email" name="email" type="email" autoComplete="email" required aria-invalid={Boolean(e.email)} aria-describedby={e.email ? "email-error" : undefined} className={input} />
        </Field>
        <Field label="Phone" name="phone" error={e.phone}>
          <input id="phone" name="phone" type="tel" autoComplete="tel" aria-invalid={Boolean(e.phone)} className={input} />
        </Field>
        <Field label="Your store" name="store">
          <select id="store" name="store" defaultValue="" className={`${input} appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%237b7566%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:1.1rem] bg-[right_1rem_center] bg-no-repeat pr-10`}>
            <option value="">Not specific to a store</option>
            {stores.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
      </div>
      <fieldset>
        <legend className="text-sm font-medium text-ink">What’s it about?</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {topics.map((tp, i) => (
            <label key={tp} className="cursor-pointer">
              <input type="radio" name="topic" value={tp} defaultChecked={i === 0} className="peer sr-only" />
              <span className="inline-block rounded-full bg-cream px-4 py-2 text-sm text-ink-soft ring-1 ring-ink/10 transition peer-checked:bg-forest peer-checked:text-cream peer-checked:ring-forest peer-focus-visible:ring-2 peer-focus-visible:ring-chili">
                {tp}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <Field label="Comments, questions or suggestions" name="message" error={e.message} required>
        <textarea id="message" name="message" rows={6} required aria-invalid={Boolean(e.message)} aria-describedby={e.message ? "message-error" : undefined} className={`${input} resize-y`} />
      </Field>
      <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <p aria-live="polite" className={`text-sm ${state.status === "error" ? "text-chili" : "text-muted"}`}>
          {state.status === "error" ? state.message : "We reply from head office, usually within two business days."}
        </p>
        <Button type="submit" variant="chili" disabled={pending} arrow className="shrink-0">
          {pending ? "Sending…" : "Send message"}
        </Button>
      </div>
    </form>
  );
}
