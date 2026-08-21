"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";
import { CalendarX2, ChevronLeft, ChevronRight, CircleDot, Ban, MousePointerClick } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Reservation } from "@/lib/panel-data";
import { dateKey } from "./date-utils";
import { EASE, Eyebrow, PanelCard } from "./shared";

type ViewMode = "mes" | "semana";

/* --------------- Agenda: calendario + bloqueo manual de fechas ---------- */

export function AgendaTab({
  reservations,
  blockedDates,
  onToggleBlocked,
  onOpenReservation,
}: {
  reservations: Reservation[];
  blockedDates: Set<string>;
  onToggleBlocked: (iso: string) => void;
  onOpenReservation: (r: Reservation) => void;
}) {
  const [view, setView] = useState<ViewMode>("mes");
  const [cursor, setCursor] = useState<Date>(() => new Date(2026, 8, 1)); // sep 2026
  const [blockMode, setBlockMode] = useState(false);

  const byDate = useMemo(() => {
    const map = new Map<string, Reservation>();
    for (const r of reservations) map.set(r.date, r);
    return map;
  }, [reservations]);

  const days = useMemo(() => {
    if (view === "mes") {
      return eachDayOfInterval({
        start: startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 }),
        end: endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 }),
      });
    }
    return eachDayOfInterval({
      start: startOfWeek(cursor, { weekStartsOn: 1 }),
      end: endOfWeek(cursor, { weekStartsOn: 1 }),
    });
  }, [cursor, view]);

  const goPrev = () => setCursor((c) => (view === "mes" ? addMonths(c, -1) : addWeeks(c, -1)));
  const goNext = () => setCursor((c) => (view === "mes" ? addMonths(c, 1) : addWeeks(c, 1)));

  const handleDayClick = (day: Date) => {
    const key = dateKey(day);
    const reservation = byDate.get(key);
    if (reservation) {
      onOpenReservation(reservation);
      return;
    }
    if (blockMode) {
      const willBlock = !blockedDates.has(key);
      onToggleBlocked(key);
      toast[willBlock ? "success" : "info"](
        willBlock ? "Fecha marcada como No Disponible" : "Fecha liberada",
        {
          description: `${format(day, "d 'de' MMMM, yyyy", { locale: es })} ${
            willBlock
              ? "queda bloqueada en el marketplace público."
              : "vuelve a estar disponible en el marketplace."
          }`,
        }
      );
    }
  };

  const title =
    view === "mes"
      ? format(cursor, "MMMM yyyy", { locale: es })
      : `Semana del ${format(days[0], "d MMM", { locale: es })} al ${format(days[6], "d MMM yyyy", { locale: es })}`;

  return (
    <div className="flex flex-col gap-6">
      {/* Barra de controles */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            className="inline-flex size-9 items-center justify-center rounded-full border border-white/10 text-neutral-300 transition-colors hover:border-[#C9A96E]/40 hover:text-[#E6CD9A]"
            aria-label="Anterior"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="inline-flex size-9 items-center justify-center rounded-full border border-white/10 text-neutral-300 transition-colors hover:border-[#C9A96E]/40 hover:text-[#E6CD9A]"
            aria-label="Siguiente"
          >
            <ChevronRight size={16} />
          </button>
          <h3 className="ml-2 font-serif text-2xl capitalize tracking-tight text-white">{title}</h3>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Toggle mensual / semanal */}
          <div className="flex rounded-full border border-white/10 p-1">
            {(["mes", "semana"] as ViewMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setView(m)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition-all",
                  view === m ? "bg-[#C9A96E] text-[#0A0A0A]" : "text-neutral-400 hover:text-white"
                )}
              >
                {m}
              </button>
            ))}
          </div>
          {/* Bloqueo manual */}
          <button
            type="button"
            onClick={() => setBlockMode((b) => !b)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all",
              blockMode
                ? "border-red-400/50 bg-red-400/15 text-red-300"
                : "border-white/10 text-neutral-300 hover:border-red-400/40 hover:text-red-300"
            )}
          >
            <CalendarX2 size={14} />
            {blockMode ? "Modo bloqueo activo" : "Bloquear fechas"}
          </button>
        </div>
      </motion.div>

      {/* Aviso de modo bloqueo */}
      <AnimatePresence>
        {blockMode && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 overflow-hidden rounded-xl border border-red-400/25 bg-red-400/8 px-4 py-2.5 text-xs text-red-200"
          >
            <MousePointerClick size={14} className="shrink-0" />
            Haz clic en cualquier día libre para marcarlo como <strong>&nbsp;No Disponible / Ocupado&nbsp;</strong> — se bloqueará en el marketplace público. Clic de nuevo para liberarlo.
          </motion.p>
        )}
      </AnimatePresence>

      {/* Leyenda */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-wrap items-center gap-5 text-xs text-neutral-400"
      >
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-gradient-to-br from-[#E6CD9A] to-[#C9A96E]" />
          Evento reservado vía Momentum
        </span>
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-red-400/80" />
          No Disponible / Ocupado (bloqueo manual)
        </span>
        <span className="flex items-center gap-2">
          <CircleDot size={12} className="text-[#C9A96E]" />
          Hoy
        </span>
      </motion.div>

      {/* Calendario */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.12, ease: EASE }}
      >
        <PanelCard className="overflow-hidden">
          {/* Encabezado días de semana */}
          <div className="grid grid-cols-7 border-b border-white/8">
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
              <div
                key={d}
                className="px-2 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {days.map((day) => {
              const key = dateKey(day);
              const reservation = byDate.get(key);
              const blocked = blockedDates.has(key);
              const outside = view === "mes" && !isSameMonth(day, cursor);
              const today = isToday(day);

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  disabled={!reservation && !blockMode}
                  className={cn(
                    "group relative flex flex-col border-b border-r border-white/6 p-2 text-left transition-colors [&:nth-child(7n)]:border-r-0",
                    view === "mes" ? "min-h-[104px]" : "min-h-[150px]",
                    outside && "opacity-35",
                    reservation
                      ? "cursor-pointer bg-gradient-to-br from-[#C9A96E]/14 to-transparent hover:from-[#C9A96E]/22"
                      : blocked
                        ? "cursor-pointer bg-[repeating-linear-gradient(135deg,rgba(248,113,113,0.07)_0px,rgba(248,113,113,0.07)_8px,transparent_8px,transparent_16px)] hover:bg-[repeating-linear-gradient(135deg,rgba(248,113,113,0.13)_0px,rgba(248,113,113,0.13)_8px,transparent_8px,transparent_16px)]"
                        : blockMode
                          ? "cursor-pointer hover:bg-red-400/8"
                          : "cursor-default",
                    !reservation && !blocked && !blockMode && "hover:bg-white/[0.02]"
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex size-7 items-center justify-center rounded-full text-xs font-medium",
                      today
                        ? "bg-[#C9A96E] font-bold text-[#0A0A0A]"
                        : reservation
                          ? "text-[#E6CD9A]"
                          : "text-neutral-400"
                    )}
                  >
                    {format(day, "d")}
                  </span>

                  {/* Evento reservado vía Momentum */}
                  {reservation && (
                    <span className="mt-1.5 flex flex-col gap-1">
                      <span className="inline-flex w-fit items-center gap-1 rounded-full border border-[#C9A96E]/35 bg-[#C9A96E]/15 px-2 py-0.5 text-[10px] font-semibold text-[#E6CD9A]">
                        <span className="size-1.5 rounded-full bg-emerald-400" />
                        {reservation.eventType}
                      </span>
                      {view === "semana" && (
                        <>
                          <span className="text-[11px] font-medium leading-tight text-white">
                            {reservation.clientName}
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            {reservation.time} h · {reservation.guests} inv.
                          </span>
                          <span className="text-[10px] text-neutral-500 line-clamp-2">{reservation.venue}</span>
                        </>
                      )}
                      {view === "mes" && (
                        <span className="hidden text-[10px] leading-tight text-neutral-400 sm:block">
                          {reservation.clientName.split(" ").slice(0, 2).join(" ")}
                        </span>
                      )}
                    </span>
                  )}

                  {/* Bloqueo manual */}
                  {blocked && !reservation && (
                    <span className="mt-1.5 inline-flex w-fit items-center gap-1 rounded-full border border-red-400/30 bg-red-400/10 px-2 py-0.5 text-[10px] font-semibold text-red-300">
                      <Ban size={10} />
                      No disponible
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </PanelCard>
      </motion.div>

      {/* Ayuda */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="flex items-start gap-2 text-xs leading-relaxed text-neutral-500"
      >
        <Eyebrow className="mt-0 shrink-0">Tip</Eyebrow>
        Haz clic en cualquier evento dorado para abrir la ficha completa del cliente: teléfono con WhatsApp directo, correo, detalles del evento, paquete contratado y resumen financiero de la reserva.
      </motion.p>
    </div>
  );
}

export function isReservationDay(reservations: Reservation[], day: Date) {
  return reservations.some((r) => isSameDay(parseISO(r.date), day));
}
