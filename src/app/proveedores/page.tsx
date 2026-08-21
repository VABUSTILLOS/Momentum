import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, InfoCard } from "@/components/info-page";
import { VendorApplicationForm } from "@/components/vendor-application-form";

export const metadata: Metadata = {
  title: "Ofrece tus servicios | Momentum",
  description:
    "Publica tus servicios de eventos en Momentum gratis. Solo pagas cuando trabajas: el cliente aparta tu fecha con el 5% y tú recibes reservaciones confirmadas.",
};

export default function ProveedoresPage() {
  return (
    <InfoPage
      kicker="Para proveedores"
      title={<>Ofrece tus servicios en <em>Momentum.</em></>}
      intro="Únete al marketplace de eventos donde los clientes no solo preguntan: apartan. Publicar es gratis — solo trabajamos cuando tú trabajas."
    >
      {/* La dinámica */}
      <div className="rounded-2xl bg-foreground p-8 text-background md:p-12">
        <p className="text-xs uppercase tracking-[0.28em] opacity-70">La dinámica, sin letras chiquitas</p>
        <h2 className="mt-4 max-w-2xl font-serif text-3xl font-medium leading-tight md:text-4xl">
          El cliente aparta tu fecha con el 5%. Tú recibes reservaciones reales.
        </h2>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          <div>
            <p className="font-serif text-2xl opacity-60">01</p>
            <h3 className="mt-2 font-semibold">Publica gratis</h3>
            <p className="mt-2 text-sm leading-relaxed opacity-80">
              Crea tu perfil con fotos, paquetes, precios y calendario. Sin mensualidades, sin costo de alta, sin suscripciones.
            </p>
          </div>
          <div>
            <p className="font-serif text-2xl opacity-60">02</p>
            <h3 className="mt-2 font-semibold">Recibe apartados del 5%</h3>
            <p className="mt-2 text-sm leading-relaxed opacity-80">
              Cuando un cliente aparta tu fecha, paga el 5% del servicio a través de Momentum. Esa es nuestra comisión — y tu
              garantía de que la reservación es seria.
            </p>
          </div>
          <div>
            <p className="font-serif text-2xl opacity-60">03</p>
            <h3 className="mt-2 font-semibold">Cobra el 95% directo</h3>
            <p className="mt-2 text-sm leading-relaxed opacity-80">
              El resto del pago es tuyo al 100%: lo liquidas directamente con tu cliente, como siempre lo has hecho. Sin
              intermediarios en tu dinero.
            </p>
          </div>
        </div>
        <div className="mt-10 rounded-xl border border-background/20 p-5">
          <p className="text-sm leading-relaxed opacity-85">
            <strong className="font-semibold">Ejemplo real:</strong> tu paquete de DJ cuesta $18,500 MXN. El cliente aparta la
            fecha pagando $925 MXN (5%) en Momentum — esa es nuestra única comisión. Tú recibes la fecha confirmada en tu
            calendario y cobras los $17,575 restantes directo al cliente.
          </p>
        </div>
      </div>

      {/* Beneficios */}
      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <InfoCard title="Cero costo fijo">
          No pagas por publicar ni por aparecer. Si no hay apartados, no pagas nada. Nuestro único ingreso es el 5% del
          apartado cuando un cliente confirma tu fecha.
        </InfoCard>
        <InfoCard title="Clientes comprometidos">
          Un apartado pagado elimina los “solo estaba viendo”. Quien aparta contigo ya tomó una decisión y tiene fecha,
          presupuesto y evento real.
        </InfoCard>
        <InfoCard title="Calendario inteligente">
          Tus fechas apartadas se bloquean automáticamente en el marketplace. Adiós a los dobles bookings y a los
          mensajes de “¿todavía tienes disponible?”.
        </InfoCard>
        <InfoCard title="Sello Verificado">
          Los proveedores que completan nuestra verificación de identidad y calidad reciben el badge “Verificado” y
          aparecen primero en los resultados.
        </InfoCard>
      </div>

      {/* Cómo empezar */}
      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="font-serif text-3xl font-medium tracking-tight text-foreground md:text-4xl">
            Empieza en tres pasos.
          </h2>
          <ol className="mt-6 flex flex-col gap-5">
            {[
              { t: "Aplica con tu información", d: "Cuéntanos qué ofreces, tu ciudad y tu rango de precios. Revisamos cada aplicación en menos de 48 horas." },
              { t: "Verificación y perfil", d: "Validamos tu identidad y experiencia. Te ayudamos a armar un perfil con fotos y paquetes que convierten." },
              { t: "Recibe apartados", d: "Tu perfil entra al marketplace y empiezas a recibir fechas apartadas con el 5% pagado por adelantado." },
            ].map((step, i) => (
              <li key={step.t} className="flex gap-4">
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground font-serif text-sm text-background">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-foreground">{step.t}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.d}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-8 text-sm text-muted-foreground">
            ¿Dudas sobre la comisión? Lee <Link href="/como-funciona" className="font-medium text-foreground underline underline-offset-2">cómo funciona</Link> o
            consulta las <Link href="/preguntas-frecuentes" className="font-medium text-foreground underline underline-offset-2">preguntas frecuentes</Link>.
          </p>
        </div>
        <VendorApplicationForm />
      </div>
    </InfoPage>
  );
}
