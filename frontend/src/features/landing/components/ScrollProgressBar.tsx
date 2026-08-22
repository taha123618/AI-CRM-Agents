import { useSmoothScroll } from '../context/SmoothScrollContext';

export function ScrollProgressBar() {
  const { scrollProgress } = useSmoothScroll();

  return (
    <div className="fixed top-0 left-0 w-full h-[3px] bg-border/40 z-[60] pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-primary via-amber-400 to-primary transition-all duration-75 ease-out shadow-[0_0_8px_rgba(255,184,0,0.6)]"
        style={{ width: `${Math.min(100, Math.max(0, scrollProgress * 100))}%` }}
      />
    </div>
  );
}
