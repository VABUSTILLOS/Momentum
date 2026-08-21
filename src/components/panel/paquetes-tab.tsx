"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Clock, MapPin, Plus, Save, Star, Trash2, Users, X } from "lucide-react";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";
import { CATEGORIES, formatMXN } from "@/lib/marketplace-data";
import { cn } from "@/lib/utils";
import {
  apartadoDe,
  anticipoDe,
  comisionDe,
  saldoDe,
  INITIAL_PACKAGES,
  PROVIDER,
  type ProviderPackage,
} from "@/lib/panel-data";
import { EASE, Eyebrow, PanelCard } from "./shared";

const CATEGORY_EMOJI: Record<string, string> = {
  musica: "🎵",
  catering: "🍽️",
  fotografia: "📸",
  venues: "🏰",
  decoracion: "💐",
  "mesa-de-dulces": "🍬",
  pasteleria: "🎂",
  "vestidos-novia": "👗",
  "trajes-tuxedos": "🤵",
  "autos-limosinas": "🚗",
};

/* ------ Sliders adaptados a cada categoría: qué se mide y en qué rango ------ */

type SliderField = "basePrice" | "maxGuests" | "hours";

interface CategorySlider {
  field: SliderField;
  label: string;
  min: number;
  max: number;
  step: number;
  display: (v: number) => string;
}

const price = (label: string, min: number, max: number, step: number): CategorySlider => ({
  field: "basePrice",
  label,
  min,
  max,
  step,
  display: formatMXN,
});

const CATEGORY_SLIDERS: Record<string, CategorySlider[]> = {
  pasteleria: [
    price("Precio base del paquete", 3000, 60000, 500),
    { field: "maxGuests", label: "Porciones incluidas", min: 20, max: 500, step: 10, display: (v) => `${v} porciones` },
    { field: "hours", label: "Horas de montaje y servicio", min: 1, max: 8, step: 1, display: (v) => `${v} h de montaje` },
  ],
  "mesa-de-dulces": [
    price("Precio base del paquete", 2500, 40000, 500),
    { field: "maxGuests", label: "Bocados por invitado", min: 20, max: 500, step: 10, display: (v) => `para ${v} invitados` },
    { field: "hours", label: "Horas de exhibición", min: 2, max: 10, step: 1, display: (v) => `${v} h de exhibición` },
  ],
  catering: [
    price("Precio base del banquete", 10000, 150000, 1000),
    { field: "maxGuests", label: "Platillos (invitados)", min: 20, max: 600, step: 10, display: (v) => `${v} platillos` },
    { field: "hours", label: "Horas de servicio", min: 2, max: 12, step: 1, display: (v) => `${v} h de servicio` },
  ],
  musica: [
    price("Precio base de la presentación", 5000, 80000, 500),
    { field: "maxGuests", label: "Músicos en vivo", min: 1, max: 20, step: 1, display: (v) => `${v} músicos` },
    { field: "hours", label: "Horas de presentación", min: 1, max: 12, step: 1, display: (v) => `${v} h en vivo` },
  ],
  fotografia: [
    price("Precio base de cobertura", 5000, 60000, 500),
    { field: "maxGuests", label: "Fotos editadas entregadas", min: 100, max: 2000, step: 50, display: (v) => `${v} fotos editadas` },
    { field: "hours", label: "Horas de cobertura", min: 2, max: 14, step: 1, display: (v) => `${v} h de cobertura` },
  ],
  venues: [
    price("Precio base de renta", 20000, 200000, 2500),
    { field: "maxGuests", label: "Capacidad máxima", min: 50, max: 1000, step: 25, display: (v) => `hasta ${v} invitados` },
    { field: "hours", label: "Horas de renta del venue", min: 4, max: 24, step: 1, display: (v) => `${v} h de renta` },
  ],
  decoracion: [
    price("Precio base del montaje", 5000, 90000, 500),
    { field: "maxGuests", label: "Escala del evento", min: 20, max: 500, step: 10, display: (v) => `evento de ${v} invitados` },
    { field: "hours", label: "Horas de montaje", min: 1, max: 10, step: 1, display: (v) => `${v} h de montaje` },
  ],
  "vestidos-novia": [
    price("Precio base del vestido", 5000, 80000, 1000),
    { field: "maxGuests", label: "Citas de prueba incluidas", min: 1, max: 8, step: 1, display: (v) => `${v} citas de prueba` },
    { field: "hours", label: "Ajustes de sastrería incluidos", min: 0, max: 4, step: 1, display: (v) => `${v} ajustes` },
  ],
  "trajes-tuxedos": [
    price("Precio base de renta", 2000, 40000, 500),
    { field: "maxGuests", label: "Trajes incluidos", min: 1, max: 15, step: 1, display: (v) => `${v} trajes` },
    { field: "hours", label: "Días de renta", min: 1, max: 7, step: 1, display: (v) => `${v} días de renta` },
  ],
  "autos-limosinas": [
    price("Precio base del servicio", 3000, 50000, 500),
    { field: "maxGuests", label: "Kilómetros incluidos", min: 10, max: 300, step: 10, display: (v) => `${v} km incluidos` },
    { field: "hours", label: "Horas de renta", min: 1, max: 12, step: 1, display: (v) => `${v} h de renta` },
  ],
};

const FALLBACK_SLIDERS = CATEGORY_SLIDERS["pasteleria"];

/* --------- Configuración de paquetes, categoría única + Live Preview --------- */

export function PaquetesTab() {
  const [selectedCategory, setSelectedCategory] = useState<string>(PROVIDER.categories[0]);
  const [packages, setPackages] = useState<ProviderPackage[]>(INITIAL_PACKAGES);
  const [activePkgId, setActivePkgId] = useState(INITIAL_PACKAGES[0].id);
  const [newExtraName, setNewExtraName] = useState("");
  const [newExtraPrice, setNewExtraPrice] = useState("");
  const [newInclude, setNewInclude] = useState("");

  const pkg = packages.find((p) => p.id === activePkgId) ?? packages[0];
  const sliders = CATEGORY_SLIDERS[selectedCategory] ?? FALLBACK_SLIDERS;
  const category = CATEGORIES.find((c) => c.slug === selectedCategory);

  const updatePkg = (patch: Partial<ProviderPackage>) => {
    setPackages((prev) => prev.map((p) => (p.id === activePkgId ? { ...p, ...patch } : p)));
  };

  const selectCategory = (slug: string) => {
    setSelectedCategory(slug);
    // Re-encuadra los valores actuales a los rangos de la nueva categoría
    const cfg = CATEGORY_SLIDERS[slug] ?? FALLBACK_SLIDERS;
    setPackages((prev) =>
      prev.map((p) => {
        const next = { ...p };
        for (const s of cfg) {
          next[s.field] = Math.min(Math.max(p[s.field], s.min), s.max);
        }
        return next;
      })
    );
  };

  const addExtra = () => {
    const priceValue = Number(newExtraPrice.replace(/[^0-9]/g, ""));
    if (!newExtraName.trim() || !priceValue) return;
    updatePkg({ extras: [...pkg.extras, { name: newExtraName.trim(), price: priceValue }] });
    setNewExtraName("");
    setNewExtraPrice("");
  };

  const addInclude = () => {
    if (!newInclude.trim()) return;
    updatePkg({ includes: [...pkg.includes, newInclude.trim()] });
    setNewInclude("");
  };

  const handlePublish = () => {
    toast.success("Cambios publicados", {
      description: `${pkg.name} ya está visible en ${category?.label ?? "tu categoría"} con precio de ${formatMXN(pkg.basePrice)}.`,
    });
  };

  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_400px]">
      {/* ------------------------- Columna izquierda ------------------------ */}
      <div className="flex flex-col gap-8">
        {/* Categoría de publicación — selección única */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
          <PanelCard className="p-6">
            <Eyebrow>Categoría de publicación</Eyebrow>
            <h3 className="mt-1.5 font-serif text-2xl font-medium tracking-tight text-foreground">
              ¿En qué categoría se publica este paquete?
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Selecciona una sola categoría — así el cliente te encuentra sin ruido y el configurador adapta sus
              medidas a tu tipo de servicio.
            </p>
            <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {CATEGORIES.map((c) => {
                const active = selectedCategory === c.slug;
                return (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => selectCategory(c.slug)}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                      active ? "border-foreground bg-secondary/60" : "border-border hover:border-foreground/40"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex size-4.5 shrink-0 items-center justify-center rounded-full border transition-colors",
                        active
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-background group-hover:border-foreground/40"
                      )}
                    >
                      {active && <Check size={11} strokeWidth={3} />}
                    </span>
                    <span className="mr-1">{CATEGORY_EMOJI[c.slug]}</span>
                    <span className="text-sm text-foreground">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </PanelCard>
        </motion.div>

        {/* Selector de paquete + configurador */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08, ease: EASE }}>
          <PanelCard className="p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <Eyebrow>Configurador de paquetes</Eyebrow>
              <span className="text-xs text-muted-foreground">
                Medidas de {category?.label ?? "la categoría seleccionada"}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {packages.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActivePkgId(p.id)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    p.id === activePkgId
                      ? "bg-foreground text-background"
                      : "border border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                  )}
                >
                  {p.name}
                </button>
              ))}
            </div>

            <div className="mt-7 flex flex-col gap-7">
              {/* Nombre del paquete */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
                  Nombre del paquete
                </label>
                <input
                  value={pkg.name}
                  onChange={(e) => updatePkg({ name: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground"
                />
              </div>

              {/* Sliders adaptados a la categoría elegida */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={selectedCategory}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="flex flex-col gap-7"
                >
                  {sliders.map((s) => (
                    <div key={s.field}>
                      <div className="flex items-baseline justify-between">
                        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
                          {s.label}
                        </label>
                        <span className="font-serif text-lg font-medium text-foreground">
                          {s.display(pkg[s.field])}
                        </span>
                      </div>
                      <Slider
                        value={[pkg[s.field]]}
                        min={s.min}
                        max={s.max}
                        step={s.step}
                        onValueChange={([v]) => updatePkg({ [s.field]: v } as Partial<ProviderPackage>)}
                        className="mt-3"
                      />
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>

              {/* Extras opcionales */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
                  Extras opcionales (add-ons)
                </label>
                <div className="mt-3 flex flex-col gap-2">
                  <AnimatePresence initial={false}>
                    {pkg.extras.map((extra) => (
                      <motion.div
                        key={extra.name}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 12 }}
                        className="flex items-center justify-between rounded-xl border border-border px-4 py-2.5"
                      >
                        <span className="flex items-center gap-2 text-sm text-foreground">
                          <Plus size={13} className="text-muted-foreground" />
                          {extra.name}
                        </span>
                        <span className="flex items-center gap-3">
                          <span className="text-sm font-medium text-foreground">+ {formatMXN(extra.price)}</span>
                          <button
                            type="button"
                            onClick={() => updatePkg({ extras: pkg.extras.filter((e) => e.name !== extra.name) })}
                            className="text-muted-foreground transition-colors hover:text-destructive"
                            aria-label={`Eliminar ${extra.name}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    value={newExtraName}
                    onChange={(e) => setNewExtraName(e.target.value)}
                    placeholder="Nombre del extra"
                    className="min-w-0 flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
                  />
                  <input
                    value={newExtraPrice}
                    onChange={(e) => setNewExtraPrice(e.target.value)}
                    placeholder="$ MXN"
                    inputMode="numeric"
                    className="w-28 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
                  />
                  <button
                    type="button"
                    onClick={addExtra}
                    className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
                  >
                    <Plus size={15} />
                    Añadir
                  </button>
                </div>
              </div>

              {/* Ítems incluidos */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
                  Lo que incluye el paquete
                </label>
                <div className="mt-3 flex flex-wrap gap-2">
                  <AnimatePresence initial={false}>
                    {pkg.includes.map((item) => (
                      <motion.span
                        key={item}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="inline-flex items-center gap-2 rounded-full bg-secondary px-3.5 py-1.5 text-xs text-foreground"
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() => updatePkg({ includes: pkg.includes.filter((i) => i !== item) })}
                          className="text-muted-foreground transition-colors hover:text-destructive"
                          aria-label={`Quitar ${item}`}
                        >
                          <X size={12} />
                        </button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    value={newInclude}
                    onChange={(e) => setNewInclude(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addInclude()}
                    placeholder="Ej. Degustación previa para 2"
                    className="min-w-0 flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
                  />
                  <button
                    type="button"
                    onClick={addInclude}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    <Plus size={15} />
                    Añadir
                  </button>
                </div>
              </div>
            </div>
          </PanelCard>
        </motion.div>
      </div>

      {/* ------------------- Columna derecha: Live Preview ------------------ */}
      {/* Réplica exacta de la tarjeta / QuickView que ve el cliente           */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.15, ease: EASE }}
        className="xl:sticky xl:top-24 xl:self-start"
      >
        <Eyebrow className="mb-3 flex items-center gap-2">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-foreground opacity-40" />
            <span className="relative inline-flex size-2 rounded-full bg-foreground" />
          </span>
          Vista en vivo — así te ve el cliente
        </Eyebrow>

        <article>
          {/* Imagen con píldoras, igual que VendorCard */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-secondary">
            <img
              src={PROVIDER.image}
              alt={PROVIDER.name}
              className="size-full object-cover"
            />
            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              {PROVIDER.verified && (
                <span className="rounded-full bg-background/85 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-foreground backdrop-blur">
                  Verificado
                </span>
              )}
              {category && (
                <span className="rounded-full bg-foreground/85 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-background backdrop-blur">
                  {CATEGORY_EMOJI[category.slug]} {category.label}
                </span>
              )}
            </div>
            <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-background/85 px-3 py-1.5 text-[11px] font-medium text-foreground backdrop-blur">
              <MapPin size={12} /> {PROVIDER.location}
            </span>
          </div>

          {/* Cuerpo, mismo ritmo tipográfico que VendorCard */}
          <div className="py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="mb-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {category?.label ?? "Sin categoría"}
                </p>
                <h4 className="font-serif text-2xl font-medium leading-snug tracking-tight text-foreground">
                  {PROVIDER.name}
                </h4>
                <div className="mt-2 flex items-center gap-1.5 text-sm text-foreground">
                  <Star size={14} className="fill-foreground" />
                  <span className="font-medium">{PROVIDER.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({PROVIDER.reviews} reseñas)</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">desde</p>
                <p className="text-base font-medium text-foreground">{formatMXN(pkg.basePrice)}</p>
                <p className="text-xs text-muted-foreground">por evento</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Users size={13} /> {sliders[1].display(pkg.maxGuests)}</span>
              <span className="flex items-center gap-1.5"><Clock size={13} /> {sliders[2].display(pkg.hours)}</span>
            </div>

            {/* Caja de apartado — igual que en el QuickView */}
            <div className="mt-5 rounded-2xl border border-border p-5">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Precio total</span>
                <span className="text-xl font-medium text-foreground">{formatMXN(pkg.basePrice)}</span>
              </div>
              <div className="mt-3 rounded-xl bg-secondary px-4 py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
                    Aparta tu fecha con solo 10%
                  </span>
                  <span className="text-base font-semibold text-foreground">{formatMXN(apartadoDe(pkg.basePrice))}</span>
                </div>
                <div className="mt-2 flex flex-col gap-1.5 text-xs leading-relaxed text-muted-foreground">
                  <span className="flex items-center justify-between gap-3">
                    <span>🛡️ 5% Comisión de Servicio y Garantía Momentum</span>
                    <span className="text-foreground">{formatMXN(comisionDe(pkg.basePrice))}</span>
                  </span>
                  <span className="flex items-center justify-between gap-3">
                    <span>🤝 5% Anticipo Directo para el Proveedor</span>
                    <span className="text-foreground">{formatMXN(anticipoDe(pkg.basePrice))}</span>
                  </span>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                El 90% restante ({formatMXN(saldoDe(pkg.basePrice))}) lo liquidas directamente con tu proveedor antes o el día del evento.
              </p>
            </div>

            <button
              type="button"
              onClick={handlePublish}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              <Save size={16} />
              Guardar y Publicar Cambios
            </button>
          </div>
        </article>

        <p className="text-xs leading-relaxed text-muted-foreground">
          La previsualización se actualiza en tiempo real con el configurador de paquetes.
        </p>
      </motion.div>
    </div>
  );
}
