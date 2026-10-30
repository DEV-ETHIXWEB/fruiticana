import Image from "next/image";
import type { Img } from "@/lib/content/types";

/** Below this width an image is a small product shot rather than a photo. */
export const isSmallImage = (img: Img) => img.width < 400;

/**
 * Centred, never-upscaled rendering for small product shots (e.g. a 311px
 * cut-out on white). Displayed at most at half its pixel width in CSS
 * pixels, so it stays sharp on 2x screens instead of being stretched to fill
 * a large card.
 */
export function ProductShot({ image, className = "", preload = false }: { image: Img; className?: string; preload?: boolean }) {
  const cssWidth = Math.round(image.width / 2);
  return (
    <div className={`absolute inset-0 grid place-items-center p-5 ${className}`}>
      <Image
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        preload={preload}
        sizes={`${cssWidth}px`}
        style={{ width: "auto", height: "auto", maxWidth: `min(100%, ${cssWidth}px)`, maxHeight: "100%" }}
      />
    </div>
  );
}
