import type { Metadata } from "next";
import { PanelProveedorClient } from "@/components/panel/panel-client";

export const metadata: Metadata = {
  title: "Panel de Proveedor | Momentum",
  description:
    "Gestiona tus ganancias, paquetes, categorías y agenda de eventos con la ficha completa de contacto de tus clientes.",
};

export default function PanelProveedorPage() {
  return <PanelProveedorClient />;
}
