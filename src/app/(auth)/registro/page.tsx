"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp, type AuthFormState } from "@/lib/actions/auth";

const inputCls =
  "w-full rounded-full border border-border bg-background px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring";

export default function RegistroPage() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    signUp,
    { error: null },
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="mb-10 flex flex-col items-center gap-3 text-center">
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Momentum para proveedores
        </span>
        <h1 className="font-serif text-4xl font-medium tracking-tight text-foreground">
          Crea tu <em>cuenta.</em>
        </h1>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          Regístrate para publicar tus servicios, recibir reservas y cobrar anticipos.
        </p>
      </div>

      <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="fullName" className="text-sm font-medium text-foreground">
            Nombre completo
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            required
            placeholder="Ana Martínez"
            className={inputCls}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="companyName" className="text-sm font-medium text-foreground">
            Nombre de tu empresa o servicio
          </label>
          <input
            id="companyName"
            name="companyName"
            type="text"
            autoComplete="organization"
            required
            placeholder="Pastelería Maison"
            className={inputCls}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="phone" className="text-sm font-medium text-foreground">
            Teléfono <span className="text-muted-foreground">(opcional)</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="55 1234 5678"
            className={inputCls}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="tu@correo.com"
            className={inputCls}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="Mínimo 8 caracteres"
            className={inputCls}
          />
        </div>

        {state.error && (
          <p className="text-sm text-destructive" role="alert">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 w-full rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Creando cuenta…" : "Crear cuenta de proveedor"}
        </button>

        <p className="mt-2 text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium text-foreground underline underline-offset-2">
            Inicia sesión
          </Link>
        </p>
      </form>
    </main>
  );
}
