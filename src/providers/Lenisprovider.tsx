"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const LenisCtx = createContext<Lenis | null>(null);

export function useLenis() {
  return useContext(LenisCtx);
}

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration:  1.2,
      easing:    t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    /* wire lenis into GSAP ticker */
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    /* sync ScrollTrigger with lenis */
    lenis.on("scroll", ScrollTrigger.update);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(time => lenis.raf(time * 1000));
    };
  }, []);

  return (
    <LenisCtx.Provider value={lenisRef.current}>
      {children}
    </LenisCtx.Provider>
  );
}