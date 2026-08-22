import { motion } from 'framer-motion';
import { TRUSTED_LOGOS } from '../data/landingData';
import { Cpu } from 'lucide-react';

export function TrustedByMarquee() {
  return (
    <section className="py-12 border-b border-border bg-card font-mono overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 text-center">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
          POWERING NEXT-GENERATION ENTERPRISE FLEETS WITH ROBUST INFRASTRUCTURE
        </span>
      </div>

      {/* Ticker Container */}
      <div className="relative w-full flex overflow-x-hidden select-none">
        <motion.div
          className="flex gap-4 shrink-0 items-center justify-around min-w-full"
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            duration: 25,
            ease: 'linear',
            repeat: Infinity,
          }}
        >
          {[...TRUSTED_LOGOS, ...TRUSTED_LOGOS].map((item, index) => (
            <div
              key={`${item.name}-${index}`}
              className="flex items-center gap-2.5 px-4 py-2.5 bg-background border border-border rounded-none shrink-0 shadow-sm hover:border-primary transition-none"
            >
              <div className="p-1.5 bg-card border border-border text-primary">
                <Cpu className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                  {item.name}
                </span>
                <span className="text-[9px] text-muted-foreground uppercase font-mono">
                  {item.type} • {item.label}
                </span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
