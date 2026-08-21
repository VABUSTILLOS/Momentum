"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  ClipboardList,
  Settings2,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster } from "sonner";
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

export function PanelProveedorClient() {
  const [tab, setTab] = useState<TabId>("finanzas");
  const [selected, setSelected] = useState<Reservation | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [blockedDates, setBlockedDates] = useState<Set<string>>(
    () => new Set(INITIAL_BLOCKED_DATES)
  );
  const { setTheme } = useTheme();

  // El panel es 100% tema oscuro premium: forzamos dark mientras está montado.
  useEffect(() => {
    setTheme("dark");
  }, [setTheme]);

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
    <div className="min-h-screen bg-[#0A0A0A] text-neutral-100">
      <Toaster theme="dark" position="bottom-right" richColors />

      {/* Header */}
      <header className="fixed left-1/2 top-4 z-40 w-[92%] max-w-6xl -translate-x-1/2">
        <div className="flex items-center justify-between rounded-full border border-white/10 bg-[#111111]/85 px-5 py-3 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex size-9 items-center justify-center rounded-full border border-white/15 text-neutral-300 transition-colors hover:border-[#C9A96E]/50 hover:text-[#E6CD9A]"
              aria-label="Volver al inicio"
            >
              <ArrowLeft size={16} />
            </Link>
            <span className="flex items-baseline gap-2 font-serif text-xl tracking-tight text-white">
              Momentum{" "}
              <span className="font-sans text-[10px] uppercase tracking-[0.18em] text-[#C9A96E]">
                Panel de Proveedor
              </span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-neutral-400 sm:block">{PROVIDER.name}</span>
            <span className="inline-flex size-9 items-center justify-center rounded-full bg-[#C9A96E] font-serif text-sm font-bold text-[#0A0A0A]">
              PM
            </span>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="mx-auto w-[92%] max-w-6xl pb-20 pt-28">
        {/* Encabezado de bienvenida */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-8"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#C9A96E]">
            Bienvenido de vuelta
          </p>
          <h1 className="mt-2 font-serif text-4xl tracking-tight text-white md:text-5xl">
            Hola, {PROVIDER.name}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-400">
            Gestiona tus ganancias, paquetes, categorías y tu agenda de eventos con la ficha completa
            de contacto de cada cliente.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1, ease: EASE }}
          className="mb-8 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "relative inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition-colors",
                tab === id ? "text-[#0A0A0A]" : "border border-white/10 text-neutral-400 hover:border-[#C9A96E]/35 hover:text-white"
              )}
            >
              {tab === id && (
                <motion.span
                  layoutId="panel-tab-pill"
                  className="absolute inset-0 rounded-full bg-[#C9A96E]"
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
