import type { Metadata } from "next";
import { MiEventoClient } from "@/components/mi-evento/mi-evento-client";

export const metadata: Metadata = {
  title: "Mi Evento | Momentum",
  description:
    "Arma tu evento paso a paso: elige fecha, invitados y presupuesto, revisa tu checklist por categoría y cotiza todos tus servicios en un solo paso.",
};

export default function MiEventoPage() {
  return <MiEventoClient />;
}
