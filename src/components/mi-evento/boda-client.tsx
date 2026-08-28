"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Gift,
  Heart,
  MapPin,
  Moon,
  Pencil,
  Shirt,
  Sun,
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
  SheetTrigger,
} from "@/components/ui/sheet";
import { useEvent, type WeddingSite } from "@/lib/event-context";
import { cn } from "@/lib/utils";

const HERO_IMAGE =
  "https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=1920";

const fade = (delay: number, className?: string) => ({
  className: cn("animate-fade-in opacity-0", className),
  style: { animationDelay: `${delay}ms`, animationFillMode: "forwards" as const },
});

function coupleNames(wedding: WeddingSite) {
  const p1 = wedding.partner1.trim() || "Mariana";
  const p2 = wedding.partner2.trim() || "Diego";
  return { p1, p2, label: `${p1} & ${p2}` };
}

/* --------------------------------- Toolbar --------------------------------- */

function BodaToolbar() {
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
          <EditSheet />
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

function EditSheet() {
  const { wedding, updateWedding } = useEvent();
  const set = (patch: Partial<WeddingSite>) => updateWedding(patch);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full bg-background px-5 py-2 text-sm font-medium text-foreground hover:bg-background/90"
        >
          <Pencil size={14} />
          <span className="hidden sm:inline">Editar contenido</span>
        </button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-serif text-2xl tracking-tight">Personaliza tu página</SheetTitle>
          <SheetDescription>
            Cada cambio se refleja al instante en la página. Todo se guarda automáticamente.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-5 px-4 pb-8">
          <div className="grid grid-cols-2 gap-3">
            <EditField label="Nombre 1" value={wedding.partner1} onChange={(v) => set({ partner1: v })} placeholder="Mariana" />
            <EditField label="Nombre 2" value={wedding.partner2} onChange={(v) => set({ partner2: v })} placeholder="Diego" />
          </div>
          <EditField label="Hashtag" value={wedding.hashtag} onChange={(v) => set({ hashtag: v })} placeholder="#MarianaYDiego" />
          <EditField
            label="Mensaje de bienvenida"
            value={wedding.message}
            onChange={(v) => set({ message: v })}
            placeholder="Después de tanto tiempo juntos, por fin llegó el día…"
            textarea
          />
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">Ceremonia</p>
          <div className="grid grid-cols-[1fr_110px] gap-3">
            <EditField label="Sede" value={wedding.ceremonyVenue} onChange={(v) => set({ ceremonyVenue: v })} placeholder="Parroquia de San Miguel" />
            <EditField label="Hora" value={wedding.ceremonyTime} onChange={(v) => set({ ceremonyTime: v })} placeholder="5:00 PM" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">Recepción</p>
          <div className="grid grid-cols-[1fr_110px] gap-3">
            <EditField label="Sede" value={wedding.receptionVenue} onChange={(v) => set({ receptionVenue: v })} placeholder="Hacienda Los Laureles" />
            <EditField label="Hora" value={wedding.receptionTime} onChange={(v) => set({ receptionTime: v })} placeholder="7:30 PM" />
          </div>
          <EditField label="Código de vestimenta" value={wedding.dressCode} onChange={(v) => set({ dressCode: v })} placeholder="Etiqueta rigurosa" />
          <EditField label="Mesa de regalos" value={wedding.giftTable} onChange={(v) => set({ giftTable: v })} placeholder="Liverpool · Evento 51234567" />
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

/* -------------------------------- Secciones -------------------------------- */

function HeroSection({ wedding }: { wedding: WeddingSite }) {
  const { details } = useEvent();
  const names = coupleNames(wedding);

  return (
    <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 text-center text-white">
      <FadeImage src={HERO_IMAGE} alt="Boda" fill priority className="object-cover" />
      <div className="absolute inset-0 bg-black/45" />
      <div className="relative z-10 flex flex-col items-center">
        <p {...fade(0, "text-xs uppercase tracking-[0.32em] opacity-90")}>Nos casamos</p>
        <h1 {...fade(150, "mt-6 font-serif text-6xl font-medium leading-[0.95] tracking-tight md:text-8xl")}>
          {names.p1}
          <span className="mx-3 font-light italic md:mx-5">&</span>
          {names.p2}
        </h1>
        <p {...fade(300, "mt-6 flex items-center gap-2 text-sm uppercase tracking-[0.24em] opacity-90")}>
          <CalendarDays size={15} />
          {details.date
            ? details.date.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
            : "Fecha por definir"}
        </p>
        <div {...fade(450)}>
          <Countdown date={details.date} />
        </div>
      </div>
      <div className="absolute bottom-8 z-10 flex flex-col items-center gap-2 opacity-80">
        <span className="text-[10px] uppercase tracking-[0.28em]">Desliza</span>
        <span className="h-8 w-px animate-pulse bg-white/70" />
      </div>
    </section>
  );
}

function WelcomeSection({ wedding }: { wedding: WeddingSite }) {
  const message =
    wedding.message.trim() ||
    "Después de tanto tiempo juntos, por fin llegó el día que soñamos. Queremos celebrarlo rodeados de las personas que más queremos: ustedes. Acompáñanos a escribir el capítulo más bonito de nuestra historia.";
  return (
    <section className="mx-auto max-w-2xl px-6 py-20 text-center md:py-28">
      <span {...fade(0, "inline-flex size-12 items-center justify-center rounded-full bg-secondary text-foreground")}>
        <Heart size={20} className="fill-foreground" />
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
  return (
    <div {...fade(delay, "flex flex-col items-center rounded-3xl border border-border p-8 text-center md:p-10")}>
      <span className="inline-flex size-12 items-center justify-center rounded-full bg-secondary text-foreground">
        <MapPin size={20} />
      </span>
      <h3 className="mt-5 font-serif text-2xl font-medium tracking-tight text-foreground">{title}</h3>
      <p className="mt-3 text-base font-medium text-foreground">{venue || "Sede por confirmar"}</p>
      <p className="mt-1 text-sm text-muted-foreground">{time || "Hora por confirmar"}</p>
    </div>
  );
}

function DetailsGrid({ wedding }: { wedding: WeddingSite }) {
  const { details } = useEvent();
  return (
    <section className="mx-auto max-w-4xl px-6 pb-20 md:pb-28">
      <div className="grid gap-6 md:grid-cols-2">
        <VenueCard title="Ceremonia" venue={wedding.ceremonyVenue} time={wedding.ceremonyTime} delay={0} />
        <VenueCard title="Recepción" venue={wedding.receptionVenue} time={wedding.receptionTime} delay={100} />
      </div>
      <div {...fade(200, "mt-6 grid gap-6 md:grid-cols-2")}>
        <div className="flex flex-col items-center rounded-3xl border border-border p-8 text-center">
          <span className="inline-flex size-12 items-center justify-center rounded-full bg-secondary text-foreground">
            <Shirt size={20} />
          </span>
          <h3 className="mt-5 font-serif text-2xl font-medium tracking-tight text-foreground">Código de vestimenta</h3>
          <p className="mt-3 text-base text-muted-foreground">{wedding.dressCode.trim() || "Etiqueta rigurosa"}</p>
        </div>
        <div className="flex flex-col items-center rounded-3xl border border-border p-8 text-center">
          <span className="inline-flex size-12 items-center justify-center rounded-full bg-secondary text-foreground">
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

function GiftSection({ wedding }: { wedding: WeddingSite }) {
  return (
    <section className="bg-secondary/60 px-6 py-20 md:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <span {...fade(0, "inline-flex size-12 items-center justify-center rounded-full bg-foreground text-background")}>
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
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto flex max-w-md flex-col items-center rounded-3xl border border-border px-8 py-14 text-center">
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
    <section className="px-6 py-20 md:py-28">
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
                  attending === opt.id
                    ? "bg-foreground text-background"
                    : "border border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            type="submit"
            className="rounded-full bg-foreground px-5 py-3.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Confirmar asistencia
          </button>
        </form>
      </div>
    </section>
  );
}

/* --------------------------------- Página ---------------------------------- */

export function BodaClient() {
  const { wedding, hydrated } = useEvent();
  const names = coupleNames(wedding);

  if (!hydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-40 w-full max-w-3xl animate-pulse rounded-3xl bg-secondary" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <BodaToolbar />
      <HeroSection wedding={wedding} />
      <WelcomeSection wedding={wedding} />
      <DetailsGrid wedding={wedding} />
      <GiftSection wedding={wedding} />
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
