"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { VENDORS, type Vendor } from "@/lib/marketplace-data";

export interface EventItem {
  vendor: Vendor;
  date?: Date;
}

export interface EventDetails {
  name: string;
  date?: Date;
  guests: number;
  budget: number;
}

interface StoredItem {
  vendorId: string;
  date?: string;
}

interface StoredState {
  items: StoredItem[];
  details: {
    name: string;
    date?: string;
    guests: number;
    budget: number;
  };
}

interface EventContextValue {
  items: EventItem[];
  details: EventDetails;
  hydrated: boolean;
  addItem: (vendor: Vendor, date?: Date) => void;
  removeItem: (vendorId: string) => void;
  updateItemDate: (vendorId: string, date?: Date) => void;
  updateDetails: (patch: Partial<EventDetails>) => void;
  clearEvent: () => void;
}

const EventContext = createContext<EventContextValue | null>(null);

const STORAGE_KEY = "momentum-mi-evento";

const DEFAULT_DETAILS: EventDetails = {
  name: "",
  date: undefined,
  guests: 100,
  budget: 150000,
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

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<EventItem[]>([]);
  const [details, setDetails] = useState<EventDetails>(DEFAULT_DETAILS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadStoredState();
    if (stored) {
      setItems(
        stored.items
          .map((item): EventItem | null => {
            const vendor = VENDORS.find((v) => v.id === item.vendorId);
            if (!vendor) return null;
            return { vendor, date: item.date ? new Date(item.date) : undefined };
          })
          .filter((item): item is EventItem => item !== null)
      );
      setDetails({
        name: stored.details.name ?? "",
        date: stored.details.date ? new Date(stored.details.date) : undefined,
        guests: stored.details.guests ?? DEFAULT_DETAILS.guests,
        budget: stored.details.budget ?? DEFAULT_DETAILS.budget,
      });
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const stored: StoredState = {
      items: items.map((item) => ({
        vendorId: item.vendor.id,
        date: item.date?.toISOString(),
      })),
      details: {
        name: details.name,
        date: details.date?.toISOString(),
        guests: details.guests,
        budget: details.budget,
      },
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch {
      // storage unavailable; event stays in memory
    }
  }, [items, details, hydrated]);

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

  const updateDetails = useCallback((patch: Partial<EventDetails>) => {
    setDetails((prev) => ({ ...prev, ...patch }));
  }, []);

  const clearEvent = useCallback(() => {
    setItems([]);
    setDetails(DEFAULT_DETAILS);
  }, []);

  const value = useMemo<EventContextValue>(
    () => ({ items, details, hydrated, addItem, removeItem, updateItemDate, updateDetails, clearEvent }),
    [items, details, hydrated, addItem, removeItem, updateItemDate, updateDetails, clearEvent]
  );

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
}

export function useEvent() {
  const ctx = useContext(EventContext);
  if (!ctx) throw new Error("useEvent debe usarse dentro de <EventProvider>");
  return ctx;
}
