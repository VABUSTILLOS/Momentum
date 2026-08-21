import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = {
  title: "Términos de servicio | Momentum",
  description: "Términos y condiciones de uso del marketplace Momentum y del modelo de apartado del 10%.",
};

const sections = [
  {
    t: "1. Qué es Momentum",
    c: "Momentum es un marketplace que conecta a organizadores de eventos con proveedores de servicios (música, catering, fotografía, venues, decoración, mesa de dulces, pastelería, vestuario y transporte, entre otros). Momentum no es el proveedor de los servicios: facilita el descubrimiento, la cotización y el apartado de fechas.",
  },
  {
    t: "2. El apartado del 10%",
    c: "Al apartar una fecha, el cliente paga a través de Momentum el 10% del precio base publicado del servicio. Este pago confirma la reservación y bloquea la fecha en el calendario del proveedor. El 10% no es un cargo adicional: forma parte del precio total del servicio. El 90% restante se liquida directamente entre el cliente y el proveedor bajo los términos que ambos acuerden. Momentum no custodia ni interviene en ese pago.",
  },
  {
    t: "3. Cancelaciones y reembolsos",
    c: "Si el proveedor cancela una fecha apartada, Momentum reembolsa el 100% del apartado al cliente en un máximo de 7 días hábiles y apoya en la búsqueda de un reemplazo. Si el cliente cancela, el apartado no es reembolsable, ya que compensa al proveedor por bloquear la fecha. Los cambios de fecha dependen de la disponibilidad del proveedor.",
  },
  {
    t: "4. Proveedores",
    c: "Publicar servicios en Momentum es gratuito. El proveedor acepta que la única comisión de la plataforma es el 10% pagado por el cliente al momento del apartado. El proveedor es responsable de mantener su calendario actualizado, cumplir las fechas apartadas y describir con exactitud sus paquetes. Los proveedores con badge “Verificado” aprobaron nuestro proceso de validación de identidad y calidad.",
  },
  {
    t: "5. Precios y cotizaciones",
    c: "Los precios publicados son precios base proporcionados por cada proveedor. La cotización consolidada generada en “Mi evento” es un estimado; el precio final puede variar según número de invitados, horarios, logística y extras acordados directamente con el proveedor.",
  },
  {
    t: "6. Responsabilidad",
    c: "La ejecución del servicio es responsabilidad exclusiva del proveedor. Momentum actúa como intermediario de apartado y no es responsable por la calidad final del servicio, aunque nuestra Garantía Momentum cubre el reembolso del apartado en caso de cancelación por parte del proveedor.",
  },
];

export default function TerminosPage() {
  return (
    <InfoPage
      kicker="Legal"
      title={<>Términos de <em>servicio.</em></>}
      intro="Última actualización: agosto 2026."
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        {sections.map((s) => (
          <div key={s.t} className="rounded-2xl border border-border p-6">
            <h3 className="text-base font-semibold text-foreground">{s.t}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.c}</p>
          </div>
        ))}
      </div>
    </InfoPage>
  );
}
