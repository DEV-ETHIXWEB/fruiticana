import Link from "@/i18n/Link";
import type { ComponentProps, ReactNode } from "react";
import { Magnetic } from "@/components/motion/primitives";

type Variant = "primary" | "leaf" | "chili" | "ghost" | "light" | "outline-light";

const styles: Record<Variant, string> = {
  primary: "btn-3d btn-forest bg-forest text-cream hover:bg-forest-deep",
  leaf: "btn-3d btn-leaf bg-leaf text-white hover:bg-forest",
  chili: "btn-3d btn-chili bg-chili text-white hover:bg-chili-deep",
  ghost: "btn-glass text-ink",
  light: "btn-3d btn-cream bg-cream text-forest hover:bg-white",
  "outline-light": "btn-glass btn-glass-dark text-cream hover:text-white",
};

const base =
  "group/btn relative inline-flex items-center justify-center overflow-hidden rounded-full font-semibold tracking-[-0.005em] whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60";

/** `fluid` is compact on phones (two buttons share a row) and full size from `sm` up. */
type Size = "md" | "fluid";
const sizes: Record<Size, string> = {
  md: "gap-2.5 px-6 py-3.5 text-[0.95rem]",
  fluid: "gap-2 px-4 py-3 text-sm sm:gap-2.5 sm:px-5 sm:py-3.5 sm:text-[0.95rem] xl:px-6",
};

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <span className={`relative inline-flex size-4 overflow-hidden ${className}`} aria-hidden>
      <svg viewBox="0 0 16 16" className="absolute inset-0 size-4 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/btn:translate-x-[140%]">
        <path d="M2 8h11m-4-4.5L13.5 8 9 12.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <svg viewBox="0 0 16 16" className="absolute inset-0 size-4 -translate-x-[140%] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/btn:translate-x-0">
        <path d="M2 8h11m-4-4.5L13.5 8 9 12.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

type Common = { variant?: Variant; size?: Size; children: ReactNode; className?: string; arrow?: boolean; magnetic?: boolean };

export function ButtonLink({ variant = "primary", size = "md", children, className = "", arrow = true, magnetic = true, ...rest }: Common & ComponentProps<typeof Link>) {
  const el = (
    <Link className={`${base} ${sizes[size]} ${styles[variant]} ${className}`} {...rest}>
      <span>{children}</span>
      {arrow && <Arrow />}
    </Link>
  );
  return magnetic ? <Magnetic>{el}</Magnetic> : el;
}

export function Button({ variant = "primary", size = "md", children, className = "", arrow = false, ...rest }: Common & ComponentProps<"button">) {
  return (
    <button className={`${base} ${sizes[size]} ${styles[variant]} ${className}`} {...rest}>
      <span>{children}</span>
      {arrow && <Arrow />}
    </button>
  );
}
