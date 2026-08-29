"use client";

import { useEffect, useRef, useState } from "react";
import {
  Camera,
  Eye,
  Images,
  Loader2,
  Lock,
  PartyPopper,
  Trash2,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { SectionHeading } from "@/components/mi-evento/editorial";
import { useBodaDetails, useGuestMode } from "@/components/mi-evento/boda-contexts";
import {
  ALBUM_MAX_PHOTOS,
  fileToDataUrl,
  isAfterWedding,
  isWeddingDay,
  loadAlbum,
  loadGuestName,
  saveAlbum,
  saveGuestName,
  type AlbumPhoto,
} from "@/lib/album";
import { cn } from "@/lib/utils";

/**
 * Álbum del gran día: los invitados comparten fotos SOLO el día de la boda.
 * Las fotos se guardan comprimidas en el dispositivo de cada invitado.
 */
export function AlbumSection() {
  const { date } = useBodaDetails();
  const guestMode = useGuestMode();
  const [photos, setPhotos] = useState<AlbumPhoto[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [preview, setPreview] = useState(false);
  const [name, setName] = useState("");
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPhotos(loadAlbum());
    setName(loadGuestName());
    setHydrated(true);
  }, []);

  const dayOpen = isWeddingDay(date);
  const after = isAfterWedding(date);
  const canUpload = dayOpen || (preview && !guestMode);
  const fecha = date
    ? date.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : null;

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    try {
      const images = Array.from(files).filter((f) => f.type.startsWith("image/"));
      const room = Math.max(0, ALBUM_MAX_PHOTOS - photos.length);
      if (images.length > room) {
        setError(`El álbum admite hasta ${ALBUM_MAX_PHOTOS} fotos por dispositivo.`);
      }
      const added: AlbumPhoto[] = [];
      for (const file of images.slice(0, room)) {
        const src = await fileToDataUrl(file);
        added.push({
          id: crypto.randomUUID(),
          src,
          name: name.trim(),
          caption: caption.trim(),
          at: new Date().toISOString(),
        });
      }
      if (added.length > 0) {
        const next = [...added.reverse(), ...photos];
        if (!saveAlbum(next)) {
          setError("No hay espacio en este dispositivo para más fotos.");
          return;
        }
        setPhotos(next);
        setCaption("");
        saveGuestName(name.trim());
      }
    } catch {
      setError("No se pudo procesar la imagen. Intenta con otra.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removePhoto = (id: string) => {
    if (!window.confirm("¿Quitar esta foto del álbum?")) return;
    const next = photos.filter((p) => p.id !== id);
    saveAlbum(next);
    setPhotos(next);
  };

  return (
    <section id="album" className="mx-auto max-w-5xl scroll-mt-24 px-6 pb-20 md:pb-28">
      <SectionHeading
        eyebrow="El gran día, en sus manos"
        title={
          <>
            El <em className="italic text-gold">álbum</em> del gran día
          </>
        }
      />
      <p className="mx-auto -mt-8 mb-10 max-w-xl text-center text-sm leading-relaxed text-muted-foreground">
        {photos.length > 0
          ? `${photos.length} ${photos.length === 1 ? "momento compartido" : "momentos compartidos"} · guardados en este dispositivo`
          : "Las fotos que tomen los invitados, reunidas en un solo lugar."}
      </p>

      {/* ------------------------- Estado: aún no es el día ------------------------ */}
      {!canUpload && !after && (
        <div className="card-lift mx-auto max-w-xl rounded-3xl border border-border bg-card p-10 text-center">
          <div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
            style={{ border: "1px solid color-mix(in srgb, var(--wed-accent) 40%, transparent)", background: "var(--wed-soft)", color: "var(--wed-accent)" }}
          >
            <Lock size={22} />
          </div>
          <p className="mt-6 font-serif text-2xl font-medium tracking-tight text-foreground">
            Se habilita el día de la boda
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {fecha ? (
              <>
                El <strong className="font-medium text-foreground">{fecha}</strong> podrás subir aquí las fotos que
                tomes durante la celebración.
              </>
            ) : (
              "El día de la boda podrás subir aquí las fotos que tomes durante la celebración."
            )}
          </p>
          {!guestMode && (
            <button
              type="button"
              onClick={() => setPreview(true)}
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-5 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Eye size={14} /> Vista previa del módulo
            </button>
          )}
        </div>
      )}

      {/* ------------------------------ Subida de fotos -------------------------- */}
      {canUpload && (
        <div className="mx-auto mb-8 max-w-xl">
          {preview && !dayOpen && (
            <p className="mb-3 rounded-full bg-secondary px-4 py-2 text-center text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Vista previa — los invitados lo verán el día de la boda
            </p>
          )}
          <div className="card-lift rounded-3xl border border-border bg-card p-6 md:p-8">
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre (opcional)"
                maxLength={40}
                className="min-h-11 rounded-xl border border-border bg-background px-4 py-2.5 text-base outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-foreground/40"
              />
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Dedicatoria corta (opcional)"
                maxLength={80}
                className="min-h-11 rounded-xl border border-border bg-background px-4 py-2.5 text-base outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-foreground/40"
              />
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => onFiles(e.target.files)}
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
              className="mt-3 flex min-h-28 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-background/60 px-4 py-6 text-sm text-muted-foreground transition-colors hover:border-[color-mix(in_srgb,var(--wed-accent)_50%,transparent)] hover:text-foreground disabled:opacity-60"
            >
              {busy ? (
                <Loader2 size={22} className="animate-spin" />
              ) : (
                <Camera size={22} style={{ color: "var(--wed-accent)" }} />
              )}
              <span className="font-medium text-foreground">
                {busy ? "Preparando tus fotos…" : "Toca para tomar o elegir fotos"}
              </span>
              <span className="text-xs">Se comprimen automáticamente · máx. {ALBUM_MAX_PHOTOS}</span>
            </button>
            {error && <p className="mt-3 text-center text-xs font-medium text-red-500">{error}</p>}
          </div>
        </div>
      )}

      {/* ------------------------------ Álbum cerrado ---------------------------- */}
      {after && !canUpload && (
        <p className="mb-8 flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
          <PartyPopper size={15} style={{ color: "var(--wed-accent)" }} />
          La subida estuvo disponible el día de la boda — gracias por compartir sus momentos.
        </p>
      )}

      {/* --------------------------------- Grid ---------------------------------- */}
      {hydrated && photos.length === 0 && canUpload && (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border py-14 text-center">
          <Images size={22} className="text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Sé la primera persona en compartir un momento.</p>
        </div>
      )}

      {photos.length > 0 && (
        <div className="columns-2 gap-3 md:columns-3">
          {photos.map((p, i) => (
            <figure
              key={p.id}
              className="group relative mb-3 break-inside-avoid overflow-hidden rounded-2xl bg-secondary"
            >
              <button
                type="button"
                onClick={() => setSelected(i)}
                aria-label={`Ver foto de ${p.name || "invitado"} en grande`}
                className="block w-full cursor-zoom-in"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.src}
                  alt={p.caption || `Momento de ${p.name || "un invitado"}`}
                  loading="lazy"
                  className="w-full transition-transform duration-700 group-hover:scale-105"
                />
              </button>
              {(p.name || p.caption) && (
                <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2.5 pt-8 text-left">
                  {p.caption && <p className="whitespace-pre-line break-words text-xs font-medium leading-relaxed text-white">{p.caption}</p>}
                  {p.name && <p className="text-[10px] uppercase tracking-[0.14em] text-white/75">{p.name}</p>}
                </figcaption>
              )}
              <button
                type="button"
                onClick={() => removePhoto(p.id)}
                aria-label="Quitar foto"
                className="absolute right-2 top-2 flex size-9 items-center justify-center rounded-full bg-black/50 text-white opacity-100 backdrop-blur-sm transition-opacity hover:bg-black/70 md:opacity-0 md:group-hover:opacity-100"
              >
                <Trash2 size={14} />
              </button>
            </figure>
          ))}
        </div>
      )}

      {/* -------------------------------- Lightbox -------------------------------- */}
      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="border-none bg-transparent p-0 shadow-none sm:max-w-3xl">
          <DialogTitle className="sr-only">Álbum del gran día</DialogTitle>
          <Carousel opts={{ startIndex: selected ?? 0 }} className="w-full">
            <CarouselContent>
              {photos.map((p) => (
                <CarouselItem key={p.id}>
                  <div className="flex flex-col items-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.src}
                      alt={p.caption || `Momento de ${p.name || "un invitado"}`}
                      className="max-h-[70vh] w-auto max-w-full rounded-2xl object-contain"
                    />
                    {(p.name || p.caption) && (
                      <p className="mt-3 text-center text-sm text-white/90">
                        {p.caption && <span className="font-medium">{p.caption} · </span>}
                        {p.name}
                      </p>
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {photos.length > 1 && (
              <>
                <CarouselPrevious className="left-2 border-white/30 bg-black/40 text-white hover:bg-black/60" />
                <CarouselNext className="right-2 border-white/30 bg-black/40 text-white hover:bg-black/60" />
              </>
            )}
          </Carousel>
        </DialogContent>
      </Dialog>
    </section>
  );
}
