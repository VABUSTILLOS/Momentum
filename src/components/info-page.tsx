"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { FooterSection } from "@/components/sections/footer-section";

export function InfoPage({
  kicker,
  title,
  intro,
  children,
}: {
  kicker: string;
  title: React.ReactNode;
  intro?: string;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  return (
    <main className="min-h-screen bg-background">
      <header className="fixed left-1/2 top-4 z-50 w-[90%] max-w-6xl -translate-x-1/2">
        <div className="flex items-center justify-between rounded-full bg-foreground px-5 py-3 shadow-lg">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex size-9 items-center justify-center rounded-full border border-background/20 text-background hover:bg-background/10"
              aria-label="Volver al inicio"
            >
              <ArrowLeft size={16} />
            </Link>
            <Link href="/" className="flex items-baseline gap-2 font-serif text-xl tracking-tight text-background">
              Momentum <span className="font-sans text-[10px] uppercase tracking-[0.18em] opacity-70">Todo para tu evento</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="inline-flex size-9 items-center justify-center rounded-full border border-background/20 text-background hover:bg-background/10"
              aria-label={mounted && resolvedTheme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {mounted && resolvedTheme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
            </button>
            <Link
              href="/marketplace"
              className="hidden rounded-full bg-background px-5 py-2 text-sm font-medium text-foreground hover:bg-background/90 sm:block"
            >
              Explorar servicios
            </Link>
          </div>
        </div>
      </header>

      <div className="px-6 pb-6 pt-32 md:px-12 md:pt-40 lg:px-20">
        <p className="animate-fade-in text-xs uppercase tracking-[0.28em] text-muted-foreground opacity-0" style={{ animationFillMode: "forwards" }}>
          {kicker}
        </p>
        <h1 className="mt-4 max-w-3xl animate-fade-in font-serif text-4xl font-medium leading-[1.02] tracking-tight text-foreground opacity-0 md:text-6xl" style={{ animationDelay: "100ms", animationFillMode: "forwards" }}>
          {title}
        </h1>
        {intro && (
          <p className="mt-6 max-w-2xl animate-fade-in leading-relaxed text-muted-foreground opacity-0" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
            {intro}
          </p>
        )}
      </div>

      <div className="px-6 py-10 md:px-12 lg:px-20">{children}</div>

      <FooterSection />
    </main>
  );
}

export function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border p-6 md:p-8">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <div className="mt-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </div>
  );
}
