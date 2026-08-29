import { useEffect, useRef, useState } from "react";
import { Fragment } from "react";
import { animate, motion, useReducedMotion } from "framer-motion";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

/* Texto libre del usuario: respeta saltos de línea (\n → <br>, \n\n → párrafo nuevo). */
export function MultilineText({
  text,
  className,
  paragraphClassName,
  ...rest
}: { text: string; paragraphClassName?: string } & HTMLAttributes<HTMLDivElement>) {
  const trimmed = text.trim();
  if (!trimmed.includes("\n")) {
    return (
      <p className={cn("break-words", className, paragraphClassName)} {...(rest as HTMLAttributes<HTMLParagraphElement>)}>
        {trimmed}
      </p>
    );
  }
  const paragraphs = trimmed.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  return (
    <div className={cn("break-words", className)} {...rest}>
      {paragraphs.map((p, i) => (
        <p key={i} className={cn(i > 0 && "mt-4", paragraphClassName)}>
          {p.split("\n").map((line, j) => (
            <Fragment key={j}>
              {j > 0 && <br />}
              {line}
            </Fragment>
          ))}
        </p>
      ))}
    </div>
  );
}

/* Revelado escalonado que respeta prefers-reduced-motion: fade + lift 8px con spring suave. */
export function FadeUp({
  index = 0,
  className,
  children,
}: {
  index?: number;
  className?: string;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 8 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-48px" }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function CountUp({
  value,
  duration = 1.1,
  once = false,
  className,
  format,
}: {
  value: number;
  duration?: number;
  /** Anima solo la primera vez; cambios posteriores se aplican directo (p. ej. cuenta regresiva). */
  once?: boolean;
  className?: string;
  /** Formatea el número mostrado (p. ej. moneda). */
  format?: (n: number) => string;
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
  return <span className={className}>{format ? format(display) : display}</span>;
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
          "font-serif text-3xl font-medium tracking-tight text-balance text-foreground md:text-5xl",
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

/* ---------------------------------------------------------------------------
 * Micro-interacciones premium (solo pointer fino; sin efecto en touch ni con
 * prefers-reduced-motion).
 * ------------------------------------------------------------------------- */

const canHover = () =>
  typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/* Hover magnético: el contenido se desplaza ±4px hacia el cursor con spring. */
export function Magnetic({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const enabled = !reduce && canHover();

  return (
    <motion.div
      ref={ref}
      className={cn("inline-block", className)}
      animate={{ x: offset.x, y: offset.y }}
      transition={{ type: "spring", stiffness: 220, damping: 16, mass: 0.6 }}
      onMouseMove={
        enabled
          ? (e) => {
              const rect = ref.current?.getBoundingClientRect();
              if (!rect) return;
              const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
              const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
              setOffset({ x: dx * 4, y: dy * 4 });
            }
          : undefined
      }
      onMouseLeave={enabled ? () => setOffset({ x: 0, y: 0 }) : undefined}
    >
      {children}
    </motion.div>
  );
}

/* Tilt 3D suave (≤4°) para tarjetas y fotos. */
export function Tilt({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [rot, setRot] = useState({ x: 0, y: 0 });
  const enabled = !reduce && canHover();

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ transformPerspective: 800 }}
      animate={{ rotateX: rot.x, rotateY: rot.y }}
      transition={{ type: "spring", stiffness: 180, damping: 18, mass: 0.7 }}
      onMouseMove={
        enabled
          ? (e) => {
              const rect = ref.current?.getBoundingClientRect();
              if (!rect) return;
              const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
              const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
              setRot({ x: -dy * 4, y: dx * 4 });
            }
          : undefined
      }
      onMouseLeave={enabled ? () => setRot({ x: 0, y: 0 }) : undefined}
    >
      {children}
    </motion.div>
  );
}
