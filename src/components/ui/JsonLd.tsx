type Node = Record<string, unknown>;

/** Nodes inside an @graph inherit the document's @context. */
const withoutContext = (node: Node): Node => Object.fromEntries(Object.entries(node).filter(([key]) => key !== "@context"));

/**
 * Inline structured data, always emitted as ONE object with a top-level
 * "@context". Several nodes are wrapped in an "@graph" (Google's recommended
 * form) instead of a bare top-level array: valid JSON-LD either way, but some
 * consumers (browser extensions, crawlers) read `data["@context"]` directly
 * and crash on an array.
 * `<` is escaped so CMS copy can never break out of the script tag.
 */
export function JsonLd({ data }: { data: Node | Node[] }) {
  const nodes = Array.isArray(data) ? data : [data];
  const doc =
    nodes.length === 1
      ? { "@context": "https://schema.org", ...nodes[0] }
      : { "@context": "https://schema.org", "@graph": nodes.map(withoutContext) };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(doc).replace(/</g, "\\u003c") }} />;
}
