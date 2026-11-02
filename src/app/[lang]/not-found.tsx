import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { getT } from "@/i18n/server";

export async function generateMetadata() {
  const t = await getT();
  return { title: t.notFound.metaTitle, robots: { index: false } };
}

export default async function NotFound() {
  const t = await getT();
  return (
    <section className="container-x grid min-h-[80vh] place-items-center pt-28 pb-20 text-center">
      <div>
        <Image src="/brand/mark.svg" alt="" width={512} height={512} unoptimized className="mx-auto w-20 -rotate-12" />
        <p className="mt-8 font-display text-[clamp(5rem,3rem+10vw,12rem)] leading-none tracking-tight text-forest">
          4<span className="text-chili italic">0</span>4
        </p>
        <h1 className="mt-4 font-display text-title text-ink">{t.notFound.title}</h1>
        <p className="mx-auto mt-4 max-w-md text-ink-soft">{t.notFound.body}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/" variant="primary">{t.common.home}</ButtonLink>
          <ButtonLink href="/flyers" variant="chili">{t.common.weeklySpecials}</ButtonLink>
          <ButtonLink href="/storefinder" variant="ghost">{t.common.storeLocator}</ButtonLink>
        </div>
      </div>
    </section>
  );
}
