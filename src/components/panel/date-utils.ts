import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

/** "12 sept 2026" → formatea fecha ISO corta en español */
export function formatEventDate(iso: string) {
  return format(parseISO(iso), "d 'de' MMMM, yyyy", { locale: es });
}

/** Clave de fecha local yyyy-MM-dd (evita corrimientos por zona horaria) */
export function dateKey(d: Date) {
  return format(d, "yyyy-MM-dd");
}
