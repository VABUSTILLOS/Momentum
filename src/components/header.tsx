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
    <header className={`fixed left-1/2 top-3 z-50 w-[calc(100%-1.5rem)] max-w-6xl -translate-x-1/2 transition-all duration-300 sm:top-4 sm:w-[90%] ${isScrolled || isMenuOpen ? "rounded-2xl bg-foreground/90 shadow-2xl backdrop-blur-md sm:rounded-full" : "bg-transparent"}`}>
      <div className="flex items-center justify-between px-4 py-3 sm:px-5">
        <span className="sr-only">Navegación principal</span>
        <Link href="#" className={`flex min-w-0 items-baseline gap-2 font-serif text-lg tracking-tight transition-colors sm:text-xl ${isScrolled || isMenuOpen ? "text-background" : "text-white"}`}>
          <span>Momentum</span> <span className="hidden truncate font-sans text-[10px] uppercase tracking-[0.18em] opacity-70 sm:inline">Todo para tu evento</span>
        </Link>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className={`inline-flex size-11 items-center justify-center rounded-full border transition-colors ${isScrolled || isMenuOpen ? "border-background/20 text-background hover:bg-background/10" : "border-white/30 text-white hover:bg-white/10"}`}
            aria-label={mounted && resolvedTheme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {mounted && resolvedTheme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
          </button>
          <Link href="#accessories" className={`hidden rounded-full px-5 py-2 text-sm font-medium transition-all md:block ${isScrolled ? "bg-background text-foreground hover:bg-background/90" : "bg-white text-foreground hover:bg-white/90"}`}>Explorar servicios</Link>
          <button type="button" onClick={() => setIsMenuOpen(!isMenuOpen)} className={`inline-flex size-11 items-center justify-center rounded-full md:hidden ${isScrolled || isMenuOpen ? "text-background" : "text-white"}`} aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"} aria-expanded={isMenuOpen}>
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        </div>
      </div>
      {isMenuOpen && <div className="rounded-b-2xl border-t border-background/15 bg-foreground px-4 py-5 md:hidden"><nav aria-label="Enlaces rápidos" className="flex flex-col gap-2"><Link href="#accessories" className="rounded-xl px-4 py-3 text-sm font-medium text-background hover:bg-background/10" onClick={() => setIsMenuOpen(false)}>Explorar servicios</Link><Link href="#technology" className="rounded-xl px-4 py-3 text-sm font-medium text-background hover:bg-background/10" onClick={() => setIsMenuOpen(false)}>Conoce Momentum</Link><Link href="#reserve" className="rounded-xl bg-background px-4 py-3 text-center text-sm font-medium text-foreground" onClick={() => setIsMenuOpen(false)}>Apartar fecha</Link></nav></div>}
    </header>
  );
}
