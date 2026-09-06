import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/lib/roles";

export class AuthError extends Error {
  constructor(
    public readonly status: 401 | 403,
    message: string
  ) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Exige que la petición actual esté autenticada como ADMIN (`master_admin`).
 *
 * Sigue la convención de auth de Momentum (Supabase SSR + `profiles.role`):
 * si no hay credenciales de Supabase configuradas (modo demo/mock) la guarda
 * se omite, igual que hace `src/middleware.ts`.
 *
 * Lanza AuthError(401) sin sesión y AuthError(403) si el rol no es admin.
 */
export async function requireAdmin(): Promise<void> {
  // Sin credenciales de Supabase no hay auth que aplicar (modo demo con datos mock).
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AuthError(401, "No autorizado");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (profile?.role ?? "proveedor") as AppRole;
  if (role !== "master_admin") {
    throw new AuthError(403, "Acceso restringido a administradores");
  }
}

/**
 * Convierte un AuthError en un NextResponse con la forma `{ error }` del repo;
 * relanza cualquier otra cosa.
 * Uso en route handlers:
 *   try { await requireAdmin(); } catch (err) { return authErrorResponse(err); }
 */
export function authErrorResponse(err: unknown): NextResponse {
  if (err instanceof AuthError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  throw err;
}
