"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { useI18n } from "./I18nProvider";

/**
 * next/link that keeps visitors in their language: internal paths ("/flyers") become
 * "/pa/flyers" on Punjabi pages. External URLs, files, /api and /studio pass through.
 */
export default function Link({ href, ...rest }: ComponentProps<typeof NextLink>) {
  const { href: localize } = useI18n();
  return <NextLink href={typeof href === "string" ? localize(href) : href} {...rest} />;
}
