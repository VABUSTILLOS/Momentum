"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, ChevronRight, ClipboardList, MapPin, MessageCircle, Users } from "lucide-react";
import { formatMXN } from "@/lib/marketplace-data";
import { anticipoDe, saldoDe, type Reservation } from "@/lib/panel-data";
import { cn } from "@/lib/utils";
import { formatEventDate } from "./date-utils";
import { EASE, PanelCard, StatusPill } from "./shared";

/* ------------------------------ Mis Reservas ----------------------------- */

type StatusFilter = "todas" | "confirmada" | "por-confirmar";

const FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "confirmada", label: "Confirmadas" },
  { id: "por-confirmar", label: "Por confirmar" },
];

export function ReservasTab({
  reservations,
  onOpenReservation,
}: {
  reservations: Reservation[];
  onOpenReservation: (r: Reservation) => void;
}) {
  const [filter, setFilter] = useState<StatusFilter>("todas");

  const filtered = useMemo(
    () =>
      [...reservations]
        .filter((r) => filter === "todas" || r.status === filter)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [reservations, filter]
  );

  const counts = useMemo(
    () => ({
      todas: reservations.length,
      confirmada: reservations.filter((r) => r.status === "confirmada").length,
      "por-confirmar": reservations.filter((r) => r.status === "por-confirmar").length,
    }),
    [reservations]
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Filtro por estatus */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-full border border-border p-1" role="group" aria-label="Filtrar por estatus">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all",
                filter === f.id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
              <span
                className={cn(
                  "inline-flex size-4 items-center justify-center rounded-full text-[10px] font-bold",
                  filter === f.id ? "bg-background text-foreground" : "bg-secondary text-foreground"
                )}
              >
                {counts[f.id]}
              </span>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Ordenadas por fecha más próxima</p>
      </div>

      {/* Lista de reservas */}
      <div className="flex flex-col gap-3">
        {filtered.map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.06 * i, ease: EASE }}
          >
            <PanelCard className="group cursor-pointer p-5 transition-colors hover:border-foreground/40">
              <button
                type="button"
                onClick={() => onOpenReservation(r)}
                className="flex w-full flex-col gap-4 text-left md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-start gap-4">
                  {/* Bloque de fecha — caja secondary como el marketplace */}
                  <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl bg-secondary">
                    <span className="font-serif text-lg font-medium leading-none text-foreground">
                      {r.date.slice(8, 10)}
                    </span>
                    <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
                      {formatEventDate(r.date).split(" ")[2]?.slice(0, 3)}
                    </span>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground group-hover:underline group-hover:underline-offset-4">
                        {r.clientName}
                      </p>
                      <StatusPill tone="neutral" className="normal-case tracking-normal">
                        {r.eventType}
                      </StatusPill>
                      <StatusPill tone={r.status === "confirmada" ? "solid" : "outline"}>
                        {r.status === "confirmada" ? "Confirmada" : "Por confirmar"}
                      </StatusPill>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays size={12} />
                        {formatEventDate(r.date)} · {r.time} h
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin size={12} />
                        {r.venue}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users size={12} />
                        {r.guests} invitados
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 md:justify-end md:gap-7">
                  <div className="text-left md:text-right">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Saldo por cobrar</p>
                    <p className="font-serif text-lg font-medium text-foreground">{formatMXN(saldoDe(r.total))}</p>
                    <p className="text-[11px] text-muted-foreground">Anticipo recibido: {formatMXN(anticipoDe(r.total))}</p>
                  </div>
                  <span className="inline-flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors group-hover:border-foreground/40 group-hover:text-foreground">
                    <ChevronRight size={16} />
                  </span>
                </div>
              </button>

              {/* Acceso rápido a WhatsApp */}
              <div className="mt-4 flex gap-2 border-t border-border pt-4">
                <a
                  href={`https://wa.me/${r.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
                >
                  <MessageCircle size={14} />
                  WhatsApp directo
                </a>
                <button
                  type="button"
                  onClick={() => onOpenReservation(r)}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  Ver ficha completa
                </button>
              </div>
            </PanelCard>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <PanelCard className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <span className="inline-flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <ClipboardList size={20} />
            </span>
            <p className="font-medium text-foreground">
              {filter === "por-confirmar"
                ? "No hay reservas por confirmar"
                : "No hay reservas en este filtro"}
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              {filter === "por-confirmar"
                ? "Todas tus reservas están confirmadas. ¡Buen trabajo!"
                : "Prueba con otra opción del filtro de estatus."}
            </p>
            {filter !== "todas" && (
              <button
                type="button"
                onClick={() => setFilter("todas")}
                className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background transition-opacity hover:opacity-90"
              >
                Ver todas las reservas
              </button>
            )}
          </PanelCard>
        )}
      </div>
    </div>
  );
}
