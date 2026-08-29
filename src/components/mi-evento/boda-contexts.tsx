"use client";

import { createContext, useContext } from "react";
import { useEvent } from "@/lib/event-context";

/** true = vista como invitado (oculta botones de edición) */
export const GuestModeContext = createContext(false);

export function useGuestMode() {
  return useContext(GuestModeContext);
}

/** Nombre del invitado cuando el enlace es un pase personalizado (#…&inv=Nombre) */
export const GuestNameContext = createContext<string | null>(null);

export function useGuestName() {
  return useContext(GuestNameContext);
}

export interface BodaViewDetails {
  date?: Date;
  guests: number;
}

/** La página compartida (#s=…) inyecta fecha/invitados aquí sin tocar el store local */
export const BodaViewDetailsContext = createContext<BodaViewDetails | null>(null);

export function useBodaDetails(): BodaViewDetails {
  const shared = useContext(BodaViewDetailsContext);
  const { details } = useEvent();
  return shared ?? details;
}
