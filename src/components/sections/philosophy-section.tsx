"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";

export function PhilosophySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [opacity, setOpacity] = useState(1);
  const [lift, setLift] = useState(0);
  const raf = useRef<number | null>(null);

  const update = useCallback(() => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, -rect.top / (sectionRef.current.offsetHeight - window.innerHeight)));
    setOpacity(1 - progress);
    setLift(progress * 40);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [update]);

  return (
    <section id="products" className="bg-background">
      <div ref={sectionRef} className="relative" style={{ height: "200vh" }}>
        <div className="sticky top-0 flex min-h-screen items-center justify-center overflow-hidden">
          <div className="w-full">
            <div className="mx-auto max-w-4xl px-6 text-center" style={{ opacity }}>
              <h2 className="font-serif text-[12vw] leading-[0.95] tracking-tighter text-foreground md:text-[10vw] lg:text-[8vw]">
                Celebra a tu manera.
              </h2>
            </div>
            <div
              className="mt-6 grid grid-cols-1 gap-4 px-6 md:mt-10 md:grid-cols-2 md:px-12 lg:px-20"
              style={{ transform: `translate3d(0, ${lift}px, 0)` }}
            >
              <div className="relative aspect-[4/3] max-h-[38vh] overflow-hidden rounded-2xl md:max-h-none">
                <Image
                  src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1400&q=85"
                  alt="Música y DJ para eventos"
                  fill
                  className="object-cover"
                />
                <span className="absolute bottom-6 left-6 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
                  Música y DJ
                </span>
              </div>
              <div className="relative aspect-[4/3] max-h-[38vh] overflow-hidden rounded-2xl md:max-h-none">
                <Image
                  src="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1400&q=85"
                  alt="Catering y banquetes"
                  fill
                  className="object-cover"
                />
                <span className="absolute bottom-6 left-6 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
                  Catering Premium
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="px-6 py-20 md:px-12 md:py-28 lg:px-20 lg:py-36">
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Momentum marketplace</p>
          <p className="mt-8 text-center text-3xl leading-relaxed text-muted-foreground">
            Música, banquetes, foto, video, venues y decoración. Planea cada detalle con proveedores verificados y
            cotizaciones claras.
          </p>
        </div>
      </div>
    </section>
  );
}
