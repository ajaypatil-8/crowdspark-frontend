"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const LenisCtx = createContext<Lenis | null>(null);

export function useLenis() {
  return useContext(LenisCtx);
}

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const instance = new Lenis({
      duration: 1.2,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    const setLenisTimer = window.setTimeout(() => setLenis(instance), 0);

    // stable reference for cleanup
    const rafCallback = (time: number) => instance.raf(time * 1000);
    const scrollCallback = () => ScrollTrigger.update();

    gsap.ticker.add(rafCallback);
    gsap.ticker.lagSmoothing(0);
    instance.on("scroll", scrollCallback);

    return () => {
      window.clearTimeout(setLenisTimer);
      instance.off("scroll", scrollCallback);
      gsap.ticker.remove(rafCallback);
      instance.destroy();
    };
  }, []);

  return (
    <LenisCtx.Provider value={lenis}>
      {children}
    </LenisCtx.Provider>
  );
}
