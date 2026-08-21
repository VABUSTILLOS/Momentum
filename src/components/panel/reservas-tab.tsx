"use client";

import { motion } from "framer-motion";
import { CalendarDays, ChevronRight, MapPin, MessageCircle, Users } from "lucide-react";
import { formatMXN } from "@/lib/marketplace-data";
import { anticipoDe, saldoDe, type Reservation } from "@/lib/panel-data";
import { formatEventDate } from "./date-utils";
import { EASE, Eyebrow, PanelCard, StatusPill } from "./shared";

/* ------------------------------ Mis Reservas ----------------------------- */

export function ReservasTab({
  reservations,
  onOpenReservation,
}: {
  reservations: Reservation[];
  onOpenReservation: (r: Reservation) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
        <Eyebrow>Reservas activas</Eyebrow>
        <h3 className="mt-1.5 font-serif text-2xl font-medium tracking-tight text-foreground">
          {reservations.length} eventos en tu agenda
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Selecciona cualquier reserva para ver la ficha completa de contacto del cliente.
        </p>
      </motion.div>

      <div className="flex flex-col gap-3">
        {reservations.map((r, i) => (
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

              {/* Acceso rápido a WhatsApp en móvil */}
              <div className="mt-4 flex gap-2 border-t border-border pt-4 md:hidden">
                <a
                  href={`https://wa.me/${r.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
                >
                  <MessageCircle size={14} />
                  WhatsApp directo
                </a>
              </div>
            </PanelCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
