"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { formatMXN } from "@/lib/marketplace-data";
import { cn } from "@/lib/utils";

export const EASE = [0.22, 1, 0.36, 1] as const;

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

/* --------------------- Patrones del sistema de diseño -------------------- */

/** Eyebrow — igual que marketplace: mayúsculas pequeñas en muted */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-[10px] uppercase tracking-[0.2em] text-muted-foreground", className)}>
      {children}
    </p>
  );
}

/** Tarjeta base — rounded-2xl + border, como las tarjetas del marketplace */
export function PanelCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card", className)}>
      {children}
    </div>
  );
}

/** Badge de estatus tipo píldora, monocromo */
export function StatusPill({
  tone = "neutral",
  children,
  className,
}: {
  tone?: "neutral" | "solid" | "outline";
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-wider",
        tone === "solid" && "bg-foreground text-background",
        tone === "neutral" && "bg-secondary text-foreground",
        tone === "outline" && "border border-border text-muted-foreground",
        className
      )}
    >
      {children}
    </span>
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-border", className)} />;
}
