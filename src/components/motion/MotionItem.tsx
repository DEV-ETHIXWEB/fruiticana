"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { staggerItem } from "./primitives";

export function MotionItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  );
}
