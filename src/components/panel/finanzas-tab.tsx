"use client";

import { useMemo, useState } from "react";
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
import { formatMXN } from "@/lib/marketplace-data";
import {
  anticipoDe,
  financeSummary,
  saldoDe,
  type Reservation,
} from "@/lib/panel-data";
import { cn } from "@/lib/utils";
import { AnimatedMoney, AnimatedNumber, EASE, Eyebrow, PanelCard, StatusPill } from "./shared";
import { formatEventDate } from "./date-utils";

type StatusFilter = "todas" | "confirmada" | "por-confirmar";

const FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "confirmada", label: "Confirmadas" },
  { id: "por-confirmar", label: "Por confirmar" },
];

/* ------------------------- Tablero de ganancias ------------------------- */

export function FinanzasTab({
  reservations,
  onOpenReservation,
}: {
  reservations: Reservation[];
  onOpenReservation: (r: Reservation) => void;
}) {
  const summary = financeSummary(reservations);
  const [filter, setFilter] = useState<StatusFilter>("todas");

  const filtered = useMemo(
    () =>
      filter === "todas"
        ? reservations
        : reservations.filter((r) => r.status === filter),
    [reservations, filter]
  );

  const totals = useMemo(
    () => ({
      total: filtered.reduce((acc, r) => acc + r.total, 0),
      anticipo: filtered.reduce((acc, r) => acc + anticipoDe(r.total), 0),
      saldo: filtered.reduce((acc, r) => acc + saldoDe(r.total), 0),
    }),
    [filtered]
  );

  const metrics = [
    {
      icon: Wallet,
      label: "Ingresos totales acumulados",
      hint: "Suma total de eventos reservados",
      render: () => <AnimatedMoney value={summary.ingresosTotales} className="font-serif text-3xl font-medium tracking-tight text-foreground" />,
    },
    {
      icon: ArrowUpRight,
      label: "Anticipos recibidos (5%)",
      hint: "Depositado a tu cuenta al apartar",
      render: () => <AnimatedMoney value={summary.anticipos} className="font-serif text-3xl font-medium tracking-tight text-foreground" />,
    },
    {
      icon: HandCoins,
      label: "Saldos pendientes por cobrar (90%)",
      hint: "A liquidar directo con clientes",
      render: () => <AnimatedMoney value={summary.saldos} className="font-serif text-3xl font-medium tracking-tight text-foreground" />,
    },
    {
      icon: CalendarCheck2,
      label: "Eventos activos / confirmados",
      hint: "Total de eventos en agenda",
      render: () => <AnimatedNumber value={summary.eventos} className="font-serif text-3xl font-medium tracking-tight text-foreground" />,
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
            <PanelCard className="h-full p-6">
              <span className="inline-flex size-10 items-center justify-center rounded-full border border-border text-foreground">
                <Icon size={17} />
              </span>
              <div className="mt-5">{render()}</div>
              <p className="mt-2 text-sm font-medium text-foreground">{label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
            </PanelCard>
          </motion.div>
        ))}
      </div>

      {/* Caja explicativa de la comisión — mismo patrón que la caja "Aparta tu fecha" */}
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.32, ease: EASE }}
      >
        <div className="rounded-2xl border border-border bg-secondary/60 p-6">
          <div className="flex items-start gap-4">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
              <Info size={18} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
                Comisión Momentum · cómo funciona
              </p>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-[15px]">
                Por cada reserva, el cliente aparta su fecha con el <strong className="font-medium text-foreground">10%</strong> del total:
                el <strong className="font-medium text-foreground">5% cubre la comisión de servicio Momentum</strong> y el{" "}
                <strong className="font-medium text-foreground">5% se deposita de inmediato a tu cuenta como anticipo</strong>.
                El <strong className="font-medium text-foreground">90% restante lo cobras tú directamente al cliente</strong>, antes o el día del evento.
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
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 pb-2 pt-6">
            <div>
              <Eyebrow>Tabla de transacciones</Eyebrow>
              <h3 className="mt-1.5 font-serif text-2xl font-medium tracking-tight text-foreground">
                Movimientos por reserva
              </h3>
            </div>
            {/* Filtro por estatus */}
            <div className="flex rounded-full border border-border p-1" role="group" aria-label="Filtrar por estatus">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs font-medium transition-all",
                    filter === f.id
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="pl-6 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Cliente</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Evento</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Fecha</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Estatus</TableHead>
                  <TableHead className="text-right text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Total</TableHead>
                  <TableHead className="text-right text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Anticipo (5%)</TableHead>
                  <TableHead className="pr-6 text-right text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Saldo (90%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow
                    key={r.id}
                    onClick={() => onOpenReservation(r)}
                    className="cursor-pointer border-border transition-colors hover:bg-secondary/60"
                  >
                    <TableCell className="pl-6">
                      <p className="font-medium text-foreground">{r.clientName}</p>
                      <p className="text-xs text-muted-foreground">{r.id}</p>
                    </TableCell>
                    <TableCell>
                      <StatusPill tone="neutral" className="normal-case tracking-normal">
                        {r.eventType}
                      </StatusPill>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{formatEventDate(r.date)}</TableCell>
                    <TableCell>
                      <StatusPill tone={r.status === "confirmada" ? "solid" : "outline"}>
                        {r.status === "confirmada" ? "Confirmada" : "Por confirmar"}
                      </StatusPill>
                    </TableCell>
                    <TableCell className="text-right font-medium text-foreground">{formatMXN(r.total)}</TableCell>
                    <TableCell className="text-right text-foreground">{formatMXN(anticipoDe(r.total))}</TableCell>
                    <TableCell className="pr-6 text-right font-medium text-foreground">{formatMXN(saldoDe(r.total))}</TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow className="border-border hover:bg-transparent">
                    <TableCell colSpan={7} className="py-12 text-center">
                      <p className="font-medium text-foreground">Sin reservas en este filtro</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Prueba con otra opción del filtro de estatus.
                      </p>
                    </TableCell>
                  </TableRow>
                )}
                {filtered.length > 0 && (
                  <TableRow className="border-border bg-secondary/50 hover:bg-secondary/50">
                    <TableCell className="pl-6 font-medium text-foreground" colSpan={4}>
                      Totales · {filtered.length} reserva(s)
                    </TableCell>
                    <TableCell className="text-right font-semibold text-foreground">{formatMXN(totals.total)}</TableCell>
                    <TableCell className="text-right font-semibold text-foreground">{formatMXN(totals.anticipo)}</TableCell>
                    <TableCell className="pr-6 text-right font-semibold text-foreground">{formatMXN(totals.saldo)}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </PanelCard>
      </motion.div>
    </div>
  );
}
