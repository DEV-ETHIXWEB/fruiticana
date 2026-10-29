import type { PortableTextBlock } from "@portabletext/types";

let n = 0;
const key = () => `k${(n++).toString(36)}`;

type Inline = string | { text: string; marks?: string[]; href?: string };

/**
 * Tiny Portable Text builder so seed copy and Sanity copy share one
 * render path. `p("Hello ", {text: "world", marks: ["strong"]})`.
 */
function block(style: string, parts: Inline[], listItem?: "bullet" | "number"): PortableTextBlock {
  const markDefs: { _key: string; _type: "link"; href: string }[] = [];
  const children = parts.map((part) => {
    if (typeof part === "string") return { _type: "span", _key: key(), text: part, marks: [] };
    const marks = [...(part.marks ?? [])];
    if (part.href) {
      const k = key();
      markDefs.push({ _key: k, _type: "link", href: part.href });
      marks.push(k);
    }
    return { _type: "span", _key: key(), text: part.text, marks };
  });
  return {
    _type: "block",
    _key: key(),
    style,
    markDefs,
    children,
    ...(listItem ? { listItem, level: 1 } : {}),
  } as PortableTextBlock;
}

export const p = (...parts: Inline[]) => block("normal", parts);
export const h2 = (...parts: Inline[]) => block("h2", parts);
export const h3 = (...parts: Inline[]) => block("h3", parts);
export const quote = (...parts: Inline[]) => block("blockquote", parts);
export const li = (...parts: Inline[]) => block("normal", parts, "bullet");
