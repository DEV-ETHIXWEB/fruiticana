"use server";

import { headers } from "next/headers";
import { createClient } from "next-sanity";
import { z } from "zod";
import { apiVersion, dataset, isSanityConfigured, projectId } from "@/sanity/env";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getSettings } from "@/lib/content";

export type FormState = { status: "idle" | "success" | "error"; message?: string; fieldErrors?: Record<string, string> };

/* ---------------------------------------------------------------- */
/* Delivery: Resend e-mail and/or a Sanity "submission" document.    */
/* With neither configured, production refuses rather than silently */
/* dropping a customer's message.                                    */
/* ---------------------------------------------------------------- */

const writeClient =
  isSanityConfigured && process.env.SANITY_API_WRITE_TOKEN
    ? createClient({ projectId, dataset, apiVersion, token: process.env.SANITY_API_WRITE_TOKEN, useCdn: false })
    : null;

/*
 * Newsletter sign-ups go to Fruiticana's existing Mailchimp audience, the same list the
 * current site's form posts to, so subscribers keep receiving the weekly specials.
 * Production uses it by default; MAILCHIMP_FORM_URL overrides it ("off" disables it).
 * Development never posts to the real list unless MAILCHIMP_FORM_URL is set explicitly.
 */
const MAILCHIMP_DEFAULT = "https://fruiticana.us14.list-manage.com/subscribe/post?u=3747eafc90754c0ebc3bcdbce&id=dacba6c26b";
const mailchimpUrl = () => {
  const env = process.env.MAILCHIMP_FORM_URL?.trim();
  if (env === "off") return null;
  return env || (process.env.NODE_ENV === "production" ? MAILCHIMP_DEFAULT : null);
};

async function subscribeMailchimp(formUrl: string, email: string, tag?: string) {
  // The embedded-form endpoint has a JSON(P) twin: /subscribe/post-json?...&EMAIL=...&c=<callback>
  const url = new URL(formUrl.replace("/subscribe/post?", "/subscribe/post-json?"));
  url.searchParams.set("EMAIL", email);
  // Mailchimp tag id (Audience > Tags), so a sign-up like the Rajan mango alert can be emailed on its own
  if (tag) url.searchParams.set("tags", tag);
  url.searchParams.set("c", "cb");
  const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000) });
  const body = await res.text();
  const json = JSON.parse(body.slice(body.indexOf("(") + 1, body.lastIndexOf(")"))) as { result: string; msg?: string };
  // Someone already on the list is a success from the shopper's point of view.
  if (json.result !== "success" && !/already subscribed/i.test(json.msg ?? "")) throw new Error(`Mailchimp: ${json.msg ?? json.result}`);
}

type Attachment = { filename: string; content: Buffer; type: string };

async function deliver(kind: "contact" | "newsletter" | "application", subject: string, fields: Record<string, string | undefined>, attachment?: Attachment) {
  const tasks: Promise<unknown>[] = [];
  // Job applications go to the hiring inbox when one is set (JOBS_TO_EMAIL), else to the usual one.
  const to = (kind === "application" && process.env.JOBS_TO_EMAIL) || process.env.CONTACT_TO_EMAIL;

  const mailchimp = kind === "newsletter" && fields.email ? mailchimpUrl() : null;
  const tag = fields.interest === "Rajan mango alert" ? process.env.MAILCHIMP_MANGO_TAG_ID?.trim() : undefined;
  if (mailchimp && fields.email) tasks.push(subscribeMailchimp(mailchimp, fields.email, tag));

  if (process.env.RESEND_API_KEY && to) {
    const text = Object.entries(fields)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");
    tasks.push(
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: process.env.CONTACT_FROM_EMAIL || "Fruiticana Website <web@fruiticana.com>",
          to: to.split(","),
          reply_to: fields.email,
          subject,
          text,
          ...(attachment && { attachments: [{ filename: attachment.filename, content: attachment.content.toString("base64") }] }),
        }),
      }).then((r) => {
        if (!r.ok) throw new Error(`Resend ${r.status}`);
      }),
    );
  }

  if (writeClient) {
    const client = writeClient;
    tasks.push(
      (async () => {
        // the résumé is kept as a private-by-obscurity file asset, linked from the submission
        const resumeUrl = attachment
          ? (await client.assets.upload("file", attachment.content, { filename: attachment.filename, contentType: attachment.type })).url
          : undefined;
        await client.create({ _type: "submission", kind, subject, ...fields, resumeUrl, submittedAt: new Date().toISOString() });
      })(),
    );
  }

  if (tasks.length === 0) {
    if (process.env.NODE_ENV === "production") throw new Error("No delivery channel configured");
    console.info(`[forms] (dev, not delivered) ${kind}:`, fields, attachment ? `+ ${attachment.filename} (${attachment.content.length} bytes)` : "");
    return;
  }
  await Promise.all(tasks);
}

/* Lightweight bot defence: honeypot + minimum fill time + per-IP throttle. */
const recent = new Map<string, number[]>();
async function isSpam(form: FormData) {
  if (String(form.get("company_website") ?? "").length > 0) return true;
  const started = Number(form.get("_t"));
  if (started && Date.now() - started < 1500) return true;
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  hits.push(now);
  recent.set(ip, hits);
  return hits.length > 6;
}

const flatten = (err: z.ZodError) =>
  Object.fromEntries(err.issues.map((i) => [String(i.path[0]), i.message])) as Record<string, string>;

/* ---------------------------------------------------------------- */

/** Messages in the visitor's language: each form posts a hidden "lang" field. */
const formLang = (form: FormData) => {
  const lang = String(form.get("lang") ?? "");
  return isLocale(lang) ? lang : "en";
};

const newsletterSchema = (t: ReturnType<typeof getDictionary>["forms"]) =>
  z.object({
    email: z.email({ message: t.invalidEmail }),
    region: z.string().optional(),
  });

export async function subscribe(_: FormState, form: FormData): Promise<FormState> {
  const lang = formLang(form);
  const t = getDictionary(lang).forms;
  const parsed = newsletterSchema(t).safeParse({ email: String(form.get("email") ?? "").trim(), region: form.get("region") || undefined });
  if (!parsed.success) return { status: "error", fieldErrors: flatten(parsed.error), message: t.invalidEmail };
  // only known interests are accepted (the field comes from the page)
  const mango = form.get("interest") === "rajan-mango-alert";
  const done = mango ? getDictionary(lang).pages.mangoAlertDone : t.subscribed;
  if (await isSpam(form)) return { status: "success", message: done };
  try {
    await deliver("newsletter", mango ? "Rajan mango alert sign-up" : "Newsletter sign-up", {
      email: parsed.data.email,
      region: parsed.data.region,
      interest: mango ? "Rajan mango alert" : undefined,
      language: lang === "pa" ? "Punjabi" : undefined,
    });
    return { status: "success", message: done };
  } catch (e) {
    console.error("[forms] newsletter", e);
    return { status: "error", message: t.subscribeFailed };
  }
}

/** Topic values stay in English: they head the email head office receives. Labels are translated in the form. */
const contactSchema = (t: ReturnType<typeof getDictionary>["forms"]) =>
  z.object({
    name: z.string().trim().min(2, t.nameRequired).max(120),
    email: z.email({ message: t.invalidEmail }),
    phone: z
      .string()
      .trim()
      .max(30)
      .regex(/^[\d\s()+.-]*$/, t.phoneDigits)
      .optional()
      .or(z.literal("")),
    store: z.string().max(120).optional(),
    topic: z.enum(["General", "Store feedback", "Product request", "Party & bulk orders", "Careers", "Media & partnerships"]),
    // party & bulk orders only
    eventDate: z.iso.date().optional().or(z.literal("")),
    guests: z.string().trim().regex(/^\d{0,5}$/, t.guestsInvalid).optional(),
    message: z.string().trim().min(10, t.messageTooShort).max(4000),
  });

export async function sendContact(_: FormState, form: FormData): Promise<FormState> {
  const lang = formLang(form);
  const t = getDictionary(lang).forms;
  const raw = Object.fromEntries(["name", "email", "phone", "store", "topic", "eventDate", "guests", "message"].map((k) => [k, String(form.get(k) ?? "")]));
  const parsed = contactSchema(t).safeParse(raw);
  if (!parsed.success) return { status: "error", fieldErrors: flatten(parsed.error), message: t.checkFields };
  if (await isSpam(form)) return { status: "success", message: t.onItsWay };
  try {
    const d = parsed.data;
    await deliver("contact", `[${d.topic}] Website message from ${d.name}`, {
      ...d,
      phone: d.phone || undefined,
      store: d.store || undefined,
      eventDate: d.topic === "Party & bulk orders" ? d.eventDate || undefined : undefined,
      guests: d.topic === "Party & bulk orders" ? d.guests || undefined : undefined,
      // tells head office to reply in Punjabi
      language: lang === "pa" ? "Punjabi" : undefined,
    });
    return { status: "success", message: t.contactSent };
  } catch (e) {
    console.error("[forms] contact", e);
    return { status: "error", message: t.contactFailed };
  }
}

/* ---------------------------------------------------------------- */
/* Job applications: details plus a résumé (PDF or Word, max 3 MB).  */
/* ---------------------------------------------------------------- */

const RESUME_MAX = 3 * 1024 * 1024;
const RESUME_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

const applySchema = (t: ReturnType<typeof getDictionary>["forms"]) =>
  z.object({
    name: z.string().trim().min(2, t.nameRequired).max(120),
    email: z.email({ message: t.invalidEmail }),
    phone: z
      .string()
      .trim()
      .max(30)
      .regex(/^[\d\s()+.-]*$/, t.phoneDigits)
      .optional()
      .or(z.literal("")),
    position: z.string().trim().max(160),
    store: z.string().max(120).optional(),
    message: z.string().trim().max(4000).optional(),
  });

export async function applyJob(_: FormState, form: FormData): Promise<FormState> {
  const lang = formLang(form);
  const dict = getDictionary(lang);
  const t = dict.forms;
  const c = dict.careers;
  const raw = Object.fromEntries(["name", "email", "phone", "position", "store", "message"].map((k) => [k, String(form.get(k) ?? "")]));
  const parsed = applySchema(t).safeParse(raw);
  const fieldErrors: Record<string, string> = parsed.success ? {} : flatten(parsed.error);

  // résumé: required, PDF or Word by extension and by content type, at most 3 MB
  const file = form.get("resume");
  const ext = file instanceof File ? file.name.split(".").pop()?.toLowerCase() ?? "" : "";
  if (!(file instanceof File) || file.size === 0) fieldErrors.resume = c.resumeRequired;
  else if (!RESUME_TYPES[ext] || (file.type && !Object.values(RESUME_TYPES).includes(file.type))) fieldErrors.resume = c.resumeType;
  else if (file.size > RESUME_MAX) fieldErrors.resume = c.resumeSize;

  if (!parsed.success || Object.keys(fieldErrors).length) return { status: "error", fieldErrors, message: t.checkFields };
  if (await isSpam(form)) return { status: "success", message: c.sentBody };
  try {
    const d = parsed.data;
    const resume = file as File;
    // a safe file name for the inbox: "Firstname-Lastname-resume.pdf"
    const filename = `${d.name.replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "") || "applicant"}-resume.${ext}`;
    await deliver(
      "application",
      `[Careers] ${d.position || "General application"} from ${d.name}`,
      {
        name: d.name,
        email: d.email,
        phone: d.phone || undefined,
        position: d.position || "General application",
        store: d.store || undefined,
        message: d.message || undefined,
        language: lang === "pa" ? "Punjabi" : undefined,
      },
      { filename, content: Buffer.from(await resume.arrayBuffer()), type: RESUME_TYPES[ext] },
    );
    return { status: "success", message: c.sentBody };
  } catch (e) {
    console.error("[forms] application", e);
    const jobsEmail = (await getSettings().catch(() => null))?.jobsEmail || "jobs@fruiticana.com";
    return { status: "error", message: c.failed(jobsEmail) };
  }
}
