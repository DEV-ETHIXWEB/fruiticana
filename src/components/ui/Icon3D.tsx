import Image from "next/image";

/**
 * The custom 3D icon set. Modelled and lit in three.js (scripts/icons/studio.html)
 * in the brand palette, rendered by scripts/icons/build.mjs to 256px WebP.
 * Decorative by default: the text beside each icon carries the meaning.
 */
export const ICON3D = ["badge", "bottle", "bowl", "calendar", "check", "chili", "clock", "flyer", "heart", "leaf", "mail", "mango", "phone", "pin", "sparkle", "truck"] as const;
export type Icon3DName = (typeof ICON3D)[number];

export function Icon3D({ name, className = "size-14", alt = "" }: { name: Icon3DName; className?: string; alt?: string }) {
  return (
    <Image
      src={`/icons3d/${name}.webp`}
      alt={alt}
      width={256}
      height={256}
      unoptimized
      draggable={false}
      className={`shrink-0 select-none object-contain drop-shadow-[0_10px_14px_rgb(15_59_38/0.18)] ${className}`}
    />
  );
}
