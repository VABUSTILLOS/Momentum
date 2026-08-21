"use client";

import { useMemo, useState } from "react";
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
import { EASE, Eyebrow, PanelCard, StatusPill } from "./shared";

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

/* --------- Configuración de paquetes, categorías + Live Preview ---------- */

export function PaquetesTab() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(PROVIDER.categories);
  const [packages, setPackages] = useState<ProviderPackage[]>(INITIAL_PACKAGES);
  const [activePkgId, setActivePkgId] = useState(INITIAL_PACKAGES[0].id);
  const [newExtraName, setNewExtraName] = useState("");
  const [newExtraPrice, setNewExtraPrice] = useState("");
  const [newInclude, setNewInclude] = useState("");

  const pkg = packages.find((p) => p.id === activePkgId) ?? packages[0];

  const updatePkg = (patch: Partial<ProviderPackage>) => {
    setPackages((prev) => prev.map((p) => (p.id === activePkgId ? { ...p, ...patch } : p)));
  };

  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
    );
  };

  const addExtra = () => {
    const price = Number(newExtraPrice.replace(/[^0-9]/g, ""));
    if (!newExtraName.trim() || !price) return;
    updatePkg({ extras: [...pkg.extras, { name: newExtraName.trim(), price }] });
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
      description: `${pkg.name} ya está visible en el marketplace con precio de ${formatMXN(pkg.basePrice)}.`,
    });
  };

  const previewCategories = useMemo(
    () => CATEGORIES.filter((c) => selectedCategories.includes(c.slug)),
    [selectedCategories]
  );

  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_400px]">
      {/* ------------------------- Columna izquierda ------------------------ */}
      <div className="flex flex-col gap-8">
        {/* Categorías oficiales — checkboxes circulares como los filtros del marketplace */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
          <PanelCard className="p-6">
            <Eyebrow>Categorías oficiales Momentum</Eyebrow>
            <h3 className="mt-1.5 font-serif text-2xl font-medium tracking-tight text-foreground">
              ¿En qué categorías participa tu negocio?
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Multi-asignación: marca todas las que apliquen. Tu negocio aparecerá en cada categoría del marketplace.
            </p>
            <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {CATEGORIES.map((c) => {
                const active = selectedCategories.includes(c.slug);
                return (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => toggleCategory(c.slug)}
                    className="group flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-left transition-colors hover:border-foreground/40"
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
            <Eyebrow>Configurador de paquetes</Eyebrow>
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

              {/* Sliders */}
              {[
                {
                  label: "Precio base del paquete",
                  value: pkg.basePrice,
                  min: 5000,
                  max: 120000,
                  step: 500,
                  display: formatMXN(pkg.basePrice),
                  onChange: (v: number) => updatePkg({ basePrice: v }),
                },
                {
                  label: "Límite de invitados",
                  value: pkg.maxGuests,
                  min: 20,
                  max: 500,
                  step: 10,
                  display: `${pkg.maxGuests} invitados`,
                  onChange: (v: number) => updatePkg({ maxGuests: v }),
                },
                {
                  label: "Horas de servicio incluidas",
                  value: pkg.hours,
                  min: 2,
                  max: 12,
                  step: 1,
                  display: `${pkg.hours} horas`,
                  onChange: (v: number) => updatePkg({ hours: v }),
                },
              ].map(({ label, value, min, max, step, display, onChange }) => (
                <div key={label}>
                  <div className="flex items-baseline justify-between">
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">{label}</label>
                    <span className="font-serif text-lg font-medium text-foreground">{display}</span>
                  </div>
                  <Slider
                    value={[value]}
                    min={min}
                    max={max}
                    step={step}
                    onValueChange={([v]) => onChange(v)}
                    className="mt-3"
                  />
                </div>
              ))}

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
              {previewCategories.map((c) => (
                <span
                  key={c.slug}
                  className="rounded-full bg-foreground/85 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-background backdrop-blur"
                >
                  {CATEGORY_EMOJI[c.slug]} {c.label}
                </span>
              ))}
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
                  {previewCategories.map((c) => c.label).join(" · ") || "Sin categoría"}
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

            <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Users size={13} /> Hasta {pkg.maxGuests} invitados</span>
              <span className="flex items-center gap-1.5"><Clock size={13} /> {pkg.hours} horas de servicio</span>
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
