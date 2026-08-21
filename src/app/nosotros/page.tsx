import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = {
  title: "Nuestra historia | Momentum",
  description: "Conoce al equipo detrás de Momentum, el marketplace para apartar proveedores de eventos en México.",
};

export default function NosotrosPage() {
  return (
    <InfoPage
      kicker="Nosotros"
      title={<>Nacimos de una boda <em>que casi no pasa.</em></>}
      intro="Momentum empezó como tantas ideas: en medio de una crisis."
    >
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="text-sm leading-relaxed text-muted-foreground">
          <p>
            En 2024, nuestro fundador organizaba su boda. Después de semanas de mensajes sin respuesta, el DJ que “le
            había guardado la fecha” firmó con otro evento. No había contrato, no había anticipo claro, no había nada.
            Ahí entendimos el problema real de los eventos en México: <strong className="font-medium text-foreground">apartar
            un proveedor dependía de la palabra, no de un sistema.</strong>
          </p>
          <p className="mt-4">
            Momentum es ese sistema. Un marketplace donde cada proveedor tiene calendario público de disponibilidad,
            precios transparentes y donde la fecha queda verdaderamente apartada con un pago del 10% — suficiente para
            confirmar el compromiso de ambas partes, sin inmovilizar el presupuesto de nadie.
          </p>
          <p className="mt-4">
            Hoy trabajamos con proveedores verificados en CDMX, Guadalajara, Monterrey, Puebla y Querétaro, en diez
            categorías: desde música y catering hasta vestidos de novia y limosinas. Y seguimos creciendo con cada evento
            que sí pasa.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl bg-foreground p-8 text-background">
            <p className="font-serif text-5xl font-medium">10%</p>
            <p className="mt-2 text-sm opacity-80">Lo único que pagas para apartar tu fecha. El resto, directo con tu proveedor.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border p-6">
              <p className="font-serif text-3xl font-medium text-foreground">10</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">Categorías de servicios</p>
            </div>
            <div className="rounded-2xl border border-border p-6">
              <p className="font-serif text-3xl font-medium text-foreground">48 h</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">Verificación de proveedores</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 rounded-2xl border border-border p-8 md:p-10">
        <h2 className="font-serif text-2xl font-medium tracking-tight text-foreground md:text-3xl">Trabaja con nosotros</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Buscamos gente obsesionada con que los eventos salgan bien: operaciones, verificación de proveedores, diseño y
          tecnología. Y si eres proveedor de eventos, únete al marketplace — publicar es gratis y solo compartimos el 10%
          cuando un cliente aparta tu fecha.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/proveedores" className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:opacity-90">
            Soy proveedor
          </Link>
          <Link href="/contacto" className="rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-secondary">
            Escríbenos
          </Link>
        </div>
      </div>
    </InfoPage>
  );
}
