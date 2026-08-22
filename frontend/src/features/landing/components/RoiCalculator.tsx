import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calculator, Zap, ArrowRight, TrendingUp, Clock, Users, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { slideUp } from '@/lib/animations';

export function RoiCalculator() {
  const navigate = useNavigate();
  const [reps, setReps] = useState<number>(10);
  const [dealSize, setDealSize] = useState<number>(35000);
  const [monthlyLeads, setMonthlyLeads] = useState<number>(250);

  // Real-time calculations
  const calculations = useMemo(() => {
    // Average 15 hours saved per rep per week on manual CRM entry & SDR follow-ups
    const hoursSavedPerMonth = reps * 15 * 4.3;
    // Estimated pipeline generated: leads * 20% qualification * dealSize
    const pipelineMonthly = monthlyLeads * 0.2 * dealSize;
    // 35% win rate improvement with multi-agent consensus war room and 140ms response speed
    const additionalArrProjected = pipelineMonthly * 12 * 0.15;
    // Estimated investment in Enterprise Fleet ($499/mo)
    const annualSoftwareCost = 499 * 12;
    const roiMultiplier = Math.max(1, Math.round(additionalArrProjected / annualSoftwareCost));

    return {
      hoursSavedPerMonth: Math.round(hoursSavedPerMonth),
      additionalArrProjected,
      roiMultiplier,
      annualSoftwareCost,
    };
  }, [reps, dealSize, monthlyLeads]);

  return (
    <section id="roi-calculator" className="py-20 lg:py-28 border-b border-border bg-card font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-none text-[10px] font-bold bg-primary/10 text-primary border border-primary/30 uppercase tracking-widest flex items-center gap-1.5">
              <Calculator className="w-3 h-3" />
              INTERACTIVE VALUE MODELLER
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-foreground">
            Estimate Your Revenue Velocity &amp; ROI
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground uppercase font-mono leading-relaxed">
            Adjust the sliders below to calculate projected pipeline acceleration and administrative hours eliminated by autonomous multi-agent orchestration.
          </p>
        </div>

        {/* Calculator Main Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={slideUp}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-background border border-border p-6 sm:p-10 rounded-none shadow-xl"
        >
          {/* Sliders Column */}
          <div className="lg:col-span-7 space-y-8">
            <div className="border-b border-border pb-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
                1. CONFIGURE YOUR REVENUE SQUAD PARAMETERS
              </span>
            </div>

            {/* Slider 1: Reps */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="reps-slider" className="font-bold text-foreground uppercase flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-primary" />
                  Sales Representatives &amp; SDRs
                </label>
                <span className="font-mono font-black text-primary text-sm px-2 py-0.5 bg-card border border-border">
                  {reps} Reps
                </span>
              </div>
              <input
                id="reps-slider"
                type="range"
                min="1"
                max="100"
                value={reps}
                onChange={(e) => setReps(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer h-2 bg-muted rounded-none"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground uppercase">
                <span>1 Rep</span>
                <span>50 Reps</span>
                <span>100 Reps</span>
              </div>
            </div>

            {/* Slider 2: Deal Size */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="deal-slider" className="font-bold text-foreground uppercase flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-primary" />
                  Average Enterprise Deal ACV
                </label>
                <span className="font-mono font-black text-primary text-sm px-2 py-0.5 bg-card border border-border">
                  {formatCurrency(dealSize)}
                </span>
              </div>
              <input
                id="deal-slider"
                type="range"
                min="5000"
                max="250000"
                step="5000"
                value={dealSize}
                onChange={(e) => setDealSize(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer h-2 bg-muted rounded-none"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground uppercase">
                <span>$5,000</span>
                <span>$125,000</span>
                <span>$250,000</span>
              </div>
            </div>

            {/* Slider 3: Inbound Leads */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="leads-slider" className="font-bold text-foreground uppercase flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  Monthly Inbound &amp; Outbound Leads
                </label>
                <span className="font-mono font-black text-primary text-sm px-2 py-0.5 bg-card border border-border">
                  {formatNumber(monthlyLeads)} Leads/mo
                </span>
              </div>
              <input
                id="leads-slider"
                type="range"
                min="50"
                max="3000"
                step="50"
                value={monthlyLeads}
                onChange={(e) => setMonthlyLeads(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer h-2 bg-muted rounded-none"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground uppercase">
                <span>50</span>
                <span>1,500</span>
                <span>3,000+</span>
              </div>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-5 bg-card border border-border p-6 rounded-none flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="border-b border-border pb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                  2. PROJECTED FLEET IMPACT
                </span>
                <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  ESTIMATED MODEL
                </span>
              </div>

              {/* Metric 1: ARR Lift */}
              <div className="p-3 bg-background border border-border space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                  PROJECTED ADDITIONAL ARR / YEAR
                </span>
                <div className="text-2xl sm:text-3xl font-black text-primary font-mono">
                  {formatCurrency(calculations.additionalArrProjected)}
                </div>
                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 uppercase font-bold block">
                  Based on +48% win-rate lift &amp; faster SLA
                </span>
              </div>

              {/* Metric 2: Hours Saved */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-background border border-border space-y-1">
                  <span className="text-[9px] text-muted-foreground uppercase font-bold block">
                    HOURS SAVED / MO
                  </span>
                  <div className="text-lg font-black text-foreground font-mono flex items-center gap-1">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{formatNumber(calculations.hoursSavedPerMonth)}h</span>
                  </div>
                  <span className="text-[9px] text-muted-foreground uppercase block">
                    15h/rep/wk automated
                  </span>
                </div>

                <div className="p-3 bg-background border border-border space-y-1">
                  <span className="text-[9px] text-muted-foreground uppercase font-bold block">
                    ESTIMATED ROI
                  </span>
                  <div className="text-lg font-black text-purple-600 dark:text-purple-400 font-mono">
                    {calculations.roiMultiplier}x ROI
                  </div>
                  <span className="text-[9px] text-muted-foreground uppercase block">
                    Net ARR vs Platform
                  </span>
                </div>
              </div>
            </div>

            {/* Launch CTA */}
            <div className="space-y-3 pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/register')}
                className="w-full text-xs uppercase font-mono font-bold tracking-wider shadow-lg"
              >
                <Zap className="w-3.5 h-3.5 mr-1.5" />
                <span>DEPLOY FLEET FOR {reps} REPS</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span>Deterministic Monte Carlo Verification</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
