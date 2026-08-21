import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, InfoCard } from "@/components/info-page";
import { VendorApplicationForm } from "@/components/vendor-application-form";

export const metadata: Metadata = {
  title: "Ofrece tus servicios | Momentum",
  description:
    "Publica tus servicios de eventos en Momentum gratis. Solo ganamos si tú ganas: el cliente aparta tu fecha con el 10% — el 5% es nuestra comisión justa y el 5% es tu anticipo.",
};

export default function ProveedoresPage() {
  return (
    <InfoPage
      kicker="Para proveedores"
      title={<>Ofrece tus servicios en <em>Momentum.</em></>}
      intro="Únete al marketplace de eventos donde los clientes no solo preguntan: apartan. Publicar es gratis y Momentum solo gana cuando te hace ganar a ti."
    >
      {/* La dinámica */}
      <div className="rounded-2xl bg-foreground p-8 text-background md:p-12">
        <p className="text-xs uppercase tracking-[0.28em] opacity-70">La dinámica, sin letras chiquitas</p>
        <h2 className="mt-4 max-w-2xl font-serif text-3xl font-medium leading-tight md:text-4xl">
          Momentum solo gana si te hace ganar a ti.
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed opacity-85">
          No cobramos mensualidades, ni por publicar, ni por aparecer en resultados. Nuestro único ingreso es la mitad
          del apartado que el cliente paga al reservar tu fecha: del 10% que paga, el 5% es la comisión justa de
          Momentum por haberte llenado la agenda, y el otro 5% es tuyo desde el primer momento, como anticipo. Si no
          te llenamos la agenda, no ganamos nada — así de simple.
        </p>
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
            <h3 className="mt-2 font-semibold">Recibe apartados del 10%</h3>
            <p className="mt-2 text-sm leading-relaxed opacity-80">
              Cuando un cliente aparta tu fecha, paga el 10% del servicio a través de Momentum. De ese pago, el 5% es
              nuestra comisión justa — que queda pagada en ese mismo momento, sin descuentos después — y el otro 5%
              es para ti: tu fecha queda apartada con todo y pago desde el día uno.
            </p>
          </div>
          <div>
            <p className="font-serif text-2xl opacity-60">03</p>
            <h3 className="mt-2 font-semibold">Cobra el 90% directo y atiende tu agenda</h3>
            <p className="mt-2 text-sm leading-relaxed opacity-80">
              Cobras el 90% restante directamente con tu cliente, como siempre lo has hecho. Sumando tu anticipo, te
              quedas con el 95% de tu precio. Tú solo te encargas de atender la agenda que te ayudamos a llenar.
            </p>
          </div>
        </div>
        <div className="mt-10 rounded-xl border border-background/20 p-5">
          <p className="text-sm leading-relaxed opacity-85">
            <strong className="font-semibold">Ejemplo real:</strong> tu paquete de DJ cuesta $18,500 MXN. El cliente
            aparta la fecha pagando $1,850 MXN (10%) en Momentum. De ese apartado, $925 MXN (5%) son la comisión justa
            de Momentum por haberte conseguido al cliente — pagada en ese instante, sin cobros después — y $925 MXN
            (5%) son tu anticipo. Luego cobras los $16,650 restantes directo al cliente: en total recibes $17,575 MXN,
            el 95% de tu precio, sin más descuentos.
          </p>
        </div>
      </div>

      {/* Beneficios */}
      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <InfoCard title="Cero costo fijo">
          No pagas por publicar ni por aparecer. Si no hay apartados, no pagas nada. Nuestro único ingreso es el 5%
          de comisión cuando un cliente confirma tu fecha.
        </InfoCard>
        <InfoCard title="Comisión pagada desde el inicio">
          En cuanto recibes un apartado, nuestra comisión del 5% ya está cubierta con la mitad de ese pago — y la otra
          mitad es tu anticipo. Nada de cobros sorpresa al final del mes ni porcentajes sobre tu evento.
        </InfoCard>
        <InfoCard title="Calendario inteligente">
          Tus fechas apartadas se bloquean automáticamente en el marketplace. Adiós a los dobles bookings y a los
          mensajes de “¿todavía tienes disponible?”.
        </InfoCard>
        <InfoCard title="Clientes comprometidos">
          Un apartado pagado elimina los “solo estaba viendo”. Quien aparta contigo ya tomó una decisión y tiene fecha,
          presupuesto y evento real.
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
              { t: "Verificación y perfil", d: "Validamos tu identidad y experiencia. Te ayudamos a armar un perfil con fotos y paquetes que convierten. Los verificados aparecen primero." },
              { t: "Recibe apartados y atiende tu agenda", d: "Tu perfil entra al marketplace y empiezas a recibir fechas apartadas con el 10% pagado por adelantado. Tú solo atiendes los eventos." },
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
