import type { EventItem, FaqEntry, WeddingSite } from "./event-context";

/** Galería por defecto del sitio de boda — usada como "fingerprint" para saber si el usuario la ha personalizado. */
export const DEFAULT_WEDDING_GALLERY: string[] = [
  "https://images.pexels.com/photos/2959192/pexels-photo-2959192.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/1721558/pexels-photo-1721558.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/1244627/pexels-photo-1244627.jpeg?auto=compress&cs=tinysrgb&w=800",
];

/** Campos del sitio de boda que pueden ser alimentados desde Mi Evento. */
export type SyncField =
  | "ceremonyVenue"
  | "receptionVenue"
  | "gallery"
  | "faq-catering"
  | "faq-pasteleria"
  | "faq-transporte"
  | "faq-musica";

export const SYNC_FIELD_LABELS: Record<SyncField, string> = {
  ceremonyVenue: "Sede de la ceremonia",
  receptionVenue: "Sede de la recepción",
  gallery: "Galería",
  "faq-catering": "Banquete",
  "faq-pasteleria": "Pastel",
  "faq-transporte": "Transporte",
  "faq-musica": "Música en vivo",
};

function isDefaultGallery(gallery: string[]): boolean {
  return gallery.length === DEFAULT_WEDDING_GALLERY.length && gallery.every((u, i) => u === DEFAULT_WEDDING_GALLERY[i]);
}

const FAQ_PATTERNS: Record<Exclude<SyncField, "ceremonyVenue" | "receptionVenue" | "gallery">, { re: RegExp; fallbackQ: string }> = {
  "faq-catering": { re: /servir|men[úu]|banquete|comida/i, fallbackQ: "¿Qué se servirá?" },
  "faq-pasteleria": { re: /pastel|torta|reposter/i, fallbackQ: "¿Habrá pastel?" },
  "faq-transporte": { re: /transport|estacion/i, fallbackQ: "¿Habrá transporte?" },
  "faq-musica": { re: /m[úu]sica/i, fallbackQ: "¿Habrá música en vivo?" },
};

/** Rellena (o crea) la respuesta de una FAQ con el nombre del proveedor. Devuelve el nuevo array y si cambió. */
function answerFaq(faqs: FaqEntry[], key: Exclude<SyncField, "ceremonyVenue" | "receptionVenue" | "gallery">, vendorName: string): { faqs: FaqEntry[]; changed: boolean } {
  const { re, fallbackQ } = FAQ_PATTERNS[key];
  const idx = faqs.findIndex((f) => re.test(f.q));
  if (idx >= 0) {
    if (faqs[idx].a.trim()) return { faqs, changed: false };
    const next = faqs.map((f, i) => (i === idx ? { ...f, a: vendorName } : f));
    return { faqs: next, changed: true };
  }
  return { faqs: [...faqs, { q: fallbackQ, a: vendorName }], changed: true };
}

/**
 * Aplica las elecciones de Mi Evento sobre el sitio de boda con regla
 * "rellenar solo si está vacío / predeterminado" — nunca pisa datos a mano.
 * Es idempotente: si ya se llenó, no cambia nada.
 */
export function applyEventToWedding(wedding: WeddingSite, items: EventItem[]): { wedding: WeddingSite; changed: boolean } {
  let next = wedding;
  let changed = false;
  const set = (patch: Partial<WeddingSite>) => {
    next = { ...next, ...patch };
    changed = true;
  };

  const venues = items.filter((i) => i.vendor.category === "venues");
  if (!next.ceremonyVenue.trim() && venues[0]) set({ ceremonyVenue: venues[0].vendor.name });
  // Reception: llenar si está vacío O si sigue en el estado "fallback" (mismo nombre que la ceremonia)
  // cuando ahora sí hay un segundo venue — nunca pisar un texto escrito a mano distinto.
  if (venues[1]) {
    if (!next.receptionVenue.trim() || next.receptionVenue === next.ceremonyVenue) {
      set({ receptionVenue: venues[1].vendor.name });
    }
  } else if (venues[0] && !next.receptionVenue.trim()) {
    set({ receptionVenue: venues[0].vendor.name });
  }

  const fotografo = items.find((i) => i.vendor.category === "fotografia");
  if (fotografo && isDefaultGallery(next.gallery)) {
    set({ gallery: fotografo.vendor.images.slice(0, 4) });
  }

  const catering = items.find((i) => i.vendor.category === "catering");
  if (catering) {
    const r = answerFaq(next.faqs, "faq-catering", catering.vendor.name);
    if (r.changed) set({ faqs: r.faqs });
  }
  const pasteleria = items.find((i) => i.vendor.category === "pasteleria");
  if (pasteleria) {
    const r = answerFaq(next.faqs, "faq-pasteleria", pasteleria.vendor.name);
    if (r.changed) set({ faqs: r.faqs });
  }
  const autos = items.find((i) => i.vendor.category === "autos-limosinas");
  if (autos) {
    const r = answerFaq(next.faqs, "faq-transporte", autos.vendor.name);
    if (r.changed) set({ faqs: r.faqs });
  }
  const musica = items.find((i) => i.vendor.category === "musica");
  if (musica) {
    const r = answerFaq(next.faqs, "faq-musica", musica.vendor.name);
    if (r.changed) set({ faqs: r.faqs });
  }

  return { wedding: next, changed };
}

function faqHasAnswer(faqs: FaqEntry[], key: Exclude<SyncField, "ceremonyVenue" | "receptionVenue" | "gallery">, vendorName: string): boolean {
  const { re } = FAQ_PATTERNS[key];
  return faqs.some((f) => re.test(f.q) && f.a.trim() === vendorName);
}

/**
 * Detecta reactivamente qué campos del sitio de boda están siendo alimentados
 * por Mi Evento (comparando el valor actual con lo que el sync produciría).
 * Si el usuario edita el campo a mano, la comparación deja de coincidir y el campo
 * desaparece de la lista — sin metadatos extra.
 */
export function computeSyncFields(wedding: WeddingSite, items: EventItem[]): SyncField[] {
  const fields: SyncField[] = [];
  const venues = items.filter((i) => i.vendor.category === "venues");
  if (venues[0] && wedding.ceremonyVenue.trim() === venues[0].vendor.name) fields.push("ceremonyVenue");
  if ((venues[1] ?? venues[0]) && wedding.receptionVenue.trim() === (venues[1] ?? venues[0]).vendor.name) fields.push("receptionVenue");

  const fotografo = items.find((i) => i.vendor.category === "fotografia");
  if (fotografo) {
    const seed = fotografo.vendor.images.slice(0, 4);
    if (seed.length === wedding.gallery.length && seed.every((u, i) => u === wedding.gallery[i])) fields.push("gallery");
  }

  const catering = items.find((i) => i.vendor.category === "catering");
  if (catering && faqHasAnswer(wedding.faqs, "faq-catering", catering.vendor.name)) fields.push("faq-catering");
  const pasteleria = items.find((i) => i.vendor.category === "pasteleria");
  if (pasteleria && faqHasAnswer(wedding.faqs, "faq-pasteleria", pasteleria.vendor.name)) fields.push("faq-pasteleria");
  const autos = items.find((i) => i.vendor.category === "autos-limosinas");
  if (autos && faqHasAnswer(wedding.faqs, "faq-transporte", autos.vendor.name)) fields.push("faq-transporte");
  const musica = items.find((i) => i.vendor.category === "musica");
  if (musica && faqHasAnswer(wedding.faqs, "faq-musica", musica.vendor.name)) fields.push("faq-musica");

  return fields;
}
