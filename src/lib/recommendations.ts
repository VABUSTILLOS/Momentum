import { format } from "date-fns";
import type { EventDetails, EventItem } from "@/lib/event-context";
import { CATEGORIES, VENDORS, type Vendor } from "@/lib/marketplace-data";

export interface Recommendation {
  vendor: Vendor;
  score: number;
  reasons: string[];
}

/**
 * Recomienda servicios del marketplace según las características del evento:
 * - Prioriza categorías que aún no están cubiertas en el checklist.
 * - Filtra proveedores ocupados en la fecha del evento (si ya se eligió).
 * - Premia que el precio base quepa en el presupuesto restante.
 * - Desempata con verificación, rating, reseñas y popularidad.
 */
export function recommendVendors(
  items: EventItem[],
  details: EventDetails,
  limit = 6,
): Recommendation[] {
  const coveredCategories = new Set(items.map((i) => i.vendor.category));
  const chosenIds = new Set(items.map((i) => i.vendor.id));
  const total = items.reduce((sum, i) => sum + i.vendor.basePrice, 0);
  const remaining = details.budget - total;
  const eventDate = details.date ? format(details.date, "yyyy-MM-dd") : null;

  const scored: Recommendation[] = [];

  for (const vendor of VENDORS) {
    if (chosenIds.has(vendor.id)) continue;
    if (eventDate && vendor.bookedDates.includes(eventDate)) continue;

    let score = 0;
    const reasons: string[] = [];

    if (!coveredCategories.has(vendor.category)) {
      score += 100;
      const label = CATEGORIES.find((c) => c.slug === vendor.category)?.label;
      if (label) reasons.push(`Te falta ${label}`);
    }

    if (vendor.basePrice <= remaining) {
      score += 40;
      reasons.push("Cabe en tu presupuesto");
      // Premia opciones que dejan margen sin ser desproporcionadamente baratas
      score += 10 * (1 - vendor.basePrice / Math.max(remaining, 1));
    } else {
      score -= 50;
    }

    if (vendor.verified) {
      score += 10;
      reasons.push("Verificado");
    }

    score += vendor.rating * 4;
    if (vendor.rating >= 4.8) reasons.push("Mejor valorado");

    score += Math.min(vendor.reviews / 25, 8);
    score += vendor.popularity / 10;

    scored.push({ vendor, score, reasons });
  }

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}
