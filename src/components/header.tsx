"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed left-1/2 top-4 z-50 w-[90%] max-w-6xl -translate-x-1/2 transition-all duration-300 ${isScrolled ? "rounded-full bg-foreground/85 shadow-2xl backdrop-blur-md" : "bg-transparent"}`}>
      <div className="flex items-center justify-between px-5 py-3">
        <span className="sr-only">Navegación principal</span>
        <Link href="/" className={`flex items-baseline gap-2 font-serif text-xl tracking-tight transition-colors ${isScrolled ? "text-background" : "text-white"}`}>
          Momentum <span className="font-sans text-[10px] uppercase tracking-[0.18em] opacity-70">Todo para tu evento</span>
        </Link>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className={`inline-flex size-9 items-center justify-center rounded-full border transition-colors ${isScrolled ? "border-background/20 text-background hover:bg-background/10" : "border-white/30 text-white hover:bg-white/10"}`}
            aria-label={mounted && resolvedTheme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {mounted && resolvedTheme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
          </button>
          <Link href="/marketplace" className={`hidden rounded-full px-5 py-2 text-sm font-medium transition-all md:block ${isScrolled ? "bg-background text-foreground hover:bg-background/90" : "bg-white text-foreground hover:bg-white/90"}`}>Explorar servicios</Link>
          <button type="button" onClick={() => setIsMenuOpen(!isMenuOpen)} className={`md:hidden ${isScrolled ? "text-background" : "text-white"}`} aria-label="Abrir menú">
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        </div>
      </div>
      {isMenuOpen && <div className="rounded-b-2xl border-t border-border bg-background px-6 py-7 md:hidden"><nav className="flex flex-col gap-5"><Link href="/marketplace" className="rounded-full border border-border px-5 py-3 text-center text-sm font-medium text-foreground" onClick={() => setIsMenuOpen(false)}>Explorar servicios</Link><Link href="/marketplace" className="rounded-full bg-foreground px-5 py-3 text-center text-sm font-medium text-background" onClick={() => setIsMenuOpen(false)}>Apartar fecha</Link></nav></div>}
    </header>
  );
}
