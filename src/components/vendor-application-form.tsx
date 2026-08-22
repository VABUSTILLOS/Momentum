"use client";

import { useState } from "react";
import { Check } from "lucide-react";

const CATEGORIES = [
  "Música",
  "Catering",
  "Fotografía",
  "Venues",
  "Decoración",
  "Mesa de Dulces",
  "Pastelería y Repostería",
  "Vestidos de Novia",
  "Trajes y Tuxedos",
  "Renta de Autos y Limosinas",
  "Otro",
];

export function VendorApplicationForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border p-6 text-center sm:p-10">
        <span className="inline-flex size-14 items-center justify-center rounded-full bg-foreground text-background">
          <Check size={24} />
        </span>
        <h3 className="mt-6 font-serif text-3xl font-medium tracking-tight text-foreground">Aplicación recibida.</h3>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Nuestro equipo de verificación revisará tu información y te contactará en menos de 48 horas para activar tu
          perfil en el marketplace.
        </p>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-full border border-border bg-background px-4 py-3.5 text-sm leading-5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring sm:px-5";

  return (
    <form
      className="flex flex-col gap-4 rounded-2xl border border-border p-5 sm:p-6 md:gap-3 md:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <h3 className="font-serif text-2xl font-medium tracking-tight text-foreground">Aplica como proveedor</h3>
      <p className="text-sm leading-6 text-muted-foreground">Sin costo de alta. Solo el 5% de comisión, que queda pagada con el apartado del cliente.</p>
      <input required placeholder="Nombre o negocio" className={inputCls} />
      <input required type="email" placeholder="Correo electrónico" className={inputCls} />
      <input required type="tel" placeholder="WhatsApp" className={inputCls} />
      <select required defaultValue="" className={inputCls} aria-label="Categoría de servicio">
        <option value="" disabled>
          ¿Qué servicio ofreces?
        </option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <input required placeholder="Ciudad" className={inputCls} />
      <input placeholder="Precio base aproximado (MXN)" inputMode="numeric" className={inputCls} />
      <button type="submit" className="mt-2 rounded-full bg-foreground px-5 py-3.5 text-sm font-medium text-background hover:opacity-90">
        Quiero ofrecer mis servicios
      </button>
      <p className="text-center text-xs text-muted-foreground">
        Al aplicar aceptas nuestros <span className="underline underline-offset-2">términos para proveedores</span>.
      </p>
    </form>
  );
}
