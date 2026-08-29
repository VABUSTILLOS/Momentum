"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { VENDORS, type Vendor } from "@/lib/marketplace-data";
import {
  applyEventToWedding,
  computeSyncFields,
  DEFAULT_WEDDING_GALLERY,
  type SyncField,
} from "@/lib/wedding-sync";

export type ItemStatus = "pendiente" | "apartado" | "confirmado";

export interface EventItem {
  vendor: Vendor;
  date?: Date;
  note?: string;
  status?: ItemStatus;
}

export type EventType = "boda" | "xv" | "cumpleanos" | "corporativo" | "otro";

export interface EventDetails {
  name: string;
  type: EventType;
  date?: Date;
  guests: number;
  budget: number;
}

export interface StoryMoment {
  title: string;
  text: string;
}

export type WeddingTheme = "arena" | "rosa" | "oliva" | "noche";

export interface ItineraryEntry {
  time: string;
  label: string;
}

export interface WeddingSite {
  partner1: string;
  partner2: string;
  hashtag: string;
  message: string;
  ceremonyVenue: string;
  ceremonyTime: string;
  receptionVenue: string;
  receptionTime: string;
  dressCode: string;
  giftTable: string;
  story: StoryMoment[];
  heroImage: string;
  theme: WeddingTheme;
  itinerary: ItineraryEntry[];
  gallery: string[];
  accommodation: string;
  accommodationNote: string;
  faqs: FaqEntry[];
  registries: RegistryEntry[];
}

export interface RsvpEntry {
  name: string;
  attending: "si" | "no";
  companions: number;
  allergies: string;
  at: string;
}

export interface WishEntry {
  name: string;
  message: string;
  at: string;
}

export interface EventTask {
  id: string;
  label: string;
  done: boolean;
  /** días antes del evento en que vence la tarea */
  dueDays: number;
}

export interface FaqEntry {
  q: string;
  a: string;
}

export interface RegistryEntry {
  label: string;
  url: string;
}

/** Tareas sugeridas por tipo de evento; dueDays = días antes del evento */
export const SUGGESTED_TASKS: Record<EventType, { label: string; dueDays: number }[]> = {
  boda: [
    { label: "Apartar la sede", dueDays: 180 },
    { label: "Contratar catering", dueDays: 150 },
    { label: "Elegir fotógrafo", dueDays: 120 },
    { label: "Enviar invitaciones", dueDays: 90 },
    { label: "Prueba de menú", dueDays: 60 },
    { label: "Prueba de vestido y traje", dueDays: 45 },
    { label: "Confirmar asistencias (RSVP)", dueDays: 30 },
    { label: "Ensayo general", dueDays: 7 },
  ],
  xv: [
    { label: "Apartar el salón", dueDays: 180 },
    { label: "Elegir el vestido", dueDays: 120 },
    { label: "Contratar música", dueDays: 120 },
    { label: "Enviar invitaciones", dueDays: 75 },
    { label: "Prueba de peinado y maquillaje", dueDays: 30 },
    { label: "Confirmar asistencias", dueDays: 21 },
    { label: "Ensayo del vals", dueDays: 14 },
  ],
  cumpleanos: [
    { label: "Apartar el venue", dueDays: 60 },
    { label: "Encargar el pastel", dueDays: 30 },
    { label: "Enviar invitaciones", dueDays: 21 },
    { label: "Comprar decoración", dueDays: 14 },
    { label: "Confirmar asistencias", dueDays: 7 },
  ],
  corporativo: [
    { label: "Apartar la sede", dueDays: 60 },
    { label: "Definir la agenda", dueDays: 45 },
    { label: "Contratar catering", dueDays: 30 },
    { label: "Enviar invitaciones", dueDays: 30 },
    { label: "Confirmar ponentes", dueDays: 21 },
  ],
  otro: [
    { label: "Apartar la sede", dueDays: 90 },
    { label: "Contratar servicios clave", dueDays: 60 },
    { label: "Enviar invitaciones", dueDays: 30 },
    { label: "Confirmar asistencias", dueDays: 14 },
  ],
};

interface StoredItem {
  vendorId: string;
  date?: string;
  note?: string;
  status?: ItemStatus;
}

interface StoredState {
  items: StoredItem[];
  details: {
    name: string;
    type?: EventType;
    date?: string;
    guests: number;
    budget: number;
  };
  wedding?: WeddingSite;
}

interface EventContextValue {
  items: EventItem[];
  details: EventDetails;
  wedding: WeddingSite;
  hydrated: boolean;
  /** Campos del sitio de boda alimentados automáticamente desde Mi Evento. */
  syncFields: SyncField[];
  /** Re-aplica el sync de Mi Evento → boda de forma manual (rellena solo vacíos). */
  resyncWedding: () => void;
  addItem: (vendor: Vendor, date?: Date) => void;
  removeItem: (vendorId: string) => void;
  updateItemDate: (vendorId: string, date?: Date) => void;
  updateItemNote: (vendorId: string, note: string) => void;
  updateItemStatus: (vendorId: string, status: ItemStatus) => void;
  updateDetails: (patch: Partial<EventDetails>) => void;
  updateWedding: (patch: Partial<WeddingSite>) => void;
  rsvps: RsvpEntry[];
  addRsvp: (entry: Omit<RsvpEntry, "at">) => void;
  clearRsvps: () => void;
  wishes: WishEntry[];
  addWish: (entry: Omit<WishEntry, "at">) => void;
  clearWishes: () => void;
  tasks: EventTask[];
  toggleTask: (taskId: string) => void;
  addTask: (label: string, dueDays: number) => void;
  removeTask: (taskId: string) => void;
  importEvent: (json: string) => boolean;
  clearEvent: () => void;
}

const EventContext = createContext<EventContextValue | null>(null);

const STORAGE_KEY = "momentum-mi-evento";
const RSVP_KEY = "momentum-rsvp";
const WISHES_KEY = "momentum-wishes";
const TASKS_KEY = "momentum-tasks";

const DEFAULT_DETAILS: EventDetails = {
  name: "",
  type: "otro",
  date: undefined,
  guests: 100,
  budget: 150000,
};

export const DEFAULT_WEDDING_HERO =
  "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=1920";

export const DEFAULT_WEDDING: WeddingSite = {
  partner1: "",
  partner2: "",
  hashtag: "",
  message: "",
  ceremonyVenue: "",
  ceremonyTime: "",
  receptionVenue: "",
  receptionTime: "",
  dressCode: "",
  giftTable: "",
  story: [
    { title: "", text: "" },
    { title: "", text: "" },
    { title: "", text: "" },
  ],
  heroImage: DEFAULT_WEDDING_HERO,
  theme: "arena",
  itinerary: [
    { time: "17:00", label: "Ceremonia" },
    { time: "18:30", label: "Cocktail" },
    { time: "20:00", label: "Recepción" },
    { time: "22:00", label: "Primer baile" },
  ],
  gallery: DEFAULT_WEDDING_GALLERY,
  accommodation: "",
  accommodationNote: "",
  faqs: [
    { q: "¿Cuál es el código de vestimenta?", a: "" },
    { q: "¿Puedo llevar acompañante?", a: "" },
    { q: "¿Habrá estacionamiento?", a: "" },
  ],
  registries: [],
};

function loadStoredState(): StoredState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredState;
  } catch {
    return null;
  }
}

export interface WeddingShare {
  wedding: WeddingSite;
  details: { name: string; date?: string; guests: number };
}

/** Serializa el sitio de boda a base64url para compartirlo en el hash de la URL */
export function encodeWeddingShare(wedding: WeddingSite, details: EventDetails): string {
  const payload: WeddingShare = {
    wedding,
    details: { name: details.name, date: details.date?.toISOString(), guests: details.guests },
  };
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeWeddingShare(encoded: string): WeddingShare | null {
  try {
    const b64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(b64);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const parsed = JSON.parse(new TextDecoder().decode(bytes)) as Partial<WeddingShare>;
    if (!parsed || typeof parsed !== "object" || !parsed.wedding) return null;
    const wedding: WeddingSite = { ...DEFAULT_WEDDING, ...parsed.wedding };
    if (!parsed.wedding.registries && wedding.giftTable) {
      wedding.registries = [{ label: "Mesa de regalos", url: wedding.giftTable }];
    }
    return {
      wedding,
      details: {
        name: parsed.details?.name ?? "",
        date: parsed.details?.date,
        guests: parsed.details?.guests ?? 100,
      },
    };
  } catch {
    return null;
  }
}

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<EventItem[]>([]);
  const [details, setDetails] = useState<EventDetails>(DEFAULT_DETAILS);
  const [wedding, setWedding] = useState<WeddingSite>(DEFAULT_WEDDING);
  const [rsvps, setRsvps] = useState<RsvpEntry[]>([]);
  const [wishes, setWishes] = useState<WishEntry[]>([]);
  const [tasks, setTasks] = useState<EventTask[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(RSVP_KEY);
      if (raw) setRsvps(JSON.parse(raw) as RsvpEntry[]);
    } catch {
      // storage unavailable
    }
    try {
      const raw = window.localStorage.getItem(WISHES_KEY);
      if (raw) setWishes(JSON.parse(raw) as WishEntry[]);
    } catch {
      // storage unavailable
    }
    try {
      const raw = window.localStorage.getItem(TASKS_KEY);
      if (raw) setTasks(JSON.parse(raw) as EventTask[]);
    } catch {
      // storage unavailable
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(RSVP_KEY, JSON.stringify(rsvps));
      window.localStorage.setItem(WISHES_KEY, JSON.stringify(wishes));
      window.localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch {
      // storage unavailable
    }
  }, [rsvps, wishes, tasks, hydrated]);

  useEffect(() => {
    const stored = loadStoredState();
    if (stored) {
      setItems(
        stored.items
          .map((item): EventItem | null => {
            const vendor = VENDORS.find((v) => v.id === item.vendorId);
            if (!vendor) return null;
            return { vendor, date: item.date ? new Date(item.date) : undefined, note: item.note, status: item.status };
          })
          .filter((item): item is EventItem => item !== null)
      );
      setDetails({
        name: stored.details.name ?? "",
        type: stored.details.type ?? DEFAULT_DETAILS.type,
        date: stored.details.date ? new Date(stored.details.date) : undefined,
        guests: stored.details.guests ?? DEFAULT_DETAILS.guests,
        budget: stored.details.budget ?? DEFAULT_DETAILS.budget,
      });
      if (stored.wedding) {
        const merged: WeddingSite = { ...DEFAULT_WEDDING, ...stored.wedding };
        if (!stored.wedding.registries && merged.giftTable) {
          merged.registries = [{ label: "Mesa de regalos", url: merged.giftTable }];
        }
        setWedding(merged);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const stored: StoredState = {
      items: items.map((item) => ({
        vendorId: item.vendor.id,
        date: item.date?.toISOString(),
        note: item.note,
        status: item.status,
      })),
      details: {
        name: details.name,
        type: details.type,
        date: details.date?.toISOString(),
        guests: details.guests,
        budget: details.budget,
      },
      wedding,
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch {
      // storage unavailable; event stays in memory
    }
  }, [items, details, wedding, hydrated]);

  const addItem = useCallback((vendor: Vendor, date?: Date) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.vendor.id === vendor.id);
      if (existing) {
        return prev.map((i) => (i.vendor.id === vendor.id ? { vendor, date: date ?? i.date } : i));
      }
      return [...prev, { vendor, date }];
    });
  }, []);

  const removeItem = useCallback((vendorId: string) => {
    setItems((prev) => prev.filter((i) => i.vendor.id !== vendorId));
  }, []);

  const updateItemDate = useCallback((vendorId: string, date?: Date) => {
    setItems((prev) => prev.map((i) => (i.vendor.id === vendorId ? { ...i, date } : i)));
  }, []);

  const updateItemNote = useCallback((vendorId: string, note: string) => {
    setItems((prev) => prev.map((i) => (i.vendor.id === vendorId ? { ...i, note } : i)));
  }, []);

  const updateItemStatus = useCallback((vendorId: string, status: ItemStatus) => {
    setItems((prev) => prev.map((i) => (i.vendor.id === vendorId ? { ...i, status } : i)));
  }, []);

  const updateDetails = useCallback((patch: Partial<EventDetails>) => {
    setDetails((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateWedding = useCallback((patch: Partial<WeddingSite>) => {
    setWedding((prev) => ({ ...prev, ...patch }));
  }, []);

  // Auto-sync Mi Evento → boda: cuando el tipo es boda y los items cambian,
  // rellena los campos vacíos/predeterminados del sitio de boda (idempotente).
  useEffect(() => {
    if (!hydrated || details.type !== "boda") return;
    const result = applyEventToWedding(wedding, items);
    if (result.changed) setWedding(result.wedding);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, details.type, items]);

  const resyncWedding = useCallback(() => {
    if (details.type !== "boda") return;
    const result = applyEventToWedding(wedding, items);
    if (result.changed) setWedding(result.wedding);
  }, [details.type, wedding, items]);

  const syncFields = useMemo<SyncField[]>(() => {
    if (details.type !== "boda") return [];
    return computeSyncFields(wedding, items);
  }, [details.type, wedding, items]);

  const addRsvp = useCallback((entry: Omit<RsvpEntry, "at">) => {
    setRsvps((prev) => [...prev, { ...entry, at: new Date().toISOString() }]);
  }, []);

  const clearRsvps = useCallback(() => {
    setRsvps([]);
    try {
      window.localStorage.removeItem(RSVP_KEY);
    } catch {
      // storage unavailable
    }
  }, []);

  const addWish = useCallback((entry: Omit<WishEntry, "at">) => {
    setWishes((prev) => [...prev, { ...entry, at: new Date().toISOString() }]);
  }, []);

  const clearWishes = useCallback(() => {
    setWishes([]);
    try {
      window.localStorage.removeItem(WISHES_KEY);
    } catch {
      // storage unavailable
    }
  }, []);

  const toggleTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)));
  }, []);

  const addTask = useCallback((label: string, dueDays: number) => {
    setTasks((prev) => [
      ...prev,
      { id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, label, done: false, dueDays },
    ]);
  }, []);

  const removeTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  const importEvent = useCallback((json: string): boolean => {
    try {
      const parsed = JSON.parse(json) as Partial<StoredState>;
      if (!parsed || typeof parsed !== "object" || !parsed.details || !Array.isArray(parsed.items)) return false;
      const nextItems = parsed.items
        .map((item): EventItem | null => {
          const vendor = VENDORS.find((v) => v.id === item.vendorId);
          if (!vendor) return null;
          return { vendor, date: item.date ? new Date(item.date) : undefined, note: item.note, status: item.status };
        })
        .filter((item): item is EventItem => item !== null);
      setItems(nextItems);
      setDetails({
        name: parsed.details.name ?? "",
        type: parsed.details.type ?? DEFAULT_DETAILS.type,
        date: parsed.details.date ? new Date(parsed.details.date) : undefined,
        guests: parsed.details.guests ?? DEFAULT_DETAILS.guests,
        budget: parsed.details.budget ?? DEFAULT_DETAILS.budget,
      });
      if (parsed.wedding) {
        const merged: WeddingSite = { ...DEFAULT_WEDDING, ...parsed.wedding };
        if (!parsed.wedding.registries && merged.giftTable) {
          merged.registries = [{ label: "Mesa de regalos", url: merged.giftTable }];
        }
        setWedding(merged);
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  const clearEvent = useCallback(() => {
    setItems([]);
    setDetails(DEFAULT_DETAILS);
    setWedding(DEFAULT_WEDDING);
  }, []);

  const value = useMemo<EventContextValue>(
    () => ({ items, details, wedding, hydrated, syncFields, resyncWedding, addItem, removeItem, updateItemDate, updateItemNote, updateItemStatus, updateDetails, updateWedding, rsvps, addRsvp, clearRsvps, wishes, addWish, clearWishes, tasks, toggleTask, addTask, removeTask, importEvent, clearEvent }),
    [items, details, wedding, hydrated, syncFields, resyncWedding, addItem, removeItem, updateItemDate, updateItemNote, updateItemStatus, updateDetails, updateWedding, rsvps, addRsvp, clearRsvps, wishes, addWish, clearWishes, tasks, toggleTask, addTask, removeTask, importEvent, clearEvent]
  );

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
}

export function useEvent() {
  const ctx = useContext(EventContext);
  if (!ctx) throw new Error("useEvent debe usarse dentro de <EventProvider>");
  return ctx;
}
