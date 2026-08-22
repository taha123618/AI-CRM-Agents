import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface SmoothScrollContextType {
  lenis: Lenis | null;
  scrollTo: (target: string | HTMLElement | number, options?: { offset?: number; duration?: number; immediate?: boolean }) => void;
  scrollProgress: number;
  scrollVelocity: number;
}

const SmoothScrollContext = createContext<SmoothScrollContextType>({
  lenis: null,
  scrollTo: () => {},
  scrollProgress: 0,
  scrollVelocity: 0,
});

interface SmoothScrollProviderProps {
  children: React.ReactNode;
  enabled?: boolean;
}

export function SmoothScrollProvider({ children, enabled = true }: SmoothScrollProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollVelocity, setScrollVelocity] = useState(0);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Respect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential smooth decel
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.05,
      touchMultiplier: 1.5,
    });

    lenisRef.current = lenis;

    // Synchronize Lenis scroll position with GSAP ScrollTrigger
    lenis.on('scroll', (e: { progress: number; velocity: number }) => {
      ScrollTrigger.update();
      setScrollProgress(e.progress);
      setScrollVelocity(e.velocity);
    });

    const updateTicker = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [enabled]);

  const scrollTo = useCallback((target: string | HTMLElement | number, options?: { offset?: number; duration?: number; immediate?: boolean }) => {
    let elementToScroll: HTMLElement | null = null;
    let targetHash = '';

    if (typeof target === 'string') {
      const cleanId = target.replace(/^#/, '').toLowerCase().trim();
      targetHash = cleanId;

      // Map common navigation aliases to matching section IDs
      const aliasMap: Record<string, string[]> = {
        capabilities: ['capabilities', 'features'],
        features: ['capabilities', 'features'],
        showcase: ['showcase', 'fleet-showcase', 'modules'],
        architecture: ['architecture', 'architecture-specs', 'specs'],
        workflow: ['workflow', 'how-it-works', 'loop'],
        'how-it-works': ['workflow', 'how-it-works', 'loop'],
        'roi-calculator': ['roi-calculator', 'roi-modeller', 'roi', 'calculator'],
        'roi-modeller': ['roi-calculator', 'roi-modeller', 'roi', 'calculator'],
        'case-studies': ['case-studies', 'testimonials', 'outcomes'],
        testimonials: ['case-studies', 'testimonials', 'outcomes'],
        pricing: ['pricing', 'tiers', 'plans'],
        faq: ['faq', 'questions'],
      };

      const candidates = aliasMap[cleanId] || [cleanId];

      for (const candidate of candidates) {
        const found = document.getElementById(candidate);
        if (found) {
          elementToScroll = found;
          break;
        }
      }

      // If still not found, try querySelector
      if (!elementToScroll) {
        try {
          elementToScroll = document.querySelector(target.startsWith('#') ? target : `#${target}`);
        } catch {
          // ignore invalid selector
        }
      }

      // Update URL hash cleanly without page reload if in browser
      if (typeof window !== 'undefined' && targetHash && window.history?.replaceState) {
        try {
          window.history.replaceState(null, '', `#${targetHash}`);
        } catch {
          // ignore history errors
        }
      }
    } else if (target instanceof HTMLElement) {
      elementToScroll = target;
    }

    if (elementToScroll) {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(elementToScroll, {
          offset: options?.offset ?? -70, // header clearance
          duration: options?.duration ?? 1.2,
          immediate: options?.immediate ?? false,
        });
      } else {
        elementToScroll.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else if (typeof target === 'number') {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(target, {
          offset: options?.offset ?? 0,
          duration: options?.duration ?? 1.2,
          immediate: options?.immediate ?? false,
        });
      } else if (typeof window !== 'undefined') {
        window.scrollTo({ top: target, behavior: 'smooth' });
      }
    }
  }, []);

  return (
    <SmoothScrollContext.Provider
      value={{
        lenis: lenisRef.current,
        scrollTo,
        scrollProgress,
        scrollVelocity,
      }}
    >
      {children}
    </SmoothScrollContext.Provider>
  );
}

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}
