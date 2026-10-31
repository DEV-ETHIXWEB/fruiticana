"use server";

import { headers } from "next/headers";
import { createClient } from "next-sanity";
import { z } from "zod";
import { apiVersion, dataset, isSanityConfigured, projectId } from "@/sanity/env";

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

async function subscribeMailchimp(formUrl: string, email: string) {
  // The embedded-form endpoint has a JSON(P) twin: /subscribe/post-json?...&EMAIL=...&c=<callback>
  const url = new URL(formUrl.replace("/subscribe/post?", "/subscribe/post-json?"));
  url.searchParams.set("EMAIL", email);
  url.searchParams.set("c", "cb");
  const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000) });
  const body = await res.text();
  const json = JSON.parse(body.slice(body.indexOf("(") + 1, body.lastIndexOf(")"))) as { result: string; msg?: string };
  // Someone already on the list is a success from the shopper's point of view.
  if (json.result !== "success" && !/already subscribed/i.test(json.msg ?? "")) throw new Error(`Mailchimp: ${json.msg ?? json.result}`);
}

async function deliver(kind: "contact" | "newsletter", subject: string, fields: Record<string, string | undefined>) {
  const tasks: Promise<unknown>[] = [];

  const mailchimp = kind === "newsletter" && fields.email ? mailchimpUrl() : null;
  if (mailchimp && fields.email) tasks.push(subscribeMailchimp(mailchimp, fields.email));

  if (process.env.RESEND_API_KEY && process.env.CONTACT_TO_EMAIL) {
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
          to: process.env.CONTACT_TO_EMAIL.split(","),
          reply_to: fields.email,
          subject,
          text,
        }),
      }).then((r) => {
        if (!r.ok) throw new Error(`Resend ${r.status}`);
      }),
    );
  }

  if (writeClient) {
    tasks.push(writeClient.create({ _type: "submission", kind, subject, ...fields, submittedAt: new Date().toISOString() }));
  }

  if (tasks.length === 0) {
    if (process.env.NODE_ENV === "production") throw new Error("No delivery channel configured");
    console.info(`[forms] (dev, not delivered) ${kind}:`, fields);
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

const newsletterSchema = z.object({
  email: z.email({ message: "Please enter a valid email address." }),
  region: z.string().optional(),
});

export async function subscribe(_: FormState, form: FormData): Promise<FormState> {
  const parsed = newsletterSchema.safeParse({ email: String(form.get("email") ?? "").trim(), region: form.get("region") || undefined });
  if (!parsed.success) return { status: "error", fieldErrors: flatten(parsed.error), message: "Please enter a valid email address." };
  if (await isSpam(form)) return { status: "success", message: "You’re on the list." };
  try {
    await deliver("newsletter", "Newsletter sign-up", { email: parsed.data.email, region: parsed.data.region });
    return { status: "success", message: "You’re on the list. Weekly specials will land in your inbox." };
  } catch (e) {
    console.error("[forms] newsletter", e);
    return { status: "error", message: "We couldn’t sign you up just now. Please try again in a moment." };
  }
}

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please tell us your name.").max(120),
  email: z.email({ message: "Please enter a valid email address." }),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[\d\s()+.-]*$/, "Numbers only, please.")
    .optional()
    .or(z.literal("")),
  store: z.string().max(120).optional(),
  topic: z.enum(["General", "Store feedback", "Product request", "Careers", "Media & partnerships"]),
  message: z.string().trim().min(10, "A little more detail helps us help you.").max(4000),
});

export async function sendContact(_: FormState, form: FormData): Promise<FormState> {
  const raw = Object.fromEntries(["name", "email", "phone", "store", "topic", "message"].map((k) => [k, String(form.get(k) ?? "")]));
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) return { status: "error", fieldErrors: flatten(parsed.error), message: "Please check the highlighted fields." };
  if (await isSpam(form)) return { status: "success", message: "Thanks, your message is on its way." };
  try {
    const d = parsed.data;
    await deliver("contact", `[${d.topic}] Website message from ${d.name}`, { ...d, phone: d.phone || undefined, store: d.store || undefined });
    return { status: "success", message: "Thank you. Your message is with our head office team. We’ll be in touch soon." };
  } catch (e) {
    console.error("[forms] contact", e);
    return { status: "error", message: "Something went wrong sending your message. Please email info@fruiticana.com or call 604-502-0005." };
  }
}
