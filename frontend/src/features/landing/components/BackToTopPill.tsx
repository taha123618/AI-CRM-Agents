import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useSmoothScroll } from '../context/SmoothScrollContext';

export function BackToTopPill() {
  const { scrollProgress, scrollTo } = useSmoothScroll();
  const show = scrollProgress > 0.15;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 left-6 z-40 font-mono hidden sm:flex items-center gap-2"
        >
          <button
            onClick={() => scrollTo(0)}
            className="flex items-center gap-2 px-3 py-2 bg-card/90 backdrop-blur-md border border-border hover:border-primary text-foreground text-xs uppercase font-bold shadow-2xl transition-none cursor-pointer group"
            title="Return to top"
          >
            <ArrowUp className="w-3.5 h-3.5 text-primary group-hover:-translate-y-0.5 transition-none" />
            <span>TOP</span>
            <span className="text-[10px] text-muted-foreground font-mono">
              [{Math.round(scrollProgress * 100)}%]
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
