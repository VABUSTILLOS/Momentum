import type { Metadata } from "next";
import { MarketplaceClient } from "@/components/marketplace/marketplace-client";

export const metadata: Metadata = {
  title: "Marketplace | Momentum",
  description:
    "Explora proveedores verificados para tu evento: música, catering, fotografía, venues y decoración. Verifica disponibilidad y cotiza todo en un solo paso.",
};

export default function MarketplacePage() {
  return <MarketplaceClient />;
}
