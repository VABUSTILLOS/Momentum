"use client";

import { motion } from "framer-motion";
import { CalendarDays, ChevronRight, MapPin, MessageCircle, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatMXN } from "@/lib/marketplace-data";
import { anticipoDe, saldoDe, type Reservation } from "@/lib/panel-data";
import { formatEventDate } from "./date-utils";
import { EASE, Eyebrow, PanelCard } from "./shared";

/* ------------------------------ Mis Reservas ----------------------------- */

export function ReservasTab({
  reservations,
  onOpenReservation,
}: {
  reservations: Reservation[];
  onOpenReservation: (r: Reservation) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
        <Eyebrow>Reservas activas</Eyebrow>
        <h3 className="mt-1.5 font-serif text-2xl tracking-tight text-white">
          {reservations.length} eventos en tu agenda
        </h3>
        <p className="mt-1 text-sm text-neutral-400">
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
            <PanelCard
              className="group cursor-pointer p-5 transition-colors hover:border-[#C9A96E]/35"
            >
              <button
                type="button"
                onClick={() => onOpenReservation(r)}
                className="flex w-full flex-col gap-4 text-left md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl border border-[#C9A96E]/30 bg-[#C9A96E]/10">
                    <span className="font-serif text-lg leading-none text-[#E6CD9A]">
                      {r.date.slice(8, 10)}
                    </span>
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-neutral-400">
                      {formatEventDate(r.date).split(" ")[2]?.slice(0, 3)}
                    </span>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-white">{r.clientName}</p>
                      <Badge className="border border-[#C9A96E]/25 bg-[#C9A96E]/10 font-normal text-[#E6CD9A]">
                        {r.eventType}
                      </Badge>
                      <Badge
                        className={
                          r.status === "confirmada"
                            ? "border border-emerald-400/25 bg-emerald-400/10 font-normal text-emerald-300"
                            : "border border-amber-400/25 bg-amber-400/10 font-normal text-amber-300"
                        }
                      >
                        {r.status === "confirmada" ? "Confirmada" : "Por confirmar"}
                      </Badge>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-400">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays size={12} className="text-[#C9A96E]" />
                        {formatEventDate(r.date)} · {r.time} h
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-[#C9A96E]" />
                        {r.venue}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users size={12} className="text-[#C9A96E]" />
                        {r.guests} invitados
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 md:justify-end md:gap-7">
                  <div className="text-left md:text-right">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-neutral-500">Saldo por cobrar</p>
                    <p className="font-serif text-lg text-[#E6CD9A]">{formatMXN(saldoDe(r.total))}</p>
                    <p className="text-[11px] text-emerald-400/80">Anticipo recibido: {formatMXN(anticipoDe(r.total))}</p>
                  </div>
                  <span className="inline-flex size-9 items-center justify-center rounded-full border border-white/10 text-neutral-400 transition-all group-hover:border-[#C9A96E]/50 group-hover:text-[#E6CD9A]">
                    <ChevronRight size={16} />
                  </span>
                </div>
              </button>

              {/* Acceso rápido a WhatsApp */}
              <div className="mt-4 flex gap-2 border-t border-white/6 pt-4 md:hidden">
                <a
                  href={`https://wa.me/${r.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-xs font-semibold text-[#062b16]"
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
