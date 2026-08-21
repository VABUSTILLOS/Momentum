"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Clock, MapPin, Plus, Save, ShieldCheck, HandCoins, Star, Trash2, Users, X } from "lucide-react";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
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
import { EASE, Eyebrow, GoldDivider, PanelCard } from "./shared";

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
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_400px]">
      {/* ------------------------- Columna izquierda ------------------------ */}
      <div className="flex flex-col gap-6">
        {/* Categorías oficiales */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
          <PanelCard className="p-6">
            <Eyebrow>Categorías oficiales Momentum</Eyebrow>
            <h3 className="mt-1.5 font-serif text-2xl tracking-tight text-white">¿En qué categorías participa tu negocio?</h3>
            <p className="mt-1 text-sm text-neutral-400">
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
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all",
                      active
                        ? "border-[#C9A96E]/50 bg-[#C9A96E]/12 text-white"
                        : "border-white/10 bg-white/[0.02] text-neutral-400 hover:border-white/25 hover:text-neutral-200"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                        active ? "border-[#C9A96E] bg-[#C9A96E] text-[#0A0A0A]" : "border-white/25"
                      )}
                    >
                      {active && <Check size={12} strokeWidth={3} />}
                    </span>
                    <span className="mr-1">{CATEGORY_EMOJI[c.slug]}</span>
                    {c.label}
                  </button>
                );
              })}
            </div>
          </PanelCard>
        </motion.div>

        {/* Selector de paquete */}
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
                    "rounded-full border px-4 py-2 text-sm font-medium transition-all",
                    p.id === activePkgId
                      ? "border-[#C9A96E] bg-[#C9A96E] text-[#0A0A0A]"
                      : "border-white/12 text-neutral-300 hover:border-[#C9A96E]/40"
                  )}
                >
                  {p.name}
                </button>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-7">
              {/* Nombre del paquete */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                  Nombre del paquete
                </label>
                <input
                  value={pkg.name}
                  onChange={(e) => updatePkg({ name: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#C9A96E]/60"
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
                    <label className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">{label}</label>
                    <span className="font-serif text-lg text-[#E6CD9A]">{display}</span>
                  </div>
                  <Slider
                    value={[value]}
                    min={min}
                    max={max}
                    step={step}
                    onValueChange={([v]) => onChange(v)}
                    className="mt-3 **:data-[slot=slider-range]:bg-[#C9A96E] **:data-[slot=slider-thumb]:border-[#C9A96E] **:data-[slot=slider-thumb]:bg-[#E6CD9A]"
                  />
                </div>
              ))}

              {/* Extras opcionales */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
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
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5"
                      >
                        <span className="flex items-center gap-2 text-sm text-neutral-200">
                          <Plus size={13} className="text-[#C9A96E]" />
                          {extra.name}
                        </span>
                        <span className="flex items-center gap-3">
                          <span className="text-sm text-[#E6CD9A]">+ {formatMXN(extra.price)}</span>
                          <button
                            type="button"
                            onClick={() => updatePkg({ extras: pkg.extras.filter((e) => e.name !== extra.name) })}
                            className="text-neutral-500 transition-colors hover:text-red-400"
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
                    className="min-w-0 flex-1 rounded-xl border border-white/12 bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-[#C9A96E]/60"
                  />
                  <input
                    value={newExtraPrice}
                    onChange={(e) => setNewExtraPrice(e.target.value)}
                    placeholder="$ MXN"
                    inputMode="numeric"
                    className="w-28 rounded-xl border border-white/12 bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-[#C9A96E]/60"
                  />
                  <button
                    type="button"
                    onClick={addExtra}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#C9A96E] px-4 py-2.5 text-sm font-semibold text-[#0A0A0A] transition-transform hover:scale-[1.03] active:scale-[0.97]"
                  >
                    <Plus size={15} />
                    Añadir
                  </button>
                </div>
              </div>

              {/* Ítems incluidos */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
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
                        className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3.5 py-1.5 text-xs text-neutral-200"
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() => updatePkg({ includes: pkg.includes.filter((i) => i !== item) })}
                          className="text-neutral-500 transition-colors hover:text-red-400"
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
                    className="min-w-0 flex-1 rounded-xl border border-white/12 bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-[#C9A96E]/60"
                  />
                  <button
                    type="button"
                    onClick={addInclude}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#C9A96E]/50 px-4 py-2.5 text-sm font-semibold text-[#E6CD9A] transition-colors hover:bg-[#C9A96E]/10"
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.15, ease: EASE }}
        className="xl:sticky xl:top-24 xl:self-start"
      >
        <Eyebrow className="mb-3 flex items-center gap-2">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#C9A96E] opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-[#C9A96E]" />
          </span>
          Vista en vivo — así te ve el cliente
        </Eyebrow>

        <div className="overflow-hidden rounded-2xl border border-[#C9A96E]/25 bg-[#111111] shadow-[0_30px_70px_-30px_rgba(201,169,110,0.25)]">
          {/* Imagen principal */}
          <div className="relative h-52 overflow-hidden">
            <img
              src={PROVIDER.image}
              alt={PROVIDER.name}
              className="size-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent" />
            <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
              {previewCategories.map((c) => (
                <Badge key={c.slug} className="border border-black/20 bg-black/60 text-[11px] font-medium text-[#E6CD9A] backdrop-blur-md">
                  {CATEGORY_EMOJI[c.slug]} {c.label}
                </Badge>
              ))}
            </div>
            {PROVIDER.verified && (
              <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-[#C9A96E] px-3 py-1 text-[11px] font-bold text-[#0A0A0A]">
                <ShieldCheck size={12} />
                Verificado
              </span>
            )}
          </div>

          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="font-serif text-2xl tracking-tight text-white">{PROVIDER.name}</h4>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-neutral-400">
                  <MapPin size={12} className="text-[#C9A96E]" />
                  {PROVIDER.location}
                </p>
              </div>
              <span className="flex items-center gap-1 text-sm text-[#E6CD9A]">
                <Star size={14} fill="currentColor" />
                {PROVIDER.rating.toFixed(1)}
                <span className="text-xs text-neutral-500">({PROVIDER.reviews})</span>
              </span>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-neutral-400">{pkg.name} · hasta {pkg.maxGuests} invitados · {pkg.hours} h de servicio</p>

            <div className="mt-4 flex items-center gap-4 text-xs text-neutral-400">
              <span className="flex items-center gap-1.5"><Users size={13} className="text-[#C9A96E]" /> {pkg.maxGuests} máx.</span>
              <span className="flex items-center gap-1.5"><Clock size={13} className="text-[#C9A96E]" /> {pkg.hours} horas</span>
            </div>

            <GoldDivider className="my-5" />

            {/* Precios */}
            <div className="flex items-baseline justify-between">
              <span className="text-xs uppercase tracking-[0.16em] text-neutral-500">Precio total</span>
              <span className="font-serif text-3xl tracking-tight text-white">{formatMXN(pkg.basePrice)}</span>
            </div>
            <div className="mt-3 rounded-xl border border-[#C9A96E]/30 bg-[#C9A96E]/10 px-4 py-3">
              <p className="text-sm text-neutral-200">
                Aparta tu fecha con solo 10%:{" "}
                <strong className="font-serif text-lg text-[#E6CD9A]">{formatMXN(apartadoDe(pkg.basePrice))}</strong>
              </p>
              <div className="mt-2.5 flex flex-col gap-1.5 text-xs text-neutral-400">
                <span className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">🛡️ 5% Comisión de Servicio y Garantía Momentum</span>
                  <span className="text-neutral-300">{formatMXN(comisionDe(pkg.basePrice))}</span>
                </span>
                <span className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">🤝 5% Anticipo Directo para el Proveedor</span>
                  <span className="text-neutral-300">{formatMXN(anticipoDe(pkg.basePrice))}</span>
                </span>
              </div>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-neutral-500">
              El {Math.round(90)}% restante ({formatMXN(saldoDe(pkg.basePrice))}) se liquida directamente con tu proveedor antes o el día del evento.
            </p>

            <button
              type="button"
              onClick={handlePublish}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#C9A96E] px-5 py-3.5 text-sm font-bold text-[#0A0A0A] transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Save size={16} />
              Guardar y Publicar Cambios
            </button>
          </div>
        </div>

        <p className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-neutral-500">
          <HandCoins size={13} className="mt-0.5 shrink-0 text-[#C9A96E]" />
          La previsualización se actualiza en tiempo real con el configurador de paquetes.
        </p>
      </motion.div>
    </div>
  );
}
