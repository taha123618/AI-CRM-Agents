import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PRICING_TIERS } from '../data/landingData';
import { Button } from '@/components/ui/Button';
import { Check, Zap, DollarSign } from 'lucide-react';
import { slideUp, staggerContainer } from '@/lib/animations';

export function PricingSection() {
  const [annualBilling, setAnnualBilling] = useState(true);
  const navigate = useNavigate();

  return (
    <section id="pricing" className="py-20 lg:py-28 border-b border-border bg-background font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-none text-[10px] font-bold bg-primary/10 text-primary border border-primary/30 uppercase tracking-widest flex items-center gap-1.5">
              <DollarSign className="w-3 h-3" />
              TRANSPARENT FLEET TIERS
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-foreground">
            Simple Pricing for Scalable Revenue Operations
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground uppercase font-mono leading-relaxed">
            Deploy specialized multi-agent squads without hidden seat limits or opaque per-token surcharges.
          </p>

          {/* Billing Switcher */}
          <div className="pt-2 flex items-center justify-center gap-3 text-xs uppercase font-bold">
            <span className={!annualBilling ? 'text-foreground' : 'text-muted-foreground'}>
              MONTHLY
            </span>
            <button
              type="button"
              onClick={() => setAnnualBilling(!annualBilling)}
              className="w-12 h-6 rounded-none bg-card border border-border flex items-center p-0.5 cursor-pointer transition-none relative"
            >
              <div
                className={`w-4 h-4 rounded-none bg-primary transition-none ${
                  annualBilling ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <div className="flex items-center gap-1.5">
              <span className={annualBilling ? 'text-foreground' : 'text-muted-foreground'}>
                ANNUAL BILLING
              </span>
              <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                SAVE 20%
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch"
        >
          {PRICING_TIERS.map((tier) => {
            const price = annualBilling ? tier.annualPrice : tier.monthlyPrice;
            const isPopular = tier.popular;

            return (
              <motion.div
                key={tier.id}
                variants={slideUp}
                className={`p-6 sm:p-8 rounded-none flex flex-col justify-between space-y-6 transition-none relative ${
                  isPopular
                    ? 'bg-card border-2 border-primary shadow-xl'
                    : 'bg-card border border-border shadow-sm hover:border-primary'
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest border border-primary">
                    RECOMMENDED FLEET
                  </div>
                )}

                <div className="space-y-6">
                  {/* Title & Tagline */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black text-foreground uppercase tracking-wide">
                        {tier.name}
                      </h3>
                      {tier.badge && (
                        <span className="px-2 py-0.5 text-[9px] font-bold bg-background border border-border text-muted-foreground uppercase">
                          {tier.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground uppercase leading-relaxed font-mono">
                      {tier.tagline}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 border-b border-border pb-4">
                    <span className="text-3xl sm:text-4xl font-black text-foreground font-mono">
                      ${price}
                    </span>
                    <span className="text-xs text-muted-foreground uppercase font-mono">
                      / month {annualBilling ? '(billed annually)' : ''}
                    </span>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-2.5 text-xs font-mono">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                      INCLUDED CAPABILITIES:
                    </span>
                    {tier.features.map((feature, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2 uppercase">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span className="text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <div className="pt-4 border-t border-border">
                  <Button
                    variant={tier.ctaVariant}
                    size="md"
                    onClick={() => navigate('/register')}
                    className={`w-full text-xs uppercase font-mono font-bold tracking-wider ${
                      isPopular ? 'shadow-lg' : 'border-border bg-background hover:bg-muted text-foreground'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 mr-1" />
                    <span>{tier.ctaLabel}</span>
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
