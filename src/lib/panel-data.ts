/* ------------------------------------------------------------------ */
/*  Datos del Panel de Proveedor — Momentum                            */
/*  Modelo financiero: el cliente aparta con 10% al reservar.          */
/*  De ese 10%: 5% comisión Momentum + 5% anticipo directo.            */
/*  El 90% restante lo cobra el proveedor directamente al cliente.     */
/* ------------------------------------------------------------------ */

export const APARTADO_PCT = 0.10;
export const COMISION_PCT = 0.05;
export const ANTICIPO_PCT = 0.05;
export const SALDO_PCT = 0.90;

export const apartadoDe = (total: number) => Math.round(total * APARTADO_PCT);
export const comisionDe = (total: number) => Math.round(total * COMISION_PCT);
export const anticipoDe = (total: number) => Math.round(total * ANTICIPO_PCT);
export const saldoDe = (total: number) => Math.round(total * SALDO_PCT);

/* --------------------------------- Tipos -------------------------------- */

export type EventType = "Boda" | "XV Años" | "Graduación" | "Evento Corporativo";

export interface Reservation {
  id: string;
  clientName: string;
  phone: string; // solo dígitos, con código de país para wa.me
  email: string;
  eventType: EventType;
  date: string; // ISO yyyy-MM-dd
  time: string;
  venue: string;
  guests: number;
  packageName: string;
  addons: string[];
  total: number; // MXN
  status: "confirmada" | "por-confirmar";
}

export interface Extra {
  name: string;
  price: number;
}

export interface ProviderPackage {
  id: string;
  name: string;
  basePrice: number;
  maxGuests: number;
  hours: number;
  extras: Extra[];
  includes: string[];
}

/* ------------------------------- Proveedor ------------------------------ */

const px = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&fm=webp`;

export const PROVIDER = {
  id: "pasteleria-maison",
  name: "Pastelería Maison",
  tagline: "Pasteles de boda de autor, hasta 5 pisos, con degustación incluida.",
  location: "CDMX",
  rating: 5.0,
  reviews: 187,
  verified: true,
  image: px(10751391),
  gallery: [px(10751391), px(291528), px(12068771)],
  categories: ["pasteleria", "mesa-de-dulces"] as string[],
};

/* ------------------------------- Reservas ------------------------------- */

export const RESERVATIONS: Reservation[] = [
  {
    id: "RES-2601",
    clientName: "Mariana Rodríguez",
    phone: "5215512348901",
    email: "mariana.rodriguez@gmail.com",
    eventType: "Boda",
    date: "2026-09-12",
    time: "17:00",
    venue: "Hacienda San Javier, Guadalajara",
    guests: 180,
    packageName: "Cake & Dessert Signature",
    addons: ["Mesa de postres franceses", "Fuente de chocolate", "Pastel de 5 pisos"],
    total: 48500,
    status: "confirmada",
  },
  {
    id: "RES-2602",
    clientName: "Carlos Mendoza",
    phone: "5215523459012",
    email: "carlos.mendoza@outlook.com",
    eventType: "XV Años",
    date: "2026-09-19",
    time: "19:30",
    venue: "Salón Alameda, CDMX",
    guests: 150,
    packageName: "Mesa de Dulces Premium",
    addons: ["Candy bar temático", "Cupcakes personalizados"],
    total: 32000,
    status: "confirmada",
  },
  {
    id: "RES-2603",
    clientName: "Fernanda López",
    phone: "5215534560123",
    email: "fer.lopez@gmail.com",
    eventType: "Graduación",
    date: "2026-09-26",
    time: "14:00",
    venue: "Jardín Coyoacán, CDMX",
    guests: 90,
    packageName: "Pastel de Autor Clásico",
    addons: ["Degustación extra para 6"],
    total: 21500,
    status: "confirmada",
  },
  {
    id: "RES-2604",
    clientName: "Grupo Bafar — Ana Torres (RH)",
    phone: "5218145671234",
    email: "ana.torres@grupobafar.mx",
    eventType: "Evento Corporativo",
    date: "2026-10-03",
    time: "12:30",
    venue: "Corporativo Torre Virreyes, CDMX",
    guests: 220,
    packageName: "Coffee Break & Repostería Ejecutiva",
    addons: ["Estación de café de especialidad", "Mini postres x 300"],
    total: 38000,
    status: "confirmada",
  },
  {
    id: "RES-2605",
    clientName: "Alejandra Ruiz",
    phone: "5215545672345",
    email: "ale.ruiz.2026@gmail.com",
    eventType: "Boda",
    date: "2026-10-17",
    time: "16:00",
    venue: "Viñedo La Redonda, Querétaro",
    guests: 200,
    packageName: "Cake & Dessert Signature",
    addons: ["Pastel escultórico 4 pisos", "Mesa de quesos dulces"],
    total: 52000,
    status: "confirmada",
  },
  {
    id: "RES-2606",
    clientName: "Diego Fernández",
    phone: "5215556783456",
    email: "diego.fdez@gmail.com",
    eventType: "XV Años",
    date: "2026-11-07",
    time: "20:00",
    venue: "Salón Los Cedros, Toluca",
    guests: 130,
    packageName: "Mesa de Dulces Premium",
    addons: ["Fuente de chocolate", "Palomitas gourmet"],
    total: 28500,
    status: "confirmada",
  },
  {
    id: "RES-2607",
    clientName: "Sofía Herrera",
    phone: "5215567894567",
    email: "sofia.herrera@gmail.com",
    eventType: "Boda",
    date: "2026-12-05",
    time: "18:30",
    venue: "Ex-Convento de San Hipólito, CDMX",
    guests: 160,
    packageName: "Cake & Dessert Signature",
    addons: ["Degustación para 8", "Topper floral natural"],
    total: 44900,
    status: "por-confirmar",
  },
];

/* --------------------------- Fechas bloqueadas -------------------------- */

export const INITIAL_BLOCKED_DATES: string[] = [
  "2026-09-05",
  "2026-10-10",
  "2026-11-14",
];

/* ------------------------------- Paquetes ------------------------------- */

export const INITIAL_PACKAGES: ProviderPackage[] = [
  {
    id: "pkg-signature",
    name: "Cake & Dessert Signature",
    basePrice: 42000,
    maxGuests: 200,
    hours: 6,
    extras: [
      { name: "Mesa de postres franceses", price: 6500 },
      { name: "Fuente de chocolate", price: 3800 },
      { name: "Piso adicional de pastel", price: 2400 },
    ],
    includes: [
      "Degustación para 4 personas",
      "Diseño 3D del pastel",
      "Hasta 5 pisos",
      "Entrega y montaje en el salón",
    ],
  },
  {
    id: "pkg-mesa-dulces",
    name: "Mesa de Dulces Premium",
    basePrice: 26500,
    maxGuests: 150,
    hours: 5,
    extras: [
      { name: "Candy bar temático", price: 3200 },
      { name: "Palomitas gourmet", price: 1800 },
    ],
    includes: [
      "Montaje y styling de la mesa",
      "12 variedades de dulces artesanales",
      "Contenedores de cristal y florería",
      "Desmontaje incluido",
    ],
  },
];

/* ------------------------- Resumen financiero global --------------------- */

export function financeSummary(reservations: Reservation[]) {
  const ingresosTotales = reservations.reduce((acc, r) => acc + r.total, 0);
  const anticipos = reservations.reduce((acc, r) => acc + anticipoDe(r.total), 0);
  const saldos = reservations.reduce((acc, r) => acc + saldoDe(r.total), 0);
  const eventos = reservations.length;
  return { ingresosTotales, anticipos, saldos, eventos };
}
