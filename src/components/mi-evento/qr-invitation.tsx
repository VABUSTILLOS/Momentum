"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Printer, QrCode } from "lucide-react";
import QRCode from "qrcode";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/components/ui/use-mobile";

/**
 * QR de invitación: genera el código del enlace para invitados en el cliente,
 * permite descargarlo como PNG e imprimir una tarjeta editorial.
 */
export function QrInvitationSheet({
  open,
  onOpenChange,
  url,
  namesLabel,
  dateLabel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  namesLabel: string;
  dateLabel: string;
}) {
  const isMobile = useIsMobile();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !url) return;
    let cancelled = false;
    QRCode.toDataURL(url, {
      width: 640,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#1C1917", light: "#FFFFFF" },
    })
      .then((png) => {
        if (cancelled) return;
        setDataUrl(png);
        if (canvasRef.current) {
          QRCode.toCanvas(canvasRef.current, url, {
            width: 224,
            margin: 1,
            errorCorrectionLevel: "M",
            color: { dark: "#1C1917", light: "#FFFFFF" },
          }).catch(() => {});
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [open, url]);

  const downloadPng = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "qr-invitacion-boda.png";
    a.click();
  };

  const printCard = () => {
    if (!dataUrl) return;
    requestAnimationFrame(() => window.print());
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className="flex flex-col gap-6 overflow-y-auto rounded-t-3xl px-6 pb-10 pt-8 sm:max-w-md"
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 font-serif text-2xl">
            <QrCode size={20} aria-hidden="true" /> QR de invitación
          </SheetTitle>
          <SheetDescription>
            Imprime este código en tus invitaciones: tus invitados lo escanean y ven la página con todos los
            detalles.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-secondary/40 p-6">
          <canvas ref={canvasRef} width={224} height={224} className="size-56 rounded-lg bg-white p-2" />
          <div className="text-center">
            <p className="font-serif text-xl text-foreground">{namesLabel}</p>
            {dateLabel && <p className="mt-0.5 text-xs uppercase tracking-[0.25em] text-muted-foreground">{dateLabel}</p>}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={downloadPng}
            disabled={!dataUrl}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Download size={16} aria-hidden="true" /> Descargar PNG
          </button>
          <button
            type="button"
            onClick={printCard}
            disabled={!dataUrl}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-border px-5 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
          >
            <Printer size={16} aria-hidden="true" /> Imprimir tarjeta
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          El código se genera en tu dispositivo; el enlace nunca pasa por un servidor.
        </p>
      </SheetContent>

      {/* Tarjeta imprimible: solo visible al imprimir */}
      {dataUrl && (
        <div
          aria-hidden="true"
          className="qr-print-card fixed inset-0 z-[100] hidden items-center justify-center bg-white print:flex"
        >
          <div className="flex w-[420px] flex-col items-center gap-6 rounded-3xl border border-neutral-200 p-10 text-center">
            <p className="text-[11px] uppercase tracking-[0.4em] text-neutral-500">Nuestra boda</p>
            <p className="font-serif text-4xl text-neutral-900">{namesLabel}</p>
            {dateLabel && <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">{dateLabel}</p>}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={dataUrl} alt="" className="size-56" />
            <p className="max-w-[280px] text-sm text-neutral-600">
              Escanea el código para ver todos los detalles y confirmar tu asistencia.
            </p>
            <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-400">Hecho con Momentum ✦</p>
          </div>
        </div>
      )}
    </Sheet>
  );
}
