"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { differenceInCalendarDays, isSameMonth, parseISO } from "date-fns";
import {
  ArrowRight,
  CalendarClock,
  CalendarX2,
  CircleAlert,
  HandCoins,
  MessageCircle,
  Sparkles,
  Wallet,
} from "lucide-react";
import { formatMXN } from "@/lib/marketplace-data";
import { saldoDe, type Reservation } from "@/lib/panel-data";
import { cn } from "@/lib/utils";
import { AnimatedMoney, AnimatedNumber, EASE, Eyebrow, PanelCard, StatusPill } from "./shared";
import { formatEventDate } from "./date-utils";
import type { TabId } from "./panel-client";

/* ------------------------- Resumen / home del panel ------------------------ */

export function ResumenTab({
  reservations,
  blockedDates,
  onOpenReservation,
  onGoToTab,
}: {
  reservations: Reservation[];
  blockedDates: Set<string>;
  onOpenReservation: (r: Reservation) => void;
  onGoToTab: (tab: TabId) => void;
}) {
  const now = new Date();

  const upcoming = useMemo(
    () =>
      [...reservations]
        .filter((r) => differenceInCalendarDays(parseISO(r.date), now) >= 0)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [reservations, now]
  );

  const nextEvent = upcoming[0];
  const daysToNext = nextEvent
    ? differenceInCalendarDays(parseISO(nextEvent.date), now)
  : null;

  const porConfirmar = useMemo(
    () => upcoming.filter((r) => r.status === "por-confirmar"),
    [upcoming]
  );

  const saldoPendiente = useMemo(
    () => upcoming.reduce((acc, r) => acc + saldoDe(r.total), 0),
    [upcoming]
  );

  const ingresosMes = useMemo(
    () =>
      upcoming
        .filter((r) => isSameMonth(parseISO(r.date), now))
        .reduce((acc, r) => acc + r.total, 0),
    [upcoming, now]
  );

  const bloqueadasProximas = useMemo(
    () =>
      [...blockedDates]
        .filter((iso) => differenceInCalendarDays(parseISO(iso), now) >= 0)
        .sort()
        .slice(0, 3),
    [blockedDates, now]
  );

  const cards = [
    {
      icon: CalendarClock,
      eyebrow: "Próximo evento",
      value: nextEvent ? (
        <span className="font-serif text-3xl font-medium tracking-tight text-foreground">
          {daysToNext === 0 ? "¡Hoy!" : `${daysToNext} días`}
        </span>
      ) : (
        <span className="font-serif text-3xl font-medium tracking-tight text-foreground">—</span>
      ),
      hint: nextEvent
        ? `${nextEvent.eventType} de ${nextEvent.clientName} · ${formatEventDate(nextEvent.date)}`
        : "Sin eventos próximos",
    },
    {
      icon: CircleAlert,
      eyebrow: "Por confirmar",
      value: (
        <AnimatedNumber
          value={porConfirmar.length}
          className="font-serif text-3xl font-medium tracking-tight text-foreground"
        />
      ),
      hint:
        porConfirmar.length > 0
          ? "Reservas esperando tu confirmación"
          : "Todo confirmado, buen trabajo",
    },
    {
      icon: HandCoins,
      eyebrow: "Saldo por cobrar",
      value: (
        <AnimatedMoney
          value={saldoPendiente}
          className="font-serif text-3xl font-medium tracking-tight text-foreground"
        />
      ),
      hint: "90% restante de eventos próximos",
    },
    {
      icon: Wallet,
      eyebrow: "Ingresos de este mes",
      value: (
        <AnimatedMoney
          value={ingresosMes}
          className="font-serif text-3xl font-medium tracking-tight text-foreground"
        />
      ),
      hint: "Total cotizado en eventos del mes en curso",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Avisos contextuales */}
      {(porConfirmar.length > 0 || bloqueadasProximas.length > 0) && (
        <div className="flex flex-col gap-2.5">
          {porConfirmar.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-secondary/60 px-5 py-4">
              <p className="flex items-center gap-2.5 text-sm text-foreground">
                <CircleAlert size={16} className="shrink-0" />
                Tienes <strong className="font-medium">{porConfirmar.length} reserva(s) por confirmar</strong> — confírmalas para asegurar la fecha.
              </p>
              <button
                type="button"
                onClick={() => onGoToTab("reservas")}
                className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background transition-opacity hover:opacity-90"
              >
                Revisar reservas
                <ArrowRight size={13} />
              </button>
            </div>
          )}
          {bloqueadasProximas.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border px-5 py-4">
              <p className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <CalendarX2 size={16} className="shrink-0" />
                Tienes {bloqueadasProximas.length} fecha(s) bloqueadas próximas:{" "}
                {bloqueadasProximas.map((iso) => formatEventDate(iso)).join(" · ")}
              </p>
              <button
                type="button"
                onClick={() => onGoToTab("agenda")}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Ver agenda
                <ArrowRight size={13} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ icon: Icon, eyebrow, value, hint }, i) => (
          <motion.div
            key={eyebrow}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: i * 0.08, ease: EASE }}
          >
            <PanelCard className="h-full p-6">
              <span className="inline-flex size-10 items-center justify-center rounded-full border border-border text-foreground">
                <Icon size={17} />
              </span>
              <div className="mt-5">{value}</div>
              <p className="mt-2 text-sm font-medium text-foreground">{eyebrow}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{hint}</p>
            </PanelCard>
          </motion.div>
        ))}
      </div>

      {/* Próximos eventos */}
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.32, ease: EASE }}
      >
        <PanelCard className="overflow-hidden">
          <div className="flex items-center justify-between px-6 pb-2 pt-6">
            <div>
              <Eyebrow>Actividad</Eyebrow>
              <h3 className="mt-1.5 font-serif text-2xl font-medium tracking-tight text-foreground">
                Próximos eventos
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onGoToTab("agenda")}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Ver agenda completa
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="mt-4 flex flex-col">
            {upcoming.slice(0, 3).map((r) => {
              const days = differenceInCalendarDays(parseISO(r.date), now);
              return (
                <div
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-6 py-4 transition-colors hover:bg-secondary/60"
                >
                  <button
                    type="button"
                    onClick={() => onOpenReservation(r)}
                    className="flex min-w-0 items-center gap-4 text-left"
                  >
                    <span
                      className={cn(
                        "inline-flex w-14 shrink-0 flex-col items-center justify-center rounded-xl px-2 py-2",
                        days <= 7 ? "bg-foreground text-background" : "bg-secondary text-foreground"
                      )}
                    >
                      <span className="text-[9px] font-medium uppercase tracking-wider opacity-80">
                        {days === 0 ? "hoy" : `en ${days}d`}
                      </span>
                      <span className="font-serif text-lg font-medium leading-tight">
                        {r.date.slice(8, 10)}
                      </span>
                    </span>
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="truncate font-medium text-foreground">{r.clientName}</span>
                        <StatusPill tone={r.status === "confirmada" ? "solid" : "outline"}>
                          {r.status === "confirmada" ? "Confirmada" : "Por confirmar"}
                        </StatusPill>
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {r.eventType} · {formatEventDate(r.date)} · {r.venue}
                      </span>
                    </span>
                  </button>
                  <a
                    href={`https://wa.me/${r.phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
                  >
                    <MessageCircle size={14} />
                    WhatsApp
                  </a>
                </div>
              );
            })}
            {upcoming.length === 0 && (
              <div className="flex flex-col items-center gap-3 border-t border-border px-6 py-14 text-center">
                <span className="inline-flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                  <Sparkles size={20} />
                </span>
                <p className="font-medium text-foreground">No hay eventos próximos</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Cuando un cliente aparte una fecha contigo, aparecerá aquí con su ficha de contacto completa.
                </p>
              </div>
            )}
          </div>
        </PanelCard>
      </motion.div>
    </div>
  );
}
