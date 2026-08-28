"use client";

import { Suspense, useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn, type AuthFormState } from "@/lib/actions/auth";

const inputCls =
  "w-full rounded-full border border-border bg-background px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring";

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "";
  const registroPendiente = searchParams.get("registro") === "pendiente";

  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    signIn,
    { error: null },
  );

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
      <input type="hidden" name="next" value={next} />

      {registroPendiente && (
        <p className="rounded-2xl border border-border bg-muted px-5 py-3 text-sm text-foreground">
          Revisa tu correo para confirmar tu cuenta antes de iniciar sesión.
        </p>
      )}

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
          autoComplete="current-password"
          required
          placeholder="••••••••"
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
        {pending ? "Entrando…" : "Iniciar sesión"}
      </button>

      <p className="mt-2 text-center text-sm text-muted-foreground">
        ¿Aún no tienes cuenta?{" "}
        <Link href="/registro" className="font-medium text-foreground underline underline-offset-2">
          Regístrate como proveedor
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="mb-10 flex flex-col items-center gap-3 text-center">
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Momentum
        </span>
        <h1 className="font-serif text-4xl font-medium tracking-tight text-foreground">
          Bienvenido <em>de vuelta.</em>
        </h1>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          Accede a tu panel para gestionar tus reservas, paquetes y finanzas.
        </p>
      </div>
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
