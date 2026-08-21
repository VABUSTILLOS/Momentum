"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, Filter, Search, SlidersHorizontal, Star, X } from "lucide-react";
import { FadeImage } from "@/components/fade-image";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";

const services = [
  { id: 1, name: "DJ Set + Audio Profesional", category: "Música", description: "DJ, iluminación y sonido para una noche memorable", price: 18500, unit: "por evento", rating: 4.9, image: "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
  { id: 2, name: "Banquete Signature", category: "Catering", description: "Menú de tres tiempos, montaje y servicio incluido", price: 950, unit: "por persona", rating: 4.8, image: "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
  { id: 3, name: "Foto y Video Cinemático", category: "Foto y video", description: "Cobertura 4K, drone y entrega de highlights", price: 24000, unit: "por evento", rating: 5, image: "https://images.pexels.com/photos/1264210/pexels-photo-1264210.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
  { id: 4, name: "Jardín Los Olivos", category: "Venue", description: "Venue para hasta 180 invitados en la ciudad", price: 42000, unit: "por evento", rating: 4.9, image: "https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
  { id: 5, name: "Diseño Floral Editorial", category: "Decoración", description: "Flores de temporada, mesas y ceremonia", price: 16800, unit: "por evento", rating: 4.7, image: "https://images.pexels.com/photos/931179/pexels-photo-931179.jpeg?auto=compress&cs=tinysrgb&w=1400&h=900&dpr=2" },
  { id: 6, name: "Coordinación del Día", category: "Planeación", description: "Un equipo experto para que tú disfrutes", price: 12500, unit: "por evento", rating: 4.9, image: "https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
];
const categories = ["Todos", ...Array.from(new Set(services.map((service) => service.category)))];
const money = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });

type Service = (typeof services)[number];

export function CollectionSection() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [maxPrice, setMaxPrice] = useState(50000);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState<Service | null>(null);

  useEffect(() => {
    const onSearch = (event: Event) => setQuery((event as CustomEvent<string>).detail);
    window.addEventListener("momentum:search", onSearch);
    return () => window.removeEventListener("momentum:search", onSearch);
  }, []);

  const filtered = useMemo(() => services.filter((service) => {
    const matchesQuery = `${service.name} ${service.description} ${service.category}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (category === "Todos" || service.category === category) && service.price <= maxPrice;
  }), [category, maxPrice, query]);

  const reset = () => { setQuery(""); setCategory("Todos"); setMaxPrice(50000); };

  return <section id="accessories" className="bg-background">
    <div className="px-6 py-20 md:px-12 lg:px-20 md:py-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div><p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Marketplace Momentum</p><h2 className="font-serif text-4xl font-medium tracking-tight text-foreground md:text-5xl">Proveedores que hacen que suceda.</h2><p className="mt-4 max-w-xl text-muted-foreground">Cotiza servicios confiables y aparta tu fecha sin sorpresas.</p></div>
        <Button variant="outline" className="w-fit rounded-full" onClick={() => setFiltersOpen(true)}><SlidersHorizontal className="mr-2 size-4" /> Filtrar servicios</Button>
      </div>
      <div className="mt-8 flex gap-2 overflow-x-auto pb-2">{categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors ${category === item ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"}`}>{item}</button>)}</div>
    </div>
    <div className="pb-24"><div className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-4 md:hidden">{filtered.map((service) => <ServiceCard key={service.id} service={service} mobile onSelect={setSelected} />)}</div><div className="hidden gap-8 px-6 md:grid md:grid-cols-3 md:px-12 lg:px-20">{filtered.map((service) => <ServiceCard key={service.id} service={service} onSelect={setSelected} />)}</div>{filtered.length === 0 && <div className="mx-6 rounded-2xl border border-dashed border-border p-12 text-center md:mx-20"><Search className="mx-auto mb-4 size-8 text-muted-foreground" /><p className="font-medium text-foreground">No encontramos servicios con esos filtros.</p><Button variant="link" onClick={reset}>Restablecer filtros</Button></div>}</div>
    <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}><DialogContent><DialogHeader><DialogTitle>Filtrar servicios</DialogTitle><DialogDescription>Encuentra el equipo ideal para tu evento.</DialogDescription></DialogHeader><div className="space-y-6 py-4"><div><p className="mb-3 text-sm font-medium">Categoría</p><div className="flex flex-wrap gap-2">{categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className={`rounded-full border px-3 py-1.5 text-xs ${category === item ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground"}`}>{item}</button>)}</div></div><div><div className="mb-3 flex justify-between text-sm"><span className="font-medium">Presupuesto máximo</span><span className="text-muted-foreground">{money.format(maxPrice)}</span></div><Slider value={[maxPrice]} min={5000} max={50000} step={1000} onValueChange={(value) => setMaxPrice(value[0])} /></div><Button className="w-full rounded-full" onClick={() => setFiltersOpen(false)}>Ver resultados</Button><Button variant="ghost" className="w-full rounded-full" onClick={reset}>Restablecer filtros</Button></div></DialogContent></Dialog>
    <QuoteDialog service={selected} onClose={() => setSelected(null)} />
  </section>;
}

function ServiceCard({ service, mobile = false, onSelect }: { service: Service; mobile?: boolean; onSelect: (service: Service) => void }) { return <article className={`group ${mobile ? "w-[75vw] flex-shrink-0 snap-center" : ""}`}><div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-secondary"><FadeImage src={service.image} alt={service.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" /><span className="absolute left-4 top-4 rounded-full bg-background/85 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-foreground backdrop-blur">Proveedor verificado</span><span className="absolute bottom-4 left-4 flex items-center gap-1 rounded-full bg-background/85 px-3 py-1.5 text-xs text-foreground backdrop-blur"><Star className="size-3 fill-current" /> {service.rating}</span></div><div className="py-6"><div className="flex items-start justify-between gap-4"><div><p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">{service.category}</p><h3 className="text-lg font-medium leading-snug text-foreground">{service.name}</h3><p className="mt-2 text-sm text-muted-foreground">{service.description}</p><Button variant="outline" className="mt-5 rounded-full" onClick={() => onSelect(service)}>Cotizar / Apartar</Button></div><span className="text-right text-base font-medium text-foreground">{money.format(service.price)}<small className="block text-[10px] font-normal text-muted-foreground">{service.unit}</small></span></div></div></article>; }

function QuoteDialog({ service, onClose }: { service: Service | null; onClose: () => void }) { const [date, setDate] = useState<Date>(); const [step, setStep] = useState(1); return <Dialog open={Boolean(service)} onOpenChange={(open) => !open && onClose()}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>{step === 3 ? "Solicitud enviada" : `Aparta ${service?.name}`}</DialogTitle><DialogDescription>{step === 3 ? "El proveedor recibirá tus datos y te contactará pronto." : "Cuéntanos cuándo y cómo imaginas tu evento."}</DialogDescription></DialogHeader>{step === 1 && <div className="space-y-4 py-4"><Calendar mode="single" selected={date} onSelect={setDate} className="mx-auto rounded-md border" /><Button className="w-full rounded-full" disabled={!date} onClick={() => setStep(2)}>Continuar</Button></div>}{step === 2 && <div className="space-y-4 py-4"><input aria-label="Tu nombre" placeholder="Tu nombre" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" /><input aria-label="Tu correo" type="email" placeholder="Tu correo electrónico" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" /><Button className="w-full rounded-full" onClick={() => setStep(3)}>Enviar solicitud</Button></div>}{step === 3 && <div className="py-6 text-center"><Check className="mx-auto mb-4 size-10 rounded-full bg-foreground p-2 text-background" /><Button className="rounded-full" onClick={onClose}>Listo</Button></div>}</DialogContent></Dialog>; }
