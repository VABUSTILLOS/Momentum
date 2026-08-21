import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, InfoCard } from "@/components/info-page";

export const metadata: Metadata = {
  title: "Garantía Momentum | Apartado protegido",
  description:
    "Tu apartado del 5% está protegido: devolución total si el proveedor cancela y apoyo para encontrar un reemplazo.",
};

export default function GarantiaPage() {
  return (
    <InfoPage
      kicker="Garantía Momentum"
      title={<>Tu apartado, <em>protegido.</em></>}
      intro="Aparta con confianza: cada reservación del 5% está respaldada por nuestra garantía de fecha segura."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <InfoCard title="Devolución del 100%">
          Si el proveedor cancela tu fecha apartada, te devolvemos íntegro tu apartado del 5% en un máximo de 7 días
          hábiles, sin preguntas ni procesos complicados.
        </InfoCard>
        <InfoCard title="Reemplazo garantizado">
          Además de la devolución, nuestro equipo te ayuda a encontrar un proveedor de reemplazo de la misma categoría y
          rango de precio, con prioridad sobre la lista de espera.
        </InfoCard>
        <InfoCard title="Proveedores verificados">
          Cada proveedor con badge “Verificado” pasó por validación de identidad y calidad. La gran mayoría de nuestros
          apartados se llevan a cabo sin ningún contratiempo.
        </InfoCard>
      </div>

      <div className="mt-10 rounded-2xl border border-border p-6 md:p-10">
        <h2 className="font-serif text-2xl font-medium tracking-tight text-foreground md:text-3xl">Condiciones claras</h2>
        <ul className="mt-5 flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground">
          <li>· La garantía cubre apartados pagados a través de Momentum y confirmados en el calendario del proveedor.</li>
          <li>· Si tú cancelas, el apartado no es reembolsable — es lo que mantiene tu fecha bloqueada y compensa al proveedor por reservarla.</li>
          <li>· Cambios de fecha están sujetos a la disponibilidad del proveedor; te ayudamos a negociarlos sin costo.</li>
          <li>· El 95% restante se liquida directo con el proveedor bajo los términos que ustedes acuerden.</li>
        </ul>
        <p className="mt-6 text-sm text-muted-foreground">
          ¿Necesitas hacer válida tu garantía? Escríbenos desde la página de{" "}
          <Link href="/contacto" className="font-medium text-foreground underline underline-offset-2">contacto</Link>.
        </p>
      </div>
    </InfoPage>
  );
}
