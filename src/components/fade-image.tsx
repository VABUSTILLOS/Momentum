"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";

interface FadeImageProps extends Omit<ImageProps, "onLoad" | "ref"> {
  fadeDelay?: number;
}

export function FadeImage({ className, fadeDelay = 0, ...props }: FadeImageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Fallback para imágenes ya cacheadas/completas antes de montarse
  // o que no disparan onLoad (el evento se pierde si ya cargaron).
  useEffect(() => {
    if (imgRef.current?.complete) {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    if (imgRef.current?.complete) {
      setIsLoaded(true);
      return;
    }
    const id = window.setInterval(() => {
      if (imgRef.current?.complete) {
        setIsLoaded(true);
        window.clearInterval(id);
      }
    }, 150);
    return () => window.clearInterval(id);
  }, [isVisible]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reveal = () => {
      setTimeout(() => {
        setIsVisible(true);
      }, fadeDelay);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          reveal();
          observer.disconnect();
          window.removeEventListener("scroll", onScroll);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
      }
    );

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        reveal();
        observer.disconnect();
        window.removeEventListener("scroll", onScroll);
      }
    };

    observer.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [fadeDelay]);

  return (
    <div ref={ref} className="relative h-full w-full">
      <Image
        ref={imgRef}
        {...props}
        className={`${className || ""} transition-all duration-700 ease-out ${
          isVisible && isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-[1.02]"
        }`}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
}
