import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@/components/ui/Button";
import type { Post } from "@/lib/content/types";

export const dateFmt = new Intl.DateTimeFormat("en-CA", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

export function PostCard({ post, large = false }: { post: Post; large?: boolean }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group/btn grid h-full overflow-hidden rounded-[var(--radius-card)] bg-white ring-1 ring-ink/[0.06] transition-shadow hover:shadow-[0_30px_60px_-30px_rgb(15_59_38/0.35)] ${large ? "md:grid-cols-[1.2fr_1fr]" : ""}`}
    >
      {post.image && (
        <div className={`relative overflow-hidden bg-paper ${large ? "aspect-[16/10] md:aspect-auto md:min-h-[24rem]" : "aspect-[16/10]"}`}>
          <Image
            src={post.image.src}
            alt={post.image.alt}
            fill
            sizes={large ? "(min-width: 768px) 55vw, 100vw" : "(min-width: 768px) 45vw, 100vw"}
            className={`transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover/btn:scale-105 ${post.image.width < 400 ? "object-contain p-8" : "object-cover"}`}
          />
        </div>
      )}
      <div className={`flex flex-col ${large ? "p-8 sm:p-12" : "p-7"}`}>
        <p className="text-xs text-muted">
          <time dateTime={post.date}>{dateFmt.format(new Date(post.date))}</time> · {post.category}
        </p>
        <h3 className={`mt-3 font-display leading-tight text-ink ${large ? "text-[clamp(1.8rem,1.2rem+1.6vw,2.75rem)]" : "text-2xl"}`}>{post.title}</h3>
        <p className="mt-4 text-ink-soft">{post.excerpt}</p>
        <span className="mt-auto inline-flex items-center gap-2 pt-8 text-sm font-semibold text-leaf">
          Read the story <Arrow />
        </span>
      </div>
    </Link>
  );
}
