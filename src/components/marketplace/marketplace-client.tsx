"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  ListFilter,
  MapPin,
  Moon,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Star,
  Sun,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { FadeImage } from "@/components/fade-image";
import { Calendar } from "@/components/ui/calendar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useEvent } from "@/lib/event-context";
import {
  CATEGORIES,
  PRICE_RANGES,
  VENDORS,
  formatMXN,
  type Vendor,
  type VendorCategory,
} from "@/lib/marketplace-data";
import { cn } from "@/lib/utils";

type SortId = "popular" | "price-asc" | "price-desc" | "rating";

const SORTS: { id: SortId; label: string }[] = [
  { id: "popular", label: "Más populares" },
  { id: "price-asc", label: "Precio: menor a mayor" },
  { id: "price-desc", label: "Precio: mayor a menor" },
  { id: "rating", label: "Mejor valorados" },
];

const APARTADO_PCT = 0.10;
const apartadoDe = (v: number) => Math.round(v * APARTADO_PCT);

/* ---------------------------------- Header --------------------------------- */

function MarketplaceHeader({ cartCount }: { cartCount: number }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed left-1/2 top-4 z-50 w-[90%] max-w-6xl -translate-x-1/2">
      <div
        className={cn(
          "flex items-center justify-between rounded-full px-5 py-3 transition-all duration-300",
          isScrolled ? "bg-foreground/85 shadow-2xl backdrop-blur-md" : "bg-foreground shadow-lg"
        )}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex size-9 items-center justify-center rounded-full border border-background/20 text-background hover:bg-background/10"
            aria-label="Volver al inicio"
          >
            <ArrowLeft size={16} />
          </Link>
          <Link href="/" className="flex items-baseline gap-2 font-serif text-xl tracking-tight text-background">
            Momentum <span className="font-sans text-[10px] uppercase tracking-[0.18em] opacity-70">Marketplace</span>
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
            href="/mi-evento"
            className="relative inline-flex items-center gap-2 rounded-full bg-background px-5 py-2 text-sm font-medium text-foreground hover:bg-background/90"
          >
            <ShoppingBag size={16} />
            <span className="hidden sm:inline">Mi evento</span>
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex size-5 items-center justify-center rounded-full bg-foreground text-[10px] font-semibold text-background ring-2 ring-background">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------ Filter section ----------------------------- */

function FilterGroup({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border py-5 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-foreground"
      >
        {title}
        <ChevronDown size={14} className={cn("text-muted-foreground transition-transform duration-300", open && "rotate-180")} />
      </button>
      <div className={cn("grid transition-all duration-300", open ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
        <div className="overflow-hidden">
          <div className="flex flex-col gap-2.5">{children}</div>
        </div>
      </div>
    </div>
  );
}

function CheckRow({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: () => void; hint?: string }) {
  return (
    <button type="button" onClick={onChange} className="group flex items-center gap-3 text-left">
      <span
        className={cn(
          "inline-flex size-4.5 shrink-0 items-center justify-center rounded-full border transition-colors",
          checked ? "border-foreground bg-foreground text-background" : "border-border bg-background group-hover:border-foreground/40"
        )}
      >
        {checked && <Check size={11} strokeWidth={3} />}
      </span>
      <span className="text-sm text-foreground">{label}</span>
      {hint && <span className="ml-auto text-xs text-muted-foreground">{hint}</span>}
    </button>
  );
}

/* -------------------------------- Vendor card ------------------------------ */

function VendorCard({ vendor, onOpen, index }: { vendor: Vendor; onOpen: () => void; index: number }) {
  return (
    <article
      className="group animate-fade-in cursor-pointer opacity-0"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms`, animationFillMode: "forwards" }}
      onClick={onOpen}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-secondary">
        <FadeImage
          src={vendor.images[0]}
          alt={vendor.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {vendor.verified && (
            <span className="rounded-full bg-background/85 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-foreground backdrop-blur">
              Verificado
            </span>
          )}
          {vendor.fechas2026 && (
            <span className="rounded-full bg-foreground/85 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-background backdrop-blur">
              Fechas 2026
            </span>
          )}
        </div>
        <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-background/85 px-3 py-1.5 text-[11px] font-medium text-foreground backdrop-blur">
          <MapPin size={12} /> {vendor.location}
        </span>
      </div>
      <div className="py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{vendor.categoryLabel}</p>
            <h3 className="text-lg font-medium leading-snug text-foreground group-hover:underline group-hover:underline-offset-4">
              {vendor.name}
            </h3>
            <div className="mt-2 flex items-center gap-1.5 text-sm text-foreground">
              <Star size={14} className="fill-foreground" />
              <span className="font-medium">{vendor.rating.toFixed(1)}</span>
              <span className="text-muted-foreground">({vendor.reviews} reseñas)</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">desde</p>
            <p className="text-base font-medium text-foreground">{formatMXN(vendor.basePrice)}</p>
            <p className="text-xs text-muted-foreground">{vendor.priceUnit}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ------------------------------- Quick view -------------------------------- */

function QuickView({
  vendor,
  open,
  onClose,
  onAdd,
}: {
  vendor: Vendor | null;
  open: boolean;
  onClose: () => void;
  onAdd: (vendor: Vendor, date?: Date) => void;
}) {
  const [activeImage, setActiveImage] = useState(0);
  const [date, setDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (open) {
      setActiveImage(0);
      setDate(undefined);
    }
  }, [open, vendor?.id]);

  const booked = useMemo(
    () => (vendor ? vendor.bookedDates.map((d) => new Date(`${d}T12:00:00`)) : []),
    [vendor]
  );

  if (!vendor) return <Sheet open={open} onOpenChange={(o) => !o && onClose()} />;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto bg-background p-0 sm:max-w-xl">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-secondary">
          <FadeImage src={vendor.images[activeImage]} alt={vendor.name} fill className="object-cover" />
          <div className="absolute left-4 top-4 flex gap-2">
            {vendor.verified && (
              <span className="rounded-full bg-background/85 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-foreground backdrop-blur">
                Verificado
              </span>
            )}
            {vendor.fechas2026 && (
              <span className="rounded-full bg-foreground/85 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-background backdrop-blur">
                Fechas 2026
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-3 px-6 pt-4">
          {vendor.images.map((img, i) => (
            <button
              key={img}
              type="button"
              onClick={() => setActiveImage(i)}
              className={cn(
                "relative h-16 w-20 overflow-hidden rounded-xl bg-secondary transition-opacity",
                i === activeImage ? "ring-2 ring-foreground" : "opacity-60 hover:opacity-100"
              )}
            >
              <FadeImage src={img} alt={`${vendor.name} ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>

        <div className="px-6 py-6">
          <SheetHeader className="p-0 text-left">
            <p className="mb-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{vendor.categoryLabel}</p>
            <SheetTitle className="font-serif text-3xl font-medium tracking-tight text-foreground">{vendor.name}</SheetTitle>
          </SheetHeader>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
            <span className="inline-flex items-center gap-1.5 text-foreground">
              <Star size={14} className="fill-foreground" />
              <span className="font-medium">{vendor.rating.toFixed(1)}</span>
              <span className="text-muted-foreground">({vendor.reviews} reseñas)</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <MapPin size={14} /> {vendor.location}
            </span>
          </div>
          <p className="mt-4 leading-relaxed text-muted-foreground">{vendor.tagline}</p>

          <div className="mt-6 rounded-2xl border border-border p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">El paquete incluye</p>
            <ul className="mt-3 flex flex-col gap-2.5">
              {vendor.includes.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-foreground">
                  <Check size={15} className="mt-0.5 shrink-0" /> {item}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
              <span className="text-sm text-muted-foreground">Desde</span>
              <span className="text-xl font-medium text-foreground">
                {formatMXN(vendor.basePrice)} <span className="text-sm font-normal text-muted-foreground">{vendor.priceUnit}</span>
              </span>
            </div>
            <div className="mt-3 rounded-xl bg-secondary px-4 py-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">Aparta tu fecha con solo 10%</span>
                <span className="text-base font-semibold text-foreground">{formatMXN(apartadoDe(vendor.basePrice))}</span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                Momentum aparta al proveedor por ti. El resto lo liquidas directo con el proveedor antes de tu evento.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
              <CalendarDays size={14} /> Verifica disponibilidad
            </p>
            <div className="mt-3 flex justify-center rounded-2xl border border-border">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={[{ before: new Date() }, ...booked]}
                modifiers={{ booked }}
                modifiersClassNames={{ booked: "line-through opacity-40" }}
              />
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              {date
                ? `Disponible el ${date.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}`
                : "Las fechas tachadas ya están apartadas."}
            </p>
          </div>

          <div className="sticky bottom-0 -mx-6 mt-8 flex gap-3 border-t border-border bg-background px-6 py-4">
            <button
              type="button"
              onClick={() => onAdd(vendor, date)}
              className="flex-1 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background hover:opacity-90"
            >
              {date ? "Apartar Fecha" : "Solicitar Cotización"}
            </button>
            <button
              type="button"
              onClick={() => onAdd(vendor, undefined)}
              className="rounded-full border border-border px-5 py-3 text-sm font-medium text-foreground hover:bg-secondary"
            >
              Agregar a mi Evento
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ------------------------------- Marketplace ------------------------------- */

function MarketplaceInner() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") as VendorCategory | null;
  const { items: cart, addItem } = useEvent();

  const [query, setQuery] = useState("");
  const [activeCategories, setActiveCategories] = useState<VendorCategory[]>(
    initialCategory && CATEGORIES.some((c) => c.slug === initialCategory) ? [initialCategory] : []
  );
  const [activePrices, setActivePrices] = useState<string[]>([]);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [only2026, setOnly2026] = useState(false);
  const [sort, setSort] = useState<SortId>("popular");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [quickView, setQuickView] = useState<Vendor | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const toggle = <T,>(list: T[], value: T) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const filtered = useMemo(() => {
    let list = VENDORS.filter((v) => {
      if (activeCategories.length > 0 && !activeCategories.includes(v.category)) return false;
      if (onlyVerified && !v.verified) return false;
      if (only2026 && !v.fechas2026) return false;
      if (activePrices.length > 0) {
        const match = PRICE_RANGES.some(
          (r) => activePrices.includes(r.id) && v.basePrice >= r.min && v.basePrice < r.max
        );
        if (!match) return false;
      }
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        const haystack = `${v.name} ${v.categoryLabel} ${v.location} ${v.tagline}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
    switch (sort) {
      case "price-asc":
        list = [...list].sort((a, b) => a.basePrice - b.basePrice);
        break;
      case "price-desc":
        list = [...list].sort((a, b) => b.basePrice - a.basePrice);
        break;
      case "rating":
        list = [...list].sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
        break;
      default:
        list = [...list].sort((a, b) => b.popularity - a.popularity);
    }
    return list;
  }, [activeCategories, activePrices, onlyVerified, only2026, query, sort]);

  const activeFilterCount =
    activeCategories.length + activePrices.length + (onlyVerified ? 1 : 0) + (only2026 ? 1 : 0);

  const clearFilters = () => {
    setActiveCategories([]);
    setActivePrices([]);
    setOnlyVerified(false);
    setOnly2026(false);
    setQuery("");
  };

  const addToCart = (vendor: Vendor, date?: Date) => {
    addItem(vendor, date);
    setQuickViewOpen(false);
    setToast(date ? "Fecha apartada en tu evento" : "Servicio agregado a tu evento");
  };

  const filtersUI = (
    <>
      <FilterGroup title="Categorías">
        {CATEGORIES.map((cat) => (
          <CheckRow
            key={cat.slug}
            label={cat.label}
            hint={String(VENDORS.filter((v) => v.category === cat.slug).length)}
            checked={activeCategories.includes(cat.slug)}
            onChange={() => setActiveCategories((prev) => toggle(prev, cat.slug))}
          />
        ))}
      </FilterGroup>
      <FilterGroup title="Precio (MXN)">
        {PRICE_RANGES.map((range) => (
          <CheckRow
            key={range.id}
            label={range.label}
            checked={activePrices.includes(range.id)}
            onChange={() => setActivePrices((prev) => toggle(prev, range.id))}
          />
        ))}
      </FilterGroup>
      <FilterGroup title="Proveedores">
        <CheckRow label="Verificado" checked={onlyVerified} onChange={() => setOnlyVerified((v) => !v)} />
        <CheckRow label="Fechas 2026" checked={only2026} onChange={() => setOnly2026((v) => !v)} />
      </FilterGroup>
    </>
  );

  return (
    <main className="min-h-screen bg-background">
      <MarketplaceHeader cartCount={cart.length} />

      {/* Page intro */}
      <div className="px-6 pb-10 pt-32 md:px-12 md:pt-40 lg:px-20">
        <p className="animate-fade-in text-xs uppercase tracking-[0.28em] text-muted-foreground opacity-0" style={{ animationFillMode: "forwards" }}>
          Marketplace
        </p>
        <h1 className="mt-4 max-w-3xl animate-fade-in font-serif text-5xl font-medium leading-[0.95] tracking-tight text-foreground opacity-0 md:text-7xl" style={{ animationDelay: "100ms", animationFillMode: "forwards" }}>
          Todo para tu evento, <em>un solo carrito.</em>
        </h1>
        <p className="mt-6 max-w-xl animate-fade-in leading-relaxed text-muted-foreground opacity-0" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
          Explora proveedores verificados, verifica disponibilidad en el calendario y cotiza música, catering, fotografía y más en un solo paso.
        </p>
      </div>

      {/* Cómo funciona — modelo de apartado 10% */}
      <div className="border-t border-border bg-secondary/50 px-6 py-10 md:px-12 lg:px-20">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { n: "01", t: "Explora y compara", d: "Proveedores verificados con precios transparentes, reseñas reales y disponibilidad en calendario." },
            { n: "02", t: "Aparta con solo 10%", d: "Tu fecha queda reservada pagando únicamente el 10% del servicio a través de Momentum. Sin sorpresas." },
            { n: "03", t: "Liquida directo", d: "El 90% restante lo pagas directamente a cada proveedor antes de tu evento. Momentum te acompaña todo el camino." },
          ].map((step, i) => (
            <div key={step.n} className="animate-fade-in opacity-0" style={{ animationDelay: `${i * 120}ms`, animationFillMode: "forwards" }}>
              <p className="font-serif text-3xl text-muted-foreground">{step.n}</p>
              <h3 className="mt-2 text-base font-semibold text-foreground">{step.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.d}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Momentum es la forma segura de apartar a los proveedores de tu evento
        </p>
      </div>

      {/* Sticky search / sort bar */}
      <div className="sticky top-0 z-40 border-y border-border bg-background/90 backdrop-blur-md">
        <div className="flex items-center gap-3 px-6 py-3.5 md:px-12 lg:px-20">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary lg:hidden"
          >
            <SlidersHorizontal size={15} />
            Filtros
            {activeFilterCount > 0 && (
              <span className="inline-flex size-5 items-center justify-center rounded-full bg-foreground text-[10px] font-semibold text-background">
                {activeFilterCount}
              </span>
            )}
          </button>
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busca DJ, banquete, jardín, foto…"
              className="w-full rounded-full border border-border bg-input px-11 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Limpiar búsqueda"
              >
                <X size={15} />
              </button>
            )}
          </div>
          <div className="relative shrink-0">
            <ListFilter size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortId)}
              className="appearance-none rounded-full border border-border bg-background py-2.5 pl-10 pr-8 text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              aria-label="Ordenar resultados"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Mobile quick category chips */}
      <div className="flex gap-2 overflow-x-auto px-6 pt-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:hidden">
        <button
          type="button"
          onClick={() => setActiveCategories([])}
          className={cn(
            "shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition-colors",
            activeCategories.length === 0 ? "border-foreground bg-foreground text-background" : "border-border text-foreground"
          )}
        >
          Todas
        </button>
        {CATEGORIES.map((cat) => {
          const active = activeCategories.includes(cat.slug);
          return (
            <button
              key={cat.slug}
              type="button"
              onClick={() => setActiveCategories((prev) => (active ? prev.filter((c) => c !== cat.slug) : [cat.slug]))}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition-colors",
                active ? "border-foreground bg-foreground text-background" : "border-border text-foreground"
              )}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      <div className="flex gap-10 px-6 py-6 md:px-12 lg:px-20 lg:py-10">
        {/* Sidebar filters (desktop) */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-24">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">Filtros</p>
              {activeFilterCount > 0 && (
                <button type="button" onClick={clearFilters} className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground">
                  Limpiar ({activeFilterCount})
                </button>
              )}
            </div>
            {filtersUI}
          </div>
        </aside>

        {/* Grid */}
        <section className="min-w-0 flex-1">
          <p className="mb-6 text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "servicio" : "servicios"}
            {activeCategories.length === 1 && ` en ${CATEGORIES.find((c) => c.slug === activeCategories[0])?.label}`}
          </p>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-24 text-center">
              <Search size={28} className="text-muted-foreground" />
              <p className="mt-4 font-serif text-2xl font-medium text-foreground">Sin resultados por ahora.</p>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Prueba con otra palabra clave o quita algunos filtros para ver más proveedores.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:opacity-90"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((vendor, i) => (
                <VendorCard
                  key={vendor.id}
                  vendor={vendor}
                  index={i}
                  onOpen={() => {
                    setQuickView(vendor);
                    setQuickViewOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Mobile filters sheet */}
      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetContent side="left" className="w-full overflow-y-auto bg-background sm:max-w-sm">
          <SheetHeader className="text-left">
            <SheetTitle className="font-serif text-2xl font-medium tracking-tight text-foreground">Filtros</SheetTitle>
          </SheetHeader>
          <div className="mt-2">{filtersUI}</div>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={clearFilters}
              className="flex-1 rounded-full border border-border px-5 py-3 text-sm font-medium text-foreground hover:bg-secondary"
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="flex-1 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background hover:opacity-90"
            >
              Ver {filtered.length} resultados
            </button>
          </div>
        </SheetContent>
      </Sheet>

      <QuickView vendor={quickView} open={quickViewOpen} onClose={() => setQuickViewOpen(false)} onAdd={addToCart} />

      {/* Mobile sticky cart bar */}
      {cart.length > 0 && (
        <div className="fixed inset-x-4 bottom-4 z-50 md:hidden">
          <Link
            href="/mi-evento"
            className="flex w-full items-center justify-between rounded-full bg-foreground px-5 py-4 text-background shadow-2xl"
          >
            <span className="flex items-center gap-2.5 text-sm font-medium">
              <ShoppingBag size={17} />
              {cart.length} {cart.length === 1 ? "servicio" : "servicios"}
            </span>
            <span className="text-right">
              <span className="block text-[10px] uppercase tracking-wider opacity-70">Aparta con 10%</span>
              <span className="block text-sm font-semibold">
                {formatMXN(apartadoDe(cart.reduce((sum, i) => sum + i.vendor.basePrice, 0)))}
              </span>
            </span>
          </Link>
        </div>
      )}

      {/* Toast */}
      <div
        className={cn(
          "fixed bottom-24 left-1/2 z-[60] md:bottom-6 -translate-x-1/2 transition-all duration-300",
          toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        )}
      >
        <Link
          href="/mi-evento"
          onClick={() => setToast(null)}
          className="flex items-center gap-2.5 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background shadow-2xl"
        >
          <Check size={15} /> {toast} <span className="underline underline-offset-2">Ver mi evento</span>
        </Link>
      </div>
    </main>
  );
}

export function MarketplaceClient() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-background" />}>
      <MarketplaceInner />
    </Suspense>
  );
}
