import type { Metadata } from "next";
import { BodaClient } from "@/components/mi-evento/boda-client";

export const metadata: Metadata = {
  title: "Mi Boda — Momentum",
  description: "Crea la página web de tu boda: cuenta regresiva, ceremonia, recepción, mesa de regalos y confirmación de asistencia.",
};

export default function MiBodaPage() {
  return <BodaClient />;
}
