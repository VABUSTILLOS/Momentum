"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BedDouble,
  CalendarDays,
  CalendarPlus,
  Camera,
  Check,
  ClipboardList,
  Copy,
  ExternalLink,
  Eye,
  Gift,
  Heart,
  HelpCircle,
  Home,
  Link2,
  MapPin,
  MessageCircle,
  MessagesSquare,
  Moon,
  QrCode,
  MoreHorizontal,
  Pencil,
  PartyPopper,
  Plus,
  RefreshCw,
  Send,
  Share2,
  Shirt,
  Sun,
  Trash2,
  Users,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { motion, useReducedMotion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import { FadeImage } from "@/components/fade-image";
import { AlbumSection } from "@/components/mi-evento/album-section";
import { CommandPalette, PaletteButton, usePaletteHotkey, type PaletteGroup } from "@/components/mi-evento/command-palette";
import { FadeUp, Magnetic, OrnamentDivider, SectionHeading, Tilt } from "@/components/mi-evento/editorial";
import { QrInvitationSheet } from "@/components/mi-evento/qr-invitation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { useIsMobile } from "@/components/ui/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  decodeWeddingShare,
  encodeWeddingShare,
  useEvent,
  type WeddingShare,
  type WeddingSite,
  type WeddingTheme,
} from "@/lib/event-context";
import { Reveal } from "@/lib/use-reveal";
import { scrollToSection, useScrollSpy } from "@/lib/use-scroll-spy";
import { cn } from "@/lib/utils";
import {
  BodaViewDetailsContext,
  GuestModeContext,
  useBodaDetails,
  useGuestMode,
  type BodaViewDetails,
} from "@/components/mi-evento/boda-contexts";

/** Barra de progreso de lectura dorada, fija en el borde superior. */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 130, damping: 28, mass: 0.4 });
  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-[#b08d57] via-[#e7c887] to-[#b08d57]"
      style={{ scaleX }}
    />
  );
}

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
  arena: { label: "Dorado", accent: "#92702c", soft: "rgba(146, 112, 44, 0.08)" },
  rosa: { label: "Rosa viejo", accent: "#a8607a", soft: "rgba(168, 96, 122, 0.08)" },
  oliva: { label: "Salvia", accent: "#6f7d5a", soft: "rgba(111, 125, 90, 0.10)" },
  noche: { label: "Medianoche", accent: "#3e4c63", soft: "rgba(62, 76, 99, 0.10)" },
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

function mapsEmbedUrl(venue: string) {
  return `https://www.google.com/maps?q=${encodeURIComponent(venue)}&output=embed`;
}

/* --------------------------- Botón editar sección --------------------------- */

function EditCornerButton({ label, onClick }: { label: string; onClick: () => void }) {
  const guestMode = useGuestMode();
  if (guestMode) return null;
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

function BodaToolbar({ onEdit, guestMode, onToggleGuest, rsvpCount, onShowRsvps, wishCount, onShowWishes, onOpenPalette, onShowQr }: { onEdit: () => void; guestMode: boolean; onToggleGuest: () => void; rsvpCount: number; onShowRsvps: () => void; wishCount: number; onShowWishes: () => void; onOpenPalette: () => void; onShowQr: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const { wedding, details } = useEvent();

  useEffect(() => setMounted(true), []);

  const copyGuestLink = async () => {
    try {
      const hash = encodeWeddingShare(wedding, details);
      await navigator.clipboard.writeText(`${window.location.origin}/mi-evento/boda#s=${hash}`);
      toast.success("Enlace para invitados copiado");
    } catch {
      toast.error("No pudimos copiar el enlace");
    }
  };

  const toggleTheme = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");

  if (guestMode) return null;

  const circleBtn =
    "hit-44 inline-flex size-10 items-center justify-center rounded-full border border-background/20 text-background hover:bg-background/10";

  return (
    <>
      <header className="fixed left-1/2 top-4 z-50 w-[90%] max-w-6xl -translate-x-1/2">
        {/* ---------- Layout móvil (<sm): toolbar compacta + menú "Más" ---------- */}
        <div className="flex items-center justify-between rounded-full border border-[#e7c887]/20 bg-foreground/85 py-2 pl-2.5 pr-2 shadow-[0_20px_60px_-30px_rgba(28,25,23,0.6)] backdrop-blur-xl sm:hidden">
          <div className="flex items-center gap-2">
            <Link href="/mi-evento" className={circleBtn} aria-label="Volver a Mi Evento">
              <ArrowLeft size={16} />
            </Link>
            <span className="font-serif text-lg tracking-tight text-background">Mi Boda</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={onToggleGuest} className={circleBtn} aria-label="Ver la página como invitado" title="Ver como invitado">
              <Eye aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className="hit-44 inline-flex size-10 items-center justify-center rounded-full bg-background text-foreground"
              aria-label="Más opciones"
              title="Más opciones"
            >
              <MoreHorizontal aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* ---------- Layout escritorio (≥sm) ---------- */}
        <div className="hidden items-center justify-between rounded-full border border-[#e7c887]/20 bg-foreground/85 px-5 py-3 shadow-[0_20px_60px_-30px_rgba(28,25,23,0.6)] backdrop-blur-xl sm:flex">
          <div className="flex items-center gap-4">
            <Link href="/mi-evento" className={circleBtn} aria-label="Volver a Mi Evento">
              <ArrowLeft size={16} />
            </Link>
            <span className="flex items-baseline gap-2 font-serif text-xl tracking-tight text-background">
              Momentum <span className="font-sans text-[10px] uppercase tracking-[0.18em] opacity-70">Mi Boda</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <PaletteButton dark onClick={onOpenPalette} />
            <button
              type="button"
              onClick={onToggleGuest}
              className={circleBtn}
              aria-label="Ver la página como invitado"
              title="Ver como invitado"
            >
              <Eye aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onShowRsvps}
              className={`relative ${circleBtn}`}
              aria-label={`Ver respuestas de invitados (${rsvpCount})`}
              title="Respuestas de invitados"
            >
              <ClipboardList aria-hidden="true" />
              {rsvpCount > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-background px-1 text-[10px] font-bold text-foreground">
                  {rsvpCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={onShowWishes}
              className={`relative ${circleBtn}`}
              aria-label={`Ver libro de firmas (${wishCount})`}
              title="Libro de firmas"
            >
              <MessagesSquare aria-hidden="true" />
              {wishCount > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-background px-1 text-[10px] font-bold text-foreground">
                  {wishCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={copyGuestLink}
              className={circleBtn}
              aria-label="Copiar enlace para invitados"
              title="Copiar enlace para invitados"
            >
              <Link2 aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onShowQr}
              className={circleBtn}
              aria-label="QR de invitación"
              title="Genera el QR de invitación para imprimir"
            >
              <QrCode aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className={circleBtn}
              aria-label={mounted && resolvedTheme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {mounted && resolvedTheme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="hit-44 inline-flex items-center gap-2 rounded-full bg-background px-5 py-2.5 text-sm font-medium text-foreground hover:bg-background/90"
            >
              <Pencil size={14} />
              <span className="hidden lg:inline">Editar contenido</span>
            </button>
          </div>
        </div>
      </header>

      {/* ---------- Menú "Más" (móvil) ---------- */}
      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="w-full pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <SheetHeader>
            <SheetTitle className="font-serif text-2xl tracking-tight">Más opciones</SheetTitle>
            <SheetDescription className="sr-only">Acciones rápidas de tu página de boda</SheetDescription>
          </SheetHeader>
          <div className="mt-4 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => {
                setMoreOpen(false);
                onShowRsvps();
              }}
              className="flex min-h-12 items-center gap-3 rounded-xl border border-border bg-secondary/60 px-4 text-left text-sm font-medium text-foreground"
            >
              <ClipboardList size={18} aria-hidden="true" />
              Respuestas de invitados
              {rsvpCount > 0 && (
                <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-foreground px-1.5 py-0.5 text-[10px] font-bold text-background">
                  {rsvpCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setMoreOpen(false);
                onShowWishes();
              }}
              className="flex min-h-12 items-center gap-3 rounded-xl border border-border bg-secondary/60 px-4 text-left text-sm font-medium text-foreground"
            >
              <MessagesSquare size={18} aria-hidden="true" />
              Libro de firmas
              {wishCount > 0 && (
                <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-foreground px-1.5 py-0.5 text-[10px] font-bold text-background">
                  {wishCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={copyGuestLink}
              className="flex min-h-12 items-center gap-3 rounded-xl border border-border bg-secondary/60 px-4 text-left text-sm font-medium text-foreground"
            >
              <Link2 size={18} aria-hidden="true" />
              Copiar enlace para invitados
            </button>
            <button
              type="button"
              onClick={() => {
                setMoreOpen(false);
                onShowQr();
              }}
              className="flex min-h-12 items-center gap-3 rounded-xl border border-border bg-secondary/60 px-4 text-left text-sm font-medium text-foreground"
            >
              <QrCode size={18} aria-hidden="true" />
              QR de invitación
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex min-h-12 items-center gap-3 rounded-xl border border-border bg-secondary/60 px-4 text-left text-sm font-medium text-foreground"
            >
              {mounted && resolvedTheme === "dark" ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
              {mounted && resolvedTheme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

/** Banner flotante en modo invitado */
function GuestModeBanner({ onExit }: { onExit: () => void }) {
  return (
    <div className="animate-scale-in fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-wrap items-center justify-center gap-3 rounded-full border border-border bg-foreground px-5 py-3 shadow-xl">
      <p className="inline-flex items-center gap-2 text-sm text-background">
        <Eye size={14} /> Estás viendo la página como tus invitados
      </p>
      <button
        type="button"
        onClick={onExit}
        className="inline-flex items-center gap-1.5 rounded-full bg-background px-4 py-1.5 text-xs font-semibold text-foreground transition-opacity hover:opacity-80"
      >
        <Pencil size={12} /> Volver a editar
      </button>
    </div>
  );
}

/** Banner flotante cuando la página llegó por un enlace compartido (#s=…) */
function SharedBanner() {
  return (
    <div className="animate-scale-in fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-wrap items-center justify-center gap-3 rounded-full border border-border bg-foreground px-5 py-3 shadow-xl">
      <p className="inline-flex items-center gap-2 text-sm text-background">
        <Heart size={14} /> Esta página fue compartida contigo
      </p>
      <Link
        href="/mi-evento"
        className="inline-flex items-center gap-1.5 rounded-full bg-background px-4 py-1.5 text-xs font-semibold text-foreground transition-opacity hover:opacity-80"
      >
        Planea tu evento en Momentum
      </Link>
    </div>
  );
}

/* ------------------------------- Panel edición ------------------------------ */

function EditField({
  label,
  value,
  onChange,
  placeholder,
  textarea,
  synced,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
  /** Muestra el chip "Desde Mi Evento" cuando el campo se llenó automáticamente. */
  synced?: boolean;
}) {
  const inputClass =
    "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring";
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
        {synced && (
          <span
            title="Se llenó automáticamente desde Mi Evento. Al editarlo, tomas el control."
            className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-1.5 py-0.5 text-[10px] font-semibold normal-case tracking-normal text-muted-foreground"
          >
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Desde Mi Evento
          </span>
        )}
      </span>
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
  const { wedding, updateWedding, syncFields, resyncWedding, items } = useEvent();
  const set = (patch: Partial<WeddingSite>) => updateWedding(patch);

  const venueKeys: Array<"ceremonyVenue" | "receptionVenue"> = ["ceremonyVenue", "receptionVenue"];
  const syncedVenues = new Set<"ceremonyVenue" | "receptionVenue">(venueKeys.filter((k) => syncFields.includes(k)));
  const syncedFaqAnswers = new Set(
    items
      .filter((i) => ["catering", "pasteleria", "autos-limosinas", "musica"].includes(i.vendor.category))
      .map((i) => i.vendor.name)
  );

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

  const setRegistry = (index: number, patch: Partial<{ label: string; url: string }>) => {
    const registries = wedding.registries.map((r, i) => (i === index ? { ...r, ...patch } : r));
    set({ registries });
  };

  const setFaq = (index: number, patch: Partial<{ q: string; a: string }>) => {
    const faqs = wedding.faqs.map((f, i) => (i === index ? { ...f, ...patch } : f));
    set({ faqs });
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
        {items.length > 0 && (
          <div className="mx-4 flex flex-col gap-2.5 rounded-xl border border-emerald-600/20 bg-emerald-500/5 px-4 py-3">
            <p className="flex items-start gap-2 text-xs leading-relaxed text-foreground/80">
              <RefreshCw size={14} className="mt-0.5 shrink-0 text-emerald-600" />
              <span>
                Tu <strong className="font-semibold">Mi Evento</strong> alimenta esta página: fecha, invitados y los
                servicios que elijas (sede, fotógrafo, catering…) se reflejan aquí solos.
              </span>
            </p>
            <button
              type="button"
              onClick={resyncWedding}
              className="inline-flex items-center justify-center gap-1.5 self-start rounded-full border border-emerald-600/30 bg-background px-3.5 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
            >
              <RefreshCw size={12} /> Recargar desde Mi Evento
            </button>
          </div>
        )}
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
              <div key={i} className="relative flex flex-col gap-3 rounded-xl border border-border p-3">
                <button
                  type="button"
                  onClick={() => set({ story: wedding.story.filter((_, j) => j !== i) })}
                  disabled={wedding.story.length <= 1}
                  aria-label={`Quitar momento ${i + 1}`}
                  className="absolute right-2 top-2 inline-flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-destructive disabled:opacity-30"
                >
                  <Trash2 size={12} />
                </button>
                <EditField
                  label={`Momento ${i + 1} · título`}
                  value={moment.title}
                  onChange={(v) => setMoment(i, { title: v })}
                  placeholder={DEFAULT_STORY[i]?.title ?? "Nuestro momento"}
                />
                <EditField
                  label={`Momento ${i + 1} · texto`}
                  value={moment.text}
                  onChange={(v) => setMoment(i, { text: v })}
                  placeholder={DEFAULT_STORY[i]?.text ?? "Cuenta este momento…"}
                  textarea
                />
              </div>
            ))}
            {wedding.story.length < 6 && (
              <button
                type="button"
                onClick={() => set({ story: [...wedding.story, { title: "", text: "" }] })}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-dashed border-border px-4 py-2.5 text-xs font-medium text-muted-foreground hover:border-foreground hover:text-foreground"
              >
                <Plus size={13} /> Agregar momento
              </button>
            )}
          </div>
          <p id="edit-ceremonia" className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground scroll-mt-4">
            Ceremonia
          </p>
          <div className="grid grid-cols-[1fr_110px] gap-3">
            <EditField label="Sede" value={wedding.ceremonyVenue} onChange={(v) => set({ ceremonyVenue: v })} placeholder="Parroquia de San Miguel" synced={syncedVenues.has("ceremonyVenue")} />
            <EditField label="Hora" value={wedding.ceremonyTime} onChange={(v) => set({ ceremonyTime: v })} placeholder="5:00 PM" />
          </div>
          <p id="edit-recepcion" className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground scroll-mt-4">
            Recepción
          </p>
          <div className="grid grid-cols-[1fr_110px] gap-3">
            <EditField label="Sede" value={wedding.receptionVenue} onChange={(v) => set({ receptionVenue: v })} placeholder="Hacienda Los Laureles" synced={syncedVenues.has("receptionVenue")} />
            <EditField label="Hora" value={wedding.receptionTime} onChange={(v) => set({ receptionTime: v })} placeholder="7:30 PM" />
          </div>
          <div id="edit-extras" className="flex flex-col gap-5 scroll-mt-4">
            <EditField label="Código de vestimenta" value={wedding.dressCode} onChange={(v) => set({ dressCode: v })} placeholder="Etiqueta rigurosa" />
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">Mesas de regalos</p>
              {wedding.registries.map((reg, i) => (
                <div key={i} className="flex items-end gap-2">
                  <div className="w-2/5">
                    <EditField label="Tienda" value={reg.label} onChange={(v) => setRegistry(i, { label: v })} placeholder="Liverpool" />
                  </div>
                  <div className="flex-1">
                    <EditField label="Enlace (opcional)" value={reg.url} onChange={(v) => setRegistry(i, { url: v })} placeholder="https://…" />
                  </div>
                  <button
                    type="button"
                    onClick={() => set({ registries: wedding.registries.filter((_, j) => j !== i) })}
                    aria-label={`Quitar mesa de regalos ${i + 1}`}
                    className="mb-1 inline-flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-destructive"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {wedding.registries.length < 6 && (
                <button
                  type="button"
                  onClick={() => set({ registries: [...wedding.registries, { label: "", url: "" }] })}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-dashed border-border px-4 py-2.5 text-xs font-medium text-muted-foreground hover:border-foreground hover:text-foreground"
                >
                  <Plus size={13} /> Agregar mesa de regalos
                </button>
              )}
            </div>
          </div>
          <div id="edit-alojamiento" className="flex flex-col gap-5 scroll-mt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">Alojamiento</p>
            <EditField
              label="Hotel sugerido"
              value={wedding.accommodation}
              onChange={(v) => set({ accommodation: v })}
              placeholder="Hotel Boutique Casa Luna · Menciona la boda para tarifa especial"
            />
            <EditField
              label="Transporte / cómo llegar"
              value={wedding.accommodationNote}
              onChange={(v) => set({ accommodationNote: v })}
              placeholder="Habrá transporte saliendo del hotel a las 4:00 PM…"
              textarea
            />
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
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
              Galería de fotos
              {syncFields.includes("gallery") && (
                <span
                  title="Se llenó con las fotos del fotógrafo elegido en Mi Evento. Al editarla, tomas el control."
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-1.5 py-0.5 text-[10px] font-semibold normal-case tracking-normal text-muted-foreground"
                >
                  <span className="size-1.5 rounded-full bg-emerald-500" /> Desde Mi Evento
                </span>
              )}
            </p>
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
          <div id="edit-faq" className="flex flex-col gap-3 scroll-mt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">Preguntas frecuentes</p>
            {wedding.faqs.map((faq, i) => (
              <div key={i} className="relative flex flex-col gap-3 rounded-xl border border-border p-3">
                <button
                  type="button"
                  onClick={() => set({ faqs: wedding.faqs.filter((_, j) => j !== i) })}
                  disabled={wedding.faqs.length <= 1}
                  aria-label={`Quitar pregunta ${i + 1}`}
                  className="absolute right-2 top-2 inline-flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-destructive disabled:opacity-30"
                >
                  <Trash2 size={12} />
                </button>
                <EditField
                  label={`Pregunta ${i + 1}`}
                  value={faq.q}
                  onChange={(v) => setFaq(i, { q: v })}
                  placeholder="¿Puedo llevar acompañante?"
                />
                <EditField
                  label={`Respuesta ${i + 1}`}
                  value={faq.a}
                  onChange={(v) => setFaq(i, { a: v })}
                  placeholder="Escribe la respuesta…"
                  textarea
                  synced={syncedFaqAnswers.has(faq.a)}
                />
              </div>
            ))}
            {wedding.faqs.length < 8 && (
              <button
                type="button"
                onClick={() => set({ faqs: [...wedding.faqs, { q: "", a: "" }] })}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-dashed border-border px-4 py-2.5 text-xs font-medium text-muted-foreground hover:border-foreground hover:text-foreground"
              >
                <Plus size={13} /> Agregar pregunta
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

function FlipNumber({ value, reduce }: { value: number; reduce: boolean | null }) {
  const text = String(value).padStart(2, "0");
  return (
    <span className="inline-flex font-serif text-3xl font-medium tabular-nums">
      {text.split("").map((digit, i) => (
        <span key={i} className="relative inline-block h-[1.25em] w-[0.62em] overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={digit}
              initial={reduce ? false : { y: "70%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { y: "-70%", opacity: 0 }}
              transition={{ duration: 0.32, ease: "easeOut" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {digit}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  );
}

function Countdown({ date }: { date?: Date }) {
  const t = useCountdown(date);
  const reduceMotion = useReducedMotion();
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
    <div className="mt-8 flex w-full max-w-md gap-2 sm:gap-3">
      {cells.map((c) => (
        <div
          key={c.l}
          className="flex min-w-0 flex-1 flex-col items-center rounded-2xl border border-white/10 bg-background/10 px-2 py-4 backdrop-blur-md sm:w-[72px] sm:flex-none sm:px-3"
        >
          <FlipNumber value={c.v} reduce={reduceMotion} />
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
  const details = useBodaDetails();
  const [shareDone, setShareDone] = useState(false);
  const names = coupleNames(wedding);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Enlace copiado");
    } catch {
      toast.error("No pudimos copiar el enlace");
    }
  };

  const sharePage = async () => {
    const fecha = details.date
      ? details.date.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
      : "muy pronto";
    const text = `💍 ¡${names.label} se casan! Acompáñalos el ${fecha}. Todos los detalles aquí:`;
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: `Boda de ${names.label}`, text, url: window.location.href });
        setShareDone(true);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareDone(true);
      }
      setTimeout(() => setShareDone(false), 2200);
    } catch {
      /* el usuario canceló el share o el portapapeles no está disponible */
    }
  };

  const shareWhatsApp = () => {
    const fecha = details.date
      ? details.date.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
      : "muy pronto";
    const text = `💍 ¡${names.label} se casan! Acompáñalos el ${fecha}. Todos los detalles y confirmación aquí: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const baseBtn =
    "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-white/40 px-5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/10 sm:w-auto sm:py-2.5";

  return (
    <div className="mt-6 flex w-full max-w-sm flex-col items-stretch gap-2 px-2 sm:w-auto sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:px-0">
      {details.date && (
        <button type="button" onClick={() => downloadIcs(details.date as Date, names.label, wedding)} className={baseBtn}>
          <CalendarPlus size={14} /> Agregar al calendario
        </button>
      )}
      <Magnetic>
        <button type="button" onClick={copyLink} className={baseBtn}>
          <Copy size={14} aria-hidden="true" /> Copiar enlace
        </button>
      </Magnetic>
      <button type="button" onClick={shareWhatsApp} className={`${baseBtn} sm:hidden`}>
        <MessageCircle size={14} /> Compartir por WhatsApp
      </button>
      <button
        type="button"
        onClick={sharePage}
        className={`${baseBtn} border-transparent bg-white font-semibold text-black hover:bg-white/90 sm:hidden`}
      >
        {shareDone ? <Check size={14} /> : <Share2 size={14} />}
        {shareDone ? "¡Listo!" : "Compartir"}
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
  const details = useBodaDetails();
  const names = coupleNames(wedding);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrollY(window.scrollY));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <section id="inicio" className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 text-center text-white">
      <div
        className="absolute inset-0"
        style={{ transform: `translateY(${Math.min(scrollY * 0.25, 200)}px)` }}
      >
        <div className="animate-kenburns absolute inset-0">
          <FadeImage src={wedding.heroImage} alt="Boda" fill priority className="object-cover" />
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/40" />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.35) 100%)" }} />
      <div className="grain pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay" />
      <EditCornerButton label="Editar nombres y portada" onClick={onEdit} />
      <div className="relative z-10 flex flex-col items-center">
        <div {...fade(0, "flex h-16 w-16 items-center justify-center rounded-full border border-white/40 bg-white/10 font-serif text-lg tracking-widest backdrop-blur-sm")}>
          {names.p1.charAt(0)}
          <span className="mx-0.5 text-[#e7c887]">&</span>
          {names.p2.charAt(0)}
        </div>
        <p {...fade(80, "mt-6 text-xs uppercase tracking-[0.32em] opacity-90")}>Nos casamos</p>
        <h1
          {...fade(150, "mt-6 break-words px-4 font-serif text-[clamp(2.75rem,11vw,7rem)] font-medium leading-[0.95] tracking-tight sm:px-0")}
        >
          {names.p1}
          <span className="mx-3 font-light italic text-[#e7c887] md:mx-5">&</span>
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
      <div className="absolute bottom-8 z-10 flex flex-col items-center gap-3 opacity-80">
        <span className="text-[10px] uppercase tracking-[0.28em]">Desliza</span>
        <span className="animate-scrollcue block h-10 w-px bg-white/80" />
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
      <SectionHeading {...fade(100, "mt-6")} eyebrow="Con todo el corazón" title="Bienvenidos a nuestra boda" />
      <p {...fade(200, "mt-6 leading-relaxed text-muted-foreground")}>{message}</p>
      {wedding.hashtag.trim() && (
        <p {...fade(300, "mt-6 font-serif text-xl italic text-foreground")}>{wedding.hashtag}</p>
      )}
    </section>
  );
}

function GallerySection({ wedding, onEdit }: { wedding: WeddingSite; onEdit: () => void }) {
  const photos = wedding.gallery.filter((u) => u.trim());
  const [selected, setSelected] = useState<number | null>(null);
  if (photos.length === 0) return null;
  return (
    <section className="relative mx-auto max-w-5xl px-6 pb-20">
      <EditCornerButton label="Editar galería" onClick={onEdit} />
      <div className={cn("grid grid-cols-2 gap-3", photos.length > 2 && "md:grid-cols-4")}>
        {photos.map((src, i) => (
          <FadeUp key={`${i}-${src}`} index={i}>
            <Tilt className="w-full">
              <button
                type="button"
                onClick={() => setSelected(i)}
                aria-label={`Ver foto ${i + 1} en grande`}
                className="group relative aspect-[3/4] w-full cursor-zoom-in overflow-hidden rounded-2xl bg-secondary"
              >
                <FadeImage
                  src={src}
                  alt={`Momento ${i + 1}`}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </button>
            </Tilt>
          </FadeUp>
        ))}
      </div>
      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="border-none bg-transparent p-0 shadow-none sm:max-w-3xl">
          <DialogTitle className="sr-only">Galería de fotos</DialogTitle>
          <Carousel opts={{ startIndex: selected ?? 0 }} className="w-full">
            <CarouselContent>
              {photos.map((src, i) => (
                <CarouselItem key={`${i}-${src}`}>
                  <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-secondary sm:aspect-[4/3]">
                    <FadeImage src={src} alt={`Momento ${i + 1}`} fill className="object-cover" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {photos.length > 1 && (
              <>
                <CarouselPrevious className="left-2 border-white/30 bg-black/40 text-white hover:bg-black/60" />
                <CarouselNext className="right-2 border-white/30 bg-black/40 text-white hover:bg-black/60" />
              </>
            )}
          </Carousel>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function StorySection({ wedding, onEdit }: { wedding: WeddingSite; onEdit: () => void }) {
  const moments = wedding.story.map((m, i) => ({
    title: m.title.trim() || DEFAULT_STORY[i]?.title || "",
    text: m.text.trim() || DEFAULT_STORY[i]?.text || "",
  }));

  return (
    <section id="historia" className="relative mx-auto max-w-2xl scroll-mt-28 px-6 pb-20 md:pb-28">
      <EditCornerButton label="Editar historia" onClick={onEdit} />
      <SectionHeading
        {...fade(0)}
        eyebrow="Capítulo por capítulo"
        title={<>Nuestra <em className="italic text-gold">historia</em></>}
      />
      <ol className="relative mt-12 flex flex-col gap-10 border-l-2 border-border pl-8">
        {moments.map((m, i) => (
          <li key={i} className="relative">
            <span
              className="absolute -left-[41px] top-1 inline-flex size-5 items-center justify-center rounded-full"
              style={{ backgroundColor: "var(--wed-accent)" }}
            >
              <Heart size={10} className="fill-background text-background" />
            </span>
            <FadeUp index={i}>
              <p className="font-serif text-xl font-medium tracking-tight text-foreground">{m.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{m.text}</p>
            </FadeUp>
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
  const [showMap, setShowMap] = useState(true);
  return (
    <div {...fade(delay, "card-lift flex flex-col items-center rounded-3xl border border-border p-8 text-center md:p-10")}>
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
        <>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <a
              href={mapsUrl(venue)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <MapPin size={12} /> Cómo llegar
            </a>
            <button
              type="button"
              onClick={() => setShowMap((s) => !s)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {showMap ? "Ocultar mapa" : "Ver mapa"}
            </button>
          </div>
          {showMap && (
            <iframe
              title={`Mapa de ${venue}`}
              src={mapsEmbedUrl(venue)}
              loading="lazy"
              className="mt-4 h-48 w-full rounded-2xl border border-border"
            />
          )}
        </>
      )}
    </div>
  );
}

function DetailsGrid({ wedding, onEditCeremony, onEditReception }: { wedding: WeddingSite; onEditCeremony: () => void; onEditReception: () => void }) {
  const details = useBodaDetails();
  return (
    <section id="detalles" className="mx-auto max-w-4xl scroll-mt-28 px-6 pb-20 md:pb-28">
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
        <div className="card-lift flex flex-col items-center rounded-3xl border border-border p-8 text-center">
          <span
            className="inline-flex size-12 items-center justify-center rounded-full"
            style={{ backgroundColor: "var(--wed-soft)", color: "var(--wed-accent)" }}
          >
            <Shirt size={20} />
          </span>
          <h3 className="mt-5 font-serif text-2xl font-medium tracking-tight text-foreground">Código de vestimenta</h3>
          <p className="mt-3 text-base text-muted-foreground">{wedding.dressCode.trim() || "Etiqueta rigurosa"}</p>
        </div>
        <div className="card-lift flex flex-col items-center rounded-3xl border border-border p-8 text-center">
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

function AccommodationSection({ wedding, onEdit }: { wedding: WeddingSite; onEdit: () => void }) {
  const guestMode = useGuestMode();
  const hasHotel = wedding.accommodation.trim().length > 0;
  const hasNote = wedding.accommodationNote.trim().length > 0;
  if (!hasHotel && !hasNote) {
    if (guestMode) return null;
    return (
      <section id="alojamiento" className="scroll-mt-28 px-6 pb-20 md:pb-28">
        <div className="mx-auto flex max-w-2xl justify-center">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-2 rounded-full border border-dashed border-border px-5 py-3 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            <BedDouble size={14} /> Agrega hotel sugerido y transporte para tus invitados
          </button>
        </div>
      </section>
    );
  }
  return (
    <section id="alojamiento" className="relative scroll-mt-28 px-6 pb-20 md:pb-28">
      <EditCornerButton label="Editar alojamiento" onClick={onEdit} />
      <div className="mx-auto max-w-2xl text-center">
        <span
          {...fade(0, "inline-flex size-12 items-center justify-center rounded-full")}
          style={{ animationDelay: "0ms", animationFillMode: "forwards", backgroundColor: "var(--wed-soft)", color: "var(--wed-accent)" }}
        >
          <BedDouble size={20} />
        </span>
        <SectionHeading {...fade(100, "mt-6")} eyebrow="Alojamiento" title="¿Dónde hospedarse?" />
        {hasHotel && (
          <p {...fade(200, "mt-4 text-base font-medium text-foreground")}>{wedding.accommodation}</p>
        )}
        {hasNote && (
          <p {...fade(250, "mt-2 text-sm leading-relaxed text-muted-foreground")}>{wedding.accommodationNote}</p>
        )}
        {hasHotel && (
          <a
            {...fade(300, "mt-5 inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary")}
            style={{ animationDelay: "300ms", animationFillMode: "forwards" }}
            href={mapsUrl(wedding.accommodation)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MapPin size={12} /> Ver en el mapa
          </a>
        )}
      </div>
    </section>
  );
}

function ItinerarySection({ wedding, onEdit }: { wedding: WeddingSite; onEdit: () => void }) {
  const entries = wedding.itinerary.filter((e) => e.time.trim() || e.label.trim());
  if (entries.length === 0) return null;
  return (
    <section id="itinerario" className="relative scroll-mt-28 px-6 pb-20 md:pb-28">
      <EditCornerButton label="Editar itinerario" onClick={onEdit} />
      <SectionHeading
        {...fade(0)}
        eyebrow="El gran día"
        title={<>Itinerario <em className="italic text-gold">del día</em></>}
      />
      <ol
        {...fade(
          200,
          "mx-auto mt-12 flex max-w-3xl items-start gap-0 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-2 sm:flex-wrap sm:justify-center sm:gap-y-8 sm:overflow-visible sm:px-0"
        )}
      >
        {entries.map((entry, i) => (
          <li key={i} className="relative flex w-40 shrink-0 snap-start flex-col items-center px-4 text-center">
            <FadeUp index={i} className="relative flex w-full flex-col items-center">
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
            </FadeUp>
          </li>
        ))}
      </ol>
    </section>
  );
}

function GiftSection({ wedding, onEdit }: { wedding: WeddingSite; onEdit: () => void }) {
  const registries = wedding.registries.filter((r) => r.label.trim());
  const legacy = wedding.giftTable.trim();
  return (
    <section
      id="regalos"
      className="relative scroll-mt-28 px-6 py-20 md:py-28"
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
        <SectionHeading
          {...fade(100, "mt-6")}
          eyebrow="Con cariño"
          title={<>Mesa de <em className="italic text-gold">regalos</em></>}
        />
        <p {...fade(200, "mt-4 leading-relaxed text-muted-foreground")}>
          Tu presencia es nuestro mejor regalo, pero si deseas tener un detalle con nosotros:
        </p>
        {registries.length > 0 ? (
          <div {...fade(300, "mt-6 flex flex-wrap items-center justify-center gap-2")}>
            {registries.map((reg, i) => {
              const url = reg.url.trim();
              if (url) {
                const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
                return (
                  <a
                    key={i}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-6 py-3 font-serif text-lg italic text-foreground transition-colors hover:border-foreground"
                  >
                    {reg.label} <ExternalLink size={13} className="not-italic" />
                  </a>
                );
              }
              return (
                <span
                  key={i}
                  className="inline-block rounded-full border border-border bg-background px-6 py-3 font-serif text-lg italic text-foreground"
                >
                  {reg.label}
                </span>
              );
            })}
          </div>
        ) : (
          <p {...fade(300, "mt-6 inline-block rounded-full border border-border bg-background px-6 py-3 font-serif text-lg italic text-foreground")}>
            {legacy || "Mesa de regalos por confirmar"}
          </p>
        )}
      </div>
    </section>
  );
}

function FaqSection({ wedding, onEdit }: { wedding: WeddingSite; onEdit: () => void }) {
  const faqs = wedding.faqs.filter((f) => f.q.trim());
  if (faqs.length === 0) return null;
  return (
    <section id="faq" className="relative mx-auto max-w-2xl scroll-mt-28 px-6 pb-20 md:pb-28">
      <EditCornerButton label="Editar preguntas frecuentes" onClick={onEdit} />
      <div className="text-center">
        <span
          {...fade(0, "inline-flex size-12 items-center justify-center rounded-full")}
          style={{ animationDelay: "0ms", animationFillMode: "forwards", backgroundColor: "var(--wed-soft)", color: "var(--wed-accent)" }}
        >
          <HelpCircle size={20} />
        </span>
        <SectionHeading {...fade(100, "mt-6")} eyebrow="Resolvemos tus dudas" title="Preguntas frecuentes" />
      </div>
      <Accordion {...fade(200, "mt-8")} type="single" collapsible>
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`faq-${i}`}>
            <AccordionTrigger className="text-left font-serif text-lg font-medium tracking-tight">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
              {faq.a.trim() || "Pronto tendrás la respuesta aquí."}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

function WishesSection({ wedding }: { wedding: WeddingSite }) {
  const { wishes, addWish, clearWishes } = useEvent();
  const guestMode = useGuestMode();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const names = coupleNames(wedding);

  return (
    <section id="deseos" className="relative scroll-mt-28 px-6 pb-20 md:pb-28">
      <div className="mx-auto max-w-2xl text-center">
        <span
          {...fade(0, "inline-flex size-12 items-center justify-center rounded-full")}
          style={{ animationDelay: "0ms", animationFillMode: "forwards", backgroundColor: "var(--wed-soft)", color: "var(--wed-accent)" }}
        >
          <MessagesSquare size={20} />
        </span>
        <SectionHeading
          {...fade(100, "mt-6")}
          eyebrow="Libro de firmas"
          title={<>Déjanos tus <em className="italic text-gold">buenos deseos</em></>}
        />
        <p {...fade(200, "mt-3 text-sm leading-relaxed text-muted-foreground")}>
          Unas palabras para {names.p1} y {names.p2} que atesorarán para siempre.
        </p>
        {sent ? (
          <div className="animate-scale-in mt-8 inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm text-foreground">
            <Check size={15} style={{ color: "var(--wed-accent)" }} /> ¡Gracias por tus buenos deseos!
          </div>
        ) : (
          <form
            {...fade(250, "mx-auto mt-8 flex max-w-md flex-col gap-3")}
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim() && message.trim()) {
                addWish({ name: name.trim(), message: message.trim() });
                setName("");
                setMessage("");
                setSent(true);
              }
            }}
          >
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              className="w-full rounded-full border border-border bg-background px-5 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <textarea
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe tus buenos deseos…"
              className="w-full resize-none rounded-2xl border border-border bg-background px-5 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white transition-[opacity,transform] hover:opacity-90 active:scale-[0.97]"
              style={{ backgroundColor: "var(--wed-accent)" }}
            >
              <Send size={14} /> Firmar el libro
            </button>
          </form>
        )}
        {wishes.length > 0 && (
          <div {...fade(300, "mt-10 grid gap-3 text-left sm:grid-cols-2")}>
            {wishes.map((wish) => (
              <figure key={wish.at + wish.name} className="card-lift rounded-2xl border border-border p-4">
                <blockquote className="font-serif text-base italic leading-relaxed text-foreground">
                  “{wish.message}”
                </blockquote>
                <figcaption className="mt-3 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  {wish.name} · {new Date(wish.at).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
        <p {...fade(350, "mt-6 text-[11px] text-muted-foreground")}>
          Las firmas se guardan en este navegador (sin servidor), igual que las confirmaciones.
        </p>
        {!guestMode && wishes.length > 0 && (
          confirmClear ? (
            <div className="mx-auto mt-4 flex max-w-sm items-center justify-between gap-2 rounded-xl border border-destructive/40 px-4 py-3">
              <p className="text-xs text-foreground">¿Borrar todas las firmas?</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { clearWishes(); setConfirmClear(false); }}
                  className="rounded-full bg-destructive px-3.5 py-1.5 text-xs font-semibold text-destructive-foreground"
                >
                  Sí, borrar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-muted-foreground"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:text-destructive"
            >
              <Trash2 size={12} /> Borrar todas las firmas
            </button>
          )
        )}
      </div>
    </section>
  );
}

const RSVP_CONFETTI = ["#B08D57", "#d4af7a", "#e7c887", "#8a6d3b", "#f5e6c8"];

function RsvpConfetti({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      <style>{`@keyframes rsvp-confetti-fall { 0% { transform: translateY(-8vh) rotate(0deg); opacity: 1; } 100% { transform: translateY(105vh) rotate(720deg); opacity: 0; } }`}</style>
      {Array.from({ length: 36 }).map((_, i) => (
        <span
          key={i}
          className="absolute top-0 block h-3 w-2 rounded-sm"
          style={{
            left: `${(i / 36) * 100 + (i % 3)}%`,
            backgroundColor: RSVP_CONFETTI[i % RSVP_CONFETTI.length],
            animation: `rsvp-confetti-fall ${2.4 + (i % 5) * 0.35}s ease-in ${(i % 6) * 0.18}s forwards`,
          }}
        />
      ))}
    </div>
  );
}

function RsvpSection({ wedding }: { wedding: WeddingSite }) {
  const { addRsvp } = useEvent();
  const reduceMotion = useReducedMotion();
  const [sent, setSent] = useState(false);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [attending, setAttending] = useState<"si" | "no" | null>(null);
  const [companions, setCompanions] = useState(0);
  const [allergies, setAllergies] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const names = coupleNames(wedding);

  const goTo = (next: number) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
  };

  const canAdvance = step === 0 ? attending !== null : step === 1 ? name.trim().length > 1 && /.+@.+\..+/.test(email.trim()) : true;

  const handleSubmit = () => {
    if (!attending || !name.trim() || !email.trim()) return;
    addRsvp({
      name: name.trim(),
      attending,
      companions: attending === "si" ? companions : 0,
      allergies: attending === "si" ? allergies.trim() : "",
    });
    setSent(true);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4800);
  };

  if (sent) {
    return (
      <section id="rsvp" className="scroll-mt-28 px-6 py-20 md:py-28">
        <RsvpConfetti show={showConfetti} />
        <FadeUp className="mx-auto flex max-w-md flex-col items-center rounded-3xl border border-border px-8 py-14 text-center">
          <span className="inline-flex size-14 items-center justify-center rounded-full bg-foreground text-background">
            <Check size={24} />
          </span>
          <h2 className="mt-6 font-serif text-3xl font-medium tracking-tight text-foreground">¡Gracias por confirmar!</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {attending === "si"
              ? `${names.p1} y ${names.p2} no pueden esperar a celebrar contigo${companions > 0 ? ` y tus ${companions} ${companions === 1 ? "acompañante" : "acompañantes"}` : ""}.`
              : "Te extrañaremos ese día. ¡Gracias por avisarnos!"}
          </p>
        </FadeUp>
      </section>
    );
  }

  const stepTitles = ["¿Nos acompañas?", "Tus datos", attending === "si" ? "Últimos detalles" : "Confirmar"];
  const slide = reduceMotion ? {} : { x: 44 * dir };

  return (
    <section id="rsvp" className="scroll-mt-28 px-6 py-20 md:py-28">
      <div className="mx-auto max-w-md">
        <SectionHeading
          {...fade(0)}
          eyebrow="RSVP"
          title={<>Confirma tu <em className="italic text-gold">asistencia</em></>}
        />
        <p {...fade(100, "mt-3 text-center text-sm text-muted-foreground")}>
          Ayúdanos a que todo salga perfecto. Confirma antes del gran día.
        </p>

        {/* Progress dots */}
        <div {...fade(150, "mt-6 flex items-center justify-center gap-2")} aria-hidden="true">
          {stepTitles.map((t, i) => (
            <span
              key={t}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === step ? "w-8" : "w-1.5",
                i <= step ? "bg-foreground" : "bg-border"
              )}
              style={i === step ? { backgroundColor: "var(--wed-accent)" } : undefined}
            />
          ))}
        </div>
        <p className="mt-2 text-center text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Paso {step + 1} de 3 · {stepTitles[step]}
        </p>

        <form
          {...fade(200, "mt-6")}
          onSubmit={(e) => {
            e.preventDefault();
            if (step < 2) {
              if (canAdvance) goTo(step + 1);
            } else {
              handleSubmit();
            }
          }}
        >
          <div className="overflow-hidden">
            <AnimatePresence mode="wait" initial={false} custom={dir}>
              <motion.div
                key={step}
                initial={{ opacity: 0, ...slide }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -44 * dir }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="flex flex-col gap-3"
              >
                {step === 0 && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {(
                      [
                        { id: "si", label: "Sí, ahí estaré", hint: "Celebremos juntos", icon: PartyPopper },
                        { id: "no", label: "No podré ir", hint: "Me perderé la fiesta", icon: Heart },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAttending(opt.id)}
                        aria-pressed={attending === opt.id}
                        className={cn(
                          "flex min-h-28 flex-col items-center justify-center gap-1.5 rounded-3xl border px-4 py-5 text-center transition-all",
                          attending === opt.id
                            ? "border-transparent text-white shadow-lg"
                            : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                        )}
                        style={attending === opt.id ? { backgroundColor: "var(--wed-accent)" } : undefined}
                      >
                        <opt.icon size={22} aria-hidden="true" />
                        <span className="text-sm font-semibold">{opt.label}</span>
                        <span className={cn("text-[11px]", attending === opt.id ? "text-white/80" : "text-muted-foreground/70")}>{opt.hint}</span>
                      </button>
                    ))}
                  </div>
                )}

                {step === 1 && (
                  <>
                    <input
                      autoFocus
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tu nombre completo"
                      autoComplete="name"
                      className="w-full rounded-full border border-border bg-background px-5 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Correo electrónico"
                      autoComplete="email"
                      className="w-full rounded-full border border-border bg-background px-5 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </>
                )}

                {step === 2 && attending === "si" && (
                  <>
                    <div className="flex items-center justify-between rounded-full border border-border px-5 py-2.5">
                      <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                        <Users size={14} /> Acompañantes
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setCompanions((c) => Math.max(0, c - 1))}
                          disabled={companions === 0}
                          aria-label="Quitar acompañante"
                          className="inline-flex size-10 items-center justify-center rounded-full border border-border text-foreground disabled:opacity-30"
                        >
                          −
                        </button>
                        <span className="w-4 text-center text-sm font-semibold tabular-nums text-foreground">{companions}</span>
                        <button
                          type="button"
                          onClick={() => setCompanions((c) => Math.min(5, c + 1))}
                          disabled={companions === 5}
                          aria-label="Agregar acompañante"
                          className="inline-flex size-10 items-center justify-center rounded-full border border-border text-foreground disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                      placeholder="Alergias o comentarios (opcional)"
                      rows={2}
                      className="w-full resize-none rounded-2xl border border-border bg-background px-5 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </>
                )}

                {step === 2 && attending === "no" && (
                  <p className="rounded-2xl border border-dashed border-border px-5 py-6 text-center text-sm leading-relaxed text-muted-foreground">
                    Lamentamos que no puedas acompañarnos, {name.split(" ")[0]}. Gracias por tomarte el tiempo de responder.
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-4 flex items-center gap-2">
            {step > 0 && (
              <button
                type="button"
                onClick={() => goTo(step - 1)}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border px-5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft size={14} /> Atrás
              </button>
            )}
            <Magnetic className="flex-1">
              <button
                type="submit"
                disabled={!canAdvance}
                className="min-h-11 w-full rounded-full px-5 py-3 text-sm font-medium text-white transition-[opacity,transform] hover:opacity-90 active:scale-[0.97] disabled:opacity-40"
                style={{ backgroundColor: "var(--wed-accent)" }}
              >
                {step < 2 ? "Continuar" : attending === "si" ? "Confirmar asistencia" : "Enviar respuesta"}
              </button>
            </Magnetic>
          </div>
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            Tu confirmación se guarda en este navegador y los novios la revisan desde su panel.
          </p>
        </form>
      </div>
    </section>
  );
}

/* --------------------------- Panel de confirmados --------------------------- */

function RsvpSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { rsvps, clearRsvps } = useEvent();
  const [confirmClear, setConfirmClear] = useState(false);
  const attending = rsvps.filter((r) => r.attending === "si");
  const expectedGuests = attending.reduce((sum, r) => sum + 1 + r.companions, 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-serif text-2xl tracking-tight">Respuestas de invitados</SheetTitle>
          <SheetDescription>
            Las confirmaciones se guardan en este navegador (sin servidor). Comparte el enlace de tu página y revisa aquí
            quién va llegando.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4 pb-8">
          {rsvps.length === 0 ? (
            <div className="mt-4 flex flex-col items-center rounded-2xl border border-dashed border-border px-6 py-10 text-center">
              <ClipboardList size={22} className="text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">
                Aún no hay respuestas. Cuando tus invitados confirmen desde esta página, aparecerán aquí.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-secondary px-3 py-2.5 text-center">
                  <p className="font-serif text-xl font-medium text-foreground">{attending.length}</p>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Confirman</p>
                </div>
                <div className="rounded-xl bg-secondary px-3 py-2.5 text-center">
                  <p className="font-serif text-xl font-medium text-foreground">{rsvps.length - attending.length}</p>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">No asisten</p>
                </div>
                <div className="rounded-xl bg-secondary px-3 py-2.5 text-center">
                  <p className="font-serif text-xl font-medium text-foreground">{expectedGuests}</p>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Con acompañantes</p>
                </div>
              </div>
              <ul className="flex flex-col gap-2">
                {rsvps.map((r) => (
                  <li key={r.at + r.name} className="rounded-xl border border-border p-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{r.name}</p>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]",
                          r.attending === "si"
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            : "bg-secondary text-muted-foreground"
                        )}
                      >
                        {r.attending === "si" ? "Asiste" : "No asiste"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(r.at).toLocaleDateString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      {r.attending === "si" && r.companions > 0 && ` · +${r.companions} ${r.companions === 1 ? "acompañante" : "acompañantes"}`}
                    </p>
                    {r.allergies && (
                      <p className="mt-1.5 rounded-lg bg-secondary px-2.5 py-1.5 text-xs text-muted-foreground">
                        {r.allergies}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
              {confirmClear ? (
                <div className="flex items-center justify-between gap-2 rounded-xl border border-destructive/40 px-4 py-3">
                  <p className="text-xs text-foreground">¿Borrar todas las respuestas?</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { clearRsvps(); setConfirmClear(false); }}
                      className="rounded-full bg-destructive px-3.5 py-1.5 text-xs font-semibold text-destructive-foreground"
                    >
                      Sí, borrar
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClear(false)}
                      className="rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-muted-foreground"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-destructive"
                >
                  <Trash2 size={12} /> Borrar todas las respuestas
                </button>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* --------------------------- Navegación de puntos ---------------------------- */

const BODA_SECTIONS = [
  { id: "inicio", label: "Inicio" },
  { id: "historia", label: "Historia" },
  { id: "detalles", label: "Detalles" },
  { id: "alojamiento", label: "Alojamiento" },
  { id: "itinerario", label: "Itinerario" },
  { id: "album", label: "Álbum" },
  { id: "regalos", label: "Regalos" },
  { id: "faq", label: "Preguntas" },
  { id: "deseos", label: "Buenos deseos" },
  { id: "rsvp", label: "RSVP" },
];

function DotNav() {
  const links = BODA_SECTIONS;
  const active = useScrollSpy(links.map((l) => l.id));
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
          aria-current={active === l.id ? "true" : undefined}
          onClick={() => scrollToSection(l.id)}
          className="group flex items-center justify-end gap-2"
        >
          <span className="rounded-full bg-foreground/80 px-2.5 py-1 text-[10px] font-medium text-background opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
            {l.label}
          </span>
          <span className="relative flex size-2.5 items-center justify-center">
            {active === l.id ? (
              <motion.span
                layoutId="dotnav-active"
                className="absolute inline-flex size-2.5 rounded-full"
                style={{ background: "var(--wed-accent)" }}
                transition={{ type: "spring", stiffness: 320, damping: 26 }}
              />
            ) : (
              <span className="size-2.5 rounded-full bg-foreground/40 transition-colors group-hover:bg-foreground" />
            )}
          </span>
        </button>
      ))}
    </nav>
  );
}

/* ------------------------- Navegación inferior móvil ----------------------- */

function MobileBodaNav() {
  const items = [
    { id: "inicio", label: "Inicio", icon: Home },
    { id: "detalles", label: "Detalles", icon: CalendarDays },
    { id: "album", label: "Álbum", icon: Camera },
    { id: "deseos", label: "Deseos", icon: Heart },
    { id: "rsvp", label: "RSVP", icon: Send },
  ];
  const active = useScrollSpy(items.map((i) => i.id));
  return (
    <nav
      aria-label="Secciones de la boda"
      className="fixed inset-x-3 bottom-3 z-50 md:hidden"
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-between gap-1 rounded-full border border-[#e7c887]/20 bg-background/85 px-2 py-2 shadow-[0_20px_60px_-30px_rgba(28,25,23,0.45)] backdrop-blur-xl">
        {items.map((it) => {
          const Icon = it.icon;
          const isActive = active === it.id;
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => scrollToSection(it.id)}
              aria-label={`Ir a ${it.label}`}
              aria-current={isActive ? "true" : undefined}
              className="relative flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-2 py-1.5 text-[10px] font-medium text-muted-foreground"
            >
              {isActive && (
                <motion.span
                  layoutId="mobilenav-active"
                  className="absolute inset-0 rounded-full"
                  style={{ background: "var(--wed-soft)" }}
                  transition={{ type: "spring", stiffness: 320, damping: 28 }}
                />
              )}
              <Icon size={17} className="relative" style={isActive ? { color: "var(--wed-accent)" } : undefined} />
              <span className={cn("relative", isActive && "text-foreground")}>{it.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/* --------------------------------- Página ---------------------------------- */

export function BodaClient() {
  const { wedding, details, hydrated, rsvps, wishes } = useEvent();
  const palette = usePaletteHotkey();
  const isMobile = useIsMobile();
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<string | null>(null);
  const [guestMode, setGuestMode] = useState(false);
  const [rsvpsOpen, setRsvpsOpen] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  // undefined = aún no leído el hash; null = sin enlace compartido; WeddingShare = modo compartido
  const [shared, setShared] = useState<WeddingShare | null | undefined>(undefined);

  useEffect(() => {
    const readHash = () => {
      const match = window.location.hash.match(/#s=([A-Za-z0-9_-]+)/);
      setShared(match ? decodeWeddingShare(match[1]) : null);
    };
    readHash();
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, []);

  const openEdit = (target: string) => {
    setEditTarget(target);
    setEditOpen(true);
  };

  const enterGuestMode = () => {
    setEditOpen(false);
    setGuestMode(true);
  };

  const openQr = () => {
    const hash = encodeWeddingShare(wedding, details);
    setQrUrl(`${window.location.origin}/mi-evento/boda#s=${hash}`);
  };

  if (shared === undefined || (!shared && !hydrated)) {
    return (
      <main className="editorial flex min-h-screen flex-col items-center justify-center gap-8 bg-background" aria-busy="true" aria-label="Cargando la página de la boda">
        <Skeleton className="h-20 w-20 rounded-full" />
        <Skeleton className="h-10 w-64 max-w-[70vw]" />
        <Skeleton className="h-4 w-40" />
        <div className="flex gap-3">
          <Skeleton className="h-20 w-16 rounded-2xl" />
          <Skeleton className="h-20 w-16 rounded-2xl" />
          <Skeleton className="h-20 w-16 rounded-2xl" />
          <Skeleton className="h-20 w-16 rounded-2xl" />
        </div>
      </main>
    );
  }

  const viewWedding = shared ? shared.wedding : wedding;
  const viewDetails: BodaViewDetails | null = shared
    ? {
        date: shared.details.date ? new Date(shared.details.date) : undefined,
        guests: shared.details.guests,
      }
    : null;
  const effectiveGuestMode = guestMode || shared !== null;
  const names = coupleNames(viewWedding);
  const theme = THEMES[viewWedding.theme] ?? THEMES.arena;

  const copyShareLink = async () => {
    try {
      const hash = encodeWeddingShare(wedding, details);
      await navigator.clipboard.writeText(`${window.location.origin}/mi-evento/boda#s=${hash}`);
      toast.success("Enlace para invitados copiado");
    } catch {
      toast.error("No pudimos copiar el enlace");
    }
  };

  const paletteGroups: PaletteGroup[] = [
    {
      heading: "Ir a",
      actions: BODA_SECTIONS.map((s) => ({
        id: `nav-${s.id}`,
        label: s.label,
        icon: <ArrowLeft size={16} className="rotate-[-90deg]" aria-hidden="true" />,
        onSelect: () => scrollToSection(s.id),
      })),
    },
    {
      heading: "Acciones",
      actions: [
        { id: "act-portada", label: "Editar portada", icon: <Camera size={16} />, keywords: ["hero", "foto", "nombres"], onSelect: () => openEdit("edit-portada") },
        { id: "act-invitado", label: "Ver como invitado", icon: <Eye size={16} />, keywords: ["preview", "vista"], onSelect: enterGuestMode },
        { id: "act-copiar", label: "Copiar enlace para invitados", icon: <Link2 size={16} />, keywords: ["compartir", "link"], onSelect: copyShareLink },
        { id: "act-qr", label: "QR de invitación", icon: <QrCode size={16} />, keywords: ["código", "imprimir", "descargar"], onSelect: openQr },
        ...(rsvps.length > 0
          ? [{ id: "act-rsvps", label: `Ver respuestas (${rsvps.length})`, icon: <ClipboardList size={16} />, keywords: ["confirmaciones", "asistencia"], onSelect: () => setRsvpsOpen(true) }]
          : []),
      ],
    },
  ];

  return (
    <BodaViewDetailsContext.Provider value={viewDetails}>
      <GuestModeContext.Provider value={effectiveGuestMode}>
        <main
          className="editorial themed min-h-screen bg-background"
          style={{ "--wed-accent": theme.accent, "--wed-soft": theme.soft } as CSSProperties}
        >
          <a
            href="#detalles"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-full focus:bg-foreground focus:px-4 focus:py-2 focus:text-sm focus:text-background"
          >
            Saltar al contenido
          </a>
          {!shared && (
            <BodaToolbar
              onEdit={() => openEdit("edit-portada")}
              guestMode={guestMode}
              onToggleGuest={enterGuestMode}
              rsvpCount={rsvps.length}
              onShowRsvps={() => setRsvpsOpen(true)}
              wishCount={wishes.length}
              onShowWishes={() => document.getElementById("deseos")?.scrollIntoView({ behavior: "smooth" })}
              onOpenPalette={() => palette.setOpen(true)}
              onShowQr={openQr}
            />
          )}
          {!shared && guestMode && <GuestModeBanner onExit={() => setGuestMode(false)} />}
          {shared && <SharedBanner />}
          <DotNav />
          <MobileBodaNav />
          {!shared && <EditSheet open={editOpen} onOpenChange={setEditOpen} target={editTarget} />}
          {!shared && <RsvpSheet open={rsvpsOpen} onOpenChange={setRsvpsOpen} />}
          {!shared && (
            <QrInvitationSheet
              open={qrUrl !== null}
              onOpenChange={(o) => {
                if (!o) setQrUrl(null);
              }}
              url={qrUrl ?? ""}
              namesLabel={names.label}
              dateLabel={
                details.date
                  ? details.date.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })
                  : ""
              }
            />
          )}
          {!shared && <CommandPalette open={palette.open} onOpenChange={palette.setOpen} groups={paletteGroups} placeholder="Busca una sección o acción…" />}
          <Toaster position={isMobile ? "bottom-center" : "bottom-right"} />
          <ScrollProgress />
          <HeroSection wedding={viewWedding} onEdit={() => openEdit("edit-portada")} />
          <Reveal>
            <WelcomeSection wedding={viewWedding} onEdit={() => openEdit("edit-mensaje")} />
          </Reveal>
          <Reveal>
            <GallerySection wedding={viewWedding} onEdit={() => openEdit("edit-galeria")} />
          </Reveal>
          <OrnamentDivider className="mx-auto mb-20 max-w-xs md:mb-28" />
          <Reveal>
            <StorySection wedding={viewWedding} onEdit={() => openEdit("edit-historia")} />
          </Reveal>
          <Reveal>
            <DetailsGrid
              wedding={viewWedding}
              onEditCeremony={() => openEdit("edit-ceremonia")}
              onEditReception={() => openEdit("edit-recepcion")}
            />
          </Reveal>
          <Reveal>
            <AccommodationSection wedding={viewWedding} onEdit={() => openEdit("edit-alojamiento")} />
          </Reveal>
          <Reveal>
            <ItinerarySection wedding={viewWedding} onEdit={() => openEdit("edit-itinerario")} />
          </Reveal>
          <Reveal>
            <AlbumSection />
          </Reveal>
          <OrnamentDivider className="mx-auto mb-20 max-w-xs md:mb-28" />
          <Reveal>
            <GiftSection wedding={viewWedding} onEdit={() => openEdit("edit-extras")} />
          </Reveal>
          <Reveal>
            <FaqSection wedding={viewWedding} onEdit={() => openEdit("edit-faq")} />
          </Reveal>
          <Reveal>
            <WishesSection wedding={viewWedding} />
          </Reveal>
          <OrnamentDivider className="mx-auto mb-4 max-w-xs" />
          <Reveal>
            <RsvpSection wedding={viewWedding} />
          </Reveal>
          <footer className="border-t border-border px-6 pb-32 pt-16 text-center md:pb-16">
            <div
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-full font-serif text-2xl tracking-widest"
              style={{ border: "1px solid color-mix(in srgb, var(--wed-accent) 40%, transparent)", color: "var(--wed-accent)", background: "var(--wed-soft)" }}
            >
              {names.p1.charAt(0)}
              <span className="mx-0.5">&</span>
              {names.p2.charAt(0)}
            </div>
            <p className="mt-6 font-serif text-4xl italic text-foreground md:text-5xl">{names.label}</p>
            <OrnamentDivider className="mx-auto mt-6 max-w-[12rem]" />
            <p className="mt-6 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Hecho con <Link href="/mi-evento" className="underline underline-offset-2 hover:text-foreground">Momentum</Link>
            </p>
          </footer>
        </main>
      </GuestModeContext.Provider>
    </BodaViewDetailsContext.Provider>
  );
}
