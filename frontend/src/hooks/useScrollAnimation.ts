import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>(
  animationCallback: (element: T, ctx: gsap.Context) => void,
  deps: any[] = []
) {
  const elementRef = useRef<T | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !elementRef.current) return;

    const ctx = gsap.context(() => {
      if (elementRef.current) {
        animationCallback(elementRef.current, ctx);
      }
    }, elementRef);

    return () => {
      ctx.revert();
    };
  }, deps);

  return elementRef;
}
