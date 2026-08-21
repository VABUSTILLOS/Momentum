"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { InfoPage } from "@/components/info-page";

export default function ContactoPage() {
  const [sent, setSent] = useState(false);
  const inputCls =
    "w-full rounded-full border border-border bg-background px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring";

  return (
    <InfoPage
      kicker="Contacto"
      title={<>Hablemos de <em>tu evento.</em></>}
      intro="¿Dudas sobre un apartado, una cotización consolidada o la garantía? Respondemos en menos de 24 horas."
    >
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-border p-6">
            <h3 className="text-base font-semibold text-foreground">Soy cliente</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Dudas sobre tu apartado del 5%, cambios de fecha, garantía o cotización consolidada. Incluye el nombre del
              proveedor y tu fecha para ayudarte más rápido.
            </p>
          </div>
          <div className="rounded-2xl border border-border p-6">
            <h3 className="text-base font-semibold text-foreground">Soy proveedor</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              ¿Quieres ofrecer tus servicios? Aplica directo desde la página de{" "}
              <a href="/proveedores" className="font-medium text-foreground underline underline-offset-2">proveedores</a> —
              revisamos cada aplicación en menos de 48 horas.
            </p>
          </div>
          <div className="rounded-2xl border border-border p-6">
            <h3 className="text-base font-semibold text-foreground">Horario de atención</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Lunes a sábado, 9:00 – 19:00 (CDMX). Los fines de semana de eventos monitoreamos incidencias activas.
            </p>
          </div>
        </div>

        {sent ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border p-10 text-center">
            <span className="inline-flex size-14 items-center justify-center rounded-full bg-foreground text-background">
              <Check size={24} />
            </span>
            <h3 className="mt-6 font-serif text-3xl font-medium tracking-tight text-foreground">Mensaje enviado.</h3>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Te responderemos en menos de 24 horas hábiles.
            </p>
          </div>
        ) : (
          <form
            className="flex flex-col gap-3 rounded-2xl border border-border p-6 md:p-8"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <input required placeholder="Tu nombre" className={inputCls} />
            <input required type="email" placeholder="Correo electrónico" className={inputCls} />
            <select required defaultValue="" className={inputCls} aria-label="Tema">
              <option value="" disabled>
                Tema de tu mensaje
              </option>
              <option>Mi apartado / reservación</option>
              <option>Cotización consolidada</option>
              <option>Garantía Momentum</option>
              <option>Quiero ser proveedor</option>
              <option>Otro</option>
            </select>
            <textarea
              required
              placeholder="Cuéntanos más…"
              rows={5}
              className="w-full rounded-2xl border border-border bg-background px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <button type="submit" className="mt-2 rounded-full bg-foreground px-5 py-3.5 text-sm font-medium text-background hover:opacity-90">
              Enviar mensaje
            </button>
          </form>
        )}
      </div>
    </InfoPage>
  );
}
