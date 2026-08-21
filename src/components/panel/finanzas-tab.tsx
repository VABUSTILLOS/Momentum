"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CalendarCheck2,
  HandCoins,
  Info,
  Wallet,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatMXN } from "@/lib/marketplace-data";
import {
  anticipoDe,
  financeSummary,
  saldoDe,
  type Reservation,
} from "@/lib/panel-data";
import { AnimatedMoney, AnimatedNumber, EASE, Eyebrow, PanelCard } from "./shared";
import { formatEventDate } from "./date-utils";

/* ------------------------- Tablero de ganancias ------------------------- */

export function FinanzasTab({
  reservations,
  onOpenReservation,
}: {
  reservations: Reservation[];
  onOpenReservation: (r: Reservation) => void;
}) {
  const summary = financeSummary(reservations);

  const metrics = [
    {
      icon: Wallet,
      label: "Ingresos totales acumulados",
      hint: "Suma total de eventos reservados",
      render: () => <AnimatedMoney value={summary.ingresosTotales} className="font-serif text-3xl tracking-tight text-white" />,
    },
    {
      icon: ArrowUpRight,
      label: "Anticipos recibidos (5%)",
      hint: "Depositado a tu cuenta al apartar",
      render: () => <AnimatedMoney value={summary.anticipos} className="font-serif text-3xl tracking-tight text-emerald-300" />,
    },
    {
      icon: HandCoins,
      label: "Saldos pendientes por cobrar (90%)",
      hint: "A liquidar directo con clientes",
      render: () => <AnimatedMoney value={summary.saldos} className="font-serif text-3xl tracking-tight text-[#E6CD9A]" />,
    },
    {
      icon: CalendarCheck2,
      label: "Eventos activos / confirmados",
      hint: "Total de eventos en agenda",
      render: () => <AnimatedNumber value={summary.eventos} className="font-serif text-3xl tracking-tight text-white" />,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ icon: Icon, label, hint, render }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: i * 0.08, ease: EASE }}
          >
            <PanelCard className="group relative h-full overflow-hidden p-5">
              <div className="absolute -right-8 -top-8 size-28 rounded-full bg-[#C9A96E]/10 blur-2xl transition-opacity group-hover:opacity-150" />
              <div className="flex items-start justify-between">
                <span className="inline-flex size-10 items-center justify-center rounded-full border border-[#C9A96E]/30 bg-[#C9A96E]/10 text-[#C9A96E]">
                  <Icon size={17} />
                </span>
              </div>
              <div className="mt-5">{render()}</div>
              <p className="mt-2 text-sm font-medium text-neutral-300">{label}</p>
              <p className="mt-0.5 text-xs text-neutral-500">{hint}</p>
            </PanelCard>
          </motion.div>
        ))}
      </div>

      {/* Caja explicativa de la comisión */}
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.32, ease: EASE }}
      >
        <div className="relative overflow-hidden rounded-2xl border border-[#C9A96E]/30 bg-gradient-to-r from-[#C9A96E]/15 via-[#C9A96E]/5 to-transparent p-6">
          <div className="absolute -left-10 top-1/2 size-40 -translate-y-1/2 rounded-full bg-[#C9A96E]/15 blur-3xl" />
          <div className="relative flex items-start gap-4">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-[#C9A96E] text-[#0A0A0A]">
              <Info size={18} />
            </span>
            <div>
              <Eyebrow>Comisión Momentum · cómo funciona</Eyebrow>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-neutral-200 md:text-[15px]">
                Por cada reserva, el cliente aparta su fecha con el <strong className="text-white">10%</strong> del total:
                el <strong className="text-[#E6CD9A]">5% cubre la comisión de servicio Momentum</strong> y el{" "}
                <strong className="text-emerald-300">5% se deposita de inmediato a tu cuenta como anticipo</strong>.
                El <strong className="text-white">90% restante lo cobras tú directamente al cliente</strong>, antes o el día del evento.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabla de transacciones */}
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.4, ease: EASE }}
      >
        <PanelCard className="overflow-hidden">
          <div className="flex items-center justify-between px-6 pb-2 pt-6">
            <div>
              <Eyebrow>Tabla de transacciones</Eyebrow>
              <h3 className="mt-1.5 font-serif text-2xl tracking-tight text-white">Movimientos por reserva</h3>
            </div>
            <Badge className="border border-white/10 bg-white/5 text-neutral-300">
              {reservations.length} reservas
            </Badge>
          </div>
          <div className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/8 hover:bg-transparent">
                  <TableHead className="pl-6 text-[11px] uppercase tracking-[0.16em] text-neutral-500">Cliente</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">Evento</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">Fecha</TableHead>
                  <TableHead className="text-right text-[11px] uppercase tracking-[0.16em] text-neutral-500">Total</TableHead>
                  <TableHead className="text-right text-[11px] uppercase tracking-[0.16em] text-emerald-400/80">Anticipo (5%)</TableHead>
                  <TableHead className="pr-6 text-right text-[11px] uppercase tracking-[0.16em] text-[#C9A96E]">Saldo (90%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.map((r) => (
                  <TableRow
                    key={r.id}
                    onClick={() => onOpenReservation(r)}
                    className="cursor-pointer border-white/6 transition-colors hover:bg-[#C9A96E]/6"
                  >
                    <TableCell className="pl-6">
                      <p className="font-medium text-neutral-100">{r.clientName}</p>
                      <p className="text-xs text-neutral-500">{r.id}</p>
                    </TableCell>
                    <TableCell>
                      <Badge className="border border-[#C9A96E]/25 bg-[#C9A96E]/10 font-normal text-[#E6CD9A]">
                        {r.eventType}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-neutral-300">{formatEventDate(r.date)}</TableCell>
                    <TableCell className="text-right font-medium text-white">{formatMXN(r.total)}</TableCell>
                    <TableCell className="text-right text-emerald-300">{formatMXN(anticipoDe(r.total))}</TableCell>
                    <TableCell className="pr-6 text-right font-medium text-[#E6CD9A]">{formatMXN(saldoDe(r.total))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </PanelCard>
      </motion.div>
    </div>
  );
}
