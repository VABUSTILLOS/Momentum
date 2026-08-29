"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Sparkles, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/components/ui/use-mobile";
import { cn } from "@/lib/utils";

const TOUR_KEY = "momentum-tour-v1";
export const TOUR_OPEN_EVENT = "momentum:open-tour";

/** Dispara el tour desde cualquier parte (p. ej. la paleta ⌘K). */
export function openTour() {
  window.dispatchEvent(new CustomEvent(TOUR_OPEN_EVENT));
}

interface TourStep {
  title: string;
  body: string;
  art: React.ReactNode;
}

function StepArt({ variant }: { variant: number }) {
  if (variant === 0) {
    // Nombre y fecha
    return (
      <svg viewBox="0 0 120 80" className="h-20 w-full" aria-hidden="true">
        <rect x="10" y="14" width="100" height="52" rx="10" className="fill-secondary" />
        <rect x="10" y="14" width="100" height="16" rx="8" className="fill-gold/70" />
        <circle cx="24" cy="10" r="4" className="fill-foreground/70" />
        <circle cx="96" cy="10" r="4" className="fill-foreground/70" />
        <rect x="22" y="40" width="44" height="6" rx="3" className="fill-foreground/25" />
        <rect x="22" y="52" width="28" height="6" rx="3" className="fill-foreground/15" />
        <circle cx="92" cy="50" r="10" className="fill-gold/30" />
        <path d="M87 50l3.5 3.5 6-6" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-gold" />
      </svg>
    );
  }
  if (variant === 1) {
    // Explora servicios
    return (
      <svg viewBox="0 0 120 80" className="h-20 w-full" aria-hidden="true">
        <circle cx="46" cy="38" r="18" fill="none" strokeWidth="5" className="stroke-foreground/30" />
        <line x1="59" y1="51" x2="74" y2="66" strokeWidth="6" strokeLinecap="round" className="stroke-foreground/30" />
        <circle cx="46" cy="38" r="7" className="fill-gold/60" />
        <circle cx="92" cy="22" r="8" className="fill-foreground/15" />
        <circle cx="98" cy="44" r="5" className="fill-gold/40" />
        <circle cx="86" cy="60" r="6" className="fill-foreground/10" />
      </svg>
    );
  }
  // Tu boda se construye sola
  return (
    <svg viewBox="0 0 120 80" className="h-20 w-full" aria-hidden="true">
      <rect x="34" y="18" width="52" height="48" rx="8" className="fill-secondary" />
      <path d="M60 30c-3-6-12-6-12 1 0 6 8 10 12 13 4-3 12-7 12-13 0-7-9-7-12-1z" className="fill-gold/70" />
      <rect x="42" y="50" width="36" height="4" rx="2" className="fill-foreground/20" />
      <rect x="48" y="58" width="24" height="4" rx="2" className="fill-foreground/12" />
      <path d="M20 22l2.4 5.6L28 30l-5.6 2.4L20 38l-2.4-5.6L12 30l5.6-2.4z" className="fill-gold/50" />
      <path d="M100 44l1.8 4.2 4.2 1.8-4.2 1.8-1.8 4.2-1.8-4.2-4.2-1.8 4.2-1.8z" className="fill-foreground/20" />
    </svg>
  );
}

const STEPS: TourStep[] = [
  {
    title: "Ponle nombre y fecha",
    body: "Toca el título para nombrar tu evento y elige el gran día. Todo se guarda solo, sin botones de guardar.",
    art: <StepArt variant={0} />,
  },
  {
    title: "Explora y agrega servicios",
    body: "Desde el marketplace toca “Agregar a mi Evento”: aquí aparecen, comparas opciones y apartas con el 10%.",
    art: <StepArt variant={1} />,
  },
  {
    title: "Si es boda, tu página se construye sola",
    body: "Nombre, fecha y proveedores alimentan tu sitio de boda estilo bodas.com. Personalízala y compártela con tus invitados.",
    art: <StepArt variant={2} />,
  },
];

interface SpotlightTarget {
  id: string;
  title: string;
  body: string;
}

const SPOTLIGHTS: SpotlightTarget[] = [
  { id: "me-nombre", title: "Tu evento empieza aquí", body: "Toca para ponerle nombre. Abajo eliges fecha, invitados y presupuesto." },
  { id: "me-cta-explorar", title: "Arma tu equipo", body: "Explora el marketplace y agrega servicios con un toque." },
  { id: "me-cta-boda", title: "Tu página de boda", body: "Cuando elijas “Boda”, aquí nace tu sitio para invitados." },
];

export function WelcomeTour() {
  const [phase, setPhase] = useState<"idle" | "welcome" | "spotlight">("idle");
  const [step, setStep] = useState(0);
  const [spot, setSpot] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const isMobile = useIsMobile();
  const reduce = useReducedMotion();

  const markDone = useCallback(() => {
    try {
      window.localStorage.setItem(TOUR_KEY, "1");
    } catch {
      // storage unavailable
    }
  }, []);

  const start = useCallback(() => {
    setStep(0);
    setSpot(0);
    setPhase("welcome");
  }, []);

  useEffect(() => {
    let seen = false;
    try {
      seen = window.localStorage.getItem(TOUR_KEY) === "1";
    } catch {
      seen = true;
    }
    const t = window.setTimeout(() => {
      if (!seen) start();
    }, 900);
    const onOpen = () => start();
    window.addEventListener(TOUR_OPEN_EVENT, onOpen);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener(TOUR_OPEN_EVENT, onOpen);
    };
  }, [start]);

  const visibleSpotlights = SPOTLIGHTS.filter((s) => typeof document !== "undefined" && document.getElementById(s.id));

  const goStep = useCallback((delta: number) => {
    setStep((s) => Math.min(Math.max(0, s + delta), STEPS.length - 1));
  }, []);

  const measureSpot = useCallback(
    (index: number) => {
      const target = visibleSpotlights[index];
      if (!target) {
        setPhase("idle");
        markDone();
        return;
      }
      const el = document.getElementById(target.id);
      if (!el) {
        setPhase("idle");
        markDone();
        return;
      }
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      window.setTimeout(() => setRect(el.getBoundingClientRect()), reduce ? 60 : 450);
    },
    [visibleSpotlights, markDone, reduce]
  );

  const finishWelcome = () => {
    setPhase("spotlight");
    setSpot(0);
    measureSpot(0);
  };

  const nextSpot = useCallback(() => {
    const next = spot + 1;
    if (next >= visibleSpotlights.length) {
      setPhase("idle");
      setRect(null);
      markDone();
      return;
    }
    setSpot(next);
    measureSpot(next);
  }, [spot, visibleSpotlights.length, markDone, measureSpot]);

  const prevSpot = useCallback(() => {
    const prev = Math.max(0, spot - 1);
    if (prev === spot) return;
    setSpot(prev);
    measureSpot(prev);
  }, [spot, measureSpot]);

  const closeAll = useCallback(() => {
    setPhase("idle");
    setRect(null);
    markDone();
  }, [markDone]);

  // Navegación por teclado (welcome y spotlight)
  useEffect(() => {
    if (phase === "idle") return;
    const onKey = (e: KeyboardEvent) => {
      if (phase === "welcome") {
        if (e.key === "ArrowRight" || e.key === "Enter") {
          e.preventDefault();
          if (step < STEPS.length - 1) goStep(1);
          else finishWelcome();
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          goStep(-1);
        }
      } else if (phase === "spotlight") {
        if (e.key === "ArrowRight" || e.key === "Enter") {
          e.preventDefault();
          nextSpot();
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          prevSpot();
        } else if (e.key === "Escape") {
          closeAll();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, step, goStep, nextSpot, prevSpot, closeAll]);

  const current = STEPS[step];

  const welcomeBody = (
    <div className="flex flex-col items-center px-6 pb-6 pt-2 text-center">
      {/* Progreso */}
      <div className="flex w-full items-center gap-3">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-border">
          <motion.div
            className="h-full rounded-full bg-gold"
            initial={false}
            animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
        <span className="text-[11px] font-medium tabular-nums text-muted-foreground">
          Paso {step + 1} de {STEPS.length}
        </span>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          initial={reduce ? false : { opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? undefined : { opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
          drag={isMobile && !reduce ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_e, info) => {
            if (info.offset.x < -60) {
              if (step < STEPS.length - 1) goStep(1);
              else finishWelcome();
            } else if (info.offset.x > 60) {
              goStep(-1);
            }
          }}
          className="flex w-full flex-col items-center"
        >
          <div className="w-44">{current.art}</div>
          <h3 className="mt-4 font-serif text-2xl font-medium tracking-tight text-foreground">{current.title}</h3>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">{current.body}</p>
        </motion.div>
      </AnimatePresence>
      <div className="mt-5 flex items-center gap-1.5" aria-hidden="true">
        {STEPS.map((_, i) => (
          <span key={i} className={cn("h-1.5 rounded-full transition-all", i === step ? "w-6 bg-gold" : "w-1.5 bg-border")} />
        ))}
      </div>
      <div className="mt-5 flex w-full items-center gap-2">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => goStep(-1)}
            className="hit-44 inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-full border border-border text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={14} /> Atrás
          </button>
        ) : (
          <button
            type="button"
            onClick={closeAll}
            className="hit-44 min-h-11 flex-1 rounded-full border border-border text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Omitir tour
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => goStep(1)}
            className="hit-44 inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-foreground text-sm font-semibold text-background transition-opacity hover:opacity-90"
          >
            Siguiente <ArrowRight size={14} />
          </button>
        ) : (
          <button
            type="button"
            onClick={finishWelcome}
            className="hit-44 inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-foreground text-sm font-semibold text-background transition-opacity hover:opacity-90"
          >
            Empezar <Sparkles size={14} />
          </button>
        )}
      </div>
    </div>
  );

  const pad = 10;

  return (
    <>
      {isMobile ? (
        <Sheet open={phase === "welcome"} onOpenChange={(o) => !o && closeAll()}>
          <SheetContent
            side="bottom"
            className="rounded-t-3xl [&>button]:flex [&>button]:size-10 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-full [&>button]:bg-secondary [&>button]:opacity-100"
          >
            <SheetTitle className="sr-only">Tour de bienvenida</SheetTitle>
            <p className="pt-1 text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-gold">Bienvenido a tu planeador</p>
            {welcomeBody}
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={phase === "welcome"} onOpenChange={(o) => !o && closeAll()}>
          <DialogContent className="max-w-md rounded-3xl" showCloseButton>
            <DialogTitle className="sr-only">Tour de bienvenida</DialogTitle>
            <p className="pt-2 text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-gold">Bienvenido a tu planeador</p>
            {welcomeBody}
          </DialogContent>
        </Dialog>
      )}

      {/* Spotlight */}
      {phase === "spotlight" && rect && visibleSpotlights[spot] && (
        <div className="fixed inset-0 z-[70]" role="dialog" aria-label="Guía rápida">
          <button
            type="button"
            aria-label="Cerrar guía"
            onClick={closeAll}
            className="absolute inset-0 cursor-default bg-black/55"
            style={{
              clipPath: `polygon(0% 0%, 0% 100%, ${rect.left - pad}px 100%, ${rect.left - pad}px ${rect.top - pad}px, ${rect.right + pad}px ${rect.top - pad}px, ${rect.right + pad}px ${rect.bottom + pad}px, ${rect.left - pad}px ${rect.bottom + pad}px, ${rect.left - pad}px 100%, 100% 100%, 100% 0%)`,
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute rounded-2xl ring-2 ring-gold"
            style={{ left: rect.left - pad, top: rect.top - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }}
          />
          <div
            className="absolute w-72 rounded-2xl border border-border bg-popover p-4 shadow-2xl"
            style={{
              left: Math.min(Math.max(16, rect.left), window.innerWidth - 304),
              top: rect.bottom + pad + 12 + 150 < window.innerHeight ? rect.bottom + pad + 12 : Math.max(16, rect.top - pad - 168),
            }}
          >
            <button
              type="button"
              aria-label="Cerrar guía"
              onClick={closeAll}
              className="hit-44 absolute -right-2 -top-2 inline-flex size-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-md transition-colors hover:text-foreground"
            >
              <X size={14} />
            </button>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
              Paso {spot + 1} de {visibleSpotlights.length}
            </p>
            <h4 className="mt-1 font-serif text-lg font-medium text-foreground">{visibleSpotlights[spot].title}</h4>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{visibleSpotlights[spot].body}</p>
            <div className="mt-3 flex items-center justify-between">
              <button type="button" onClick={closeAll} className="hit-44 inline-flex min-h-10 items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                <X size={12} /> Omitir
              </button>
              <button
                type="button"
                onClick={nextSpot}
                className="hit-44 inline-flex min-h-10 items-center gap-1.5 rounded-full bg-foreground px-4 text-xs font-semibold text-background hover:opacity-90"
              >
                {spot + 1 >= visibleSpotlights.length ? (
                  <>
                    Listo <Check size={12} />
                  </>
                ) : (
                  <>
                    Siguiente <ArrowRight size={12} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
