"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Clock, MapPin, Pencil, Plus, Save, Star, Trash2, Users, X } from "lucide-react";
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

/* --------- Extras sugeridos según la categoría seleccionada --------- */

interface SuggestedExtra {
  name: string;
  price: number;
}

const CATEGORY_EXTRAS: Record<string, SuggestedExtra[]> = {
  pasteleria: [
    { name: "Mesa de postres franceses", price: 6500 },
    { name: "Fuente de chocolate", price: 3800 },
    { name: "Piso adicional de pastel", price: 2400 },
    { name: "Mini cupcakes de cortesía (50 pzas)", price: 1900 },
    { name: "Topper personalizado", price: 850 },
    { name: "Degustación previa para 4", price: 1200 },
  ],
  "mesa-de-dulces": [
    { name: "Carrito de churros", price: 3200 },
    { name: "Fuente de chocolate con fruta", price: 3800 },
    { name: "Barra de café y repostería", price: 4500 },
    { name: "Dulces personalizados con monograma", price: 2600 },
    { name: "Estación de helados", price: 3900 },
    { name: "Mesa salada (botanas gourmet)", price: 3400 },
  ],
  catering: [
    { name: "Barra de cocteles de bienvenida", price: 5500 },
    { name: "Estación de tacos al pastor", price: 6800 },
    { name: "Mesa de quesos y charcutería", price: 4900 },
    { name: "Servicio de meseros adicionales", price: 2800 },
    { name: "Menú infantil", price: 2200 },
    { name: "Coffee break de medianoche", price: 3600 },
  ],
  musica: [
    { name: "Saxofonista para el vals", price: 3200 },
    { name: "Hora extra de presentación", price: 4500 },
    { name: "DJ para el after", price: 6000 },
    { name: "Mariachi de bienvenida (45 min)", price: 7500 },
    { name: "Pantalla LED con visuales", price: 5200 },
    { name: "Karaoke con animador", price: 2800 },
  ],
  fotografia: [
    { name: "Sesión pre-evento (getting ready)", price: 3500 },
    { name: "Drone para tomas aéreas", price: 4200 },
    { name: "Segundo fotógrafo", price: 5800 },
    { name: "Álbum físico premium 30x30", price: 6500 },
    { name: "Cabina de fotos con props", price: 4800 },
    { name: "Video highlight de 3 min", price: 7500 },
  ],
  venues: [
    { name: "Mobiliario lounge adicional", price: 8500 },
    { name: "Iluminación arquitectónica", price: 6200 },
    { name: "Valet parking (4 h)", price: 4800 },
    { name: "Suite nupcial la noche del evento", price: 5500 },
    { name: "Uso de jardín para ceremonia", price: 7000 },
    { name: "Planta de luz de respaldo", price: 3900 },
  ],
  decoracion: [
    { name: "Arco floral para ceremonia", price: 7800 },
    { name: "Centros de mesa altos (por mesa)", price: 950 },
    { name: "Cortina de luces cálidas", price: 4200 },
    { name: "Letras gigantes iluminadas", price: 3600 },
    { name: "Pista de baile iluminada", price: 8900 },
    { name: "Bengalas frías de entrada", price: 2800 },
  ],
  "vestidos-novia": [
    { name: "Velo de catedral", price: 2800 },
    { name: "Segundo look (vestido de recepción)", price: 9500 },
    { name: "Ramo de novia preservado", price: 1800 },
    { name: "Bordado personalizado interior", price: 1500 },
    { name: "Cita express adicional", price: 900 },
    { name: "Kit de emergencia de costura", price: 650 },
  ],
  "trajes-tuxedos": [
    { name: "Traje del novio incluido", price: 4200 },
    { name: "Cummerbund y corbatín extra", price: 800 },
    { name: "Planchado y entrega a domicilio", price: 1200 },
    { name: "Traje para cortejo infantil", price: 1500 },
    { name: "Día extra de renta", price: 900 },
    { name: "Seguro contra daños menores", price: 600 },
  ],
  "autos-limosinas": [
    { name: "Decoración floral del auto", price: 1600 },
    { name: "Chófer con uniforme de gala", price: 900 },
    { name: "Ruta de fotos por la ciudad (1 h)", price: 1800 },
    { name: "Botella de espumante a bordo", price: 750 },
    { name: "Auto adicional para familia", price: 3200 },
    { name: "Alfombra roja en la entrada", price: 1100 },
  ],
};

/* --------- Configuración de paquetes, categoría única + Live Preview --------- */

export function PaquetesTab() {
  const [selectedCategory, setSelectedCategory] = useState<string>(PROVIDER.categories[0]);
  const [packages, setPackages] = useState<ProviderPackage[]>(INITIAL_PACKAGES);
  const [activePkgId, setActivePkgId] = useState(INITIAL_PACKAGES[0].id);
  const [newExtraName, setNewExtraName] = useState("");
  const [newExtraPrice, setNewExtraPrice] = useState("");
  const [newInclude, setNewInclude] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    JSON.stringify({ packages: INITIAL_PACKAGES, category: PROVIDER.categories[0] })
  );

  const dirty = JSON.stringify({ packages, category: selectedCategory }) !== savedSnapshot;

  const pkg = packages.find((p) => p.id === activePkgId) ?? packages[0];
  const sliders = CATEGORY_SLIDERS[selectedCategory] ?? FALLBACK_SLIDERS;
  const category = CATEGORIES.find((c) => c.slug === selectedCategory);

  const updatePkg = (patch: Partial<ProviderPackage>) => {
    setPackages((prev) => prev.map((p) => (p.id === activePkgId ? { ...p, ...patch } : p)));
  };

  const selectCategory = (slug: string) => {
    setSelectedCategory(slug);
    setCategoryOpen(false);
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

  const suggestedExtras = (CATEGORY_EXTRAS[selectedCategory] ?? []).filter(
    (s) => !pkg.extras.some((e) => e.name === s.name)
  );

  const addSuggestedExtra = (extra: SuggestedExtra) => {
    updatePkg({ extras: [...pkg.extras, { name: extra.name, price: extra.price }] });
  };

  const handlePublish = () => {
    setSavedSnapshot(JSON.stringify({ packages, category: selectedCategory }));
    toast.success("Cambios publicados", {
      description: `${pkg.name} ya está visible en ${category?.label ?? "tu categoría"} con precio de ${formatMXN(pkg.basePrice)}.`,
    });
  };

  const handleDiscard = () => {
    const snap = JSON.parse(savedSnapshot) as { packages: ProviderPackage[]; category: string };
    setPackages(snap.packages);
    setSelectedCategory(snap.category);
    toast.info("Cambios descartados", {
      description: "Se restauró la última versión publicada de tus paquetes.",
    });
  };

  return (
    <div className="flex flex-col gap-8">
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_400px]">
      {/* ------------------------- Columna izquierda ------------------------ */}
      <div className="flex flex-col gap-8">
        {/* Categoría de publicación — colapsada una vez elegida */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
          <PanelCard className="p-6">
            {!categoryOpen && category ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex size-10 items-center justify-center rounded-full bg-secondary text-lg">
                    {CATEGORY_EMOJI[category.slug]}
                  </span>
                  <div>
                    <Eyebrow>Publicado en</Eyebrow>
                    <p className="mt-0.5 font-serif text-xl font-medium tracking-tight text-foreground">
                      {category.label}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCategoryOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  <Pencil size={13} />
                  Cambiar categoría
                </button>
              </div>
            ) : (
              <>
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
              </>
            )}
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

                {/* Sugerencias según la categoría seleccionada */}
                {suggestedExtras.length > 0 && (
                  <div className="mt-3 rounded-xl bg-secondary/60 p-4">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      Sugerencias para {category?.label ?? "tu categoría"} — clic para añadir
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      <AnimatePresence initial={false}>
                        {suggestedExtras.map((s) => (
                          <motion.button
                            key={s.name}
                            type="button"
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.92 }}
                            transition={{ duration: 0.25, ease: EASE }}
                            onClick={() => addSuggestedExtra(s)}
                            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3.5 py-1.5 text-xs text-foreground transition-colors hover:border-foreground/40 hover:bg-secondary"
                          >
                            <Plus size={12} className="text-muted-foreground" />
                            {s.name}
                            <span className="font-medium text-foreground">{formatMXN(s.price)}</span>
                          </motion.button>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

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

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Usa la barra inferior para guardar y publicar tus cambios.
            </p>
          </div>
        </article>

        <p className="text-xs leading-relaxed text-muted-foreground">
          La previsualización se actualiza en tiempo real con el configurador de paquetes.
        </p>
      </motion.div>
    </div>

    {/* Barra de acción fija — guardar/publicar siempre visible */}
    <div className="sticky bottom-4 z-30">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-full border border-border bg-foreground px-5 py-3 shadow-2xl">
        <p className="flex items-center gap-2 text-xs font-medium text-background/80">
          {dirty ? (
            <>
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-background opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-background" />
              </span>
              Tienes cambios sin publicar
            </>
          ) : (
            <>
              <Check size={13} />
              Todo publicado — así te ven los clientes
            </>
          )}
        </p>
        <div className="flex items-center gap-2">
          {dirty && (
            <button
              type="button"
              onClick={handleDiscard}
              className="inline-flex items-center gap-1.5 rounded-full border border-background/25 px-4 py-2 text-xs font-medium text-background transition-colors hover:bg-background/10"
            >
              <X size={13} />
              Descartar
            </button>
          )}
          <button
            type="button"
            onClick={handlePublish}
            disabled={!dirty}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all",
              dirty
                ? "bg-background text-foreground hover:opacity-90"
                : "cursor-default bg-background/20 text-background/60"
            )}
          >
            <Save size={15} />
            Guardar y Publicar
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}
