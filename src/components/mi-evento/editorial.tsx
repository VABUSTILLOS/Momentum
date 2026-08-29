import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function CountUp({
  value,
  duration = 1.1,
  once = false,
  className,
}: {
  value: number;
  duration?: number;
  /** Anima solo la primera vez; cambios posteriores se aplican directo (p. ej. cuenta regresiva). */
  once?: boolean;
  className?: string;
}) {
  const [display, setDisplay] = useState(once ? 0 : value);
  const prev = useRef(0);
  const doneOnce = useRef(false);
  useEffect(() => {
    if (once && doneOnce.current) {
      setDisplay(value);
      prev.current = value;
      return;
    }
    const controls = animate(prev.current, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
      onComplete: () => {
        doneOnce.current = true;
      },
    });
    prev.current = value;
    return () => controls.stop();
  }, [value, duration, once]);
  return <span className={className}>{display}</span>;
}

/* Encabezado editorial centrado: eyebrow con líneas hairline + título serif. */
export function SectionHeading({
  eyebrow,
  title,
  className,
  ...rest
}: { eyebrow?: string; title: ReactNode } & Omit<HTMLAttributes<HTMLDivElement>, "title">) {
  return (
    <div className={cn("text-center", className)} {...rest}>
      {eyebrow && (
        <p className="flex items-center justify-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold">
          <span aria-hidden className="h-px w-8 bg-gold/50" />
          {eyebrow}
          <span aria-hidden className="h-px w-8 bg-gold/50" />
        </p>
      )}
      <h2
        className={cn(
          "font-serif text-3xl font-medium tracking-tight text-foreground md:text-5xl",
          eyebrow && "mt-4",
        )}
      >
        {title}
      </h2>
    </div>
  );
}

/* Etiqueta de sección para el planeador: small caps con rombo dorado. */
export function SectionLabel({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-foreground", className)}
      {...rest}
    >
      <span aria-hidden className="inline-block h-1.5 w-1.5 rotate-45 bg-gold" />
      {children}
    </p>
  );
}

/* Divisor ornamental entre secciones: líneas degradadas + rombo dorado. */
export function OrnamentDivider({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div aria-hidden className={cn("flex items-center justify-center gap-3", className)} {...rest}>
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold/50 md:w-24" />
      <span className="block h-1.5 w-1.5 rotate-45 border border-gold/70" />
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold/50 md:w-24" />
    </div>
  );
}
