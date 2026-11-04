"use client";

import Image from "next/image";
import { useEffect } from "react";
import { ButtonLink, Button } from "@/components/ui/Button";
import { useI18n } from "@/i18n/I18nProvider";

/** Branded error screen for a page that fails to render, in the visitor's language. */
export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  const { t } = useI18n();
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <section className="container-x grid min-h-[80vh] place-items-center pt-28 pb-14 text-center sm:pb-20">
      <div>
        <Image src="/brand/mark.svg" alt="" width={512} height={512} unoptimized className="mx-auto w-20 -rotate-12" />
        <h1 className="mt-8 font-display text-title text-ink">{t.error.title}</h1>
        <p className="mx-auto mt-4 max-w-md text-ink-soft">{t.error.body}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button variant="chili" onClick={() => retry()}>
            {t.error.retry}
          </Button>
          <ButtonLink href="/" variant="primary">
            {t.common.home}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
