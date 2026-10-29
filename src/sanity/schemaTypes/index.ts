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

const richText = defineField({
  name: "body",
  title: "Body",
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

const seo = [
  defineField({ name: "seoTitle", title: "SEO title", type: "string", group: "seo", validation: (r) => r.max(65).warning("Google truncates titles past ~60 characters") }),
  defineField({ name: "seoDescription", title: "SEO description", type: "text", rows: 3, group: "seo", validation: (r) => r.max(160).warning("Keep under 160 characters") }),
];

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
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
    defineField({
      name: "socials",
      type: "array",
      of: [defineArrayMember({ type: "object", fields: [defineField({ name: "label", type: "string" }), defineField({ name: "href", type: "url" })] })],
    }),
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
  fields: [
    defineField({ name: "region", type: "string", options: { list: regionOptions, layout: "radio" }, validation: (r) => r.required() }),
    defineField({ name: "label", type: "string", validation: (r) => r.required() }),
    imageWithAlt("image", "Flyer image", true),
    defineField({ name: "validFrom", type: "date" }),
    defineField({ name: "validTo", type: "date" }),
  ],
  preview: { select: { title: "label", subtitle: "validFrom", media: "image" } },
});

export const campaign = defineType({
  name: "campaign",
  title: "Campaign banner",
  type: "document",
  fields: [
    defineField({ name: "label", type: "string", validation: (r) => r.required() }),
    imageWithAlt("image", "Banner image (≈1800×520)", true),
    defineField({ name: "href", title: "Link", type: "string" }),
    defineField({ name: "order", type: "number", initialValue: 10 }),
    defineField({ name: "active", type: "boolean", initialValue: true }),
  ],
  orderings: [{ title: "Order", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "label", media: "image", active: "active" }, prepare: ({ title, media, active }) => ({ title, media, subtitle: active ? "Live" : "Hidden" }) },
});

export const video = defineType({
  name: "video",
  title: "Commercial",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "youtubeId", title: "YouTube ID", type: "string", validation: (r) => r.required().regex(/^[\w-]{11}$/) }),
    defineField({ name: "caption", type: "text", rows: 2 }),
    imageWithAlt("poster", "Poster image"),
    defineField({ name: "order", type: "number", initialValue: 10 }),
  ],
});

export const post = defineType({
  name: "post",
  title: "Community post",
  type: "document",
  groups: [{ name: "content", default: true }, { name: "seo", title: "SEO" }],
  fields: [
    defineField({ name: "title", type: "string", group: "content", validation: (r) => r.required() }),
    defineField({ name: "slug", type: "slug", group: "content", options: { source: "title" }, validation: (r) => r.required() }),
    defineField({ name: "date", type: "date", group: "content", validation: (r) => r.required() }),
    defineField({ name: "category", type: "string", group: "content", initialValue: "Philanthropic Initiatives" }),
    defineField({ name: "excerpt", type: "text", rows: 3, group: "content" }),
    { ...imageWithAlt("image", "Cover image"), group: "content" },
    { ...richText, group: "content" },
    ...seo,
  ],
  orderings: [{ title: "Newest", name: "date", by: [{ field: "date", direction: "desc" }] }],
});

export const event = defineType({
  name: "event",
  title: "Event",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "start", type: "datetime", validation: (r) => r.required() }),
    defineField({ name: "end", type: "datetime" }),
    defineField({ name: "location", type: "string" }),
    defineField({ name: "description", type: "text", rows: 4 }),
  ],
  orderings: [{ title: "Upcoming", name: "start", by: [{ field: "start", direction: "asc" }] }],
});

export const page = defineType({
  name: "page",
  title: "Page",
  type: "document",
  groups: [{ name: "content", default: true }, { name: "seo", title: "SEO" }],
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
  ],
  preview: { select: { title: "title", subtitle: "slug.current" } },
});

export const submission = defineType({
  name: "submission",
  title: "Form submission",
  type: "document",
  readOnly: true,
  fields: [
    ...["kind", "subject", "name", "email", "phone", "store", "topic", "region", "submittedAt"].map((name) => defineField({ name, type: "string" as const })),
    defineField({ name: "message", type: "text" }),
  ],
  orderings: [{ title: "Newest", name: "submittedAt", by: [{ field: "submittedAt", direction: "desc" }] }],
  preview: { select: { title: "subject", subtitle: "email" } },
});

export const schemaTypes = [siteSettings, store, flyer, campaign, video, post, event, page, submission];
