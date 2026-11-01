"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import Link from "@/i18n/Link";
import { stripLocale } from "@/i18n/config";
import { LanguageSwitcher } from "@/i18n/LanguageSwitcher";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { nav } from "@/lib/site";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Header({ announcement, phone }: { announcement?: { text: string; href?: string }; phone: string }) {
  // compare against the path without the /pa prefix, so active states work in both languages
  const pathname = stripLocale(usePathname() || "/").path;
  const [open, setOpen] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // The header always stays on screen (Locations / Specials are one tap away); once the page
  // scrolls it condenses into a slim frosted bar instead of hiding.
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  // Close menus on navigation (state adjusted during render, no effect round-trip).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMobile(false);
    setOpen(null);
  }

  useEffect(() => {
    document.documentElement.style.overflow = mobile ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && (setMobile(false), setOpen(null));
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobile]);

  const isActive = (href: string, children?: readonly { href: string }[]) =>
    pathname === href || (href !== "/" && pathname.startsWith(href + "/")) || Boolean(children?.some((c) => pathname === c.href));

  // Over the homepage video (top of page, nothing open) the header switches to light-on-dark.
  const onDark = pathname === "/" && !scrolled && !open && !mobile;

  const enter = (label: string) => {
    clearTimeout(closeTimer.current);
    setOpen(label);
  };
  const leave = () => {
    closeTimer.current = setTimeout(() => setOpen(null), 140);
  };

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-forest focus:px-5 focus:py-3 focus:text-cream">
        Skip to content
      </a>

      <header className="fixed inset-x-0 top-0 z-50">
        {announcement?.text && !scrolled && (
          <div className="bg-forest text-cream">
            <div className="container-x flex h-9 items-center justify-center gap-3 text-[0.8rem] font-medium">
              <span className="size-1.5 animate-pulse-dot rounded-full bg-turmeric text-turmeric" />
              {announcement.href ? (
                <Link href={announcement.href} className="underline-offset-4 hover:underline">
                  {announcement.text}
                </Link>
              ) : (
                announcement.text
              )}
            </div>
          </div>
        )}

        <div
          className={`transition-[background-color,box-shadow,backdrop-filter] duration-500 ${
            scrolled || open ? "bg-cream/85 shadow-[0_1px_0_rgb(28_26_21/0.08)] backdrop-blur-xl backdrop-saturate-150" : "bg-transparent"
          }`}
        >
          <div className={`container-x flex items-center justify-between gap-3 transition-[height] sm:gap-6 duration-500 ${scrolled ? "h-[4.25rem]" : "h-20 lg:h-24"}`}>
            <Link href="/" className="relative shrink-0" aria-label="Fruiticana home">
              <Logo
                tone={onDark ? "light" : "color"}
                preload
                className={`transition-[width] duration-500 ${scrolled ? "w-[min(172px,44vw)] lg:w-[190px]" : "w-[min(196px,44vw)] lg:w-[244px] xl:max-2xl:w-[210px]"}`}
              />
            </Link>

            <nav aria-label="Primary" className="hidden xl:block">
              <ul className="flex items-center gap-0.5">
                {nav.map((item) => {
                  const children = "children" in item ? item.children : undefined;
                  const active = isActive(item.href, children);
                  return (
                    <li key={item.label} className="relative" onMouseEnter={() => children && enter(item.label)} onMouseLeave={() => children && leave()}>
                      <Link
                        href={item.href}
                        className={`group relative flex items-center gap-1 rounded-full px-2.5 py-2 text-[0.88rem] font-medium whitespace-nowrap transition-colors 2xl:px-3 2xl:text-[0.9rem] ${
                          onDark ? (active ? "text-turmeric" : "text-cream/90 hover:text-white") : active ? "text-forest" : "text-ink/75 hover:text-ink"
                        }`}
                        aria-expanded={children ? open === item.label : undefined}
                        onFocus={() => children && enter(item.label)}
                      >
                        {item.label}
                        {children && <Icon name="chevronDown" className={`size-3.5 transition-transform duration-300 ${open === item.label ? "rotate-180" : ""}`} strokeWidth={2} />}
                        <span
                          className={`absolute inset-x-3 -bottom-0.5 h-[2px] origin-left rounded-full bg-chili transition-transform duration-500 ease-[var(--ease-out-expo)] ${active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}
                        />
                      </Link>

                      <AnimatePresence>
                        {children && open === item.label && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 6, scale: 0.98, transition: { duration: 0.15 } }}
                            transition={{ duration: 0.35, ease: EASE }}
                            className="absolute top-full left-1/2 w-[25rem] -translate-x-1/2 pt-3"
                            onMouseEnter={() => enter(item.label)}
                            onMouseLeave={leave}
                          >
                            <div className="overflow-hidden rounded-3xl bg-white p-2 shadow-[0_30px_80px_-20px_rgb(15_59_38/0.35),0_0_0_1px_rgb(28_26_21/0.06)]">
                              {children.map((c, i) => (
                                <motion.div key={c.href} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * i, duration: 0.3 }}>
                                  <Link
                                    href={c.href}
                                    onBlur={(e) => !e.currentTarget.closest("li")?.contains(e.relatedTarget as Node) && setOpen(null)}
                                    className={`group/item flex items-start gap-3 rounded-2xl p-3.5 transition-colors hover:bg-cream ${pathname === c.href ? "bg-cream" : ""}`}
                                  >
                                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-sand transition-colors group-hover/item:bg-chili" />
                                    <span>
                                      <span className="block text-[0.95rem] font-semibold text-ink">{c.label}</span>
                                      <span className="mt-0.5 block text-[0.82rem] leading-snug text-muted">{c.blurb}</span>
                                    </span>
                                  </Link>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="flex items-center gap-2">
              <LanguageSwitcher tone={onDark ? "dark" : "light"} />
              {/* The two red / green header buttons from the original site, kept on purpose. */}
              <Link
                href="/storefinder"
                className="hidden items-center gap-2 btn-3d btn-chili rounded-full bg-chili px-4 py-2.5 text-[0.82rem] font-semibold tracking-wide text-white uppercase hover:bg-chili-deep sm:inline-flex"
              >
                <Icon name="pin" className="size-4 xl:max-2xl:hidden" strokeWidth={2} /> Locations
              </Link>
              <Link
                href="/flyers"
                className="hidden items-center gap-2 btn-3d btn-leaf rounded-full bg-leaf px-4 py-2.5 text-[0.82rem] font-semibold tracking-wide text-white uppercase hover:bg-forest sm:inline-flex"
              >
                <Icon name="flyer" className="size-4 xl:max-2xl:hidden" strokeWidth={2} /> Specials
              </Link>
              <button
                type="button"
                className={`relative grid size-11 place-items-center rounded-full text-cream transition-colors xl:hidden ${onDark ? "bg-cream/15 ring-1 ring-cream/30 backdrop-blur" : "bg-forest"}`}
                aria-label={mobile ? "Close menu" : "Open menu"}
                aria-expanded={mobile}
                aria-controls="mobile-menu"
                onClick={() => setMobile((v) => !v)}
              >
                <Icon name={mobile ? "close" : "menu"} className="size-5" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobile && (
          <motion.div
            id="mobile-menu"
            className="grain fixed inset-0 z-40 flex flex-col overflow-y-auto bg-forest pt-24 text-cream xl:hidden"
            initial={{ clipPath: "circle(0% at calc(100% - 3rem) 2.75rem)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 3rem) 2.75rem)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 3rem) 2.75rem)", transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1] } }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          >
            <nav aria-label="Mobile" className="container-x relative z-10 flex-1 pb-10">
              <ul className="divide-y divide-cream/10 border-y border-cream/10">
                {nav.map((item, i) => (
                  <motion.li key={item.label} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.05, duration: 0.6, ease: EASE }}>
                    <Link href={item.href} className="flex items-baseline justify-between py-4 font-display text-[2rem] leading-none">
                      {item.label}
                      <span className="font-sans text-xs tracking-widest text-cream/40">0{i + 1}</span>
                    </Link>
                    {"children" in item && (
                      <ul className="-mt-1 flex flex-wrap gap-2 pb-4">
                        {item.children.slice(1).map((c) => (
                          <li key={c.href}>
                            <Link href={c.href} className="inline-block rounded-full bg-cream/10 px-3.5 py-1.5 text-sm text-cream/85">
                              {c.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.li>
                ))}
              </ul>
              <motion.div className="mt-8 grid grid-cols-2 gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                <Link href="/storefinder" className="flex items-center justify-center btn-3d btn-chili gap-2 rounded-full bg-chili py-3.5 text-sm font-semibold uppercase">
                  <Icon name="pin" className="size-4" /> Locations
                </Link>
                <Link href="/flyers" className="flex items-center justify-center btn-3d btn-turmeric gap-2 rounded-full bg-turmeric py-3.5 text-sm font-semibold text-forest uppercase">
                  <Icon name="flyer" className="size-4" /> Specials
                </Link>
                <LanguageSwitcher variant="menu" className="col-span-2" />
                <a href={`tel:+1${phone.replace(/\D/g, "")}`} className="col-span-2 mt-2 text-center text-sm text-cream/60">
                  Head office · {phone}
                </a>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
