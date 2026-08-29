"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CakeSlice,
  CalendarDays,
  Camera,
  Candy,
  Car,
  Check,
  Gem,
  Heart,
  Hourglass,
  Landmark,
  Moon,
  Music,
  Palette,
  PartyPopper,
  Pencil,
  Plus,
  Printer,
  Shirt,
  Sparkles,
  Star,
  Sun,
  Trash2,
  Undo2,
  Users,
  UtensilsCrossed,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { FadeImage } from "@/components/fade-image";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { useEvent, type EventItem, type EventType } from "@/lib/event-context";
import { CATEGORIES, formatMXN, type Vendor, type VendorCategory } from "@/lib/marketplace-data";
import { recommendVendors, type Recommendation } from "@/lib/recommendations";
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

/* ---------------------------------- Header --------------------------------- */

function MiEventoHeader({ count }: { count: number }) {
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
          isScrolled ? "bg-foreground/85 shadow-2xl backdrop-blur-md" : "bg-foreground shadow-lg"
        )}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/marketplace"
            className="inline-flex size-9 items-center justify-center rounded-full border border-background/20 text-background hover:bg-background/10"
            aria-label="Volver al marketplace"
          >
            <ArrowLeft size={16} />
          </Link>
          <Link href="/mi-evento" className="flex items-baseline gap-2 font-serif text-xl tracking-tight text-background">
            Momentum <span className="font-sans text-[10px] uppercase tracking-[0.18em] opacity-70">Mi Evento</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="inline-flex size-9 items-center justify-center rounded-full border border-background/20 text-background hover:bg-background/10"
            aria-label={mounted && resolvedTheme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {mounted && resolvedTheme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
          </button>
          <Link
            href="/marketplace"
            className="relative inline-flex items-center gap-2 rounded-full bg-background px-5 py-2 text-sm font-medium text-foreground hover:bg-background/90"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Explorar servicios</span>
            {count > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex size-5 items-center justify-center rounded-full bg-foreground text-[10px] font-semibold text-background ring-2 ring-background">
                {count}
              </span>
            )}
          </Link>
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

  const pills = [
    {
      icon: CalendarDays,
      label: details.date
        ? details.date.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })
        : "Sin fecha",
    },
    { icon: Users, label: `${details.guests} invitados` },
    { icon: Sparkles, label: `${items.length} ${items.length === 1 ? "servicio" : "servicios"}` },
    { icon: Wallet, label: `${pct}% del presupuesto` },
  ];

  if (details.date) {
    const daysLeft = Math.ceil((details.date.getTime() - Date.now()) / 86400000);
    if (daysLeft >= 0) {
      pills.splice(1, 0, {
        icon: Hourglass,
        label: daysLeft === 0 ? "¡Es hoy!" : daysLeft === 1 ? "¡Falta 1 día!" : `Faltan ${daysLeft} días`,
      });
    }
  }

  return (
    <div {...fade(300, "mt-8 flex flex-wrap gap-2")}>
      {pills.map((p) => (
        <span
          key={p.label}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2 text-xs font-medium text-foreground backdrop-blur-sm"
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
  ];
  return (
    <nav
      {...fade(200, "sticky top-24 z-40 mx-auto flex w-fit gap-1 rounded-full border border-border bg-background/85 p-1.5 shadow-lg backdrop-blur-md")}
      aria-label="Secciones de tu evento"
    >
      {links.map((l) => (
        <button
          key={l.id}
          type="button"
          onClick={() => document.getElementById(l.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
          className="rounded-full px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
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
          className="mt-3 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
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
  const { details, updateDetails } = useEvent();
  return (
    <section {...fade(200)}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">Detalles de tu evento</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border p-5">
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
                  "rounded-full px-3.5 py-2 text-xs font-medium transition-colors",
                  details.type === t.id
                    ? "bg-foreground text-background"
                    : "border border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border p-5">
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
        <div className="rounded-2xl border border-border p-5">
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
        <div className="rounded-2xl border border-border p-5">
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
  return (
    <section {...fade(250)}>
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
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">Checklist de tu evento</p>
        <p className="text-sm text-muted-foreground">
          {covered.size} de {CATEGORIES.length} categorías
        </p>
      </div>
      <div className="mt-4 flex flex-col gap-6 rounded-2xl border border-border p-6 sm:flex-row sm:items-center">
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
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary"
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
      <input
        autoFocus
        defaultValue={item.note ?? ""}
        placeholder="Ej. pedir paquete con saxofonista"
        onBlur={(e) => {
          updateItemNote(item.vendor.id, e.target.value.trim());
          setEditing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === "Escape") {
            updateItemNote(item.vendor.id, e.currentTarget.value.trim());
            setEditing(false);
          }
        }}
        className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring"
        aria-label={`Nota para ${item.vendor.name}`}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="group inline-flex items-center gap-1.5 text-left text-xs text-muted-foreground hover:text-foreground"
    >
      <Pencil size={11} className="shrink-0" />
      <span className={cn("truncate", item.note && "italic")}>{item.note || "Agregar nota"}</span>
    </button>
  );
}

function ServicesSection({ items, onRemoveItem }: { items: EventItem[]; onRemoveItem: (item: EventItem) => void }) {
  const groups = useMemo(() => {
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
  }, [items]);

  return (
    <section {...fade(400)}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">Servicios de tu evento</p>
        <Link href="/marketplace" className="inline-flex items-center gap-1 text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground">
          Agregar más <ArrowRight size={13} />
        </Link>
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
                <li
                  key={item.vendor.id}
                  className="flex animate-fade-in items-center gap-4 rounded-2xl border border-border p-4 opacity-0 transition-shadow hover:shadow-md"
                  style={{ animationDelay: `${400 + i * 70}ms`, animationFillMode: "forwards" }}
                >
                  <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-secondary">
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
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2.5">
                    <span className="text-sm font-semibold text-foreground">{formatMXN(item.vendor.basePrice)}</span>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item)}
                      className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-destructive"
                      aria-label={`Quitar ${item.vendor.name}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ----------------------------- Recomendaciones ----------------------------- */

function RecommendationCard({ rec, index }: { rec: Recommendation; index: number }) {
  const { addItem, details } = useEvent();
  const { vendor } = rec;

  return (
    <article
      className="flex animate-fade-in flex-col overflow-hidden rounded-2xl border border-border opacity-0"
      style={{ animationDelay: `${index * 70}ms`, animationFillMode: "forwards" }}
    >
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
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-2 text-xs font-medium text-background transition-opacity hover:opacity-90"
          >
            <Plus size={13} />
            Agregar
          </button>
        </div>
      </div>
    </article>
  );
}

function RecommendationsSection({ items }: { items: EventItem[] }) {
  const { details } = useEvent();
  const recommendations = useMemo(() => recommendVendors(items, details), [items, details]);

  if (recommendations.length === 0) return null;

  return (
    <section {...fade(350)}>
      <div className="flex items-center justify-between">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
          <Sparkles size={14} /> Recomendados para tu evento
        </p>
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
          <RecommendationCard key={rec.vendor.id} rec={rec} index={i} />
        ))}
      </div>
    </section>
  );
}

/* ------------------------------- Presupuesto ------------------------------- */

function BudgetPanel({ items }: { items: EventItem[] }) {
  const { details } = useEvent();
  const total = items.reduce((sum, item) => sum + item.vendor.basePrice, 0);
  const over = total > details.budget;
  const fillPct = Math.min(100, Math.round((total / details.budget) * 100));

  return (
    <aside {...fade(500, "lg:sticky lg:top-28")}>
      <div className="rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">Presupuesto</p>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            title="Imprimir o guardar como PDF"
          >
            <Printer size={12} /> Imprimir
          </button>
        </div>
        <div className="mt-4 flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">Estimado base</span>
          <span className="font-serif text-3xl font-medium tracking-tight text-foreground">{formatMXN(total)}</span>
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
          <ul className="mt-3 flex flex-col gap-1.5">
            {items.map((item) => (
              <li key={item.vendor.id} className="flex items-center justify-between gap-3 text-xs">
                <span className="truncate text-muted-foreground">{item.vendor.name}</span>
                <span className="flex shrink-0 items-baseline gap-2">
                  <span className="text-[10px] text-muted-foreground">apartado {formatMXN(apartadoDe(item.vendor.basePrice))}</span>
                  <span className="font-medium text-foreground">{Math.round((item.vendor.basePrice / total) * 100)}%</span>
                </span>
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
      className="mt-4 flex flex-col gap-3 rounded-2xl border border-border p-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (name.trim() && email.trim()) setSent(true);
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">¿Listo para apartar?</p>
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
        className="rounded-full bg-foreground px-5 py-3.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
      >
        Solicitar cotización consolidada
      </button>
    </form>
  );
}

/* ------------------------------- Empty state -------------------------------- */

function EmptyState() {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border px-6 py-20 text-center">
      <span className="inline-flex size-14 items-center justify-center rounded-full bg-secondary text-foreground">
        <Sparkles size={24} />
      </span>
      <h2 className="mt-6 font-serif text-3xl font-medium tracking-tight text-foreground">Tu evento empieza aquí.</h2>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        Explora el marketplace y toca <strong className="font-medium text-foreground">“Agregar a mi Evento”</strong> en los
        servicios que te enamoren. Aquí los verás todos juntos, con tu presupuesto y checklist en vivo.
      </p>
      <Link
        href="/marketplace"
        className="mt-8 rounded-full bg-foreground px-6 py-3.5 text-sm font-medium text-background hover:opacity-90"
      >
        Explorar servicios
      </Link>
      <div className="mt-8 flex max-w-lg flex-wrap justify-center gap-2">
        {CATEGORIES.slice(0, 6).map((cat) => (
          <Link
            key={cat.slug}
            href={`/marketplace?category=${cat.slug}`}
            className="rounded-full border border-border px-3.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            {cat.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

/* --------------------------------- Página ---------------------------------- */

export function MiEventoClient() {
  const { items, details, updateDetails, hydrated, removeItem, addItem, updateItemNote } = useEvent();
  const [editingName, setEditingName] = useState(false);
  const [lastRemoved, setLastRemoved] = useState<EventItem | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  const displayName = details.name.trim() || "Mi evento";
  const coveredCategories = new Set(items.map((i) => i.vendor.category));
  const checklistComplete = items.length > 0 && coveredCategories.size >= CATEGORIES.length;

  const handleRemoveItem = (item: EventItem) => {
    removeItem(item.vendor.id);
    setLastRemoved(item);
  };

  const handleUndo = () => {
    if (!lastRemoved) return;
    addItem(lastRemoved.vendor, lastRemoved.date);
    if (lastRemoved.note) updateItemNote(lastRemoved.vendor.id, lastRemoved.note);
    setLastRemoved(null);
  };

  useEffect(() => {
    if (!lastRemoved) return;
    const t = setTimeout(() => setLastRemoved(null), 4500);
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
    <main className="min-h-screen bg-background pb-24">
      <MiEventoHeader count={items.length} />

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
          <StepsGuide done={checklistComplete} />
        </div>
      </div>

      {!hydrated ? (
        <div className="px-6 md:px-12 lg:px-20">
          <div className="h-40 animate-pulse rounded-2xl bg-secondary" />
        </div>
      ) : (
        <div className="flex flex-col gap-12 px-6 md:px-12 lg:px-20">
          <SectionNav show={items.length > 0} />
          <div id="detalles" className="scroll-mt-32">
            <DetailsSection />
          </div>
          {details.type === "boda" && <WeddingCTA />}
          {items.length === 0 ? (
            <div {...fade(300)}>
              <EmptyState />
            </div>
          ) : (
            <>
              <ChecklistSection items={items} />
              <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
                <div id="servicios" className="scroll-mt-32">
                  <ServicesSection items={items} onRemoveItem={handleRemoveItem} />
                </div>
                <div id="presupuesto" className="scroll-mt-32">
                  <BudgetPanel items={items} />
                </div>
              </div>
            </>
          )}
          <RecommendationsSection items={items} />
        </div>
      )}

      <Confetti show={celebrate} />

      {lastRemoved && (
        <div className="animate-scale-in fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-full border border-border bg-foreground px-5 py-3 shadow-xl">
          <p className="text-sm text-background">
            Quitaste <strong className="font-semibold">{lastRemoved.vendor.name}</strong>
          </p>
          <button
            type="button"
            onClick={handleUndo}
            className="inline-flex items-center gap-1.5 rounded-full bg-background px-4 py-1.5 text-xs font-semibold text-foreground transition-opacity hover:opacity-80"
          >
            <Undo2 size={12} /> Deshacer
          </button>
        </div>
      )}
    </main>
  );
}
