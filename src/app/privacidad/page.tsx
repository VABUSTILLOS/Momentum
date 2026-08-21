import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = {
  title: "Aviso de privacidad | Momentum",
  description: "Cómo Momentum recopila, usa y protege tus datos personales.",
};

const sections = [
  {
    t: "1. Datos que recopilamos",
    c: "Recopilamos los datos que nos proporcionas directamente: nombre, correo electrónico, teléfono y detalles de tu evento al solicitar una cotización o apartar una fecha. Para proveedores, además recopilamos información del negocio, documentación de verificación y calendario de disponibilidad.",
  },
  {
    t: "2. Para qué los usamos",
    c: "Usamos tus datos para procesar apartados del 10%, generar cotizaciones consolidadas, poner en contacto a clientes con proveedores, verificar proveedores, atender garantías y — si lo aceptas — enviarte novedades del marketplace. No vendemos tus datos a terceros.",
  },
  {
    t: "3. Con quién los compartimos",
    c: "Cuando apartas un servicio, compartimos con el proveedor únicamente los datos necesarios para confirmar tu reservación (nombre, contacto, fecha y servicio). Los pagos del 10% se procesan a través de pasarelas de pago certificadas; Momentum no almacena datos completos de tarjetas.",
  },
  {
    t: "4. Conservación y seguridad",
    c: "Conservamos tus datos mientras tengas una relación activa con Momentum y aplicamos medidas técnicas y organizativas razonables para protegerlos contra acceso no autorizado, pérdida o alteración.",
  },
  {
    t: "5. Tus derechos (ARCO)",
    c: "Puedes ejercer tus derechos de acceso, rectificación, cancelación y oposición, así como revocar tu consentimiento, escribiéndonos desde la página de contacto. Respondemos en un máximo de 20 días hábiles conforme a la legislación mexicana aplicable.",
  },
];

export default function PrivacidadPage() {
  return (
    <InfoPage
      kicker="Legal"
      title={<>Aviso de <em>privacidad.</em></>}
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
