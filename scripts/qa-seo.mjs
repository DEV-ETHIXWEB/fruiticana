// SEO audit of every sitemap URL (both languages): status, title and description length,
// canonical, hreflang pairs, a single h1, share image, image alt text, JSON-LD validity,
// and duplicate titles / descriptions across pages. Reads server HTML (what crawlers get).
// Usage: node scripts/qa-seo.mjs   Env: QA_BASE (default http://localhost:4318)
const base = process.env.QA_BASE || "http://localhost:4318";
const SITE = "https://www.fruiticana.com";
const xml = await (await fetch(`${base}/sitemap.xml`)).text();
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const titles = new Map(), descs = new Map();
let problems = 0;
const ogChecked = new Map();
for (const url of urls) {
  const path = new URL(url).pathname;
  const res = await fetch(base + path, { redirect: "manual" });
  const html = await res.text();
  const issues = [];
  if (res.status !== 200) issues.push(`status ${res.status}`);
  const title = decode(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "");
  const desc = decode(html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "");
  // Gurmukhi takes less room in results than Latin, so allow longer counts there
  const pa = path.startsWith("/pa");
  if (title.length < 20 || title.length > (pa ? 75 : 65)) issues.push(`title ${title.length}c "${title}"`);
  if (desc.length < 70 || desc.length > (pa ? 190 : 165)) issues.push(`description ${desc.length}c`);
  const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
  if (canonical !== url && canonical !== url.replace(/\/$/, "")) issues.push(`canonical ${canonical}`);
  const alts = [...html.matchAll(/<link rel="alternate" hrefLang="([^"]+)" href="([^"]+)"/g)].map((m) => m[1]);
  for (const l of ["en-CA", "pa-CA", "x-default"]) if (!alts.includes(l)) issues.push(`hreflang ${l} missing`);
  const h1 = (html.match(/<h1[\s>]/g) ?? []).length;
  if (h1 !== 1) issues.push(`${h1} h1`);
  const og = html.match(/<meta property="og:image" content="([^"]*)"/)?.[1];
  if (!og) issues.push("no og:image");
  else {
    const ogPath = og.replace(SITE, "");
    if (!ogChecked.has(ogPath)) {
      const r = await fetch(base + ogPath);
      ogChecked.set(ogPath, r.ok && (r.headers.get("content-type") ?? "").startsWith("image/"));
    }
    if (!ogChecked.get(ogPath)) issues.push(`og:image fails ${ogPath}`);
  }
  if (!html.includes('name="twitter:card"')) issues.push("no twitter:card");
  const noAlt = [...html.matchAll(/<img\b(?![^>]*\balt=)[^>]*>/g)].length;
  if (noAlt) issues.push(`${noAlt} img without alt`);
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const d = JSON.parse(m[1]);
      if (!d["@context"]) issues.push("JSON-LD without @context");
    } catch {
      issues.push("JSON-LD does not parse");
    }
  }
  if (/<meta name="robots" content="[^"]*noindex/.test(html)) issues.push("noindex");
  (titles.get(title) ?? titles.set(title, []).get(title)).push(path);
  (descs.get(desc) ?? descs.set(desc, []).get(desc)).push(path);
  if (issues.length) {
    problems += issues.length;
    console.log(`${path}\n  ${issues.join("\n  ")}`);
  }
}
for (const [kind, map] of [["title", titles], ["description", descs]])
  for (const [v, paths] of map) if (paths.length > 1) { problems++; console.log(`duplicate ${kind} on ${paths.join(", ")}: "${v.slice(0, 70)}"`); }
console.log(`\n${urls.length} URLs audited: ${problems} problems`);
