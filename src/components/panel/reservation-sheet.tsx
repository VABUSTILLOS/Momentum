"use client";

import { useState } from "react";
import {
  CalendarDays,
  Check,
  Clock,
  Copy,
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
import { formatMXN } from "@/lib/marketplace-data";
import {
  anticipoDe,
  comisionDe,
  saldoDe,
  type Reservation,
} from "@/lib/panel-data";
import { Eyebrow, StatusPill } from "./shared";
import { formatEventDate } from "./date-utils";

/* ------- Ficha / Drawer de detalle y contacto del cliente (reserva) ------- */
/* Mismo patrón visual que el QuickView del marketplace                       */

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // portapapeles no disponible (p. ej. contexto no seguro) — ignorar
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      aria-label={copied ? `${label} copiado` : `Copiar ${label}`}
      title={copied ? "Copiado" : `Copiar ${label}`}
    >
      {copied ? <Check size={13} className="text-foreground" /> : <Copy size={13} />}
    </button>
  );
}

export function ReservationSheet({
  reservation,
  open,
  onOpenChange,
}: {
  reservation: Reservation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!reservation) return <Sheet open={open} onOpenChange={onOpenChange} />;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto bg-background p-0 sm:max-w-md">
        <div className="flex min-h-full flex-col">
          {/* Encabezado — eyebrow + serif como el QuickView */}
          <div className="border-b border-border px-6 pb-6 pt-7">
            <SheetHeader className="space-y-3 p-0 text-left">
              <Eyebrow>Reserva {reservation.id}</Eyebrow>
              <SheetTitle className="font-serif text-3xl font-medium tracking-tight text-foreground">
                {reservation.eventType}
                <span className="mt-1 block font-sans text-base font-normal text-muted-foreground">
                  {formatEventDate(reservation.date)} · {reservation.time} h
                </span>
              </SheetTitle>
              <SheetDescription className="sr-only">
                Ficha completa de contacto del cliente y detalles del evento
              </SheetDescription>
              <StatusPill tone={reservation.status === "confirmada" ? "solid" : "outline"}>
                {reservation.status === "confirmada" ? "Confirmada" : "Por confirmar"}
              </StatusPill>
            </SheetHeader>
          </div>

          <div className="flex flex-col gap-6 px-6 py-7">
            {/* Datos del cliente */}
            <section>
              <Eyebrow className="mb-3">👤 Datos del cliente</Eyebrow>
              <div className="rounded-2xl border border-border p-5">
                <p className="font-serif text-xl font-medium text-foreground">{reservation.clientName}</p>
                <div className="mt-4 flex flex-col gap-3 text-sm">
                  <div className="flex items-center gap-3 text-foreground">
                    <Phone size={15} className="shrink-0 text-muted-foreground" />
                    <span>+{reservation.phone}</span>
                    <CopyButton value={`+${reservation.phone}`} label="teléfono" />
                  </div>
                  <div className="flex items-center gap-3 text-foreground">
                    <Mail size={15} className="shrink-0 text-muted-foreground" />
                    <span className="break-all">{reservation.email}</span>
                    <CopyButton value={reservation.email} label="correo" />
                  </div>
                </div>
                <a
                  href={`https://wa.me/${reservation.phone}?text=${encodeURIComponent(
                    `Hola ${reservation.clientName.split(" ")[0]}, soy Pastelería Maison de Momentum. Te contacto sobre tu evento del ${formatEventDate(reservation.date)} (${reservation.id}).`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  <MessageCircle size={17} />
                  Abrir chat de WhatsApp
                </a>
              </div>
            </section>

            {/* Detalles del evento */}
            <section>
              <Eyebrow className="mb-3">🎉 Detalles del evento</Eyebrow>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: CalendarDays, label: "Tipo de evento", value: reservation.eventType },
                  { icon: Clock, label: "Fecha y hora", value: `${formatEventDate(reservation.date)} · ${reservation.time} h` },
                  { icon: MapPin, label: "Ubicación / Salón", value: reservation.venue },
                  { icon: Users, label: "Invitados estimados", value: `${reservation.guests} personas` },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="col-span-2 rounded-2xl border border-border p-4 sm:col-span-1"
                  >
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      <Icon size={13} />
                      {label}
                    </div>
                    <p className="mt-2 text-sm font-medium leading-snug text-foreground">{value}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Paquete contratado — lista con checks como "El paquete incluye" */}
            <section>
              <Eyebrow className="mb-3">📦 Paquete contratado y add-ons</Eyebrow>
              <div className="rounded-2xl border border-border p-5">
                <div className="flex items-center gap-2.5">
                  <Package size={16} className="text-muted-foreground" />
                  <p className="font-medium text-foreground">{reservation.packageName}</p>
                </div>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {reservation.addons.map((addon) => (
                    <li key={addon} className="flex items-start gap-2.5 text-sm text-foreground">
                      <Plus size={13} className="mt-1 shrink-0 text-muted-foreground" />
                      {addon}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Resumen financiero — caja secondary como "Aparta tu fecha" */}
            <section>
              <Eyebrow className="mb-3">💳 Resumen financiero de la reserva</Eyebrow>
              <div className="rounded-2xl border border-border p-5">
                <div className="flex items-baseline justify-between">
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles size={14} />
                    Total de la cotización
                  </span>
                  <span className="text-xl font-medium text-foreground">{formatMXN(reservation.total)}</span>
                </div>

                <div className="mt-4 rounded-xl bg-secondary px-4 py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
                      <ShieldCheck size={13} />
                      Anticipo recibido (5% directo)
                    </span>
                    <span className="text-base font-semibold text-foreground">{formatMXN(anticipoDe(reservation.total))}</span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    Depositado a tu cuenta vía Momentum al momento del apartado.
                  </p>
                </div>

                <div className="mt-3 rounded-xl bg-secondary px-4 py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
                      <HandCoins size={13} />
                      Saldo por cobrar (90%)
                    </span>
                    <span className="text-base font-semibold text-foreground">{formatMXN(saldoDe(reservation.total))}</span>
                  </div>
                  <p className="mt-1.5 flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
                    <Wallet size={12} className="mt-0.5 shrink-0" />
                    Monto a liquidar directamente con el cliente antes o el día del evento.
                  </p>
                </div>

                <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
                  Comisión de servicio Momentum (5%): {formatMXN(comisionDe(reservation.total))} — ya retenida del apartado.
                </p>
              </div>
            </section>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
