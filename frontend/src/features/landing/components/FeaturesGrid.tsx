import { memo } from 'react';
import { motion } from 'framer-motion';
import { PLATFORM_FEATURES } from '../data/landingData';
import { staggerContainer, slideUp } from '@/lib/animations';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { useSmoothScroll } from '../context/SmoothScrollContext';

interface FeaturesGridProps {
  onSelectFeature?: (featureId: string) => void;
}

export const FeaturesGrid = memo(function FeaturesGrid({ onSelectFeature }: FeaturesGridProps) {
  const { scrollTo } = useSmoothScroll();

  const handleCardClick = (featureId: string) => {
    if (onSelectFeature) {
      onSelectFeature(featureId);
    } else {
      scrollTo('showcase');
    }
  };

  return (
    <section id="capabilities" className="py-20 lg:py-28 border-b border-border bg-background font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-none text-[10px] font-bold bg-primary/10 text-primary border border-primary/30 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              SPECIALIZED MULTI-AGENT CAPABILITIES
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-foreground">
            Engineered for High-Velocity Revenue Fleets
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground uppercase font-mono leading-relaxed">
            Replace manual spreadsheets and disconnected sales tools with a unified multi-agent operating system that executes around the clock.
          </p>
        </div>

        {/* 6 Feature Cards Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {PLATFORM_FEATURES.map((feature) => (
            <motion.div
              key={feature.id}
              variants={slideUp}
              whileHover={{ y: -4 }}
              onClick={() => handleCardClick(feature.id)}
              className="p-6 bg-card border border-border rounded-none shadow-sm flex flex-col justify-between space-y-6 hover:border-primary transition-none cursor-pointer group"
            >
              {/* Card Top */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-background border border-border text-foreground group-hover:border-primary transition-none">
                    {feature.icon}
                  </div>
                  <span className="px-2 py-0.5 text-[9px] font-bold bg-background border border-border text-muted-foreground uppercase font-mono">
                    {feature.badgeText}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                    {feature.category}
                  </span>
                  <h3 className="text-base font-bold text-foreground uppercase tracking-wide mt-1 flex items-center justify-between">
                    <span>{feature.title}</span>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-none" />
                  </h3>
                </div>

                <p className="text-xs text-muted-foreground uppercase font-mono leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Card Bottom Metric */}
              <div className="pt-4 border-t border-border flex items-center justify-between text-xs font-mono">
                <span className="text-[10px] text-muted-foreground uppercase">{feature.statLabel}</span>
                <span className="font-black text-primary text-sm">{feature.statValue}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
});
