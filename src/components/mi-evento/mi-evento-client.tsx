"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  BadgeCheck,
  CakeSlice,
  CalendarDays,
  Camera,
  Candy,
  Car,
  Check,
  CircleDashed,
  CircleDot,
  Download,
  Gem,
  Heart,
  Hourglass,
  Landmark,
  Link2,
  ListTodo,
  Moon,
  Music,
  Palette,
  PartyPopper,
  Pencil,
  Plus,
  Printer,
  Share2,
  Shirt,
  Sparkles,
  Star,
  Sun,
  Trash2,
  Trophy,
  Upload,
  Users,
  UtensilsCrossed,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FadeImage } from "@/components/fade-image";
import { CommandPalette, PaletteButton, usePaletteHotkey, type PaletteGroup } from "@/components/mi-evento/command-palette";
import { CountUp, FadeUp, Magnetic, SectionLabel, Tilt } from "@/components/mi-evento/editorial";
import { WelcomeTour, openTour } from "@/components/mi-evento/welcome-tour";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { useIsMobile } from "@/components/ui/use-mobile";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { SUGGESTED_TASKS, encodeWeddingShare, useEvent, type EventItem, type EventTask, type EventType, type ItemStatus } from "@/lib/event-context";
import { CATEGORIES, VENDORS, formatMXN, type Vendor, type VendorCategory } from "@/lib/marketplace-data";
import { recommendVendors, type Recommendation } from "@/lib/recommendations";
import { Reveal } from "@/lib/use-reveal";
import { scrollToSection } from "@/lib/use-scroll-spy";
import { cn } from "@/lib/utils";

const APARTADO_PCT = 0.1;
const apartadoDe = (v: number) => Math.round(v * APARTADO_PCT);

const fade = (delay: number, className?: string) => ({
  className: cn("animate-fade-in opacity-0", className),
  style: { animationDelay: `${delay}ms`, animationFillMode: "forwards" as const },
});

const CATEGORY_ICONS: Record<VendorCategory, LucideIcon> = {
  musica: Music,
  catering: UtensilsCrossed,
  fotografia: Camera,
  venues: Landmark,
  decoracion: Palette,
  "mesa-de-dulces": Candy,
  pasteleria: CakeSlice,
  "vestidos-novia": Gem,
  "trajes-tuxedos": Shirt,
  "autos-limosinas": Car,
};

const categoryIcon = (slug: VendorCategory) => CATEGORY_ICONS[slug] ?? Sparkles;

/* ------------------------------ Plantillas -------------------------------- */

const EVENT_TEMPLATES: { id: string; label: string; icon: LucideIcon; type: EventType; categories: VendorCategory[] }[] = [
  { id: "boda-clasica", label: "Boda clásica", icon: Heart, type: "boda", categories: ["venues", "catering", "fotografia", "musica", "decoracion", "pasteleria"] },
  { id: "xv-sonados", label: "XV soñados", icon: Gem, type: "xv", categories: ["venues", "catering", "fotografia", "musica", "decoracion", "mesa-de-dulces"] },
  { id: "cumpleanos", label: "Cumpleaños", icon: CakeSlice, type: "cumpleanos", categories: ["catering", "musica", "pasteleria", "mesa-de-dulces", "fotografia"] },
  { id: "corporativo", label: "Corporativo", icon: Landmark, type: "corporativo", categories: ["venues", "catering", "musica", "fotografia"] },
];

function TemplatePicker({ compact }: { compact?: boolean }) {
  const { addItem, updateDetails, items } = useEvent();

  const applyTemplate = (template: (typeof EVENT_TEMPLATES)[number]) => {
    updateDetails({ type: template.type });
    const covered = new Set(items.map((i) => i.vendor.category));
    for (const cat of template.categories) {
      if (covered.has(cat)) continue;
      const best = VENDORS.filter((v) => v.category === cat).sort((a, b) => b.rating - a.rating)[0];
      if (best) addItem(best);
    }
  };

  if (compact) {
    return (
      <div className="mt-2 flex flex-wrap gap-1.5">
        {EVENT_TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => applyTemplate(t)}
            className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            <t.icon size={12} aria-hidden="true" />
            {t.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
      {EVENT_TEMPLATES.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => applyTemplate(t)}
          className="group flex flex-col items-center gap-2 rounded-2xl border border-border p-4 text-center transition-all hover:-translate-y-0.5 hover:border-foreground hover:shadow-md"
        >
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-secondary text-foreground transition-transform group-hover:scale-110">
            <t.icon size={18} aria-hidden="true" />
          </span>
          <span className="text-sm font-medium text-foreground">{t.label}</span>
          <span className="text-[11px] leading-snug text-muted-foreground">
            {t.categories.length} servicios sugeridos
          </span>
        </button>
      ))}
    </div>
  );
}

/* ----------------------------- Estado por servicio ------------------------- */

const STATUS_FLOW: ItemStatus[] = ["pendiente", "apartado", "confirmado"];

const STATUS_META: Record<ItemStatus, { label: string; icon: LucideIcon; className: string }> = {
  pendiente: {
    label: "Pendiente",
    icon: CircleDashed,
    className: "border-dashed text-muted-foreground hover:text-foreground",
  },
  apartado: {
    label: "Apartado",
    icon: CircleDot,
    className: "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  confirmado: {
    label: "Confirmado",
    icon: BadgeCheck,
    className: "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
};

function ItemStatusChip({ item }: { item: EventItem }) {
  const { updateItemStatus } = useEvent();
  const status = item.status ?? "pendiente";
  const meta = STATUS_META[status];
  const next = STATUS_FLOW[(STATUS_FLOW.indexOf(status) + 1) % STATUS_FLOW.length];

  return (
    <button
      type="button"
      onClick={() => updateItemStatus(item.vendor.id, next)}
      title={`Cambiar a "${STATUS_META[next].label}"`}
      className={cn(
        "hit-44 inline-flex w-fit min-h-10 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-medium transition-colors",
        meta.className,
      )}
    >
      <meta.icon size={11} />
      {meta.label}
    </button>
  );
}

/* --------------------------- Progreso de planeación ------------------------ */

function PlanningProgress({ items }: { items: EventItem[] }) {
  const { details } = useEvent();
  const covered = new Set(items.map((i) => i.vendor.category)).size;

  const milestones = [
    { done: !!details.date, label: "Fecha" },
    { done: details.type !== "otro", label: "Tipo de evento" },
    { done: items.length > 0, label: "Primer servicio" },
    { done: covered >= Math.min(4, CATEGORIES.length), label: "4 categorías" },
    { done: covered >= CATEGORIES.length, label: "Checklist completo" },
  ];
  const doneCount = milestones.filter((m) => m.done).length;
  const pct = Math.round((doneCount / milestones.length) * 100);

  const message =
    pct === 100
      ? "¡Tu evento está listo para brillar! ✨"
      : pct >= 60
        ? "Vas volando, ya casi está todo."
        : pct >= 40
          ? "Buen ritmo, sigue así."
          : "Apenas comenzando — tú puedes.";

  return (
    <div {...fade(350, "mt-6 flex max-w-md items-center gap-4")}>
      <svg viewBox="0 0 40 40" className="size-11 shrink-0 -rotate-90" aria-hidden="true">
        <circle cx="20" cy="20" r="16" fill="none" strokeWidth="4" className="stroke-foreground/10" />
        <circle
          cx="20"
          cy="20"
          r="16"
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          className="stroke-foreground transition-all duration-700"
          strokeDasharray={2 * Math.PI * 16}
          strokeDashoffset={2 * Math.PI * 16 * (1 - pct / 100)}
        />
      </svg>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2 text-xs">
          <span className="font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Tu planeación va {pct}%
          </span>
          <span className="truncate text-muted-foreground">{message}</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-foreground/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-foreground/50 to-foreground transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- Header --------------------------------- */

function MiEventoHeader({ count, onOpenPalette }: { count: number; onOpenPalette: () => void }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed left-1/2 top-4 z-50 w-[90%] max-w-6xl -translate-x-1/2">
      <div
        className={cn(
          "flex items-center justify-between rounded-full px-5 py-3 transition-all duration-300",
          isScrolled
            ? "border border-[#e7c887]/20 bg-foreground/85 shadow-[0_20px_60px_-30px_rgba(28,25,23,0.6)] backdrop-blur-xl"
            : "border border-transparent bg-foreground shadow-lg"
        )}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/marketplace"
            className="hit-44 inline-flex size-10 items-center justify-center rounded-full border border-background/20 text-background hover:bg-background/10"
            aria-label="Volver al marketplace"
          >
            <ArrowLeft size={16} />
          </Link>
          <Link href="/mi-evento" className="flex items-baseline gap-2 font-serif text-xl tracking-tight text-background">
            Momentum{" "}
            <span className="hidden font-sans text-[10px] uppercase tracking-[0.18em] opacity-70 sm:inline">Mi Evento</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <PaletteButton dark onClick={onOpenPalette} />
          <button
            type="button"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="hit-44 inline-flex size-10 items-center justify-center rounded-full border border-background/20 text-background hover:bg-background/10"
            aria-label={mounted && resolvedTheme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {mounted && resolvedTheme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
          </button>
          <Magnetic>
            <Link
              id="me-cta-explorar"
              href="/marketplace"
              className="hit-44 inline-flex min-h-11 items-center gap-2 rounded-full bg-background px-4 text-sm font-medium text-foreground hover:bg-background/90 sm:px-5"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Explorar servicios</span>
              {count > 0 && (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-foreground px-1.5 py-0.5 text-[10px] font-semibold text-background">
                  {count}
                </span>
              )}
            </Link>
          </Magnetic>
        </div>
      </div>
    </header>
  );
}

/* --------------------------- Resumen en vivo ------------------------------- */

function SummaryBar({ items }: { items: EventItem[] }) {
  const { details } = useEvent();
  const total = items.reduce((s, i) => s + i.vendor.basePrice, 0);
  const pct = Math.min(100, Math.round((total / details.budget) * 100));
  const apartados = items.filter((i) => i.status === "apartado" || i.status === "confirmado").length;

  const pills: { icon: LucideIcon; key: string; label: ReactNode }[] = [
    {
      icon: CalendarDays,
      key: "fecha",
      label: details.date
        ? details.date.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })
        : "Sin fecha",
    },
    { icon: Users, key: "invitados", label: <><CountUp value={details.guests} /> invitados</> },
    {
      icon: Sparkles,
      key: "servicios",
      label: <><CountUp value={items.length} /> {items.length === 1 ? "servicio" : "servicios"}</>,
    },
    { icon: Wallet, key: "presupuesto", label: <><CountUp value={pct} />% del presupuesto</> },
  ];

  if (items.length > 0) {
    pills.push({
      icon: BadgeCheck,
      key: "apartados",
      label:
        apartados === 0
          ? "Ninguno apartado aún"
          : <><CountUp value={apartados} /> de {items.length} {items.length === 1 ? "apartado" : "apartados"}</>,
    });
  }

  if (details.date) {
    const daysLeft = Math.ceil((details.date.getTime() - Date.now()) / 86400000);
    if (daysLeft >= 0) {
      pills.splice(1, 0, {
        icon: Hourglass,
        key: "cuenta",
        label: daysLeft === 0 ? "¡Es hoy!" : daysLeft === 1 ? "¡Falta 1 día!" : <>Faltan <CountUp value={daysLeft} /> días</>,
      });
    }
  }

  return (
    <div {...fade(300, "mt-8 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden")}>
      {pills.map((p) => (
        <span
          key={p.key}
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2 text-xs font-medium text-foreground backdrop-blur-sm"
        >
          <p.icon size={13} className="text-muted-foreground" />
          {p.label}
        </span>
      ))}
    </div>
  );
}

/* ------------------------------ Guía 3 pasos ------------------------------- */

function StepsGuide({ done }: { done: boolean }) {
  if (done) return null;
  const steps = [
    { n: "1", title: "Elige fecha y tipo", desc: "Cuéntanos qué celebras y cuándo." },
    { n: "2", title: "Agrega servicios", desc: "Arma tu equipo pieza por pieza." },
    { n: "3", title: "Aparta con el 10%", desc: "Asegura todo sin pagarlo completo." },
  ];
  return (
    <div {...fade(400, "mt-10 grid gap-3 sm:grid-cols-3")}>
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background/60 p-4 backdrop-blur-sm">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">
            {s.n}
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">{s.title}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{s.desc}</p>
          </div>
          {i < steps.length - 1 && <ArrowRight size={14} className="ml-auto mt-2 hidden shrink-0 text-muted-foreground sm:block" />}
        </div>
      ))}
    </div>
  );
}

/* --------------------------- Navegación secciones -------------------------- */

function SectionNav({ show }: { show: boolean }) {
  if (!show) return null;
  const links = [
    { id: "detalles", label: "Detalles" },
    { id: "servicios", label: "Servicios" },
    { id: "presupuesto", label: "Presupuesto" },
    { id: "tareas", label: "Tareas" },
  ];
  return (
    <nav
      {...fade(
        200,
        "sticky top-24 z-40 mx-auto flex w-full max-w-md gap-1 overflow-x-auto scrollbar-hide rounded-full border border-border bg-background/80 p-1.5 shadow-[0_20px_60px_-30px_rgba(28,25,23,0.4)] backdrop-blur-xl sm:w-fit sm:max-w-none"
      )}
      aria-label="Secciones de tu evento"
    >
      {links.map((l) => (
        <button
          key={l.id}
          type="button"
          onClick={() => document.getElementById(l.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
          className="hit-44 shrink-0 rounded-full px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          {l.label}
        </button>
      ))}
    </nav>
  );
}

/* ------------------------------ Detalles ----------------------------------- */

const EVENT_TYPES: { id: EventType; label: string }[] = [
  { id: "boda", label: "Boda" },
  { id: "xv", label: "XV Años" },
  { id: "cumpleanos", label: "Cumpleaños" },
  { id: "corporativo", label: "Corporativo" },
  { id: "otro", label: "Otro" },
];

function EventDatePicker({ date, onChange }: { date?: Date; onChange: (d?: Date) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium text-foreground hover:bg-secondary"
        >
          <CalendarDays size={15} />
          {date
            ? date.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })
            : "Elegir fecha"}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto rounded-2xl p-2" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            onChange(d);
            setOpen(false);
          }}
          disabled={[{ before: new Date() }]}
        />
      </PopoverContent>
    </Popover>
  );
}

function DetailsSection() {
  const { details, updateDetails, items } = useEvent();
  return (
    <section {...fade(200)}>
      <SectionLabel>Detalles de tu evento</SectionLabel>
      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="card-lift rounded-2xl border border-border p-5">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <Sparkles size={14} /> Tipo de evento
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {EVENT_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => updateDetails({ type: t.id })}
                className={cn(
                  "hit-44 rounded-full px-3.5 py-2 text-xs font-medium transition-colors",
                  details.type === t.id
                    ? "bg-foreground text-background"
                    : "border border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          {items.length === 0 && (
            <div className="mt-4 border-t border-border pt-3">
              <p className="text-[11px] text-muted-foreground">¿Quieres una base rápida? Prueba una plantilla:</p>
              <TemplatePicker compact />
            </div>
          )}
        </div>
        <div className="card-lift rounded-2xl border border-border p-5">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <CalendarDays size={14} /> Fecha
          </p>
          <p className="mt-3 font-serif text-2xl font-medium tracking-tight text-foreground">
            {details.date
              ? details.date.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })
              : "Sin fecha"}
          </p>
          <EventDatePicker date={details.date} onChange={(d) => updateDetails({ date: d })} />
        </div>
        <div className="card-lift rounded-2xl border border-border p-5">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <Users size={14} /> Invitados
          </p>
          <p className="mt-3 font-serif text-2xl font-medium tracking-tight text-foreground">{details.guests} personas</p>
          <Slider
            className="mt-5"
            value={[details.guests]}
            onValueChange={([v]) => updateDetails({ guests: v })}
            min={20}
            max={500}
            step={10}
            aria-label="Número de invitados"
          />
          <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
            <span>20</span>
            <span>500</span>
          </div>
        </div>
        <div className="card-lift rounded-2xl border border-border p-5">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <Wallet size={14} /> Presupuesto objetivo
          </p>
          <p className="mt-3 font-serif text-2xl font-medium tracking-tight text-foreground">{formatMXN(details.budget)}</p>
          <Slider
            className="mt-5"
            value={[details.budget]}
            onValueChange={([v]) => updateDetails({ budget: v })}
            min={50000}
            max={500000}
            step={5000}
            aria-label="Presupuesto objetivo"
          />
          <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
            <span>$50k</span>
            <span>$500k</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ CTA de boda -------------------------------- */

function WeddingCTA() {
  const { wedding, details, items } = useEvent();

  const copyGuestLink = async () => {
    try {
      const code = encodeWeddingShare(wedding, details);
      await navigator.clipboard.writeText(`${window.location.origin}/mi-evento/boda#s=${code}`);
      toast.success("Enlace para invitados copiado");
    } catch {
      toast.error("No pudimos copiar el enlace");
    }
  };

  // Mapeo en vivo de Mi Evento → boda (mismo criterio que el sync)
  const venues = items.filter((i) => i.vendor.category === "venues");
  const venue = venues[0];
  const fotografo = items.find((i) => i.vendor.category === "fotografia");
  const hasCatering = items.some((i) => i.vendor.category === "catering");
  const hasPastel = items.some((i) => i.vendor.category === "pasteleria");
  const hasTransporte = items.some((i) => i.vendor.category === "autos-limosinas");
  const hasMusica = items.some((i) => i.vendor.category === "musica");
  const previewChips = [
    { label: "Banquete", ok: hasCatering },
    { label: "Pastel", ok: hasPastel },
    { label: "Transporte", ok: hasTransporte },
    { label: "Música", ok: hasMusica },
  ];

  return (
    <section {...fade(250)} id="me-cta-boda" className="scroll-mt-32">
      <Link
        href="/mi-evento/boda"
        className="group flex flex-col gap-6 rounded-3xl bg-foreground p-8 text-background transition-shadow hover:shadow-2xl sm:flex-row sm:items-center sm:justify-between md:p-10"
      >
        <div className="flex items-start gap-5">
          <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-full bg-background text-foreground">
            <Heart size={24} className="fill-foreground" />
          </span>
          <div>
            <p className="font-serif text-2xl font-medium tracking-tight md:text-3xl">
              Crea la página web de tu boda
            </p>
            <p className="mt-2 max-w-md text-sm leading-relaxed opacity-80">
              Comparte tu historia con una página estilo bodas.com: cuenta regresiva, ceremonia y recepción, mesa de
              regalos y confirmación de asistencia para tus invitados.
            </p>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-background px-6 py-3.5 text-sm font-medium text-foreground transition-transform group-hover:scale-[1.03]">
          Empezar ahora <ArrowRight size={15} />
        </span>
      </Link>

      {/* Preview en vivo de lo que alimenta a la boda */}
      <div className="card-lift mt-4 rounded-2xl border border-border bg-background p-5 text-foreground">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Así se verá tu boda
          </p>
          <p className="text-[11px] text-muted-foreground">Según lo que elegiste en Mi Evento</p>
        </div>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground">
              <Landmark size={16} />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Sede</p>
              <p className="truncate text-sm font-semibold">
                {venue?.vendor.name ?? <span className="font-normal text-muted-foreground">No has elegido sede aún</span>}
              </p>
            </div>
          </div>
          <div className="flex min-w-0 items-start gap-3">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground">
              <Camera size={16} />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Galería</p>
              <p className="truncate text-sm font-semibold">
                {fotografo?.vendor.name ?? (
                  <span className="font-normal text-muted-foreground">Elige un fotógrafo para las fotos</span>
                )}
              </p>
              {fotografo && (
                <div className="mt-1.5 flex gap-1.5">
                  {fotografo.vendor.images.slice(0, 4).map((u, i) => (
                    <span key={i} className="size-8 overflow-hidden rounded-md border border-border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={u} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {previewChips.map((chip) => (
            <span
              key={chip.label}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium",
                chip.ok
                  ? "border-emerald-600/30 bg-emerald-500/10 text-emerald-700"
                  : "border-border bg-secondary/60 text-muted-foreground"
              )}
            >
              {chip.ok ? <Check size={11} className="text-emerald-600" /> : <CircleDashed size={11} />}
              {chip.label}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          El enlace incluye todos los datos de tu página; tus invitados la verán en modo lectura.
        </p>
        <button
          type="button"
          onClick={copyGuestLink}
          className="hit-44 inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          title="Copia el enlace de la página de tu boda para compartirlo con tus invitados"
        >
          <Link2 size={12} aria-hidden="true" />
          Copiar enlace para invitados
        </button>
      </div>
    </section>
  );
}

/* ------------------------------- Checklist --------------------------------- */
function ChecklistSection({ items }: { items: EventItem[] }) {
  const covered = useMemo(() => new Set(items.map((i) => i.vendor.category)), [items]);
  const pct = Math.round((covered.size / CATEGORIES.length) * 100);
  const complete = covered.size >= CATEGORIES.length;
  const r = 26;
  const circ = 2 * Math.PI * r;

  return (
    <section {...fade(300)}>
      <div className="flex items-center justify-between">
        <SectionLabel>Checklist de tu evento</SectionLabel>
        <p className="text-sm text-muted-foreground">
          {covered.size} de {CATEGORIES.length} categorías
        </p>
      </div>
      <div className="card-lift mt-4 flex flex-col gap-6 rounded-2xl border border-border p-6 sm:flex-row sm:items-center">
        <div className="relative mx-auto size-20 shrink-0 sm:mx-0">
          <svg viewBox="0 0 64 64" className="size-20 -rotate-90">
            <circle cx="32" cy="32" r={r} fill="none" strokeWidth="6" className="stroke-secondary" />
            <circle
              cx="32"
              cy="32"
              r={r}
              fill="none"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={circ - (circ * pct) / 100}
              className="stroke-foreground transition-all duration-700"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-foreground">{pct}%</span>
        </div>
        <div className="flex flex-1 flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const done = covered.has(cat.slug);
            const Icon = categoryIcon(cat.slug);
            return done ? (
              <span
                key={cat.slug}
                className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-2 text-xs font-medium text-background"
              >
                <Icon size={12} aria-hidden="true" /> {cat.label}
              </span>
            ) : (
              <Link
                key={cat.slug}
                href={`/marketplace?category=${cat.slug}`}
                className="group inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-3.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
              >
                <Icon size={12} aria-hidden="true" /> {cat.label}
              </Link>
            );
          })}
        </div>
      </div>
      {complete && (
        <div className="animate-scale-in mt-4 flex items-center gap-3 rounded-2xl bg-foreground px-6 py-4 text-background">
          <PartyPopper size={20} aria-hidden="true" />
          <p className="text-sm font-medium">
            ¡Checklist completo! Tienes todas las categorías cubiertas. Solo falta apartar y a celebrar.
          </p>
        </div>
      )}
      {!complete && covered.size > 0 && (
        <p className="mt-4 text-xs text-muted-foreground">
          {pct < 40
            ? "Buen comienzo — toca las categorías punteadas para seguir sumando."
            : pct < 80
              ? "¡Vas a mitad de camino! Tu evento va tomando forma."
              : "¡Casi lo logras! Solo te faltan unas categorías."}
        </p>
      )}
    </section>
  );
}

/* -------------------------------- Confetti --------------------------------- */

const CONFETTI_COLORS = ["#f43f5e", "#f59e0b", "#10b981", "#3b82f6", "#a855f7", "#ec4899"];

function Confetti({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      <style>{`@keyframes confetti-fall { 0% { transform: translateY(-8vh) rotate(0deg); opacity: 1; } 100% { transform: translateY(105vh) rotate(720deg); opacity: 0; } }`}</style>
      {Array.from({ length: 36 }).map((_, i) => (
        <span
          key={i}
          className="absolute top-0 block h-3 w-2 rounded-sm"
          style={{
            left: `${(i / 36) * 100 + (i % 3)}%`,
            backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            animation: `confetti-fall ${2.4 + (i % 5) * 0.35}s ease-in ${(i % 6) * 0.18}s forwards`,
          }}
        />
      ))}
    </div>
  );
}

/* -------------------------------- Servicios -------------------------------- */

function ItemDateEditor({ item }: { item: EventItem }) {
  const { updateItemDate } = useEvent();
  const [open, setOpen] = useState(false);
  const booked = useMemo(() => item.vendor.bookedDates.map((d) => new Date(`${d}T12:00:00`)), [item.vendor]);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="hit-44 inline-flex min-h-10 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-medium text-foreground hover:bg-secondary"
        >
          <CalendarDays size={12} />
          {item.date
            ? item.date.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })
            : "Elegir fecha"}
          <Pencil size={11} className="text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto rounded-2xl p-2" align="end">
        <Calendar
          mode="single"
          selected={item.date}
          onSelect={(d) => {
            updateItemDate(item.vendor.id, d);
            setOpen(false);
          }}
          disabled={[{ before: new Date() }, ...booked]}
          modifiers={{ booked }}
          modifiersClassNames={{ booked: "line-through opacity-40" }}
        />
      </PopoverContent>
    </Popover>
  );
}

function ItemNoteEditor({ item }: { item: EventItem }) {
  const { updateItemNote } = useEvent();
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div>
        <textarea
          autoFocus
          rows={2}
          defaultValue={item.note ?? ""}
          placeholder={"Ej. pedir paquete con saxofonista\nEnter = salto de línea · Esc = cancelar"}
          onBlur={(e) => {
            updateItemNote(item.vendor.id, e.target.value.trim());
            setEditing(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              updateItemNote(item.vendor.id, e.currentTarget.value.trim());
              setEditing(false);
            }
          }}
          className="w-full resize-none rounded-lg border border-border bg-background px-3 py-1.5 text-xs leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring"
          aria-label={`Nota para ${item.vendor.name}`}
        />
        <p className="mt-1 text-[10px] text-muted-foreground/70">Enter = salto de línea · se guarda al salir</p>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="hit-44 group inline-flex min-h-10 items-center gap-1.5 text-left text-xs text-muted-foreground hover:text-foreground"
    >
      <Pencil size={11} className="shrink-0" />
      <span className={cn("whitespace-pre-line break-words line-clamp-2", item.note && "italic")}>{item.note || "Agregar nota"}</span>
    </button>
  );
}

function ClearEventButton() {
  const { clearEvent } = useEvent();
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-5 py-4">
        <p className="text-sm text-foreground">¿Seguro? Se quitarán todos los servicios y detalles.</p>
        <button
          type="button"
          onClick={() => {
            clearEvent();
            setConfirming(false);
          }}
          className="rounded-full bg-destructive px-4 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-85"
        >
          Sí, vaciar todo
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-full border border-border px-4 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground underline underline-offset-2 transition-colors hover:text-destructive"
      >
        <Trash2 size={12} /> Vaciar mi evento
      </button>
    </div>
  );
}

type ServicesSort = "categoria" | "precio" | "estado";

const STATUS_ORDER: { id: ItemStatus; label: string; icon: LucideIcon }[] = [
  { id: "pendiente", label: "Pendientes", icon: CircleDashed },
  { id: "apartado", label: "Apartados", icon: Hourglass },
  { id: "confirmado", label: "Confirmados", icon: BadgeCheck },
];

function ServicesSection({ items, onRemoveItem, compareIds, onToggleCompare }: { items: EventItem[]; onRemoveItem: (item: EventItem) => void; compareIds: string[]; onToggleCompare: (vendor: Vendor) => void }) {
  const [sort, setSort] = useState<ServicesSort>("categoria");
  const groups = useMemo(() => {
    if (sort === "precio") {
      return [
        {
          label: "Mayor a menor precio",
          icon: ArrowUpDown,
          items: [...items].sort((a, b) => b.vendor.basePrice - a.vendor.basePrice),
        },
      ];
    }
    if (sort === "estado") {
      return STATUS_ORDER.map((s) => ({
        label: s.label,
        icon: s.icon,
        items: items.filter((i) => (i.status ?? "pendiente") === s.id),
      })).filter((g) => g.items.length > 0);
    }
    const map = new Map<string, { label: string; icon: LucideIcon; items: EventItem[] }>();
    for (const item of items) {
      const key = item.vendor.category;
      const existing = map.get(key);
      if (existing) {
        existing.items.push(item);
      } else {
        map.set(key, {
          label: CATEGORIES.find((c) => c.slug === key)?.label ?? item.vendor.categoryLabel,
          icon: categoryIcon(key),
          items: [item],
        });
      }
    }
    return [...map.values()];
  }, [items, sort]);

  return (
    <section {...fade(400)}>
      <div className="flex items-center justify-between gap-3">
        <SectionLabel>Servicios de tu evento</SectionLabel>
        <div className="flex items-center gap-3">
          <Select value={sort} onValueChange={(v) => setSort(v as ServicesSort)}>
            <SelectTrigger className="h-8 w-auto gap-1.5 rounded-full border-border px-3 text-xs" aria-label="Ordenar servicios">
              <ArrowUpDown size={11} aria-hidden="true" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="categoria">Por categoría</SelectItem>
              <SelectItem value="precio">Por precio</SelectItem>
              <SelectItem value="estado">Por estado</SelectItem>
            </SelectContent>
          </Select>
          <Link href="/marketplace" className="inline-flex items-center gap-1 text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground">
            Agregar más <ArrowRight size={13} />
          </Link>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-8">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <group.icon size={14} aria-hidden="true" />
              {group.label}
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-foreground">
                {group.items.length}
              </span>
            </p>
            <ul className="flex flex-col gap-3">
              {group.items.map((item, i) => (
                <li key={item.vendor.id} className="block">
                  <FadeUp
                    index={i}
                    className="card-lift flex flex-col gap-4 rounded-2xl border border-border p-4 sm:flex-row sm:items-center"
                  >
                    <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-xl bg-secondary sm:h-20 sm:w-24">
                      <FadeImage src={item.vendor.images[0]} alt={item.vendor.name} fill className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-medium text-foreground">{item.vendor.name}</p>
                      <div className="mt-1.5">
                        <ItemDateEditor item={item} />
                      </div>
                      <div className="mt-1.5">
                        <ItemNoteEditor item={item} />
                      </div>
                      <div className="mt-2">
                        <ItemStatusChip item={item} />
                      </div>
                      <ItemDeadlineChip item={item} />
                    </div>
                    <div className="flex w-full shrink-0 flex-row items-center justify-between gap-2.5 sm:w-auto sm:flex-col sm:items-end">
                      <span className="text-sm font-semibold text-foreground">{formatMXN(item.vendor.basePrice)}</span>
                      <CompareToggle
                        active={compareIds.includes(item.vendor.id)}
                        disabled={compareIds.length >= MAX_COMPARE}
                        onToggle={() => onToggleCompare(item.vendor)}
                        label={item.vendor.name}
                      />
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item)}
                        className="hit-44 inline-flex size-10 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-destructive"
                        aria-label={`Quitar ${item.vendor.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </FadeUp>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-10">
        <ClearEventButton />
      </div>
    </section>
  );
}

/* ------------------------------ Comparador --------------------------------- */

const MAX_COMPARE = 3;

function CompareToggle({ active, disabled, onToggle, label }: { active: boolean; disabled: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={!active && disabled}
      aria-pressed={active}
      className={cn(
        "hit-44 inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border text-muted-foreground hover:border-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
      )}
      title={!active && disabled ? `Puedes comparar hasta ${MAX_COMPARE}` : `Comparar ${label}`}
    >
      {active ? <Check size={11} /> : <Plus size={11} />}
      Comparar
    </button>
  );
}

function CompareSheet({
  vendors,
  items,
  open,
  onOpenChange,
  onRemove,
}: {
  vendors: Vendor[];
  items: EventItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRemove: (vendorId: string) => void;
}) {
  const bestPriceId = vendors.length > 1 ? vendors.reduce((min, v) => (v.basePrice < min.basePrice ? v : min)).id : null;
  const bestRatingId = vendors.length > 1 ? vendors.reduce((max, v) => (v.rating > max.rating ? v : max)).id : null;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="font-serif text-2xl">Comparar proveedores</SheetTitle>
          <SheetDescription>
            Lado a lado: precio, rating y apartado. Máximo {MAX_COMPARE} a la vez.
          </SheetDescription>
        </SheetHeader>
        {vendors.length === 0 ? (
          <p className="mt-8 text-sm text-muted-foreground">No hay proveedores seleccionados.</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[480px] border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  <th className="w-28" />
                  {vendors.map((v) => (
                    <th key={v.id} className="border-l border-border p-3 align-top first:border-l-0">
                      <div className="relative h-24 w-full overflow-hidden rounded-xl bg-secondary">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={v.images[0]} alt={v.name} className="h-full w-full object-cover" />
                      </div>
                      <p className="mt-2 text-left text-sm font-semibold leading-snug text-foreground">{v.name}</p>
                      <p className="text-left text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{v.categoryLabel}</p>
                      <button
                        type="button"
                        onClick={() => onRemove(v.id)}
                        className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground underline underline-offset-2 hover:text-destructive"
                      >
                        <Trash2 size={10} /> Quitar
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="[&_td]:border-l [&_td]:border-border [&_td]:p-3 [&_td]:align-top [&_td:first-child]:border-l-0 [&_td:first-child]:text-xs [&_td:first-child]:font-medium [&_td:first-child]:text-muted-foreground [&_tr]:border-t [&_tr]:border-border">
                <tr>
                  <td>Precio base</td>
                  {vendors.map((v) => (
                    <td key={v.id} className="font-semibold text-foreground">
                      {formatMXN(v.basePrice)}
                      <span className="block text-[11px] font-normal text-muted-foreground">{v.priceUnit}</span>
                      {v.id === bestPriceId && (
                        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-foreground px-2 py-0.5 text-[10px] font-semibold text-background">
                          <Trophy size={9} aria-hidden="true" /> Mejor precio
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Rating</td>
                  {vendors.map((v) => (
                    <td key={v.id}>
                      <span className="inline-flex items-center gap-1 text-foreground">
                        <Star size={12} className="fill-foreground" aria-hidden="true" />
                        {v.rating.toFixed(1)}
                      </span>
                      {v.id === bestRatingId && (
                        <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-foreground px-2 py-0.5 text-[10px] font-semibold text-background">
                          <Trophy size={9} aria-hidden="true" /> Mejor rating
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Apartado hoy (10%)</td>
                  {vendors.map((v) => (
                    <td key={v.id} className="font-medium text-foreground">
                      {formatMXN(apartadoDe(v.basePrice))}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Tu nota</td>
                  {vendors.map((v) => {
                    const note = items.find((i) => i.vendor.id === v.id)?.note;
                    return (
                      <td key={v.id} className="whitespace-pre-line break-words align-top text-xs leading-relaxed text-muted-foreground">
                        {note?.trim() || "—"}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function CompareBar({ count, lifted, onOpen }: { count: number; lifted: boolean; onOpen: () => void }) {
  if (count === 0) return null;
  return (
    <div className={cn("fixed inset-x-0 z-40 flex justify-center px-6", lifted ? "bottom-40 md:bottom-24" : "bottom-24 md:bottom-6")}>
      <button
        type="button"
        onClick={onOpen}
        className="inline-flex animate-scale-in items-center gap-2 rounded-full bg-foreground px-6 py-3.5 text-sm font-medium text-background shadow-xl transition-transform hover:scale-[1.03]"
      >
        Comparar proveedores ({count})
        <ArrowRight size={15} />
      </button>
    </div>
  );
}

/* ------------------------------ CTA móvil ---------------------------------- */

function MobileCtaBar({ items }: { items: EventItem[] }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (items.length === 0) return null;
  const total = items.reduce((s, i) => s + i.vendor.basePrice, 0);

  return (
    <div
      className={cn(
        "fixed inset-x-3 bottom-3 z-50 transition-all duration-300 md:hidden",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      )}
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-between gap-3 rounded-full border border-[#e7c887]/20 bg-foreground/90 px-5 py-2.5 shadow-xl backdrop-blur-xl">
        <div className="min-w-0 text-background">
          <p className="truncate text-xs font-semibold">
            {items.length} {items.length === 1 ? "servicio" : "servicios"} · {formatMXN(total)}
          </p>
          <p className="text-[10px] opacity-70">Aparta hoy con solo el 10%</p>
        </div>
        <button
          type="button"
          onClick={() => scrollToSection("apartado")}
          className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full bg-background px-5 py-2.5 text-xs font-semibold text-foreground transition-transform active:scale-[0.97]"
        >
          Continuar <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}

/* --------------------------- Fecha límite apartado ------------------------- */

function ItemDeadlineChip({ item }: { item: EventItem }) {
  const { details } = useEvent();
  if (!details.date || (item.status ?? "pendiente") !== "pendiente") return null;
  const deadline = new Date(details.date);
  deadline.setDate(deadline.getDate() - 30);
  const overdue = deadline.getTime() < Date.now();
  return (
    <p className={cn("mt-1.5 inline-flex items-center gap-1.5 text-[11px]", overdue ? "text-destructive" : "text-muted-foreground")}>
      <Hourglass size={11} aria-hidden="true" />
      {overdue
        ? "Tu fecha está cerca: apártalo lo antes posible"
        : `Aparta antes del ${deadline.toLocaleDateString("es-MX", { day: "numeric", month: "short" })} para asegurar disponibilidad`}
    </p>
  );
}

/* ----------------------------- Recomendaciones ----------------------------- */

function RecommendationCard({ rec, index, compareIds, onToggleCompare }: { rec: Recommendation; index: number; compareIds: string[]; onToggleCompare: (vendor: Vendor) => void }) {
  const { addItem, details } = useEvent();
  const { vendor } = rec;

  return (
    <FadeUp index={index} className="h-full">
      <Tilt className="h-full">
        <article className="card-lift flex h-full flex-col overflow-hidden rounded-2xl border border-border">
        <div className="relative h-36 bg-secondary">
          <FadeImage src={vendor.images[0]} alt={vendor.name} fill className="object-cover" />
          {rec.reasons[0] && (
            <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-[11px] font-medium text-foreground backdrop-blur-sm">
              {rec.reasons[0]}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{vendor.categoryLabel}</p>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
              <Star size={12} className="fill-foreground" aria-hidden="true" />
              {vendor.rating.toFixed(1)}
            </span>
          </div>
          <p className="text-sm font-medium leading-snug text-foreground">{vendor.name}</p>
          <div className="mt-auto flex items-center justify-between gap-2 pt-2">
            <span className="text-sm font-semibold text-foreground">
              {formatMXN(vendor.basePrice)}
              <span className="ml-1 text-xs font-normal text-muted-foreground">{vendor.priceUnit}</span>
            </span>
            <button
              type="button"
              onClick={() => addItem(vendor, details.date)}
              className="hit-44 inline-flex min-h-11 items-center gap-1.5 rounded-full bg-foreground px-4 text-xs font-medium text-background transition-opacity hover:opacity-90"
            >
              <Plus size={13} />
              Agregar
            </button>
          </div>
          <div className="pt-1.5">
            <CompareToggle
              active={compareIds.includes(vendor.id)}
              disabled={compareIds.length >= MAX_COMPARE}
              onToggle={() => onToggleCompare(vendor)}
              label={vendor.name}
            />
          </div>
        </div>
      </article>
      </Tilt>
    </FadeUp>
  );
}

function RecommendationsSection({ items, compareIds, onToggleCompare }: { items: EventItem[]; compareIds: string[]; onToggleCompare: (vendor: Vendor) => void }) {
  const { details } = useEvent();
  const recommendations = useMemo(() => recommendVendors(items, details), [items, details]);

  if (recommendations.length === 0) return null;

  return (
    <section {...fade(350)}>
      <div className="flex items-center justify-between">
        <SectionLabel>
          <Sparkles size={14} aria-hidden="true" /> Recomendados para tu evento
        </SectionLabel>
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          Ver todos <ArrowRight size={13} />
        </Link>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Según tu fecha{details.date ? "" : " (elígela arriba)"}, {details.guests} invitados y presupuesto de{" "}
        {formatMXN(details.budget)}.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {recommendations.map((rec, i) => (
          <RecommendationCard key={rec.vendor.id} rec={rec} index={i} compareIds={compareIds} onToggleCompare={onToggleCompare} />
        ))}
      </div>
    </section>
  );
}

/* ------------------------------- Presupuesto ------------------------------- */

function ShareSummaryButton({ items }: { items: EventItem[] }) {
  const { details } = useEvent();

  const handleShare = async () => {
    const total = items.reduce((s, i) => s + i.vendor.basePrice, 0);
    const lines = [
      `🎉 ${details.name.trim() || "Mi evento"}${details.type !== "otro" ? ` (${EVENT_TYPES.find((t) => t.id === details.type)?.label})` : ""}`,
      details.date
        ? `📅 ${details.date.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}`
        : "📅 Fecha por definir",
      `👥 ${details.guests} invitados`,
      "",
      ...items.map((i) => {
        const s = i.status === "confirmado" ? "✅" : i.status === "apartado" ? "🔖" : "⬜";
        return `${s} ${i.vendor.name} — ${formatMXN(i.vendor.basePrice)}`;
      }),
      "",
      `💰 Total estimado: ${formatMXN(total)}`,
      `🔑 Apartado hoy (10%): ${formatMXN(apartadoDe(total))}`,
      "",
      "Armado con Momentum ✨",
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      toast.success("Resumen copiado, listo para compartir");
    } catch {
      toast.error("No pudimos copiar el resumen");
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      title="Copia el resumen para mandarlo por WhatsApp"
    >
      <Share2 size={12} aria-hidden="true" />
      Compartir
    </button>
  );
}

function BudgetPanel({ items }: { items: EventItem[] }) {
  const { details } = useEvent();
  const [expanded, setExpanded] = useState<string | null>(null);
  const total = items.reduce((sum, item) => sum + item.vendor.basePrice, 0);
  const over = total > details.budget;
  const fillPct = Math.min(100, Math.round((total / details.budget) * 100));

  return (
    <aside {...fade(500, "lg:sticky lg:top-28")}>
      <div className="card-lift rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between">
          <SectionLabel>Presupuesto</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            <ShareSummaryButton items={items} />
            <ExportEventButton />
            <ImportEventButton />
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              title="Imprimir o guardar como PDF"
            >
              <Printer size={12} /> Imprimir
            </button>
          </div>
        </div>
        <div className="mt-4 flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">Estimado base</span>
          <span className="font-serif text-3xl font-medium tracking-tight text-foreground">
            <CountUp value={total} format={formatMXN} />
          </span>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{fillPct}% de tu presupuesto</span>
            <span>{formatMXN(details.budget)}</span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-secondary">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700",
                over ? "bg-destructive" : "bg-gradient-to-r from-foreground/50 to-foreground"
              )}
              style={{ width: `${fillPct}%` }}
            />
          </div>
          <p className={cn("mt-2 text-xs leading-relaxed", over ? "text-destructive" : "text-muted-foreground")}>
            {over
              ? `Te pasas por ${formatMXN(total - details.budget)} — ajusta tu presupuesto o quita algún servicio.`
              : fillPct >= 80
                ? `Casi llegas a tu límite: te quedan ${formatMXN(details.budget - total)} de margen.`
                : `Vas perfecto: te quedan ${formatMXN(details.budget - total)} de margen.`}
          </p>
        </div>

        {/* Participación por servicio */}
        <div className="mt-5 border-t border-border pt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Distribución</p>
          <div className="mt-3 flex h-3 gap-0.5 overflow-hidden rounded-full">
            {items.map((item) => (
              <div
                key={item.vendor.id}
                className="bg-foreground/70 transition-all duration-500 first:rounded-l-full last:rounded-r-full odd:bg-foreground"
                style={{ width: `${(item.vendor.basePrice / total) * 100}%` }}
                title={`${item.vendor.name} · ${formatMXN(item.vendor.basePrice)}`}
              />
            ))}
          </div>
          <ul className="mt-3 flex flex-col gap-1">
            {items.map((item) => (
              <li key={item.vendor.id}>
                <button
                  type="button"
                  onClick={() => setExpanded(expanded === item.vendor.id ? null : item.vendor.id)}
                  aria-expanded={expanded === item.vendor.id}
                  className="flex min-h-10 w-full items-center justify-between gap-3 rounded-lg px-2 text-xs transition-colors hover:bg-secondary/60"
                >
                  <span className="truncate text-muted-foreground">{item.vendor.name}</span>
                  <span className="flex shrink-0 items-baseline gap-2">
                    <span className="text-[10px] text-muted-foreground">
                      apartado {formatMXN(apartadoDe(item.vendor.basePrice))}
                    </span>
                    <span className="font-medium text-foreground">{Math.round((item.vendor.basePrice / total) * 100)}%</span>
                  </span>
                </button>
                {expanded === item.vendor.id && (
                  <div className="animate-fade-in mt-1 flex items-center justify-between gap-3 rounded-lg bg-secondary/60 px-3 py-2 text-[11px] text-muted-foreground">
                    <span>Precio base</span>
                    <span className="font-medium text-foreground">{formatMXN(item.vendor.basePrice)}</span>
                    <span>Apartado hoy</span>
                    <span className="font-medium text-foreground">{formatMXN(apartadoDe(item.vendor.basePrice))}</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 rounded-xl bg-secondary px-4 py-3">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">Apartado hoy (10%)</span>
            <span className="text-base font-semibold text-foreground">{formatMXN(apartadoDe(total))}</span>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            Aparta a todos tus proveedores con solo el 10%. El resto lo liquidas directo con cada proveedor antes de tu evento.
          </p>
        </div>

        <div className="mt-3 rounded-xl border border-border px-4 py-3">
          <div className="flex items-baseline justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
              <Users size={12} aria-hidden="true" /> Por invitado
            </span>
            <span className="text-base font-semibold text-foreground">{formatMXN(Math.round(total / details.guests))}</span>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            Con {details.guests} invitados, cada quien “cuesta” {formatMXN(Math.round(total / details.guests))} y lo apartas
            hoy por {formatMXN(Math.round(apartadoDe(total) / details.guests))} por persona.
          </p>
        </div>
      </div>
      <QuoteForm />
    </aside>
  );
}

/* ------------------------------ Cotización --------------------------------- */

function QuoteForm() {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  if (sent) {
    return (
      <div className="mt-4 flex flex-col items-center rounded-2xl border border-border px-6 py-10 text-center">
        <span className="inline-flex size-14 items-center justify-center rounded-full bg-foreground text-background">
          <Check size={24} />
        </span>
        <h3 className="mt-6 font-serif text-2xl font-medium tracking-tight text-foreground">Cotización en camino.</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Un coordinador de Momentum te contactará en menos de 24 horas para confirmar disponibilidad y apartado.
        </p>
        <Link
          href="/marketplace"
          className="mt-6 rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-secondary"
        >
          Seguir explorando
        </Link>
      </div>
    );
  }

  return (
    <form
      id="apartado"
      className="mt-4 flex scroll-mt-32 flex-col gap-3 rounded-2xl border border-border p-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (name.trim() && email.trim()) setSent(true);
      }}
    >
      <SectionLabel className="justify-center">¿Listo para apartar?</SectionLabel>
      <input
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Tu nombre"
        className="w-full rounded-full border border-border bg-background px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      />
      <input
        required
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Correo electrónico"
        className="w-full rounded-full border border-border bg-background px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      />
      <button
        type="submit"
        className="rounded-full bg-foreground px-5 py-3.5 text-sm font-medium text-background transition-[opacity,transform] hover:opacity-90 active:scale-[0.97]"
      >
        Solicitar cotización consolidada
      </button>
    </form>
  );
}

/* ------------------------------- Empty state -------------------------------- */

function EmptyState() {
  return (
    <div className="relative flex flex-col items-center overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-secondary/40 to-transparent px-6 py-16 text-center sm:py-20">
      {/* Blobs decorativos de fondo */}
      <span aria-hidden className="pointer-events-none absolute -left-16 -top-16 size-48 rounded-full bg-gold/15 blur-3xl" />
      <span aria-hidden className="pointer-events-none absolute -bottom-20 -right-14 size-56 rounded-full bg-foreground/5 blur-3xl" />

      {/* Ilustración SVG: calendario + globo + confeti */}
      <svg viewBox="0 0 120 120" className="size-28" role="img" aria-label="Ilustración de planeación de evento">
        <defs>
          <linearGradient id="es-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f5f0e6" />
            <stop offset="100%" stopColor="#e9dcc3" />
          </linearGradient>
          <linearGradient id="es-gold" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#c9a45c" />
            <stop offset="100%" stopColor="#b08d57" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="54" fill="url(#es-bg)" />
        {/* globo */}
        <g transform="rotate(-12 92 26)">
          <circle cx="92" cy="26" r="13" fill="none" stroke="url(#es-gold)" strokeWidth="2.5" />
          <path d="M92 39l6 12M92 39l-6 12M92 39v12" stroke="url(#es-gold)" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M85 18l7 8 7-8" fill="none" stroke="url(#es-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        {/* calendario */}
        <g>
          <rect x="30" y="34" width="48" height="50" rx="9" fill="#fff" stroke="#d6c8ab" strokeWidth="2" />
          <path d="M30 50h48" stroke="#d6c8ab" strokeWidth="2" />
          <rect x="42" y="28" width="5" height="14" rx="2.5" fill="#c9a45c" />
          <rect x="60" y="28" width="5" height="14" rx="2.5" fill="#c9a45c" />
          <path d="M50 62l4-6h-7" fill="none" stroke="#1c1917" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M54 56v8h8" fill="none" stroke="#1c1917" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="70" cy="72" r="2" fill="#1c1917" />
          <circle cx="70" cy="78" r="2" fill="#1c1917" />
          <circle cx="70" cy="66" r="2" fill="#1c1917" />
        </g>
        {/* confeti */}
        <path d="M20 62l6-10 6 6-9 7z" fill="#c9a45c" opacity="0.9" />
        <path d="M104 58l5-9 5 5-8 7z" fill="#a8607a" opacity="0.75" />
        <circle cx="24" cy="92" r="3.5" fill="#a8607a" opacity="0.8" />
        <circle cx="100" cy="90" r="3" fill="#6f7d5a" opacity="0.8" />
        <path d="M86 34l3-7 4 3-5 6z" fill="#6f7d5a" opacity="0.7" />
        <path d="M28 34l3-6 4 3-5 5z" fill="#1c1917" opacity="0.35" />
      </svg>

      <h2 className="mt-6 font-serif text-3xl font-medium tracking-tight text-foreground">Tu evento empieza aquí.</h2>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        Explora el marketplace y toca <strong className="font-medium text-foreground">“Agregar a mi Evento”</strong> en los
        servicios que te enamoren. Aquí los verás todos juntos, con tu presupuesto y checklist en vivo.
      </p>
      <Link
        href="/marketplace"
        className="mt-8 inline-flex min-h-11 items-center rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-transform hover:scale-[1.02] hover:opacity-90 active:scale-95"
      >
        Explorar servicios
      </Link>
      <div className="mt-10 flex flex-col items-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          O empieza con una plantilla
        </p>
        <p className="mt-2 max-w-md text-xs leading-relaxed text-muted-foreground">
          Un clic y te pre-agregamos los proveedores mejor valorados de las categorías clave. Luego ajustas a tu gusto.
        </p>
        <div className="mt-4 flex justify-center">
          <TemplatePicker />
        </div>
      </div>
      <div className="mt-8 flex max-w-lg flex-wrap justify-center gap-2">
        {CATEGORIES.slice(0, 6).map((cat) => (
          <Link
            key={cat.slug}
            href={`/marketplace?category=${cat.slug}`}
            className="hit-44 inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            {cat.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

/* --------------------------- Tareas de planeación -------------------------- */

const TASK_DUE_OPTIONS = [180, 120, 90, 60, 45, 30, 21, 14, 7];

function TasksSection() {
  const { tasks, details, toggleTask, addTask, removeTask } = useEvent();
  const [newLabel, setNewLabel] = useState("");
  const [newDue, setNewDue] = useState("30");

  const doneCount = tasks.filter((t) => t.done).length;
  const pct = tasks.length === 0 ? 0 : Math.round((doneCount / tasks.length) * 100);
  const sorted = useMemo(
    () => [...tasks].sort((a, b) => Number(a.done) - Number(b.done) || b.dueDays - a.dueDays),
    [tasks]
  );

  const dueDateOf = (t: EventTask) => {
    if (!details.date) return null;
    const d = new Date(details.date);
    d.setDate(d.getDate() - t.dueDays);
    return d;
  };

  const seedSuggested = () => {
    const existing = new Set(tasks.map((t) => t.label));
    for (const s of SUGGESTED_TASKS[details.type] ?? SUGGESTED_TASKS.otro) {
      if (!existing.has(s.label)) addTask(s.label, s.dueDays);
    }
  };

  const handleAdd = () => {
    const label = newLabel.trim();
    if (!label) return;
    addTask(label, Number(newDue));
    setNewLabel("");
  };

  return (
    <section id="tareas" {...fade(450, "scroll-mt-32")}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionLabel>
          <ListTodo size={14} aria-hidden="true" /> Tareas de planeación
        </SectionLabel>
        <div className="flex items-center gap-2">
          {tasks.length > 0 && (
            <span className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-foreground">
              {doneCount} de {tasks.length}
            </span>
          )}
          <button
            type="button"
            onClick={seedSuggested}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            title="Agrega las tareas sugeridas para tu tipo de evento"
          >
            <Sparkles size={12} /> Sugerir tareas
          </button>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="mt-4 flex flex-col items-center rounded-2xl border border-dashed border-border px-6 py-10 text-center">
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Además de contratar, hay mucho por hacer: enviar invitaciones, pruebas de menú, confirmar asistencias…
            Crea tu primera tarea o deja que te sugiramos las típicas según tu tipo de evento.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-gradient-to-r from-foreground/50 to-foreground transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <ul className="mt-5 grid gap-2.5 md:grid-cols-2">
            {sorted.map((t) => {
              const due = dueDateOf(t);
              const overdue = !t.done && due !== null && due.getTime() < Date.now();
              return (
                <li
                  key={t.id}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl border border-border px-4 py-3 transition-colors",
                    t.done && "bg-secondary/60"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleTask(t.id)}
                    aria-pressed={t.done}
                    aria-label={t.done ? `Marcar pendiente: ${t.label}` : `Marcar hecha: ${t.label}`}
                    className={cn(
                      "inline-flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                      t.done ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"
                    )}
                  >
                    {t.done && <Check size={13} />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className={cn("truncate text-sm font-medium text-foreground", t.done && "text-muted-foreground line-through")}>
                      {t.label}
                    </p>
                    <p className={cn("mt-0.5 inline-flex items-center gap-1 text-[11px]", overdue ? "font-medium text-destructive" : "text-muted-foreground")}>
                      <Hourglass size={10} aria-hidden="true" />
                      {due
                        ? overdue
                          ? `Venció el ${due.toLocaleDateString("es-MX", { day: "numeric", month: "short" })}`
                          : `Antes del ${due.toLocaleDateString("es-MX", { day: "numeric", month: "short" })}`
                        : `${t.dueDays} días antes del evento`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTask(t.id)}
                    className="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-opacity hover:bg-secondary hover:text-destructive group-hover:opacity-100"
                    aria-label={`Eliminar tarea ${t.label}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <form
        className="mt-4 flex flex-wrap items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          handleAdd();
        }}
      >
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="Nueva tarea… (ej. contratar mariachi)"
          className="min-w-0 flex-1 rounded-full border border-border bg-transparent px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
          aria-label="Nueva tarea"
        />
        <Select value={newDue} onValueChange={setNewDue}>
          <SelectTrigger className="h-10 w-auto gap-1.5 rounded-full border-border px-3 text-xs" aria-label="Vencimiento">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {TASK_DUE_OPTIONS.map((d) => (
              <SelectItem key={d} value={String(d)}>
                {d} días antes
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <button
          type="submit"
          disabled={!newLabel.trim()}
          className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2.5 text-xs font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          <Plus size={12} /> Agregar
        </button>
      </form>
    </section>
  );
}

/* --------------------------- Exportar / importar --------------------------- */

function ExportEventButton() {
  const { items, details, wedding } = useEvent();
  const handleExport = () => {
    const payload = {
      items: items.map((item) => ({
        vendorId: item.vendor.id,
        date: item.date?.toISOString(),
        note: item.note,
        status: item.status,
      })),
      details: {
        name: details.name,
        type: details.type,
        date: details.date?.toISOString(),
        guests: details.guests,
        budget: details.budget,
      },
      wedding,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mi-evento-momentum.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Evento exportado como JSON");
  };
  return (
    <button
      type="button"
      id="btn-exportar"
      onClick={handleExport}
      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      title="Descarga tu evento como archivo JSON para respaldarlo o moverlo a otro dispositivo"
    >
      <Download size={12} /> Exportar
    </button>
  );
}
function ImportEventButton() {
  const { importEvent } = useEvent();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [result, setResult] = useState<"ok" | "error" | null>(null);

  const handleImport = () => {
    const ok = importEvent(text);
    setResult(ok ? "ok" : "error");
    if (ok) {
      toast.success("Evento importado correctamente");
      setText("");
      setTimeout(() => {
        setOpen(false);
        setResult(null);
      }, 1200);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          id="btn-importar"
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          title="Importa un evento exportado previamente"
        >
          <Upload size={12} /> Importar
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Importar evento</DialogTitle>
          <DialogDescription>
            Pega el contenido del archivo JSON que exportaste. Se reemplazará tu evento actual.
          </DialogDescription>
        </DialogHeader>
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setResult(null);
          }}
          rows={8}
          placeholder='{"items": [...], "details": {...}}'
          className="mt-2 w-full rounded-xl border border-border bg-transparent p-3 font-mono text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-foreground focus:outline-none"
          aria-label="JSON del evento"
        />
        {result === "error" && (
          <p className="text-xs font-medium text-destructive">Ese JSON no es válido. Verifica que sea el archivo exportado completo.</p>
        )}
        {result === "ok" && <p className="text-xs font-medium text-foreground">¡Listo! Tu evento se importó correctamente.</p>}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleImport}
            disabled={!text.trim()}
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-5 py-2.5 text-xs font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <Upload size={12} /> Importar evento
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------------- Página ---------------------------------- */

export function MiEventoClient() {
  const { items, details, wedding, updateDetails, hydrated, removeItem, addItem, updateItemNote, updateItemStatus } = useEvent();
  const router = useRouter();
  const palette = usePaletteHotkey();
  const isMobile = useIsMobile();
  const [editingName, setEditingName] = useState(false);
  const [lastRemoved, setLastRemoved] = useState<EventItem | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  const toggleCompare = (vendor: Vendor) => {
    setCompareIds((prev) =>
      prev.includes(vendor.id)
        ? prev.filter((id) => id !== vendor.id)
        : prev.length >= MAX_COMPARE
          ? prev
          : [...prev, vendor.id]
    );
  };

  const compareVendors = useMemo(
    () => compareIds.map((id) => VENDORS.find((v) => v.id === id)).filter((v): v is Vendor => v !== undefined),
    [compareIds]
  );

  const displayName = details.name.trim() || "Mi evento";
  const coveredCategories = new Set(items.map((i) => i.vendor.category));
  const checklistComplete = items.length > 0 && coveredCategories.size >= CATEGORIES.length;

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const copyGuestLink = async () => {
    try {
      const code = encodeWeddingShare(wedding, details);
      await navigator.clipboard.writeText(`${window.location.origin}/mi-evento/boda#s=${code}`);
    } catch {
      // clipboard unavailable
    }
  };

  const paletteGroups: PaletteGroup[] = [
    {
      heading: "Ir a",
      actions: [
        { id: "nav-detalles", label: "Detalles del evento", icon: <CalendarDays size={16} />, keywords: ["fecha", "invitados", "nombre"], onSelect: () => scrollTo("detalles") },
        ...(details.type === "boda"
          ? [{ id: "nav-boda", label: "Página de nuestra boda", icon: <Heart size={16} />, keywords: ["boda", "web", "invitados"], onSelect: () => router.push("/mi-evento/boda") }]
          : []),
        ...(items.length > 0
          ? [
              { id: "nav-servicios", label: "Servicios", icon: <Sparkles size={16} />, keywords: ["proveedores"], onSelect: () => scrollTo("servicios") },
              { id: "nav-presupuesto", label: "Presupuesto", icon: <Wallet size={16} />, keywords: ["dinero", "apartado", "costo"], onSelect: () => scrollTo("presupuesto") },
              { id: "nav-tareas", label: "Tareas", icon: <ListTodo size={16} />, keywords: ["checklist", "pendientes"], onSelect: () => scrollTo("tareas") },
            ]
          : []),
      ],
    },
    {
      heading: "Acciones",
      actions: [
        { id: "act-explorar", label: "Explorar servicios", icon: <Plus size={16} />, keywords: ["marketplace", "agregar"], onSelect: () => router.push("/marketplace") },
        ...(compareIds.length > 0
          ? [{ id: "act-comparar", label: `Comparar seleccionados (${compareIds.length})`, icon: <ArrowUpDown size={16} />, keywords: ["versus", "comparador"], onSelect: () => setCompareOpen(true) }]
          : []),
        { id: "act-exportar", label: "Exportar evento", icon: <Download size={16} />, keywords: ["json", "respaldo", "descargar"], onSelect: () => document.getElementById("btn-exportar")?.click() },
        ...(details.type === "boda"
          ? [{ id: "act-copiar", label: "Copiar enlace para invitados", icon: <Link2 size={16} />, keywords: ["compartir", "link"], onSelect: copyGuestLink }]
          : []),
        { id: "act-tour", label: "Ver el tour de bienvenida", icon: <Sparkles size={16} />, keywords: ["ayuda", "guía", "onboarding"], onSelect: () => openTour() },
      ],
    },
  ];

  const handleRemoveItem = (item: EventItem) => {
    removeItem(item.vendor.id);
    setLastRemoved(item);
    toast(`Quitaste ${item.vendor.name}`, {
      duration: 4500,
      action: {
        label: "Deshacer",
        onClick: () => {
          addItem(item.vendor, item.date);
          if (item.note) updateItemNote(item.vendor.id, item.note);
          if (item.status) updateItemStatus(item.vendor.id, item.status);
          setLastRemoved(null);
        },
      },
    });
  };

  useEffect(() => {
    if (!lastRemoved) return;
    const t = setTimeout(() => setLastRemoved(null), 4600);
    return () => clearTimeout(t);
  }, [lastRemoved]);

  useEffect(() => {
    if (!hydrated || !checklistComplete) return;
    try {
      if (window.sessionStorage.getItem("momentum-checklist-celebrated")) return;
      window.sessionStorage.setItem("momentum-checklist-celebrated", "1");
    } catch {
      // storage unavailable; celebrate anyway
    }
    setCelebrate(true);
    const t = setTimeout(() => setCelebrate(false), 4800);
    return () => clearTimeout(t);
  }, [hydrated, checklistComplete]);

  return (
    <main className="editorial min-h-screen bg-background pb-24">
      <a
        href="#detalles"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-full focus:bg-foreground focus:px-4 focus:py-2 focus:text-sm focus:text-background"
      >
        Saltar al contenido
      </a>
      <MiEventoHeader count={items.length} onOpenPalette={() => palette.setOpen(true)} />

      {/* Hero */}
      <div className="relative overflow-hidden px-6 pb-10 pt-32 md:px-12 md:pt-40 lg:px-20">
        {/* Blobs decorativos */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="animate-float absolute -top-24 right-[8%] h-72 w-72 rounded-full bg-foreground/[0.05] blur-3xl" />
          <div className="animate-float absolute bottom-0 left-[4%] h-56 w-56 rounded-full bg-foreground/[0.04] blur-3xl [animation-delay:2s]" />
        </div>
        <div className="relative">
          <p {...fade(0, "text-xs uppercase tracking-[0.28em] text-muted-foreground")}>
            Planeador interactivo
          </p>
          <div {...fade(100)} className="mt-4 max-w-3xl">
            {editingName ? (
              <input
                autoFocus
                value={details.name}
                onChange={(e) => updateDetails({ name: e.target.value })}
                onBlur={() => setEditingName(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === "Escape") setEditingName(false);
                }}
                placeholder="Mi evento"
                className="w-full border-b-2 border-foreground bg-transparent font-serif text-5xl font-medium leading-[0.95] tracking-tight text-foreground placeholder:text-muted-foreground/50 focus:outline-none md:text-7xl"
                aria-label="Nombre de tu evento"
              />
            ) : (
              <button
                type="button"
                id="me-nombre"
                onClick={() => setEditingName(true)}
                className="group flex items-start gap-3 text-left font-serif text-5xl font-medium leading-[0.95] tracking-tight text-foreground md:text-7xl"
                title="Toca para nombrar tu evento"
              >
                <span className={cn(!details.name.trim() && "text-muted-foreground/60")}>{displayName}</span>
                <Pencil size={22} className="mt-2 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            )}
          </div>
          <p {...fade(200, "mt-6 max-w-xl leading-relaxed text-muted-foreground")}>
            Ponle nombre, elige la fecha y arma tu equipo de proveedores pieza por pieza. Todo se guarda automáticamente.
          </p>
          <SummaryBar items={items} />
          <PlanningProgress items={items} />
          <StepsGuide done={checklistComplete} />
        </div>
      </div>

      {!hydrated ? (
        <div
          className="flex flex-col gap-12 px-6 md:px-12 lg:px-20"
          aria-busy="true"
          aria-label="Cargando tu evento"
        >
          <div className="flex flex-col gap-4">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-52 w-full rounded-3xl" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-44 rounded-2xl" />
            <Skeleton className="hidden h-44 rounded-2xl sm:block" />
            <Skeleton className="hidden h-44 rounded-2xl lg:block" />
          </div>
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      ) : (
        <div className="flex flex-col gap-12 px-6 md:px-12 lg:px-20">
          <SectionNav show={items.length > 0} />
          <Reveal>
            <div id="detalles" className="scroll-mt-32">
              <DetailsSection />
            </div>
          </Reveal>
          {details.type === "boda" && (
            <Reveal>
              <WeddingCTA />
            </Reveal>
          )}
          {items.length === 0 ? (
            <div {...fade(300)}>
              <EmptyState />
            </div>
          ) : (
            <>
              <Reveal>
                <ChecklistSection items={items} />
              </Reveal>
              <Reveal>
                <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
                  <div id="servicios" className="scroll-mt-32">
                    <ServicesSection items={items} onRemoveItem={handleRemoveItem} compareIds={compareIds} onToggleCompare={toggleCompare} />
                  </div>
                  <div id="presupuesto" className="scroll-mt-32">
                    <BudgetPanel items={items} />
                  </div>
                </div>
              </Reveal>
              <Reveal>
                <TasksSection />
              </Reveal>
            </>
          )}
          <Reveal>
            <RecommendationsSection items={items} compareIds={compareIds} onToggleCompare={toggleCompare} />
          </Reveal>
          {items.length > 0 && <div aria-hidden="true" className="h-16 md:hidden" />}
        </div>
      )}

      <Confetti show={celebrate} />
      <WelcomeTour />
      <Toaster position={isMobile ? "bottom-center" : "bottom-right"} />
      <CommandPalette open={palette.open} onOpenChange={palette.setOpen} groups={paletteGroups} placeholder="Busca una sección o acción…" />

      <CompareBar count={compareIds.length} lifted={lastRemoved !== null} onOpen={() => setCompareOpen(true)} />
      <MobileCtaBar items={items} />
      <CompareSheet
        vendors={compareVendors}
        items={items}
        open={compareOpen}
        onOpenChange={setCompareOpen}
        onRemove={(id) => setCompareIds((prev) => prev.filter((x) => x !== id))}
      />
    </main>
  );
}
