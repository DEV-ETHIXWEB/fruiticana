import Image from "next/image";

/**
 * The Fruiticana logo, fully vector: the wordmark traced from the client's artwork
 * (scripts/brand/trace-logo.py), the hand-drawn apple mark (scripts/brand/mark.svg),
 * and "SINCE 1994" set as live text in the site font. Sharp at any size and density.
 *
 * Geometry follows the original lockup on a 505 x 118 grid: wordmark 393 wide, apple
 * from x 395, tagline centred at x 204 between the two brush strokes. Everything is
 * positioned in percentages and the tagline is sized in container units, so the
 * lockup scales as one piece: set only its width.
 *
 * Decorative by default (alt=""): the surrounding link carries the accessible name.
 */
export function Logo({ tone = "color", preload = false, className = "" }: { tone?: "color" | "light"; preload?: boolean; className?: string }) {
  const light = tone === "light";
  return (
    <span className={`relative inline-block aspect-[505/118] select-none [container-type:inline-size] ${className}`}>
      <span className="absolute inset-y-0 left-0 w-[77.82%]">
        <Image src={light ? "/brand/wordmark-light.svg" : "/brand/wordmark.svg"} alt="" fill unoptimized preload={preload} draggable={false} className="object-contain object-left" />
      </span>
      <span
        aria-hidden
        className={`absolute top-[89%] left-[40.4%] -translate-x-1/2 font-sans text-[2.05cqw] leading-none font-semibold tracking-[0.26em] whitespace-nowrap uppercase [margin-right:-0.26em] ${
          light ? "text-cream/90" : "text-ink"
        }`}
      >
        Since 1994
      </span>
      <span className="absolute top-0 left-[78.2%] h-[93.2%] w-[21.8%]">
        <Image src="/brand/mark.svg" alt="" fill unoptimized preload={preload} draggable={false} className="object-contain drop-shadow-[0_1px_1.5px_rgb(0_0_0/0.18)]" />
      </span>
    </span>
  );
}
