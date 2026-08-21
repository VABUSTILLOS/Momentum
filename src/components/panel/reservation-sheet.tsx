"use client";

import {
  CalendarDays,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Plus,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
  HandCoins,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { formatMXN } from "@/lib/marketplace-data";
import {
  anticipoDe,
  comisionDe,
  saldoDe,
  type Reservation,
} from "@/lib/panel-data";
import { Eyebrow, GoldDivider } from "./shared";
import { formatEventDate } from "./date-utils";

/* ------- Ficha / Drawer de detalle y contacto del cliente (reserva) ------- */

export function ReservationSheet({
  reservation,
  open,
  onOpenChange,
}: {
  reservation: Reservation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto border-l border-[#C9A96E]/20 bg-[#0C0C0C] p-0 text-neutral-100 sm:max-w-md"
      >
        {reservation && (
          <div className="flex min-h-full flex-col">
            {/* Encabezado dorado */}
            <div className="border-b border-white/8 bg-gradient-to-b from-[#C9A96E]/15 to-transparent px-6 pb-6 pt-7">
              <SheetHeader className="space-y-3 text-left">
                <Eyebrow>Reserva {reservation.id}</Eyebrow>
                <SheetTitle className="font-serif text-3xl tracking-tight text-white">
                  {reservation.eventType}
                  <span className="mt-1 block text-base font-normal text-neutral-400">
                    {formatEventDate(reservation.date)} · {reservation.time} h
                  </span>
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Ficha completa de contacto del cliente y detalles del evento
                </SheetDescription>
                <Badge
                  className={
                    reservation.status === "confirmada"
                      ? "w-fit border border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                      : "w-fit border border-amber-400/30 bg-amber-400/10 text-amber-300"
                  }
                >
                  {reservation.status === "confirmada" ? "Confirmada" : "Por confirmar"}
                </Badge>
              </SheetHeader>
            </div>

            <div className="flex flex-col gap-7 px-6 py-7">
              {/* Datos del cliente */}
              <section>
                <Eyebrow className="mb-4">👤 Datos del cliente</Eyebrow>
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                  <p className="font-serif text-xl text-white">{reservation.clientName}</p>
                  <div className="mt-4 flex flex-col gap-3 text-sm">
                    <div className="flex items-center gap-3 text-neutral-300">
                      <Phone size={15} className="shrink-0 text-[#C9A96E]" />
                      <span>+{reservation.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-neutral-300">
                      <Mail size={15} className="shrink-0 text-[#C9A96E]" />
                      <span className="break-all">{reservation.email}</span>
                    </div>
                  </div>
                  <a
                    href={`https://wa.me/${reservation.phone}?text=${encodeURIComponent(
                      `Hola ${reservation.clientName.split(" ")[0]}, soy Pastelería Maison de Momentum. Te contacto sobre tu evento del ${formatEventDate(reservation.date)} (${reservation.id}).`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-[#062b16] transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <MessageCircle size={17} />
                    Abrir chat de WhatsApp
                  </a>
                </div>
              </section>

              {/* Detalles del evento */}
              <section>
                <Eyebrow className="mb-4">🎉 Detalles del evento</Eyebrow>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: CalendarDays, label: "Tipo de evento", value: reservation.eventType },
                    { icon: Clock, label: "Fecha y hora", value: `${formatEventDate(reservation.date)} · ${reservation.time} h` },
                    { icon: MapPin, label: "Ubicación / Salón", value: reservation.venue },
                    { icon: Users, label: "Invitados estimados", value: `${reservation.guests} personas` },
                  ].map(({ icon: Icon, label, value }) => (
                    <div
                      key={label}
                      className="col-span-2 rounded-xl border border-white/8 bg-white/[0.03] p-4 sm:col-span-1"
                    >
                      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-neutral-500">
                        <Icon size={13} className="text-[#C9A96E]" />
                        {label}
                      </div>
                      <p className="mt-2 text-sm font-medium leading-snug text-neutral-100">{value}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Paquete contratado */}
              <section>
                <Eyebrow className="mb-4">📦 Paquete contratado y add-ons</Eyebrow>
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                  <div className="flex items-center gap-2.5">
                    <Package size={16} className="text-[#C9A96E]" />
                    <p className="font-medium text-white">{reservation.packageName}</p>
                  </div>
                  <div className="mt-4 flex flex-col gap-2">
                    {reservation.addons.map((addon) => (
                      <div key={addon} className="flex items-center gap-2.5 text-sm text-neutral-300">
                        <Plus size={13} className="shrink-0 text-[#C9A96E]" />
                        {addon}
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Resumen financiero */}
              <section>
                <Eyebrow className="mb-4">💳 Resumen financiero de la reserva</Eyebrow>
                <div className="overflow-hidden rounded-2xl border border-[#C9A96E]/25 bg-gradient-to-b from-[#C9A96E]/10 to-transparent">
                  <div className="flex items-center justify-between px-5 py-4">
                    <span className="flex items-center gap-2 text-sm text-neutral-300">
                      <Sparkles size={15} className="text-[#C9A96E]" />
                      Total de la cotización
                    </span>
                    <span className="font-serif text-xl text-white">{formatMXN(reservation.total)}</span>
                  </div>
                  <GoldDivider />
                  <div className="flex items-center justify-between px-5 py-4">
                    <span className="flex items-center gap-2 text-sm text-neutral-300">
                      <ShieldCheck size={15} className="text-[#C9A96E]" />
                      Anticipo recibido vía Momentum (5% directo)
                    </span>
                    <span className="font-semibold text-emerald-300">{formatMXN(anticipoDe(reservation.total))}</span>
                  </div>
                  <GoldDivider />
                  <div className="flex items-center justify-between gap-3 px-5 py-4">
                    <span className="flex items-center gap-2 text-sm text-neutral-300">
                      <HandCoins size={15} className="text-[#C9A96E]" />
                      Saldo pendiente por cobrar al cliente (90%)
                    </span>
                    <span className="font-serif text-xl text-[#E6CD9A]">{formatMXN(saldoDe(reservation.total))}</span>
                  </div>
                  <div className="border-t border-white/8 bg-white/[0.02] px-5 py-3.5">
                    <p className="flex items-start gap-2 text-xs leading-relaxed text-neutral-400">
                      <Wallet size={13} className="mt-0.5 shrink-0 text-[#C9A96E]" />
                      Monto a liquidar directamente con el cliente antes o el día del evento.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
