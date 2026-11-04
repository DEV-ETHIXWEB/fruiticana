import { defineArrayMember, defineField, defineType } from "sanity";

const regionOptions = [
  { title: "Greater Vancouver & BC", value: "greater-vancouver" },
  { title: "Calgary", value: "calgary" },
  { title: "Chestermere", value: "chestermere" },
  { title: "Edmonton", value: "edmonton" },
];

const imageWithAlt = (name: string, title: string, required = false) =>
  defineField({
    name,
    title,
    type: "image",
    options: { hotspot: true },
    fields: [defineField({ name: "alt", title: "Alt text", type: "string", validation: (r) => r.required().warning("Describe the image for screen readers and Google Images") })],
    validation: required ? (r) => r.required() : undefined,
  });

const richTextField = (name: string, title: string) => defineField({
  name,
  title,
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Paragraph", value: "normal" },
        { title: "Heading", value: "h2" },
        { title: "Sub-heading", value: "h3" },
        { title: "Quote", value: "blockquote" },
      ],
      marks: {
        annotations: [
          { name: "link", type: "object", title: "Link", fields: [{ name: "href", type: "url", title: "URL", validation: (r) => r.uri({ scheme: ["http", "https", "mailto", "tel"], allowRelative: true }) }] },
        ],
      },
    }),
    defineArrayMember({ type: "image", options: { hotspot: true }, fields: [{ name: "alt", type: "string", title: "Alt text" }] }),
  ],
});
const richText = richTextField("body", "Body");


/*
 * Punjabi (ਪੰਜਾਬੀ) version of a document's text, on its own tab. Every field is optional:
 * a blank field shows the bundled Punjabi translation while the English is unchanged, and
 * the English text once the English has been edited (so readers never get an outdated
 * translation). Store names, addresses and phone numbers are not translated.
 */
const punjabiGroup = { name: "punjabi", title: "Punjabi (ਪੰਜਾਬੀ)" };
const punjabi = (fields: ReturnType<typeof defineField>[]) =>
  defineField({
    name: "pa",
    title: "Punjabi (ਪੰਜਾਬੀ)",
    description: "Leave a field blank to use the bundled translation, or English if the English has changed. See src/i18n/GLOSSARY.md for wording conventions.",
    type: "object",
    group: "punjabi",
    options: { collapsible: false },
    fields,
  });
const paString = (name: string, title: string) => defineField({ name, title, type: "string" });
const paText = (name: string, title: string, rows = 3) => defineField({ name, title, type: "text", rows });

const seo = [
  defineField({ name: "seoTitle", title: "SEO title", type: "string", group: "seo", validation: (r) => r.max(65).warning("Google truncates titles past ~60 characters") }),
  defineField({ name: "seoDescription", title: "SEO description", type: "text", rows: 3, group: "seo", validation: (r) => r.max(160).warning("Keep under 160 characters") }),
];

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  groups: [punjabiGroup],
  fields: [
    defineField({ name: "tagline", type: "string", initialValue: "Fruiticana Hee Jaana!" }),
    defineField({ name: "phone", type: "string" }),
    defineField({ name: "email", type: "string" }),
    defineField({ name: "jobsEmail", title: "Careers email", type: "string" }),
    defineField({ name: "mission", title: "Mission statement", type: "text", rows: 3 }),
    defineField({ name: "companySummary", title: "Company summary", type: "text", rows: 3 }),
    defineField({ name: "presidentQuote", title: "President’s message", type: "text", rows: 3 }),
    defineField({ name: "presidentName", type: "string" }),
    defineField({
      name: "announcement",
      title: "Announcement bar",
      description: "Optional strip above the header, e.g. “Now open: South Surrey”.",
      type: "object",
      fields: [defineField({ name: "text", type: "string" }), defineField({ name: "href", title: "Link", type: "string" })],
    }),
    defineField({ name: "whatsappUrl", title: "WhatsApp channel link", description: "Weekly deals channel, e.g. https://whatsapp.com/channel/... Shown in the footer and on the flyers page once filled in.", type: "url" }),
    defineField({
      name: "deliveryLinks",
      title: "Delivery services",
      description: "Where customers can order Fruiticana online (Instacart, Uber Eats, DoorDash...). Shown on the flyers page once filled in.",
      type: "array",
      of: [defineArrayMember({ type: "object", fields: [defineField({ name: "label", title: "Service name", type: "string", validation: (r) => r.required() }), defineField({ name: "href", title: "Link to Fruiticana on the service", type: "url", validation: (r) => r.required() })] })],
    }),
    defineField({
      name: "socials",
      type: "array",
      of: [defineArrayMember({ type: "object", fields: [defineField({ name: "label", type: "string" }), defineField({ name: "href", type: "url" })] })],
    }),
    punjabi([
      paString("tagline", "Tagline"),
      paText("mission", "Mission statement"),
      paText("companySummary", "Company summary"),
      paText("presidentQuote", "President’s message"),
      paString("presidentName", "President’s name (in Gurmukhi)"),
      paString("announcementText", "Announcement bar text"),
    ]),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});

export const store = defineType({
  name: "store",
  title: "Store",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", type: "slug", options: { source: "name" }, validation: (r) => r.required() }),
    defineField({ name: "city", title: "City group", description: "Used for the locator filter, e.g. “Surrey”.", type: "string", validation: (r) => r.required() }),
    defineField({ name: "street", type: "string", validation: (r) => r.required() }),
    defineField({ name: "locality", title: "Municipality", type: "string", validation: (r) => r.required() }),
    defineField({ name: "province", type: "string", options: { list: ["BC", "AB"], layout: "radio" }, validation: (r) => r.required() }),
    defineField({ name: "postalCode", type: "string" }),
    defineField({ name: "phone", type: "string", validation: (r) => r.required() }),
    defineField({ name: "location", type: "geopoint", validation: (r) => r.required() }),
    defineField({ name: "opens", title: "Opens (24h, HH:MM)", type: "string", initialValue: "09:00", validation: (r) => r.regex(/^\d{2}:\d{2}$/) }),
    defineField({ name: "closes", title: "Closes (24h, HH:MM)", type: "string", initialValue: "21:00", validation: (r) => r.regex(/^\d{2}:\d{2}$/) }),
    defineField({ name: "flyerRegion", type: "string", options: { list: regionOptions }, validation: (r) => r.required() }),
    defineField({ name: "isHeadOffice", type: "boolean", initialValue: false }),
  ],
  orderings: [{ title: "City", name: "city", by: [{ field: "city", direction: "asc" }, { field: "name", direction: "asc" }] }],
  preview: { select: { title: "name", subtitle: "street" } },
});

export const flyer = defineType({
  name: "flyer",
  title: "Weekly flyer",
  type: "document",
  groups: [punjabiGroup],
  fields: [
    defineField({ name: "region", type: "string", options: { list: regionOptions, layout: "radio" }, validation: (r) => r.required() }),
    defineField({ name: "label", type: "string", validation: (r) => r.required() }),
    imageWithAlt("image", "Flyer image", true),
    defineField({ name: "validFrom", type: "date" }),
    defineField({ name: "validTo", type: "date" }),
    punjabi([paString("label", "Label"), paString("imageAlt", "Flyer image description (alt text)")]),
  ],
  preview: { select: { title: "label", subtitle: "validFrom", media: "image" } },
});

export const campaign = defineType({
  name: "campaign",
  title: "Campaign banner",
  type: "document",
  groups: [punjabiGroup],
  fields: [
    defineField({ name: "label", type: "string", validation: (r) => r.required() }),
    imageWithAlt("image", "Banner image (≈1800×520)", true),
    defineField({ name: "href", title: "Link", type: "string" }),
    defineField({ name: "order", type: "number", initialValue: 10 }),
    defineField({ name: "active", type: "boolean", initialValue: true }),
    punjabi([paString("label", "Label"), paString("imageAlt", "Banner image description (alt text)")]),
  ],
  orderings: [{ title: "Order", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "label", media: "image", active: "active" }, prepare: ({ title, media, active }) => ({ title, media, subtitle: active ? "Live" : "Hidden" }) },
});

export const video = defineType({
  name: "video",
  title: "Commercial",
  type: "document",
  groups: [punjabiGroup],
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "youtubeId", title: "YouTube ID", type: "string", validation: (r) => r.required().regex(/^[\w-]{11}$/) }),
    defineField({ name: "caption", type: "text", rows: 2 }),
    imageWithAlt("poster", "Poster image"),
    defineField({ name: "order", type: "number", initialValue: 10 }),
    punjabi([paString("title", "Title"), paText("caption", "Caption", 2), paString("posterAlt", "Poster description (alt text)")]),
  ],
});

export const post = defineType({
  name: "post",
  title: "Community post",
  type: "document",
  groups: [{ name: "content", title: "English", default: true }, punjabiGroup, { name: "seo", title: "SEO" }],
  fields: [
    defineField({ name: "title", type: "string", group: "content", validation: (r) => r.required() }),
    defineField({ name: "slug", type: "slug", group: "content", options: { source: "title" }, validation: (r) => r.required() }),
    defineField({ name: "date", type: "date", group: "content", validation: (r) => r.required() }),
    defineField({ name: "category", type: "string", group: "content", initialValue: "Philanthropic Initiatives" }),
    defineField({ name: "excerpt", type: "text", rows: 3, group: "content" }),
    { ...imageWithAlt("image", "Cover image"), group: "content" },
    { ...richText, group: "content" },
    ...seo,
    punjabi([
      paString("title", "Title"),
      paString("category", "Category"),
      paText("excerpt", "Excerpt"),
      paString("imageAlt", "Cover image description (alt text)"),
      richTextField("body", "Body"),
      paString("seoTitle", "SEO title"),
      paText("seoDescription", "SEO description"),
    ]),
  ],
  orderings: [{ title: "Newest", name: "date", by: [{ field: "date", direction: "desc" }] }],
});

export const event = defineType({
  name: "event",
  title: "Event",
  type: "document",
  groups: [punjabiGroup],
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "start", type: "datetime", validation: (r) => r.required() }),
    defineField({ name: "end", type: "datetime" }),
    defineField({ name: "location", type: "string" }),
    defineField({ name: "description", type: "text", rows: 4 }),
    punjabi([paString("title", "Title"), paString("location", "Location"), paText("description", "Description", 4)]),
  ],
  orderings: [{ title: "Upcoming", name: "start", by: [{ field: "start", direction: "asc" }] }],
});

export const page = defineType({
  name: "page",
  title: "Page",
  type: "document",
  groups: [{ name: "content", title: "English", default: true }, punjabiGroup, { name: "seo", title: "SEO" }],
  fields: [
    defineField({ name: "title", type: "string", group: "content", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      group: "content",
      description: "Matches the URL, e.g. our-company, indican, farm-to-table. Keep legacy slugs to preserve search rankings.",
      validation: (r) => r.required(),
    }),
    defineField({ name: "eyebrow", type: "string", group: "content" }),
    defineField({ name: "intro", type: "text", rows: 3, group: "content" }),
    { ...imageWithAlt("heroImage", "Hero image"), group: "content" },
    { ...richText, group: "content" },
    ...seo,
    punjabi([
      paString("title", "Title"),
      paString("eyebrow", "Eyebrow"),
      paText("intro", "Intro"),
      paString("heroAlt", "Hero image description (alt text)"),
      richTextField("body", "Body"),
      paString("seoTitle", "SEO title"),
      paText("seoDescription", "SEO description"),
    ]),
  ],
  preview: { select: { title: "title", subtitle: "slug.current" } },
});

export const job = defineType({
  name: "job",
  title: "Job opening",
  type: "document",
  groups: [punjabiGroup],
  fields: [
    defineField({ name: "title", title: "Position", type: "string", validation: (r) => r.required() }),
    defineField({ name: "store", title: "Store", description: "Leave blank for head office or several stores.", type: "string" }),
    defineField({
      name: "type",
      title: "Type",
      type: "string",
      options: { list: [{ title: "Full-time", value: "full-time" }, { title: "Part-time", value: "part-time" }, { title: "Seasonal", value: "seasonal" }], layout: "radio" },
      initialValue: "part-time",
      validation: (r) => r.required(),
    }),
    defineField({ name: "description", title: "What the job involves", type: "text", rows: 5, validation: (r) => r.required() }),
    defineField({ name: "posted", title: "Posted on", type: "date", initialValue: () => new Date().toISOString().slice(0, 10), validation: (r) => r.required() }),
    defineField({ name: "active", title: "Show on the website", type: "boolean", initialValue: true }),
    punjabi([paString("title", "Position"), paText("description", "What the job involves", 5)]),
  ],
  orderings: [{ title: "Newest", name: "posted", by: [{ field: "posted", direction: "desc" }] }],
  preview: { select: { title: "title", subtitle: "store", active: "active" }, prepare: ({ title, subtitle, active }) => ({ title, subtitle: `${subtitle || "Any store"}${active === false ? " · hidden" : ""}` }) },
});

export const submission = defineType({
  name: "submission",
  title: "Form submission",
  type: "document",
  readOnly: true,
  fields: [
    ...["kind", "subject", "name", "email", "phone", "store", "topic", "region", "eventDate", "guests", "position", "interest", "language", "resumeUrl", "submittedAt"].map((name) => defineField({ name, type: "string" as const })),
    defineField({ name: "message", type: "text" }),
  ],
  orderings: [{ title: "Newest", name: "submittedAt", by: [{ field: "submittedAt", direction: "desc" }] }],
  preview: { select: { title: "subject", subtitle: "email" } },
});

export const schemaTypes = [siteSettings, store, flyer, campaign, video, post, event, page, job, submission];
