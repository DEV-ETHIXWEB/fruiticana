import Link from "@/i18n/Link";
import { JsonLd } from "@/components/ui/JsonLd";
import { breadcrumbLd } from "@/lib/seo";

export function Breadcrumbs({ items, tone = "dark" }: { items: { name: string; path: string }[]; tone?: "dark" | "light" }) {
  const all = [{ name: "Home", path: "/" }, ...items];
  return (
    <>
      <JsonLd data={breadcrumbLd(all)} />
      <nav aria-label="Breadcrumb">
        <ol className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.78rem] ${tone === "dark" ? "text-muted" : "text-cream/60"}`}>
          {all.map((it, i) => (
            <li key={it.path + i} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden className="opacity-50">/</span>}
              {i === all.length - 1 ? (
                <span aria-current="page" className={tone === "dark" ? "text-ink" : "text-cream"}>
                  {it.name}
                </span>
              ) : (
                <Link href={it.path} className="hover:underline underline-offset-4">
                  {it.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
