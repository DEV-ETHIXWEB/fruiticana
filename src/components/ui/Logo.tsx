import Image from "next/image";

/**
 * The Fruiticana logo, fully vector and traced from the client's own artwork
 * (scripts/brand/trace-logo.py): the wordmark and brush strokes, and the apple
 * mark with its gloss. "SINCE 1994" is live text. Sharp at any size and density.
 *
 * Geometry is the original lockup's, on its 482 x 118 grid: wordmark x 0-393, apple
 * x 389-482 at full height, tagline centred at x 204 between the two brush strokes.
 * Everything is positioned in percentages and the tagline is sized in container
 * units, so the lockup scales as one piece: set only its width.
 *
 * Decorative by default (alt=""): the surrounding link carries the accessible name.
 */
export function Logo({ tone = "color", preload = false, className = "" }: { tone?: "color" | "light"; preload?: boolean; className?: string }) {
  const light = tone === "light";
  return (
    <span className={`relative inline-block aspect-[482/118] select-none [container-type:inline-size] ${className}`}>
      <span className="absolute inset-y-0 left-0 w-[81.54%]">
        <Image src={light ? "/brand/wordmark-light.svg" : "/brand/wordmark.svg"} alt="" fill unoptimized preload={preload} draggable={false} className="object-contain object-left" />
      </span>
      <span
        aria-hidden
        className={`absolute top-[91.4%] left-[42.32%] -translate-x-1/2 font-sans text-[2.15cqw] leading-none font-bold tracking-[0.26em] whitespace-nowrap uppercase [margin-right:-0.26em] ${
          light ? "text-cream/90" : "text-[#1d1f1b]"
        }`}
      >
        Since 1994
      </span>
      <span className="absolute inset-y-0 left-[80.71%] w-[19.29%]">
        <Image src="/brand/apple.svg" alt="" fill unoptimized preload={preload} draggable={false} className="object-contain" />
      </span>
    </span>
  );
}
