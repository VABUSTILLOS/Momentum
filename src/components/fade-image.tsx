"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";

interface FadeImageProps extends Omit<ImageProps, "onLoad" | "ref"> {
  fadeDelay?: number;
}

export function FadeImage({ className, fadeDelay = 0, ...props }: FadeImageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
      // Reveal when the element is in view OR has already scrolled past the
      // top of the viewport. On fast/smooth scrolls an element can jump past
      // the viewport between frames; requiring it to be inside the viewport
      // would leave it stuck at opacity 0 forever.
      if (rect.top < window.innerHeight + 100) {
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
        {...props}
        className={`${className || ""} transition-all duration-700 ease-out ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-[1.02]"
        }`}
      />
    </div>
  );
}
