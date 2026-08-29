"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CalendarPlus,
  Check,
  Copy,
  Gift,
  Heart,
  MapPin,
  Moon,
  Pencil,
  PartyPopper,
  Plus,
  Shirt,
  Sun,
  Trash2,
  Users,
} from "lucide-react";
import { useTheme } from "next-themes";
import { FadeImage } from "@/components/fade-image";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useEvent, type WeddingSite, type WeddingTheme } from "@/lib/event-context";
import { cn } from "@/lib/utils";

const pexels = (id: number, w: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

const HERO_OPTIONS: { id: string; label: string; url: string }[] = [
  { id: "pareja", label: "La pareja", url: pexels(1043474, 1920) },
  { id: "camino", label: "Camino al altar", url: pexels(2959192, 1920) },
  { id: "ramo", label: "El ramo", url: pexels(1721558, 1920) },
  { id: "celebracion", label: "Celebración", url: pexels(931177, 1920) },
  { id: "recepcion", label: "La recepción", url: pexels(1244627, 1920) },
  { id: "clasico", label: "Clásica", url: pexels(1444442, 1920) },
];

const THEMES: Record<WeddingTheme, { label: string; accent: string; soft: string }> = {
  arena: { label: "Arena", accent: "#a16207", soft: "rgba(161, 98, 7, 0.08)" },
  rosa: { label: "Rosa", accent: "#be185d", soft: "rgba(190, 24, 93, 0.08)" },
  oliva: { label: "Oliva", accent: "#4d7c0f", soft: "rgba(77, 124, 15, 0.08)" },
  noche: { label: "Noche", accent: "#334155", soft: "rgba(51, 65, 85, 0.10)" },
};

const DEFAULT_STORY = [
  { title: "Cómo nos conocimos", text: "Todo empezó con una mirada y un café que duró horas." },
  { title: "La propuesta", text: "Entre nervios y lágrimas de felicidad, dijimos que sí al para siempre." },
  { title: "El gran día", text: "Y ahora los queremos a ustedes celebrando con nosotros." },
];

const fade = (delay: number, className?: string) => ({
  className: cn("animate-fade-in opacity-0", className),
  style: { animationDelay: `${delay}ms`, animationFillMode: "forwards" as const },
});

function coupleNames(wedding: WeddingSite) {
  const p1 = wedding.partner1.trim() || "Mariana";
  const p2 = wedding.partner2.trim() || "Diego";
  return { p1, p2, label: `${p1} & ${p2}` };
}

function mapsUrl(venue: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue)}`;
}

/* --------------------------- Botón editar sección --------------------------- */

function EditCornerButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="absolute right-4 top-4 z-20 inline-flex size-9 items-center justify-center rounded-full border border-border bg-background/90 text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:text-foreground"
    >
      <Pencil size={14} />
    </button>
  );
}

/* --------------------------------- Toolbar --------------------------------- */

function BodaToolbar({ onEdit }: { onEdit: () => void }) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  return (
    <header className="fixed left-1/2 top-4 z-50 w-[90%] max-w-6xl -translate-x-1/2">
      <div className="flex items-center justify-between rounded-full bg-foreground/85 px-5 py-3 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link
            href="/mi-evento"
            className="inline-flex size-9 items-center justify-center rounded-full border border-background/20 text-background hover:bg-background/10"
            aria-label="Volver a Mi Evento"
          >
            <ArrowLeft size={16} />
          </Link>
          <span className="flex items-baseline gap-2 font-serif text-xl tracking-tight text-background">
            Momentum <span className="font-sans text-[10px] uppercase tracking-[0.18em] opacity-70">Mi Boda</span>
          </span>
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
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-2 rounded-full bg-background px-5 py-2 text-sm font-medium text-foreground hover:bg-background/90"
          >
            <Pencil size={14} />
            <span className="hidden sm:inline">Editar contenido</span>
          </button>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------- Panel edición ------------------------------ */

function EditField({
  label,
  value,
  onChange,
  placeholder,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
}) {
  const inputClass =
    "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring";
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
      {textarea ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(inputClass, "resize-none")}
        />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputClass} />
      )}
    </label>
  );
}

function EditSheet({
  open,
  onOpenChange,
  target,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: string | null;
}) {
  const { wedding, updateWedding } = useEvent();
  const set = (patch: Partial<WeddingSite>) => updateWedding(patch);

  useEffect(() => {
    if (!open || !target) return;
    const t = setTimeout(() => {
      document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 200);
    return () => clearTimeout(t);
  }, [open, target]);

  const setMoment = (index: number, patch: Partial<{ title: string; text: string }>) => {
    const story = wedding.story.map((m, i) => (i === index ? { ...m, ...patch } : m));
    set({ story });
  };

  const setItineraryEntry = (index: number, patch: Partial<{ time: string; label: string }>) => {
    const itinerary = wedding.itinerary.map((e, i) => (i === index ? { ...e, ...patch } : e));
    set({ itinerary });
  };

  const setGalleryUrl = (index: number, url: string) => {
    const gallery = wedding.gallery.map((u, i) => (i === index ? url : u));
    set({ gallery });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-serif text-2xl tracking-tight">Personaliza tu página</SheetTitle>
          <SheetDescription>
            Cada cambio se refleja al instante en la página. Todo se guarda automáticamente.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-5 px-4 pb-8">
          <div id="edit-portada" className="scroll-mt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Foto de portada</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {HERO_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => set({ heroImage: opt.url })}
                  title={opt.label}
                  aria-label={`Portada: ${opt.label}`}
                  className={cn(
                    "relative aspect-[4/3] overflow-hidden rounded-xl border-2 transition-all",
                    wedding.heroImage === opt.url ? "border-foreground" : "border-transparent opacity-70 hover:opacity-100"
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={opt.url.replace("w=1920", "w=400")} alt={opt.label} className="h-full w-full object-cover" />
                  {wedding.heroImage === opt.url && (
                    <span className="absolute right-1.5 top-1.5 inline-flex size-5 items-center justify-center rounded-full bg-foreground text-background">
                      <Check size={11} />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div id="edit-paleta" className="scroll-mt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Paleta de color</p>
            <div className="mt-2 flex gap-2">
              {(Object.keys(THEMES) as WeddingTheme[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set({ theme: t })}
                  aria-label={`Paleta ${THEMES[t].label}`}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-1.5 rounded-xl border-2 py-3 transition-all",
                    wedding.theme === t ? "border-foreground" : "border-transparent opacity-70 hover:opacity-100"
                  )}
                >
                  <span className="size-7 rounded-full border border-border" style={{ backgroundColor: THEMES[t].accent }} />
                  <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    {THEMES[t].label}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div id="edit-pareja" className="grid grid-cols-2 gap-3 scroll-mt-4">
            <EditField label="Nombre 1" value={wedding.partner1} onChange={(v) => set({ partner1: v })} placeholder="Mariana" />
            <EditField label="Nombre 2" value={wedding.partner2} onChange={(v) => set({ partner2: v })} placeholder="Diego" />
          </div>
          <EditField label="Hashtag" value={wedding.hashtag} onChange={(v) => set({ hashtag: v })} placeholder="#MarianaYDiego" />
          <div id="edit-mensaje" className="scroll-mt-4">
            <EditField
              label="Mensaje de bienvenida"
              value={wedding.message}
              onChange={(v) => set({ message: v })}
              placeholder="Después de tanto tiempo juntos, por fin llegó el día…"
              textarea
            />
          </div>
          <div id="edit-historia" className="flex flex-col gap-3 scroll-mt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">Nuestra historia</p>
            {wedding.story.map((moment, i) => (
              <div key={i} className="flex flex-col gap-3 rounded-xl border border-border p-3">
                <EditField
                  label={`Momento ${i + 1} · título`}
                  value={moment.title}
                  onChange={(v) => setMoment(i, { title: v })}
                  placeholder={DEFAULT_STORY[i]?.title}
                />
                <EditField
                  label={`Momento ${i + 1} · texto`}
                  value={moment.text}
                  onChange={(v) => setMoment(i, { text: v })}
                  placeholder={DEFAULT_STORY[i]?.text}
                  textarea
                />
              </div>
            ))}
          </div>
          <p id="edit-ceremonia" className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground scroll-mt-4">
            Ceremonia
          </p>
          <div className="grid grid-cols-[1fr_110px] gap-3">
            <EditField label="Sede" value={wedding.ceremonyVenue} onChange={(v) => set({ ceremonyVenue: v })} placeholder="Parroquia de San Miguel" />
            <EditField label="Hora" value={wedding.ceremonyTime} onChange={(v) => set({ ceremonyTime: v })} placeholder="5:00 PM" />
          </div>
          <p id="edit-recepcion" className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground scroll-mt-4">
            Recepción
          </p>
          <div className="grid grid-cols-[1fr_110px] gap-3">
            <EditField label="Sede" value={wedding.receptionVenue} onChange={(v) => set({ receptionVenue: v })} placeholder="Hacienda Los Laureles" />
            <EditField label="Hora" value={wedding.receptionTime} onChange={(v) => set({ receptionTime: v })} placeholder="7:30 PM" />
          </div>
          <div id="edit-extras" className="flex flex-col gap-5 scroll-mt-4">
            <EditField label="Código de vestimenta" value={wedding.dressCode} onChange={(v) => set({ dressCode: v })} placeholder="Etiqueta rigurosa" />
            <EditField label="Mesa de regalos" value={wedding.giftTable} onChange={(v) => set({ giftTable: v })} placeholder="Liverpool · Evento 51234567" />
          </div>
          <div id="edit-itinerario" className="flex flex-col gap-3 scroll-mt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">Itinerario del día</p>
            {wedding.itinerary.map((entry, i) => (
              <div key={i} className="flex items-end gap-2">
                <div className="w-24">
                  <EditField label="Hora" value={entry.time} onChange={(v) => setItineraryEntry(i, { time: v })} placeholder="17:00" />
                </div>
                <div className="flex-1">
                  <EditField label="Momento" value={entry.label} onChange={(v) => setItineraryEntry(i, { label: v })} placeholder="Ceremonia" />
                </div>
                <button
                  type="button"
                  onClick={() => set({ itinerary: wedding.itinerary.filter((_, j) => j !== i) })}
                  disabled={wedding.itinerary.length <= 1}
                  aria-label={`Quitar ${entry.label || `momento ${i + 1}`}`}
                  className="mb-1 inline-flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-destructive disabled:opacity-30"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {wedding.itinerary.length < 8 && (
              <button
                type="button"
                onClick={() => set({ itinerary: [...wedding.itinerary, { time: "", label: "" }] })}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-dashed border-border px-4 py-2.5 text-xs font-medium text-muted-foreground hover:border-foreground hover:text-foreground"
              >
                <Plus size={13} /> Agregar momento
              </button>
            )}
          </div>
          <div id="edit-galeria" className="flex flex-col gap-3 scroll-mt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">Galería de fotos</p>
            {wedding.gallery.map((url, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-secondary">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
                </span>
                <input
                  value={url}
                  onChange={(e) => setGalleryUrl(i, e.target.value)}
                  placeholder="https://…"
                  aria-label={`URL de foto ${i + 1}`}
                  className="w-full min-w-0 rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => set({ gallery: wedding.gallery.filter((_, j) => j !== i) })}
                  disabled={wedding.gallery.length <= 1}
                  aria-label={`Quitar foto ${i + 1}`}
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-destructive disabled:opacity-30"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
            {wedding.gallery.length < 8 && (
              <button
                type="button"
                onClick={() => set({ gallery: [...wedding.gallery, ""] })}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-dashed border-border px-4 py-2.5 text-xs font-medium text-muted-foreground hover:border-foreground hover:text-foreground"
              >
                <Plus size={13} /> Agregar foto
              </button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ------------------------------ Cuenta regresiva ---------------------------- */

function useCountdown(target?: Date) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!target || now === null) return null;
  const diff = Math.max(0, target.getTime() - now);
  return {
    done: target.getTime() <= now,
    dias: Math.floor(diff / 86400000),
    horas: Math.floor(diff / 3600000) % 24,
    minutos: Math.floor(diff / 60000) % 60,
    segundos: Math.floor(diff / 1000) % 60,
  };
}

function Countdown({ date }: { date?: Date }) {
  const t = useCountdown(date);
  if (!date) {
    return (
      <Link
        href="/mi-evento"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 text-sm font-medium text-foreground hover:bg-background/90"
      >
        <CalendarDays size={15} /> Elige la fecha en Mi Evento
      </Link>
    );
  }
  if (!t) {
    return <div className="mt-8 h-20" aria-hidden="true" />;
  }
  if (t.done) {
    return (
      <p className="animate-scale-in mt-8 inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 font-serif text-xl italic text-foreground">
        <PartyPopper size={18} /> ¡Hoy es el día!
      </p>
    );
  }
  const cells = [
    { v: t.dias, l: "días" },
    { v: t.horas, l: "horas" },
    { v: t.minutos, l: "min" },
    { v: t.segundos, l: "seg" },
  ];
  return (
    <div className="mt-8 flex gap-3">
      {cells.map((c) => (
        <div
          key={c.l}
          className="flex w-[72px] flex-col items-center rounded-2xl bg-background/10 px-3 py-4 backdrop-blur-md"
        >
          <span className="font-serif text-3xl font-medium tabular-nums">{String(c.v).padStart(2, "0")}</span>
          <span className="mt-1 text-[10px] uppercase tracking-[0.2em] opacity-80">{c.l}</span>
        </div>
      ))}
    </div>
  );
}

/* --------------------------- Acciones para invitados ------------------------- */

function downloadIcs(date: Date, names: string, wedding: WeddingSite) {
  const fmt = (d: Date) =>
    `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}T${String(
      d.getHours()
    ).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}00`;
  const start = new Date(date);
  start.setHours(17, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 0, 0);
  const location = [wedding.ceremonyVenue, wedding.receptionVenue].filter((v) => v.trim()).join(" y ");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Momentum//Mi Boda//ES",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@momentum`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:Boda de ${names}`,
    location ? `LOCATION:${location}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "nuestra-boda.ics";
  a.click();
  URL.revokeObjectURL(url);
}

function GuestActions({ wedding }: { wedding: WeddingSite }) {
  const { details } = useEvent();
  const [copied, setCopied] = useState(false);
  const names = coupleNames(wedding);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* portapapeles no disponible */
    }
  };

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
      {details.date && (
        <button
          type="button"
          onClick={() => downloadIcs(details.date as Date, names.label, wedding)}
          className="inline-flex items-center gap-2 rounded-full border border-white/40 px-5 py-2.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/10"
        >
          <CalendarPlus size={14} /> Agregar al calendario
        </button>
      )}
      <button
        type="button"
        onClick={copyLink}
        className="inline-flex items-center gap-2 rounded-full border border-white/40 px-5 py-2.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/10"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? "¡Enlace copiado!" : "Copiar enlace"}
      </button>
    </div>
  );
}

/* -------------------------------- Secciones -------------------------------- */

function Ornament({ light }: { light?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={cn("flex items-center justify-center gap-3", light && "text-white/70")}
      style={light ? undefined : { color: "var(--wed-accent, currentColor)", opacity: 0.7 }}
    >
      <span className="h-px w-16 bg-current" />
      <Heart size={13} className="fill-current" />
      <span className="h-px w-16 bg-current" />
    </div>
  );
}

function HeroSection({ wedding, onEdit }: { wedding: WeddingSite; onEdit: () => void }) {
  const { details } = useEvent();
  const names = coupleNames(wedding);

  return (
    <section id="inicio" className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 text-center text-white">
      <div className="animate-scale-in absolute inset-0">
        <FadeImage src={wedding.heroImage} alt="Boda" fill priority className="object-cover" />
      </div>
      <div className="absolute inset-0 bg-black/45" />
      <EditCornerButton label="Editar nombres y portada" onClick={onEdit} />
      <div className="relative z-10 flex flex-col items-center">
        <p {...fade(0, "text-xs uppercase tracking-[0.32em] opacity-90")}>Nos casamos</p>
        <h1 {...fade(150, "mt-6 font-serif text-6xl font-medium leading-[0.95] tracking-tight md:text-8xl")}>
          {names.p1}
          <span className="mx-3 font-light italic md:mx-5">&</span>
          {names.p2}
        </h1>
        <div {...fade(250, "mt-8")}>
          <Ornament light />
        </div>
        <p {...fade(300, "mt-6 flex items-center gap-2 text-sm uppercase tracking-[0.24em] opacity-90")}>
          <CalendarDays size={15} />
          {details.date
            ? details.date.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
            : "Fecha por definir"}
        </p>
        <div {...fade(450)}>
          <Countdown date={details.date} />
        </div>
        <div {...fade(600)}>
          <GuestActions wedding={wedding} />
        </div>
      </div>
      <div className="absolute bottom-8 z-10 flex flex-col items-center gap-2 opacity-80">
        <span className="text-[10px] uppercase tracking-[0.28em]">Desliza</span>
        <span className="h-8 w-px animate-pulse bg-white/70" />
      </div>
    </section>
  );
}

function WelcomeSection({ wedding, onEdit }: { wedding: WeddingSite; onEdit: () => void }) {
  const message =
    wedding.message.trim() ||
    "Después de tanto tiempo juntos, por fin llegó el día que soñamos. Queremos celebrarlo rodeados de las personas que más queremos: ustedes. Acompáñanos a escribir el capítulo más bonito de nuestra historia.";
  return (
    <section className="relative mx-auto max-w-2xl px-6 py-20 text-center md:py-28">
      <EditCornerButton label="Editar mensaje" onClick={onEdit} />
      <span
        {...fade(0, "inline-flex size-12 items-center justify-center rounded-full")}
        style={{ animationDelay: "0ms", animationFillMode: "forwards", backgroundColor: "var(--wed-soft)", color: "var(--wed-accent)" }}
      >
        <Heart size={20} className="fill-current" />
      </span>
      <h2 {...fade(100, "mt-6 font-serif text-3xl font-medium tracking-tight text-foreground md:text-4xl")}>
        Bienvenidos a nuestra boda
      </h2>
      <p {...fade(200, "mt-6 leading-relaxed text-muted-foreground")}>{message}</p>
      {wedding.hashtag.trim() && (
        <p {...fade(300, "mt-6 font-serif text-xl italic text-foreground")}>{wedding.hashtag}</p>
      )}
    </section>
  );
}

function GallerySection({ wedding, onEdit }: { wedding: WeddingSite; onEdit: () => void }) {
  const photos = wedding.gallery.filter((u) => u.trim());
  if (photos.length === 0) return null;
  return (
    <section className="relative mx-auto max-w-5xl px-6 pb-20">
      <EditCornerButton label="Editar galería" onClick={onEdit} />
      <div className={cn("grid grid-cols-2 gap-3", photos.length > 2 && "md:grid-cols-4")}>
        {photos.map((src, i) => (
          <div
            key={`${i}-${src}`}
            {...fade(i * 100, "group relative aspect-[3/4] overflow-hidden rounded-2xl bg-secondary")}
          >
            <FadeImage
              src={src}
              alt={`Momento ${i + 1}`}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function StorySection({ wedding, onEdit }: { wedding: WeddingSite; onEdit: () => void }) {
  const moments = wedding.story.map((m, i) => ({
    title: m.title.trim() || DEFAULT_STORY[i]?.title || "",
    text: m.text.trim() || DEFAULT_STORY[i]?.text || "",
  }));

  return (
    <section id="historia" className="relative mx-auto max-w-2xl scroll-mt-24 px-6 pb-20 md:pb-28">
      <EditCornerButton label="Editar historia" onClick={onEdit} />
      <h2 {...fade(0, "text-center font-serif text-3xl font-medium tracking-tight text-foreground md:text-4xl")}>
        Nuestra historia
      </h2>
      <div {...fade(100, "mt-6")}>
        <Ornament />
      </div>
      <ol className="relative mt-12 flex flex-col gap-10 border-l-2 border-border pl-8">
        {moments.map((m, i) => (
          <li key={i} {...fade(150 + i * 120, "relative")}>
            <span
              className="absolute -left-[41px] top-1 inline-flex size-5 items-center justify-center rounded-full"
              style={{ backgroundColor: "var(--wed-accent)" }}
            >
              <Heart size={10} className="fill-background text-background" />
            </span>
            <p className="font-serif text-xl font-medium tracking-tight text-foreground">{m.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{m.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function VenueCard({
  title,
  venue,
  time,
  delay,
}: {
  title: string;
  venue: string;
  time: string;
  delay: number;
}) {
  const hasVenue = venue.trim().length > 0;
  return (
    <div {...fade(delay, "flex flex-col items-center rounded-3xl border border-border p-8 text-center md:p-10")}>
      <span
        className="inline-flex size-12 items-center justify-center rounded-full"
        style={{ backgroundColor: "var(--wed-soft)", color: "var(--wed-accent)" }}
      >
        <MapPin size={20} />
      </span>
      <h3 className="mt-5 font-serif text-2xl font-medium tracking-tight text-foreground">{title}</h3>
      <p className="mt-3 text-base font-medium text-foreground">{venue || "Sede por confirmar"}</p>
      <p className="mt-1 text-sm text-muted-foreground">{time || "Hora por confirmar"}</p>
      {hasVenue && (
        <a
          href={mapsUrl(venue)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <MapPin size={12} /> Ver mapa
        </a>
      )}
    </div>
  );
}

function DetailsGrid({ wedding, onEditCeremony, onEditReception }: { wedding: WeddingSite; onEditCeremony: () => void; onEditReception: () => void }) {
  const { details } = useEvent();
  return (
    <section id="detalles" className="mx-auto max-w-4xl scroll-mt-24 px-6 pb-20 md:pb-28">
      <div className="relative grid gap-6 md:grid-cols-2">
        <div className="relative">
          <EditCornerButton label="Editar ceremonia" onClick={onEditCeremony} />
          <VenueCard title="Ceremonia" venue={wedding.ceremonyVenue} time={wedding.ceremonyTime} delay={0} />
        </div>
        <div className="relative">
          <EditCornerButton label="Editar recepción" onClick={onEditReception} />
          <VenueCard title="Recepción" venue={wedding.receptionVenue} time={wedding.receptionTime} delay={100} />
        </div>
      </div>
      <div {...fade(200, "mt-6 grid gap-6 md:grid-cols-2")}>
        <div className="flex flex-col items-center rounded-3xl border border-border p-8 text-center">
          <span
            className="inline-flex size-12 items-center justify-center rounded-full"
            style={{ backgroundColor: "var(--wed-soft)", color: "var(--wed-accent)" }}
          >
            <Shirt size={20} />
          </span>
          <h3 className="mt-5 font-serif text-2xl font-medium tracking-tight text-foreground">Código de vestimenta</h3>
          <p className="mt-3 text-base text-muted-foreground">{wedding.dressCode.trim() || "Etiqueta rigurosa"}</p>
        </div>
        <div className="flex flex-col items-center rounded-3xl border border-border p-8 text-center">
          <span
            className="inline-flex size-12 items-center justify-center rounded-full"
            style={{ backgroundColor: "var(--wed-soft)", color: "var(--wed-accent)" }}
          >
            <Users size={20} />
          </span>
          <h3 className="mt-5 font-serif text-2xl font-medium tracking-tight text-foreground">Invitados</h3>
          <p className="mt-3 text-base text-muted-foreground">
            {details.guests} personas celebrarán con nosotros
          </p>
        </div>
      </div>
    </section>
  );
}

function ItinerarySection({ wedding, onEdit }: { wedding: WeddingSite; onEdit: () => void }) {
  const entries = wedding.itinerary.filter((e) => e.time.trim() || e.label.trim());
  if (entries.length === 0) return null;
  return (
    <section id="itinerario" className="relative scroll-mt-24 px-6 pb-20 md:pb-28">
      <EditCornerButton label="Editar itinerario" onClick={onEdit} />
      <h2 {...fade(0, "text-center font-serif text-3xl font-medium tracking-tight text-foreground md:text-4xl")}>
        Itinerario del día
      </h2>
      <div {...fade(100, "mt-6")}>
        <Ornament />
      </div>
      <ol {...fade(200, "mx-auto mt-12 flex max-w-3xl flex-wrap items-start justify-center gap-y-8")}>
        {entries.map((entry, i) => (
          <li key={i} className="relative flex w-40 flex-col items-center px-4 text-center">
            {i < entries.length - 1 && (
              <span aria-hidden="true" className="absolute left-1/2 top-3.5 -z-10 h-px w-full bg-border" />
            )}
            <span
              className="inline-flex size-7 items-center justify-center rounded-full"
              style={{ backgroundColor: "var(--wed-accent)" }}
            >
              <span className="size-2 rounded-full bg-background" />
            </span>
            <p className="mt-3 font-serif text-lg font-medium tabular-nums text-foreground">{entry.time || "—"}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">{entry.label || "Momento"}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function GiftSection({ wedding, onEdit }: { wedding: WeddingSite; onEdit: () => void }) {
  return (
    <section
      id="regalos"
      className="relative scroll-mt-24 px-6 py-20 md:py-28"
      style={{ backgroundColor: "var(--wed-soft)" }}
    >
      <EditCornerButton label="Editar mesa de regalos" onClick={onEdit} />
      <div className="mx-auto max-w-2xl text-center">
        <span
          {...fade(0, "inline-flex size-12 items-center justify-center rounded-full text-background")}
          style={{ animationDelay: "0ms", animationFillMode: "forwards", backgroundColor: "var(--wed-accent)" }}
        >
          <Gift size={20} />
        </span>
        <h2 {...fade(100, "mt-6 font-serif text-3xl font-medium tracking-tight text-foreground md:text-4xl")}>
          Mesa de regalos
        </h2>
        <p {...fade(200, "mt-4 leading-relaxed text-muted-foreground")}>
          Tu presencia es nuestro mejor regalo, pero si deseas tener un detalle con nosotros:
        </p>
        <p {...fade(300, "mt-6 inline-block rounded-full border border-border bg-background px-6 py-3 font-serif text-lg italic text-foreground")}>
          {wedding.giftTable.trim() || "Mesa de regalos por confirmar"}
        </p>
      </div>
    </section>
  );
}

function RsvpSection({ wedding }: { wedding: WeddingSite }) {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [attending, setAttending] = useState<"si" | "no">("si");
  const names = coupleNames(wedding);

  if (sent) {
    return (
      <section id="rsvp" className="scroll-mt-24 px-6 py-20 md:py-28">
        <div className="animate-scale-in mx-auto flex max-w-md flex-col items-center rounded-3xl border border-border px-8 py-14 text-center">
          <span className="inline-flex size-14 items-center justify-center rounded-full bg-foreground text-background">
            <Check size={24} />
          </span>
          <h2 className="mt-6 font-serif text-3xl font-medium tracking-tight text-foreground">¡Gracias por confirmar!</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {attending === "si"
              ? `${names.p1} y ${names.p2} no pueden esperar a celebrar contigo.`
              : "Te extrañaremos ese día. ¡Gracias por avisarnos!"}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="rsvp" className="scroll-mt-24 px-6 py-20 md:py-28">
      <div className="mx-auto max-w-md">
        <h2 {...fade(0, "text-center font-serif text-3xl font-medium tracking-tight text-foreground md:text-4xl")}>
          Confirma tu asistencia
        </h2>
        <p {...fade(100, "mt-3 text-center text-sm text-muted-foreground")}>
          Ayúdanos a que todo salga perfecto. Confirma antes del gran día.
        </p>
        <form
          {...fade(200, "mt-8 flex flex-col gap-3")}
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim() && email.trim()) setSent(true);
          }}
        >
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre completo"
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
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { id: "si", label: "Sí, ahí estaré" },
                { id: "no", label: "No podré ir" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setAttending(opt.id)}
                className={cn(
                  "rounded-full px-4 py-3 text-sm font-medium transition-colors",
                  attending !== opt.id && "border border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                )}
                style={attending === opt.id ? { backgroundColor: "var(--wed-accent)", color: "#fff" } : undefined}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            type="submit"
            className="rounded-full px-5 py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--wed-accent)" }}
          >
            Confirmar asistencia
          </button>
        </form>
      </div>
    </section>
  );
}

/* --------------------------- Navegación de puntos ---------------------------- */

function DotNav() {
  const links = [
    { id: "inicio", label: "Inicio" },
    { id: "historia", label: "Historia" },
    { id: "detalles", label: "Detalles" },
    { id: "itinerario", label: "Itinerario" },
    { id: "regalos", label: "Regalos" },
    { id: "rsvp", label: "RSVP" },
  ];
  return (
    <nav
      aria-label="Secciones de la página"
      className="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 lg:flex"
    >
      {links.map((l) => (
        <button
          key={l.id}
          type="button"
          title={l.label}
          aria-label={`Ir a ${l.label}`}
          onClick={() => document.getElementById(l.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
          className="group flex items-center justify-end gap-2"
        >
          <span className="rounded-full bg-foreground/80 px-2.5 py-1 text-[10px] font-medium text-background opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
            {l.label}
          </span>
          <span className="size-2.5 rounded-full bg-foreground/40 transition-colors group-hover:bg-foreground" />
        </button>
      ))}
    </nav>
  );
}

/* --------------------------------- Página ---------------------------------- */

export function BodaClient() {
  const { wedding, hydrated } = useEvent();
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<string | null>(null);
  const names = coupleNames(wedding);
  const theme = THEMES[wedding.theme] ?? THEMES.arena;

  const openEdit = (target: string) => {
    setEditTarget(target);
    setEditOpen(true);
  };

  if (!hydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-40 w-full max-w-3xl animate-pulse rounded-3xl bg-secondary" />
      </main>
    );
  }

  return (
    <main
      className="min-h-screen bg-background"
      style={{ "--wed-accent": theme.accent, "--wed-soft": theme.soft } as CSSProperties}
    >
      <BodaToolbar onEdit={() => openEdit("edit-portada")} />
      <DotNav />
      <EditSheet open={editOpen} onOpenChange={setEditOpen} target={editTarget} />
      <HeroSection wedding={wedding} onEdit={() => openEdit("edit-portada")} />
      <WelcomeSection wedding={wedding} onEdit={() => openEdit("edit-mensaje")} />
      <GallerySection wedding={wedding} onEdit={() => openEdit("edit-galeria")} />
      <StorySection wedding={wedding} onEdit={() => openEdit("edit-historia")} />
      <DetailsGrid
        wedding={wedding}
        onEditCeremony={() => openEdit("edit-ceremonia")}
        onEditReception={() => openEdit("edit-recepcion")}
      />
      <ItinerarySection wedding={wedding} onEdit={() => openEdit("edit-itinerario")} />
      <GiftSection wedding={wedding} onEdit={() => openEdit("edit-extras")} />
      <RsvpSection wedding={wedding} />
      <footer className="border-t border-border px-6 py-10 text-center">
        <p className="font-serif text-lg italic text-foreground">{names.label}</p>
        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Hecho con <Link href="/mi-evento" className="underline underline-offset-2 hover:text-foreground">Momentum</Link>
        </p>
      </footer>
    </main>
  );
}
