import Image from "next/image";
import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <section className="container-x grid min-h-[80vh] place-items-center pt-28 pb-20 text-center">
      <div>
        <Image src="/brand/mark.svg" alt="" width={512} height={512} unoptimized className="mx-auto w-20 -rotate-12" />
        <p className="mt-8 font-display text-[clamp(5rem,3rem+10vw,12rem)] leading-none tracking-tight text-forest">
          4<span className="text-chili italic">0</span>4
        </p>
        <h1 className="mt-4 font-display text-title text-ink">This aisle doesn’t exist.</h1>
        <p className="mx-auto mt-4 max-w-md text-ink-soft">The page you’re looking for may have moved when we refreshed our website. Try one of these instead:</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/" variant="primary">Home</ButtonLink>
          <ButtonLink href="/flyers" variant="chili">Weekly Specials</ButtonLink>
          <ButtonLink href="/storefinder" variant="ghost">Store Locator</ButtonLink>
        </div>
      </div>
    </section>
  );
}
