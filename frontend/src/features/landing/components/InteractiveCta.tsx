import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Zap, ArrowRight, ShieldCheck, Terminal, Bot, Sparkles } from 'lucide-react';
import { slideUp } from '@/lib/animations';

export function InteractiveCta() {
  const navigate = useNavigate();

  return (
    <section className="py-20 lg:py-28 border-b border-border bg-background font-mono relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={slideUp}
          className="p-8 sm:p-12 bg-card border-2 border-primary shadow-2xl rounded-none text-center space-y-8"
        >
          {/* Top Status Badge */}
          <div className="inline-flex items-center gap-2">
            <span className="px-3 py-1 text-xs font-black bg-primary text-primary-foreground uppercase tracking-widest flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5" />
              <span>COMMENCE ENTERPRISE MULTI-AGENT TRIAL</span>
            </span>
          </div>

          {/* Headline */}
          <div className="space-y-3 max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-foreground">
              Ready to Put Your Sales Operations on Autonomous Auto-Pilot?
            </h2>
            <p className="text-xs sm:text-base text-muted-foreground uppercase font-mono leading-relaxed">
              Deploy the 9-agent CRM fleet today. Eliminate administrative toil, increase pipeline velocity by 340%, and achieve deterministic revenue visibility.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto text-xs uppercase font-mono tracking-wider font-black px-8 py-3.5 shadow-xl"
            >
              <Zap className="w-4 h-4 mr-2" />
              <span>DEPLOY FREE MULTI-AGENT FLEET</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto text-xs uppercase font-mono tracking-wider border-border bg-background hover:bg-muted text-foreground px-6 py-3.5"
            >
              <span>ACCESS COMMAND CONSOLE</span>
            </Button>
          </div>

          {/* Guarantee Badges */}
          <div className="pt-4 border-t border-border flex flex-wrap items-center justify-center gap-6 text-[11px] text-muted-foreground uppercase font-mono">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>Zero Risk • 14-Day Full Access</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-primary" />
              <span>Instant Workspace Provisioning</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>100% Data Sovereignty</span>
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
