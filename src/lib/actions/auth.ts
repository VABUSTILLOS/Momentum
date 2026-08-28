"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/lib/roles";

export type AuthFormState = { error: string | null };

const signInSchema = z.object({
  email: z.string().email("Ingresa un correo válido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
  next: z.string().optional(),
});

const signUpSchema = z.object({
  fullName: z.string().min(2, "Ingresa tu nombre completo"),
  companyName: z.string().min(2, "Ingresa el nombre de tu empresa"),
  phone: z.string().optional(),
  email: z.string().email("Ingresa un correo válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

async function redirectByRole(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  next?: string,
): Promise<never> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  const role = (profile?.role ?? "proveedor") as AppRole;
  const home = role === "master_admin" ? "/admin" : "/panel-proveedor";

  redirect(next && next.startsWith("/") ? next : home);
}

export async function signIn(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: "Correo o contraseña incorrectos" };
  }

  return redirectByRole(supabase, data.user.id, parsed.data.next);
}

export async function signUp(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    companyName: formData.get("companyName"),
    phone: formData.get("phone") || undefined,
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        company_name: parsed.data.companyName,
        phone: parsed.data.phone ?? null,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.session) {
    // Confirmación de correo activada: el usuario debe verificar su email.
    redirect("/login?registro=pendiente");
  }

  return redirectByRole(supabase, data.user!.id);
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
