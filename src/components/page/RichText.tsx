import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import Image from "next/image";
import Link from "@/i18n/Link";

const components: PortableTextComponents = {
  marks: {
    link: ({ value, children }) => {
      const href: string = value?.href ?? "#";
      if (href.startsWith("/")) return <Link href={href}>{children}</Link>;
      const external = /^https?:/.test(href);
      return (
        <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({ value }) =>
      value?.src ? (
        <figure className="my-10">
          <Image src={value.src} alt={value.alt ?? ""} width={value.width ?? 1200} height={value.height ?? 800} sizes="(min-width: 768px) 46rem, 100vw" className="h-auto w-full rounded-2xl" />
          {value.alt && <figcaption className="mt-3 text-sm text-muted">{value.alt}</figcaption>}
        </figure>
      ) : null,
  },
};

export function RichText({ value, className = "" }: { value: PortableTextBlock[]; className?: string }) {
  return (
    <div className={`prose-fr ${className}`}>
      <PortableText value={value} components={components} />
    </div>
  );
}
