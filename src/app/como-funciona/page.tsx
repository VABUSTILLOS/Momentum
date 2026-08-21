import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = {
  title: "Cómo funciona | Momentum",
  description:
    "Momentum es la forma segura de apartar a los proveedores de tu evento: explora, compara y reserva tu fecha pagando solo el 10% por adelantado.",
};

const steps = [
  {
    n: "01",
    t: "Explora y compara",
    d: "Navega el marketplace por categoría, precio, ubicación y rating. Cada proveedor muestra sus paquetes, qué incluye y su calendario de disponibilidad real: las fechas tachadas ya están apartadas.",
  },
  {
    n: "02",
    t: "Aparta tu fecha con el 10%",
    d: "Cuando encuentras al proveedor ideal, apartas la fecha pagando únicamente el 10% del precio del servicio a través de Momentum. Ese pago confirma la reservación y bloquea la fecha en el calendario del proveedor.",
  },
  {
    n: "03",
    t: "Consolida tu evento",
    d: "Agrega varios servicios a “Mi evento” — DJ, catering, foto, venue — y solicita una cotización consolidada en un solo paso. Nuestro equipo coordina contigo los detalles.",
  },
  {
    n: "04",
    t: "Liquida directo con cada proveedor",
    d: "El 90% restante lo pagas directamente a cada proveedor, en los tiempos que acuerden. Momentum no retiene tu dinero ni infla precios: del apartado del 10%, la mitad es nuestra comisión y la otra mitad es un anticipo que se descuenta de lo que le pagas al proveedor.",
  },
];

export default function ComoFuncionaPage() {
  return (
    <InfoPage
      kicker="Cómo funciona"
      title={<>Aparta a tus proveedores con <em>solo el 10%.</em></>}
      intro="Momentum nació para resolver el caos de organizar un evento: mensajes que nadie contesta, fechas que se “congelan” y se pierden, y precios que cambian cada semana. Aquí apartas en serio, pagando poco."
    >
      <div className="grid gap-6 md:grid-cols-2">
        {steps.map((step) => (
          <div key={step.n} className="rounded-2xl border border-border p-6 md:p-8">
            <p className="font-serif text-3xl text-muted-foreground">{step.n}</p>
            <h3 className="mt-3 text-lg font-semibold text-foreground">{step.t}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl bg-foreground p-8 text-background md:p-10">
        <h2 className="font-serif text-2xl font-medium md:text-3xl">¿Por qué solo el 10%?</h2>
        <div className="mt-4 grid gap-6 text-sm leading-relaxed opacity-85 md:grid-cols-2">
          <p>
            Porque apartar no debería costarte la mitad de tu presupuesto. El 10% es suficiente para confirmar tu
            compromiso y bloquear la fecha — y lo suficientemente accesible para que asegures a tus proveedores favoritos
            meses antes de tu evento.
          </p>
          <p>
            Y para los proveedores es igual de justo: reciben reservaciones pagadas y serias, no curiosos. Si quieres
            ofrecer tus servicios, conoce la dinámica completa en nuestra página para{" "}
            <Link href="/proveedores" className="font-medium underline underline-offset-2">proveedores</Link>.
          </p>
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border py-12 text-center">
        <p className="font-serif text-2xl font-medium text-foreground">¿Listo para apartar tu fecha?</p>
        <Link href="/marketplace" className="rounded-full bg-foreground px-8 py-3.5 text-sm font-medium text-background hover:opacity-90">
          Explorar el marketplace
        </Link>
      </div>
    </InfoPage>
  );
}
