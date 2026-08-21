"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  ClipboardList,
  Moon,
  Settings2,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import {
  INITIAL_BLOCKED_DATES,
  PROVIDER,
  RESERVATIONS,
  type Reservation,
} from "@/lib/panel-data";
import { Divider, EASE, Eyebrow } from "./shared";
import { FinanzasTab } from "./finanzas-tab";
import { AgendaTab } from "./agenda-tab";
import { PaquetesTab } from "./paquetes-tab";
import { ReservasTab } from "./reservas-tab";
import { ReservationSheet } from "./reservation-sheet";

/* --------- Header idéntico en patrón al del marketplace (píldora) -------- */

function PanelHeader() {
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
            href="/"
            className="inline-flex size-9 items-center justify-center rounded-full border border-background/20 text-background hover:bg-background/10"
            aria-label="Volver al inicio"
          >
            <ArrowLeft size={16} />
          </Link>
          <Link href="/" className="flex items-baseline gap-2 font-serif text-xl tracking-tight text-background">
            Momentum{" "}
            <span className="font-sans text-[10px] uppercase tracking-[0.18em] opacity-70">
              Panel de Proveedor
            </span>
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
          <span className="hidden items-center gap-2 rounded-full bg-background px-4 py-2 sm:flex">
            <span className="inline-flex size-6 items-center justify-center rounded-full bg-foreground font-serif text-[11px] font-bold text-background">
              PM
            </span>
            <span className="text-sm font-medium text-foreground">{PROVIDER.name}</span>
          </span>
        </div>
      </div>
    </header>
  );
}

/* --------------------- Navegación de secciones (anclas) ------------------- */

const SECTIONS = [
  { id: "finanzas", label: "Finanzas", icon: BarChart3, num: "01", title: "Tablero de finanzas" },
  { id: "agenda", label: "Agenda", icon: CalendarDays, num: "02", title: "Mi agenda & contactos" },
  { id: "reservas", label: "Reservas", icon: ClipboardList, num: "03", title: "Mis reservas" },
  { id: "paquetes", label: "Paquetes", icon: Settings2, num: "04", title: "Configurar paquetes" },
] as const;

function SectionNav() {
  return (
    <nav className="sticky top-[4.75rem] z-40 mb-14 flex gap-1 overflow-x-auto rounded-full border border-border bg-background/85 p-1.5 backdrop-blur-md [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {SECTIONS.map(({ id, label, icon: Icon }) => (
        <a
          key={id}
          href={`#${id}`}
          className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Icon size={15} />
          {label}
        </a>
      ))}
    </nav>
  );
}

function SectionHeading({ num, title, index }: { num: string; title: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: index * 0.04, ease: EASE }}
      className="mb-8"
    >
      <Eyebrow>{num} — Sección</Eyebrow>
      <h2 className="mt-2 font-serif text-3xl font-medium tracking-tight text-foreground md:text-4xl">
        {title}
      </h2>
    </motion.div>
  );
}

/* --------------------------------- Shell --------------------------------- */

export function PanelProveedorClient() {
  const [selected, setSelected] = useState<Reservation | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [blockedDates, setBlockedDates] = useState<Set<string>>(
    () => new Set(INITIAL_BLOCKED_DATES)
  );

  const reservations = useMemo(() => RESERVATIONS, []);

  const openReservation = (r: Reservation) => {
    setSelected(r);
    setSheetOpen(true);
  };

  const toggleBlocked = (iso: string) => {
    setBlockedDates((prev) => {
      const next = new Set(prev);
      if (next.has(iso)) next.delete(iso);
      else next.add(iso);
      return next;
    });
  };

  return (
    <div className="min-h-screen scroll-smooth bg-background">
      <Toaster position="bottom-right" />
      <PanelHeader />

      <main className="mx-auto w-[90%] max-w-6xl pb-20 pt-28">
        {/* Encabezado — mismo patrón tipográfico del hero de marketplace */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-10"
        >
          <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            Bienvenido de vuelta
          </p>
          <h1 className="mt-3 font-serif text-4xl font-medium leading-[1.02] tracking-tight text-foreground md:text-5xl">
            Hola, {PROVIDER.name}
          </h1>
          <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
            Todo tu negocio en una sola vista: ganancias, agenda, reservas y la configuración de tus paquetes.
          </p>
        </motion.div>

        {/* Navegación pegajosa de las 4 áreas del panel */}
        <SectionNav />

        {/* 01 · Finanzas */}
        <section id="finanzas" className="scroll-mt-36">
          <SectionHeading num="01" title="Tablero de finanzas" index={0} />
          <FinanzasTab reservations={reservations} onOpenReservation={openReservation} />
        </section>

        <Divider className="my-16" />

        {/* 02 · Agenda */}
        <section id="agenda" className="scroll-mt-36">
          <SectionHeading num="02" title="Mi agenda & contactos" index={1} />
          <AgendaTab
            reservations={reservations}
            blockedDates={blockedDates}
            onToggleBlocked={toggleBlocked}
            onOpenReservation={openReservation}
          />
        </section>

        <Divider className="my-16" />

        {/* 03 · Reservas */}
        <section id="reservas" className="scroll-mt-36">
          <SectionHeading num="03" title="Mis reservas" index={2} />
          <ReservasTab reservations={reservations} onOpenReservation={openReservation} />
        </section>

        <Divider className="my-16" />

        {/* 04 · Paquetes */}
        <section id="paquetes" className="scroll-mt-36">
          <SectionHeading num="04" title="Configurar paquetes" index={3} />
          <PaquetesTab />
        </section>
      </main>

      {/* Drawer de contacto del cliente */}
      <ReservationSheet reservation={selected} open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
