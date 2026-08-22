import { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { TESTIMONIALS } from '../data/landingData';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';

const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: 'spring' as const, stiffness: 350, damping: 30 },
      opacity: { duration: 0.2 },
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -40 : 40,
    opacity: 0,
    transition: {
      x: { type: 'spring' as const, stiffness: 350, damping: 30 },
      opacity: { duration: 0.2 },
    },
  }),
};

export function TestimonialsSection() {
  const [[currentIndex, direction], setPage] = useState<[number, number]>([0, 0]);

  const paginate = (newDirection: number) => {
    let nextIndex = currentIndex + newDirection;
    if (nextIndex < 0) nextIndex = TESTIMONIALS.length - 1;
    if (nextIndex >= TESTIMONIALS.length) nextIndex = 0;
    setPage([nextIndex, newDirection]);
  };

  const setDirectIndex = (index: number) => {
    if (index === currentIndex) return;
    const newDirection = index > currentIndex ? 1 : -1;
    setPage([index, newDirection]);
  };

  const currentTestimonial = TESTIMONIALS[currentIndex];

  return (
    <section id="case-studies" className="py-20 lg:py-28 border-b border-border bg-card font-mono overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-none text-[10px] font-bold bg-primary/10 text-primary border border-primary/30 uppercase tracking-widest flex items-center gap-1.5">
              <Star className="w-3 h-3" />
              VERIFIABLE ENTERPRISE OUTCOMES
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-foreground">
            Trusted by Revenue Leaders Worldwide
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground uppercase font-mono leading-relaxed">
            See how enterprise revenue teams scale conversion velocity and rescue at-risk ARR with multi-agent orchestration.
          </p>
        </div>

        {/* Testimonials Carousel Container */}
        <div className="max-w-4xl mx-auto bg-background border border-border p-6 sm:p-10 rounded-none shadow-xl relative min-h-[360px] sm:min-h-[320px] flex flex-col justify-between overflow-hidden">
          <div className="relative flex-1 flex flex-col justify-between overflow-hidden">
            <AnimatePresence mode="popLayout" custom={direction} initial={false}>
              <motion.div
                key={currentTestimonial.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6 flex-1 flex flex-col justify-between w-full"
              >
                {/* Quote Top */}
                <div className="flex items-center justify-between">
                  <Quote className="w-8 h-8 text-primary opacity-60 shrink-0" />
                  <div className="p-2.5 bg-card border border-border text-right">
                    <span className="text-[9px] text-muted-foreground uppercase font-bold block">
                      {currentTestimonial.metricLabel}
                    </span>
                    <span className="text-xl font-black text-primary font-mono block">
                      {currentTestimonial.metric}
                    </span>
                  </div>
                </div>

                {/* Quote Body */}
                <blockquote className="text-sm sm:text-base lg:text-lg font-medium text-foreground uppercase leading-relaxed font-mono flex-1">
                  "{currentTestimonial.quote}"
                </blockquote>

                {/* Author Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-border pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-none bg-primary text-primary-foreground font-black text-xs flex items-center justify-center border border-primary font-mono shrink-0">
                      {currentTestimonial.avatarText}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground uppercase tracking-wide">
                        {currentTestimonial.author}
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase font-mono">
                        {currentTestimonial.role} • {currentTestimonial.company}
                      </div>
                    </div>
                  </div>

                  {/* Carousel Controls */}
                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    {/* Direct Page Selector Tabs */}
                    <div className="flex items-center gap-1">
                      {TESTIMONIALS.map((t, idx) => (
                        <button
                          key={t.id}
                          onClick={() => setDirectIndex(idx)}
                          className={`px-2 py-1 text-[10px] font-mono font-bold uppercase transition-none cursor-pointer ${
                            idx === currentIndex
                              ? 'bg-primary text-primary-foreground border border-primary'
                              : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          0{idx + 1}
                        </button>
                      ))}
                    </div>

                    {/* Arrow Navigation */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => paginate(-1)}
                        aria-label="Previous Testimonial"
                        className="p-2 rounded-none bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary transition-none cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => paginate(1)}
                        aria-label="Next Testimonial"
                        className="p-2 rounded-none bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary transition-none cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
