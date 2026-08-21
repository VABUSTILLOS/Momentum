"use client";

import { InfoPage } from "@/components/info-page";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "¿Qué es Momentum?",
    a: "Momentum es un marketplace para apartar a los proveedores de tu evento (bodas, XV años, corporativos y más). Encuentras proveedores verificados con precios transparentes, verificas su disponibilidad en calendario y apartas la fecha pagando solo el 10% del servicio.",
  },
  {
    q: "¿Cómo funciona el pago del 10%?",
    a: "Cuando apartas una fecha, pagas únicamente el 10% del precio base del servicio a través de Momentum. De ese 10%, el 5% es la comisión justa de Momentum y el otro 5% es un anticipo que se descuenta de lo que le pagas al proveedor. El 90% restante lo liquidas directamente con cada proveedor en los tiempos que acuerden.",
  },
  {
    q: "¿El 10% es un costo extra?",
    a: "No. El 10% no se suma al precio del servicio: es el anticipo que confirma tu apartado. El precio que ves en el marketplace es el precio total del proveedor — solo lo divides en un 10% para reservar y un 90% que pagas directo al proveedor.",
  },
  {
    q: "¿Puedo apartar varios servicios a la vez?",
    a: "Sí. Agrega todos los servicios que necesites a “Mi evento” (música, catering, fotografía, venue, decoración y más) y solicita una cotización consolidada en un solo paso. Verás el estimado total y el apartado del 10% correspondiente.",
  },
  {
    q: "¿Qué pasa si el proveedor cancela?",
    a: "Si un proveedor cancela una fecha apartada, te devolvemos el 100% de tu apartado y nuestro equipo te ayuda a encontrar un reemplazo de categoría y precio similar. Consulta los detalles en nuestra página de Garantía.",
  },
  {
    q: "¿Qué significa el badge “Verificado”?",
    a: "Que el proveedor pasó por nuestro proceso de verificación de identidad, documentación y calidad de servicio. Los proveedores verificados aparecen primero en los resultados y puedes filtrar solo por ellos en el marketplace.",
  },
  {
    q: "¿Cómo sé si mi fecha está disponible?",
    a: "Cada servicio tiene un calendario interactivo en su vista rápida. Las fechas tachadas ya están apartadas por otros clientes. Si tu fecha está libre, puedes seleccionarla y apartarla en ese momento.",
  },
  {
    q: "Soy proveedor, ¿cómo ofrezco mis servicios?",
    a: "Publicar es gratis y sin mensualidades. La dinámica: el cliente aparta tu fecha pagando el 10% — de ese pago, el 5% es la comisión justa de Momentum por ayudarte a llenar tu agenda y el otro 5% es tu anticipo, para que tu fecha quede apartada con todo y pago. Después cobras el 90% restante directo al cliente: en total te quedas con el 95% de tu precio. Aplica desde la página de Proveedores.",
  },
];

export default function PreguntasFrecuentesPage() {
  return (
    <InfoPage
      kicker="Ayuda"
      title={<>Preguntas <em>frecuentes.</em></>}
      intro="Todo sobre el apartado del 10%, la cotización consolidada y cómo trabajar con proveedores verificados."
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-border px-6 md:px-10">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={faq.q} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base font-medium text-foreground">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </InfoPage>
  );
}
