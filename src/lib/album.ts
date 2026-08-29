"use client";

/* ---------------------------------------------------------------------------
 * Álbum del gran día — fotos compartidas por los invitados.
 * Persistencia local (localStorage) por dispositivo: las fotos que sube un
 * invitado viven en su navegador; sin backend no hay sincronización entre
 * dispositivos. La subida solo se habilita el día de la boda (fecha local).
 * ------------------------------------------------------------------------- */

export interface AlbumPhoto {
  id: string;
  /** dataURL JPEG comprimido */
  src: string;
  /** nombre del invitado (puede ir vacío → "Anónimo") */
  name: string;
  caption: string;
  at: string; // ISO
}

const ALBUM_KEY = "momentum-album";
const ALBUM_NAME_KEY = "momentum-album-name";
export const ALBUM_MAX_PHOTOS = 40;

export function loadAlbum(): AlbumPhoto[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ALBUM_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (p): p is AlbumPhoto =>
        p && typeof p.id === "string" && typeof p.src === "string"
    );
  } catch {
    return [];
  }
}

/** Devuelve true si guardó; false si se excedió la cuota del navegador. */
export function saveAlbum(photos: AlbumPhoto[]): boolean {
  try {
    window.localStorage.setItem(ALBUM_KEY, JSON.stringify(photos));
    return true;
  } catch {
    return false;
  }
}

export function loadGuestName(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(ALBUM_NAME_KEY) ?? "";
}

export function saveGuestName(name: string) {
  try {
    window.localStorage.setItem(ALBUM_NAME_KEY, name);
  } catch {
    /* sin espacio: no pasa nada */
  }
}

/* ------------------------------ Gate por fecha ---------------------------- */

function sameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** true solo durante el día local de la boda. */
export function isWeddingDay(date?: Date, now: Date = new Date()): boolean {
  if (!date) return false;
  return sameLocalDay(date, now);
}

/** true cuando el día de la boda ya pasó (a partir del día siguiente). */
export function isAfterWedding(date?: Date, now: Date = new Date()): boolean {
  if (!date) return false;
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return now.getTime() > end.getTime();
}

/* --------------------------- Compresión de imagen ------------------------- */

const MAX_DIM = 1280;
const JPEG_QUALITY = 0.75;

/**
 * Convierte un File de imagen a dataURL JPEG redimensionado para que quepa
 * en localStorage (~150-350 KB por foto según contenido).
 */
export async function fileToDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file).catch(() => null);
  const loadViaImage = () =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("No se pudo leer la imagen"));
      };
      img.src = url;
    });

  const source: CanvasImageSource = bitmap ?? (await loadViaImage());
  const w = bitmap ? bitmap.width : (source as HTMLImageElement).naturalWidth;
  const h = bitmap ? bitmap.height : (source as HTMLImageElement).naturalHeight;
  const scale = Math.min(1, MAX_DIM / Math.max(w, h));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(w * scale));
  canvas.height = Math.max(1, Math.round(h * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas no disponible");
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  bitmap?.close();
  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}
