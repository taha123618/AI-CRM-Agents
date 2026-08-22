import { motion } from 'framer-motion';
import { HOW_IT_WORKS_STEPS } from '../data/landingData';
import { slideUp, staggerContainer } from '@/lib/animations';
import { Check, Workflow } from 'lucide-react';

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28 border-b border-border bg-background font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-none text-[10px] font-bold bg-primary/10 text-primary border border-primary/30 uppercase tracking-widest flex items-center gap-1.5">
              <Workflow className="w-3 h-3" />
              THE AUTONOMOUS EXECUTION LOOP
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-foreground">
            How the Multi-Agent Engine Operates
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground uppercase font-mono leading-relaxed">
            From raw signal ingestion to closed revenue, explore the 4-phase automated intelligence loop that runs continuously across your pipeline.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative"
        >
          {HOW_IT_WORKS_STEPS.map((step) => (
            <motion.div
              key={step.step}
              variants={slideUp}
              className="p-6 bg-card border border-border rounded-none shadow-sm flex flex-col justify-between space-y-6 hover:border-primary transition-none relative group"
            >
              <div className="space-y-4">
                {/* Step number badge & icon */}
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black text-primary font-mono tracking-tighter">
                    {step.step}
                  </span>
                  <div className="p-2.5 bg-background border border-border text-primary group-hover:border-primary transition-none">
                    {step.icon}
                  </div>
                </div>

                <div>
                  <span className="px-2 py-0.5 text-[9px] font-bold bg-background border border-border text-muted-foreground uppercase block w-fit mb-2">
                    {step.badge}
                  </span>
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
                    {step.title}
                  </h3>
                </div>

                <p className="text-xs text-muted-foreground uppercase font-mono leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Sub bullets */}
              <div className="pt-4 border-t border-border space-y-1.5 text-[10px] text-muted-foreground font-mono">
                {step.subBullets.map((bullet, bIdx) => (
                  <div key={bIdx} className="flex items-start gap-1.5 uppercase">
                    <Check className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
