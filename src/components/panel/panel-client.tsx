"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
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
import { EASE } from "./shared";
import { FinanzasTab } from "./finanzas-tab";
import { AgendaTab } from "./agenda-tab";
import { PaquetesTab } from "./paquetes-tab";
import { ReservasTab } from "./reservas-tab";
import { ReservationSheet } from "./reservation-sheet";

type TabId = "finanzas" | "agenda" | "paquetes" | "reservas";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "finanzas", label: "Tablero Finanzas", icon: BarChart3 },
  { id: "agenda", label: "Mi Agenda & Contactos", icon: CalendarDays },
  { id: "paquetes", label: "Configurar Paquetes", icon: Settings2 },
  { id: "reservas", label: "Mis Reservas", icon: ClipboardList },
];

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

/* --------------------------------- Shell --------------------------------- */

export function PanelProveedorClient() {
  const [tab, setTab] = useState<TabId>("finanzas");
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
    <div className="min-h-screen bg-background">
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
            Gestiona tus ganancias, paquetes, categorías y tu agenda de eventos con la ficha completa
            de contacto de cada cliente.
          </p>
        </motion.div>

        {/* Tabs — píldoras como los filtros del marketplace */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1, ease: EASE }}
          className="mb-10 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "relative inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition-colors",
                tab === id
                  ? "text-background"
                  : "border border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              )}
            >
              {tab === id && (
                <motion.span
                  layoutId="panel-tab-pill"
                  className="absolute inset-0 rounded-full bg-foreground"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Icon size={15} />
                {label}
              </span>
            </button>
          ))}
        </motion.div>

        {/* Contenido de cada tab */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            {tab === "finanzas" && (
              <FinanzasTab reservations={reservations} onOpenReservation={openReservation} />
            )}
            {tab === "agenda" && (
              <AgendaTab
                reservations={reservations}
                blockedDates={blockedDates}
                onToggleBlocked={toggleBlocked}
                onOpenReservation={openReservation}
              />
            )}
            {tab === "paquetes" && <PaquetesTab />}
            {tab === "reservas" && (
              <ReservasTab reservations={reservations} onOpenReservation={openReservation} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Drawer de contacto del cliente */}
      <ReservationSheet reservation={selected} open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
