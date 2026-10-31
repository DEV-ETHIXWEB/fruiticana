import type { ReactNode } from "react";

/** One item inside a <Stagger>: the container animates these in sequence on scroll. */
export function MotionItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div data-stagger-item className={className}>
      {children}
    </div>
  );
}
