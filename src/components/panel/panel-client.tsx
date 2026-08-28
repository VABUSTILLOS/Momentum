"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Moon,
  Settings2,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { signOut } from "@/lib/actions/auth";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import {
  INITIAL_BLOCKED_DATES,
  PROVIDER,
  RESERVATIONS,
  type Reservation,
} from "@/lib/panel-data";
import { EASE, Eyebrow } from "./shared";
import { FinanzasTab } from "./finanzas-tab";
import { AgendaTab } from "./agenda-tab";
import { PaquetesTab } from "./paquetes-tab";
import { ReservasTab } from "./reservas-tab";
import { ResumenTab } from "./resumen-tab";
import { ReservationSheet } from "./reservation-sheet";

/* --------- Header idéntico en patrón al del marketplace (píldora) -------- */

function PanelHeader({ pendientes }: { pendientes: number }) {
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
          {pendientes > 0 && (
            <span className="hidden items-center gap-1.5 rounded-full border border-background/20 px-3 py-1.5 text-[11px] font-medium text-background sm:inline-flex">
              <span className="inline-flex size-4 items-center justify-center rounded-full bg-background text-[10px] font-bold text-foreground">
                {pendientes}
              </span>
              por confirmar
            </span>
          )}
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
          <form action={signOut}>
            <button
              type="submit"
              className="inline-flex size-9 items-center justify-center rounded-full border border-background/20 text-background hover:bg-background/10"
              aria-label="Cerrar sesión"
            >
              <LogOut size={16} aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

/* ------------------------- Navegación por pestañas ------------------------ */

const TABS = [
  { id: "resumen", label: "Resumen", icon: LayoutDashboard },
  { id: "finanzas", label: "Finanzas", icon: BarChart3 },
  { id: "agenda", label: "Agenda", icon: CalendarDays },
  { id: "reservas", label: "Reservas", icon: ClipboardList },
  { id: "paquetes", label: "Paquetes", icon: Settings2 },
] as const;

export type TabId = (typeof TABS)[number]["id"];

function isTabId(value: string | null): value is TabId {
  return TABS.some((t) => t.id === value);
}

function TabsNav({
  active,
  onChange,
  pendientes,
}: {
  active: TabId;
  onChange: (tab: TabId) => void;
  pendientes: number;
}) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const idx = TABS.findIndex((t) => t.id === active);
    let next = -1;
    if (e.key === "ArrowRight") next = (idx + 1) % TABS.length;
    if (e.key === "ArrowLeft") next = (idx - 1 + TABS.length) % TABS.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = TABS.length - 1;
    if (next >= 0) {
      e.preventDefault();
      onChange(TABS[next].id);
      document.getElementById(`tab-${TABS[next].id}`)?.focus();
    }
  };

  return (
    <div
      role="tablist"
      aria-label="Secciones del panel"
      onKeyDown={handleKeyDown}
      className="sticky top-[4.75rem] z-40 mb-10 flex gap-1 overflow-x-auto rounded-full border border-border bg-background/85 p-1.5 backdrop-blur-md [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {TABS.map(({ id, label, icon: Icon }) => {
        const isActive = id === active;
        return (
          <button
            key={id}
            id={`tab-${id}`}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(id)}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <Icon size={15} />
            {label}
            {id === "reservas" && pendientes > 0 && (
              <span
                className={cn(
                  "inline-flex size-4.5 items-center justify-center rounded-full text-[10px] font-bold",
                  isActive ? "bg-background text-foreground" : "bg-foreground text-background"
                )}
              >
                {pendientes}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function TabHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-8">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-2 font-serif text-3xl font-medium tracking-tight text-foreground md:text-4xl">
        {title}
      </h2>
    </div>
  );
}

/** Saludo según la hora del día */
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

/* --------------------------------- Shell --------------------------------- */

export function PanelProveedorClient() {
  const [activeTab, setActiveTab] = useState<TabId>("resumen");
  const [selected, setSelected] = useState<Reservation | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [blockedDates, setBlockedDates] = useState<Set<string>>(
    () => new Set(INITIAL_BLOCKED_DATES)
  );

  const reservations = useMemo(() => RESERVATIONS, []);
  const pendientes = useMemo(
    () => reservations.filter((r) => r.status === "por-confirmar").length,
    [reservations]
  );

  // Deep-link: lee ?tab= al montar y refleja cambios en la URL
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("tab");
    if (isTabId(param)) setActiveTab(param);
  }, []);

  const changeTab = (tab: TabId) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    if (tab === "resumen") url.searchParams.delete("tab");
    else url.searchParams.set("tab", tab);
    window.history.replaceState(null, "", url.toString());
    window.scrollTo({ top: 0 });
  };

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
      <PanelHeader pendientes={pendientes} />

      <main className="mx-auto w-[90%] max-w-6xl pb-20 pt-28">
        {/* Encabezado — saludo según la hora del día */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-10"
        >
          <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            {greeting()}
          </p>
          <h1 className="mt-3 font-serif text-4xl font-medium leading-[1.02] tracking-tight text-foreground md:text-5xl">
            Hola, {PROVIDER.name}
          </h1>
          <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
            Todo tu negocio en una sola vista: ganancias, agenda, reservas y la configuración de tus paquetes.
          </p>
        </motion.div>

        {/* Navegación por pestañas */}
        <TabsNav active={activeTab} onChange={changeTab} pendientes={pendientes} />

        {/* Contenido de la pestaña activa */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            id={`panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            {activeTab === "resumen" && (
              <ResumenTab
                reservations={reservations}
                blockedDates={blockedDates}
                onOpenReservation={openReservation}
                onGoToTab={changeTab}
              />
            )}
            {activeTab === "finanzas" && (
              <>
                <TabHeading eyebrow="Finanzas" title="Tablero de finanzas" />
                <FinanzasTab reservations={reservations} onOpenReservation={openReservation} />
              </>
            )}
            {activeTab === "agenda" && (
              <>
                <TabHeading eyebrow="Agenda" title="Mi agenda & disponibilidad" />
                <AgendaTab
                  reservations={reservations}
                  blockedDates={blockedDates}
                  onToggleBlocked={toggleBlocked}
                  onOpenReservation={openReservation}
                />
              </>
            )}
            {activeTab === "reservas" && (
              <>
                <TabHeading eyebrow="Reservas" title="Mis reservas" />
                <ReservasTab reservations={reservations} onOpenReservation={openReservation} />
              </>
            )}
            {activeTab === "paquetes" && (
              <>
                <TabHeading eyebrow="Paquetes" title="Configurar paquetes" />
                <PaquetesTab />
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Drawer de contacto del cliente */}
      <ReservationSheet reservation={selected} open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
