"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { formatMXN } from "@/lib/marketplace-data";
import { cn } from "@/lib/utils";

/* Paleta dorada cálida del panel (tema oscuro premium) */
export const GOLD = "#C9A96E";
export const GOLD_BRIGHT = "#E6CD9A";

export const EASE = [0.22, 1, 0.36, 1] as const;

export const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: EASE },
};

/* ------------------------------ Animaciones ----------------------------- */

export function AnimatedMoney({ value, className }: { value: number; className?: string }) {
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => formatMXN(Math.round(v)));
  const first = useRef(true);

  useEffect(() => {
    const controls = animate(mv, value, {
      duration: first.current ? 1.2 : 0.5,
      ease: [0.22, 1, 0.36, 1],
    });
    first.current = false;
    return () => controls.stop();
  }, [value, mv]);

  return <motion.span className={className}>{text}</motion.span>;
}

export function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => `${Math.round(v)}`);
  const first = useRef(true);

  useEffect(() => {
    const controls = animate(mv, value, {
      duration: first.current ? 1 : 0.4,
      ease: [0.22, 1, 0.36, 1],
    });
    first.current = false;
    return () => controls.stop();
  }, [value, mv]);

  return <motion.span className={className}>{text}</motion.span>;
}

/* ------------------------------- Etiquetas ------------------------------ */

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "text-[11px] font-semibold uppercase tracking-[0.22em] text-[#C9A96E]",
        className
      )}
    >
      {children}
    </p>
  );
}

export function PanelCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/8 bg-[#111111]/80 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.9)] backdrop-blur-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

export function GoldDivider({ className }: { className?: string }) {
  return (
    <div
      className={cn("h-px w-full bg-gradient-to-r from-transparent via-[#C9A96E]/40 to-transparent", className)}
    />
  );
}
