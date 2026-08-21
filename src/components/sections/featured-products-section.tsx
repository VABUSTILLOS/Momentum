"use client";

import { FadeImage } from "@/components/fade-image";

const features = [
  { title: "Música & Producción", description: "RITMO", image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1400&q=85" },
  { title: "Catering Premium", description: "SABOR", image: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1400&q=85" },
  { title: "Cobertura 4K", description: "RECUERDOS", image: "https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg?auto=compress&cs=tinysrgb&w=1400&h=900&dpr=2" },
  { title: "Reserva Segura", description: "CONFIANZA", image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1400&q=85" },
  { title: "Venues Exclusivos", description: "ESPACIOS", image: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1400&q=85" },
  { title: "Decoración Floral", description: "DETALLES", image: "https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=1400&q=85" },
];

export function FeaturedProductsSection() { return <section id="technology" className="bg-background"><div className="px-5 py-16 text-center sm:px-6 md:px-12 md:py-28 lg:px-20 lg:py-32 lg:pb-20"><h2 className="text-balance font-serif text-3xl font-medium leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">Todo para un evento <em>extraordinario.</em></h2><p className="mx-auto mt-6 max-w-md text-sm text-muted-foreground">Música, gastronomía, espacios y recuerdos que hacen la diferencia.</p></div><div className="grid grid-cols-1 gap-8 px-5 pb-16 sm:px-6 md:grid-cols-3 md:gap-4 md:px-12 md:pb-20 lg:px-20">{features.map((feature) => <div key={feature.title} className="group"><div className="relative aspect-[4/3] overflow-hidden rounded-2xl"><FadeImage src={feature.image} alt={feature.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" /></div><div className="py-6"><p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">{feature.description}</p><h3 className="text-xl font-semibold text-foreground">{feature.title}</h3></div></div>)}</div></section>; }
