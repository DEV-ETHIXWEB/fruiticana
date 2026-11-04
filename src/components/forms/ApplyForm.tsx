"use client";

import { AnimatePresence, motion } from "motion/react";
import { useActionState, useEffect, useState } from "react";
import { applyJob, type FormState } from "@/app/actions";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Icon3D } from "@/components/ui/Icon3D";
import { useI18n } from "@/i18n/I18nProvider";
import { track } from "@/lib/track";
import { ConsentNote } from "./ContactForm";
import { keepValues } from "./useKeepValues";

const input =
  "w-full rounded-2xl bg-cream px-4 py-3 text-[0.95rem] text-ink ring-1 ring-ink/10 outline-none transition-shadow placeholder:text-muted focus:ring-2 focus:ring-leaf aria-[invalid=true]:ring-chili";
const select = `${input} appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%237b7566%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:1.1rem] bg-[right_1rem_center] bg-no-repeat pr-10`;

function Field({ label, name, error, required, hint, children }: { label: string; name: string; error?: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  const { t } = useI18n();
  return (
    <div>
      <label htmlFor={name} className="flex items-baseline justify-between gap-3 text-sm font-medium text-ink">
        {label}
        <span className="text-xs font-normal text-muted">{hint ?? (required ? t.forms.required : t.forms.optional)}</span>
      </label>
      <div className="mt-1.5">{children}</div>
      <AnimatePresence>
        {error && (
          <motion.p id={`${name}-error`} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-1.5 text-sm text-chili-deep">
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Online job application: position (an open role or general), preferred store, résumé. */
export function ApplyForm({ positions, stores }: { positions: string[]; stores: string[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(applyJob, { status: "idle" });
  const { t, lang } = useI18n();
  const c = t.careers;
  const [startedAt] = useState(() => Date.now());
  const [fileName, setFileName] = useState("");
  // "Apply" on a listing links here with ?position=<title>: pre-select that role
  const [position, setPosition] = useState("");
  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get("position");
    if (wanted && positions.includes(wanted)) setPosition(wanted); // eslint-disable-line react-hooks/set-state-in-effect
  }, [positions]);
  const e = state.fieldErrors ?? {};
  useEffect(() => {
    if (state.status === "success") track("Job application");
  }, [state.status]);

  if (state.status === "success") {
    return (
      <motion.div role="status" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="grid place-items-center rounded-[var(--radius-card)] bg-leaf p-10 text-center text-white">
        <Icon3D name="check" className="size-20" />
        <p className="mt-6 font-display text-3xl">{c.sent}</p>
        <p className="mt-3 max-w-sm text-white/80">{state.message}</p>
      </motion.div>
    );
  }

  return (
    <form action={action} onSubmit={keepValues(action)} noValidate encType="multipart/form-data" className="space-y-4">
      <input type="hidden" name="_t" value={startedAt} />
      <input type="hidden" name="lang" value={lang} />
      <div aria-hidden className="absolute -left-[9999px]">
        <label htmlFor="apply_company_website">{t.forms.honeypot}</label>
        <input id="apply_company_website" name="company_website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.forms.name} name="apply-name" error={e.name} required>
          <input id="apply-name" name="name" autoComplete="name" required aria-invalid={Boolean(e.name)} aria-describedby={e.name ? "apply-name-error" : undefined} className={input} />
        </Field>
        <Field label={t.forms.email} name="apply-email" error={e.email} required>
          <input id="apply-email" name="email" type="email" autoComplete="email" required aria-invalid={Boolean(e.email)} aria-describedby={e.email ? "apply-email-error" : undefined} className={input} />
        </Field>
        <Field label={t.forms.phone} name="apply-phone" error={e.phone}>
          <input id="apply-phone" name="phone" type="tel" autoComplete="tel" aria-invalid={Boolean(e.phone)} className={input} />
        </Field>
        <Field label={c.position} name="apply-position" required>
          <select id="apply-position" name="position" value={position} onChange={(ev) => setPosition(ev.currentTarget.value)} className={select}>
            <option value="">{c.generalApplication}</option>
            {positions.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </Field>
        <Field label={c.preferredStore} name="apply-store">
          <select id="apply-store" name="store" defaultValue="" className={select}>
            <option value="">{c.anyStore}</option>
            {stores.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label={c.resume} name="apply-resume" error={e.resume} hint={c.resumeHint}>
          <label
            htmlFor="apply-resume"
            className={`flex cursor-pointer items-center gap-3 rounded-2xl bg-cream px-4 py-3 text-[0.95rem] ring-1 transition-shadow focus-within:ring-2 focus-within:ring-leaf ${e.resume ? "ring-chili" : "ring-ink/10"}`}
          >
            <Icon name="download" className="size-4 shrink-0 rotate-180 text-leaf" />
            <span className={`min-w-0 truncate ${fileName ? "text-ink" : "text-muted"}`}>{fileName || c.resume}</span>
            <input
              id="apply-resume"
              name="resume"
              type="file"
              required
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              aria-invalid={Boolean(e.resume)}
              aria-describedby={e.resume ? "apply-resume-error" : undefined}
              onChange={(ev) => setFileName(ev.currentTarget.files?.[0]?.name ?? "")}
              className="sr-only"
            />
          </label>
        </Field>
      </div>
      <Field label={c.aboutYou} name="apply-message">
        <textarea id="apply-message" name="message" rows={3} className={`${input} resize-y`} />
      </Field>
      <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          {state.status === "error" && (
            <p aria-live="polite" className="text-sm text-chili-deep">
              {state.message}
            </p>
          )}
          <ConsentNote />
        </div>
        <Button type="submit" variant="chili" disabled={pending} arrow className="shrink-0">
          {pending ? t.forms.sending : c.send}
        </Button>
      </div>
    </form>
  );
}
