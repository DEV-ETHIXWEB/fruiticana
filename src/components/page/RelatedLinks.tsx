import Link from "next/link";
import { Reveal } from "@/components/motion/primitives";
import { Arrow } from "@/components/ui/Button";

export type Related = { href: string; title: string; body: string };

export function RelatedLinks({ title = "Keep exploring", items }: { title?: string; items: Related[] }) {
  return (
    <section className="container-x py-20 lg:py-28">
      <h2 className="font-display text-title text-forest">{title}</h2>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {items.map((it, i) => (
          <Reveal key={it.href} delay={i * 0.07}>
            <Link href={it.href} className="group/btn flex h-full flex-col rounded-[var(--radius-card)] bg-white p-7 ring-1 ring-ink/[0.06] transition-[box-shadow,transform] duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgb(15_59_38/0.35)]">
              <span className="font-display text-2xl text-ink">{it.title}</span>
              <span className="mt-2 text-[0.95rem] text-ink-soft">{it.body}</span>
              <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-leaf">
                Read more <Arrow />
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export const companyLinks: Related[] = [
  { href: "/our-company", title: "Our Story", body: "From one Surrey store in 1994 to 25 across BC & Alberta." },
  { href: "/commitment-to-quality", title: "Commitment to Quality", body: "Direct from growers, packers and our own facilities in India." },
  { href: "/farm-to-table", title: "Farm to Table", body: "Local farm produce on our shelves within 12-24 hours." },
  { href: "/employment", title: "Employment", body: "Join a team where people connect with “home”." },
  { href: "/indican", title: "Indican", body: "Our own brand of spices, lentils and juices since 1997." },
  { href: "/mangoes", title: "Rajan Mangoes", body: "Our signature seasonal mango, exclusive to Fruiticana." },
];

export const relatedExcept = (href: string, n = 3) => companyLinks.filter((l) => l.href !== href).slice(0, n);
