"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const sideImages = [
  { src: "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2", alt: "Mesa de evento en jardín", position: "left" },
  { src: "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2", alt: "Celebración al aire libre", position: "left" },
  { src: "https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2", alt: "Decoración floral para evento", position: "right" },
  { src: "https://images.pexels.com/photos/265947/pexels-photo-265947.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2", alt: "Mesa de boda decorada con flores", position: "right" },
];

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  useEffect(() => { const handleScroll = () => { if (!sectionRef.current) return; const progress = Math.max(0, Math.min(1, -sectionRef.current.getBoundingClientRect().top / (window.innerHeight * 2))); setScrollProgress(progress); }; window.addEventListener("scroll", handleScroll, { passive: true }); handleScroll(); return () => window.removeEventListener("scroll", handleScroll); }, []);
  const textOpacity = Math.max(0, 1 - scrollProgress / 0.2);
  const imageProgress = Math.max(0, Math.min(1, (scrollProgress - 0.2) / 0.8));
  const centerWidth = 100 - imageProgress * 58;
  const centerHeight = 100 - imageProgress * 30;
  const sideWidth = imageProgress * 22;
  const sideTranslateLeft = -100 + imageProgress * 100;
  const sideTranslateRight = 100 - imageProgress * 100;
  const radius = imageProgress * 24;
  const gap = imageProgress * 16;
  const renderSide = (position: "left" | "right") => sideImages.filter((image) => image.position === position).map((image) => <div key={image.alt} className="relative flex-1 overflow-hidden" style={{ borderRadius: `${radius}px` }}><Image src={image.src} alt={image.alt} fill className="object-cover" /></div>);

  return <section ref={sectionRef} className="hero-section relative bg-background"><div className="sticky top-0 h-screen overflow-hidden"><div className="flex h-full w-full items-center justify-center"><div className="relative flex h-full w-full items-stretch justify-center" style={{ gap: `${gap}px`, padding: `${imageProgress * 16}px`, paddingBottom: `${60 + imageProgress * 40}px` }}><div className="flex flex-col will-change-transform" style={{ width: `${sideWidth}%`, gap: `${gap}px`, transform: `translateX(${sideTranslateLeft}%)`, opacity: imageProgress }}>{renderSide("left")}</div><div className="relative flex flex-col justify-end overflow-hidden will-change-transform" style={{ width: `${centerWidth}%`, height: `${centerHeight}%`, borderRadius: `${radius}px` }}><Image src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=85" alt="Mesa elegante decorada para una celebración" fill className="object-cover" priority /><div className="absolute inset-0 bg-foreground/25" /><div className="relative z-10 p-5 pb-7 text-white transition-opacity duration-300 sm:p-6 sm:pb-8 md:p-12 md:pb-14" style={{ opacity: textOpacity }}><p className="mb-5 text-xs uppercase tracking-[0.28em]">Una nueva forma de celebrar</p><h1 className="max-w-4xl text-balance font-serif text-[2.75rem] leading-[0.95] sm:text-5xl md:text-7xl lg:text-8xl">Haz que tu evento sea <em>inolvidable.</em></h1><p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 md:text-lg">Encuentra y aparta todo en un solo lugar. Proveedores verificados, precios transparentes y la tranquilidad de tener Momentum contigo.</p><div className="mt-8 flex flex-wrap gap-3"><Link href="#accessories" className="rounded-full bg-white px-5 py-3 text-sm font-medium text-foreground">Explorar Servicios</Link><Link href="#reserve" className="rounded-full border border-white/50 px-5 py-3 text-sm font-medium text-white backdrop-blur-sm">Apartar Fecha</Link></div></div></div><div className="flex flex-col will-change-transform" style={{ width: `${sideWidth}%`, gap: `${gap}px`, transform: `translateX(${sideTranslateRight}%)`, opacity: imageProgress }}>{renderSide("right")}</div></div></div></div><div className="h-[200vh]" /><div className="px-6 pb-28 pt-32 md:px-12 md:py-48 lg:px-20"><p className="mx-auto max-w-3xl text-center font-serif text-3xl leading-snug text-muted-foreground md:text-5xl">Todo lo que imaginas para tu evento, en un solo lugar.</p></div></section>;
}
