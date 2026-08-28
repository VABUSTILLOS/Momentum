import { redirect } from "next/navigation";
import { LogOut, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
import { ROLE_LABELS, type AppRole } from "@/lib/roles";

interface ProfileRow {
  id: string;
  role: AppRole;
  full_name: string;
  company_name: string | null;
  created_at: string;
}

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, role, full_name, company_name, created_at")
    .order("created_at", { ascending: false });

  const rows = (profiles ?? []) as ProfileRow[];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-10 px-6 py-16">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-3">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <ShieldCheck size={14} aria-hidden="true" />
            Master Admin
          </span>
          <h1 className="font-serif text-4xl font-medium tracking-tight text-foreground">
            Panel de <em>administración.</em>
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Gestiona los usuarios y proveedores registrados en Momentum.
          </p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            <LogOut size={14} aria-hidden="true" />
            Cerrar sesión
          </button>
        </form>
      </header>

      <section className="overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium">Nombre</th>
              <th className="px-5 py-3 font-medium">Empresa</th>
              <th className="px-5 py-3 font-medium">Rol</th>
              <th className="px-5 py-3 font-medium">Registro</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">
                  Aún no hay usuarios registrados.
                </td>
              </tr>
            )}
            {rows.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3 font-medium text-foreground">{p.full_name || "—"}</td>
                <td className="px-5 py-3 text-muted-foreground">{p.company_name ?? "—"}</td>
                <td className="px-5 py-3">
                  <span
                    className={
                      p.role === "master_admin"
                        ? "rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background"
                        : "rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground"
                    }
                  >
                    {ROLE_LABELS[p.role]}
                  </span>
                </td>
                <td className="px-5 py-3 text-muted-foreground">
                  {new Date(p.created_at).toLocaleDateString("es-MX")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
