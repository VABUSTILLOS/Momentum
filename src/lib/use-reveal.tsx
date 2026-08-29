"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { motion } from "framer-motion";

/**
 * Anima la aparición de un elemento al entrar al viewport (IntersectionObserver).
 * Fallback: si no hay soporte, el contenido se muestra de inmediato.
 */
export function useReveal<T extends HTMLElement>(delay = 0) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || visible) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [visible]);

  const style: CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? "none" : "translateY(18px)",
    transition: "opacity 0.7s ease, transform 0.7s ease",
    transitionDelay: visible ? `${delay}ms` : "0ms",
  };

  return { ref, style, visible };
}

/** Wrapper listo para usar: anima a sus hijos al entrar al viewport (spring suave). */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ type: "spring", stiffness: 64, damping: 18, delay: delay / 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
