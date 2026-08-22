import { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap,
  ArrowRight,
  Shield,
  Bot,
  Activity,
  Terminal,
  CheckCircle2,
  Sparkles,
  Radio,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { HERO_STATS } from '../data/landingData';
import { slideUp, staggerContainer } from '@/lib/animations';
import { useAnimatedCounter } from '../hooks/useAnimatedCounter';
import { useSmoothScroll } from '../context/SmoothScrollContext';

interface HeroSectionProps {
  onExploreClick?: () => void;
}

const SIMULATED_AGENT_LOGS = [
  { agent: 'LEAD QUALIFIER', action: 'Scored Enterprise Prospect #9024', status: 'Score: 96/100 (HIGH INTENT)' },
  { agent: 'DEAL WAR ROOM', action: 'Generated SWOT battle-card vs Competitor', status: 'Win-Rate Lift: +48%' },
  { agent: 'VOICE AI INTEL', action: 'Transcribed 18m solutions briefing turn-by-turn', status: 'Objections Handled: 4/4' },
  { agent: 'WHATSAPP AUTO', action: 'Dispatched Tier Pricing Matrix via Meta API', status: 'Delivered: 140ms SLA' },
  { agent: 'CHURN DEFENSE', action: 'Triggered autonomous retention playbook', status: 'ARR Protected: $180,000' },
];

const StatCard = memo(function StatCard({ stat, index }: { stat: (typeof HERO_STATS)[0]; index: number }) {
  // Parse numeric values if any
  let numericTarget = 0;
  let isPercentage = false;
  let isMs = false;
  let isAgents = false;

  if (stat.value.includes('ms')) {
    numericTarget = parseInt(stat.value);
    isMs = true;
  } else if (stat.value.includes('%')) {
    numericTarget = parseFloat(stat.value.replace(/[^0-9.]/g, ''));
    isPercentage = true;
  } else if (stat.value.includes('Agents')) {
    numericTarget = parseInt(stat.value);
    isAgents = true;
  }

  const count = useAnimatedCounter({
    target: numericTarget || 100,
    duration: 1600 + index * 200,
    decimals: isPercentage && stat.value.includes('.') ? 1 : 0,
  });

  const displayValue = isMs
    ? `${count}ms`
    : isPercentage
    ? `${stat.value.startsWith('+') ? '+' : ''}${count}%`
    : isAgents
    ? `${count} Agents`
    : stat.value;

  return (
    <div className="p-4 bg-card border border-border shadow-sm text-center space-y-1 hover:border-primary transition-none">
      <div className="text-2xl sm:text-3xl font-black text-primary font-mono">{displayValue}</div>
      <div className="text-xs font-bold text-foreground uppercase tracking-wider">{stat.label}</div>
      <div className="text-[10px] text-muted-foreground uppercase font-mono">{stat.sub}</div>
    </div>
  );
});

export function HeroSection({ onExploreClick }: HeroSectionProps) {
  const navigate = useNavigate();
  const { scrollTo } = useSmoothScroll();
  const [activeLogIndex, setActiveLogIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveLogIndex((prev) => (prev + 1) % SIMULATED_AGENT_LOGS.length);
    }, 2600);
    return () => clearInterval(interval);
  }, []);

  const handleExplore = () => {
    if (onExploreClick) {
      onExploreClick();
    } else {
      scrollTo('features');
    }
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-border bg-background font-mono">
      {/* Background Subtle Tactical Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Hero Header & Copy */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="text-center max-w-4xl mx-auto space-y-6"
        >
          {/* Live Telemetry Status Badge */}
          <motion.div variants={slideUp} className="inline-flex items-center gap-2">
            <span className="px-3 py-1 rounded-none text-xs font-mono font-bold bg-primary/10 text-primary border border-primary/40 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-none bg-primary animate-pulse" />
              <span>FLEET STATUS: 9 SPECIALIZED AGENTS ONLINE • 140MS RESPONSE SLA</span>
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            variants={slideUp}
            className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-foreground leading-[1.1]"
          >
            The Autonomous{' '}
            <span className="text-primary underline decoration-primary/50 decoration-4 underline-offset-8">
              Multi-Agent CRM
            </span>{' '}
            Fleet for Enterprise Revenue
          </motion.h1>

          {/* Supporting Description */}
          <motion.p
            variants={slideUp}
            className="text-sm sm:text-base lg:text-lg text-muted-foreground uppercase font-mono max-w-3xl mx-auto leading-relaxed"
          >
            Orchestrate specialized AI agents across Live Voice Calls, WhatsApp Auto-Pilot, Deal War Rooms, and Stochastic Monte Carlo Revenue Forecasting with zero manual data entry.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            variants={slideUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2"
          >
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto text-xs uppercase font-mono tracking-wider font-black px-8 py-3 shadow-lg"
            >
              <Zap className="w-4 h-4 mr-2" />
              <span>DEPLOY FREE MULTI-AGENT FLEET</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={handleExplore}
              className="w-full sm:w-auto text-xs uppercase font-mono tracking-wider border-border bg-card hover:bg-muted text-foreground px-6 py-3"
            >
              <span>Explore Fleet Capabilities</span>
            </Button>
          </motion.div>

          {/* Quick reassurance strip */}
          <motion.div
            variants={slideUp}
            className="pt-2 flex flex-wrap items-center justify-center gap-6 text-[11px] uppercase text-muted-foreground font-mono"
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
              <span>No Credit Card Required</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span>SOC2 &amp; RBAC Hardened</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-primary" />
              <span>Full OpenAI &amp; Anthropic Support</span>
            </span>
          </motion.div>
        </motion.div>

        {/* ── Interactive Tactical Dashboard Mockup ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="mt-12 lg:mt-16 max-w-5xl mx-auto border border-border bg-card shadow-2xl rounded-none overflow-hidden font-mono"
        >
          {/* Mockup Top Window Bar */}
          <div className="px-4 py-2.5 bg-background border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-none bg-destructive/80" />
              <div className="w-2.5 h-2.5 rounded-none bg-primary/80" />
              <div className="w-2.5 h-2.5 rounded-none bg-emerald-500/80" />
              <span className="ml-2 text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-1.5">
                <Terminal className="w-3 h-3 text-primary" />
                TACTICAL COMMAND FLEET CONSOLE [LIVE TELEMETRY]
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground uppercase">
              <span className="hidden sm:flex items-center gap-1 text-primary">
                <Radio className="w-3 h-3 animate-pulse" />
                <span>SPECTRUM: 44.1KHZ</span>
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-none bg-emerald-500 animate-ping" />
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">LIVE SYNC ACTIVE</span>
              </div>
            </div>
          </div>

          {/* Mockup Content Grid */}
          <div className="p-4 sm:p-6 bg-card space-y-6">
            {/* KPI Telemetry Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3 bg-background border border-border">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">SIMULATED ARR</span>
                <span className="text-lg sm:text-xl font-black text-foreground font-mono">$4,820,000</span>
                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold uppercase block mt-0.5">+38.4% vs target</span>
              </div>
              <div className="p-3 bg-background border border-border">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">ACTIVE PIPELINE</span>
                <span className="text-lg sm:text-xl font-black text-primary font-mono">$12,450,000</span>
                <span className="text-[9px] text-muted-foreground uppercase block mt-0.5">84 Qualified Deals</span>
              </div>
              <div className="p-3 bg-background border border-border">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">FLEET CONVERSIONS</span>
                <span className="text-lg sm:text-xl font-black text-purple-600 dark:text-purple-400 font-mono">68.4%</span>
                <span className="text-[9px] text-purple-600 dark:text-purple-400 font-bold uppercase block mt-0.5">Autonomous Win Rate</span>
              </div>
              <div className="p-3 bg-background border border-border">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">CHURN DEFENSE RADAR</span>
                <span className="text-lg sm:text-xl font-black text-destructive font-mono">2.1%</span>
                <span className="text-[9px] text-destructive font-bold uppercase block mt-0.5">Zero High-Risk Accounts</span>
              </div>
            </div>

            {/* Live Synchronized Agent Event Stream */}
            <div className="p-4 bg-background border border-border space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-primary" />
                  REAL-TIME MULTI-AGENT EVENT STREAM (/WS/FLEET)
                </span>
                <span className="px-2 py-0.5 text-[9px] font-bold bg-primary/10 text-primary border border-primary/30 uppercase">
                  AUTO-RESOLVING
                </span>
              </div>

              <div className="space-y-2">
                {SIMULATED_AGENT_LOGS.map((log, idx) => {
                  const isActive = idx === activeLogIndex;
                  return (
                    <div
                      key={log.agent}
                      className={`p-2.5 border rounded-none flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 transition-none text-xs ${
                        isActive
                          ? 'bg-muted border-primary text-foreground'
                          : 'bg-transparent border-border text-muted-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 text-[9px] font-bold bg-card border border-border text-primary uppercase">
                          {log.agent}
                        </span>
                        <span className="text-foreground uppercase font-medium">{log.action}</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold uppercase">
                        {log.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mockup Bottom Status Bar */}
          <div className="px-4 py-2 bg-background border-t border-border flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted-foreground uppercase font-mono">
            <span>DATABASE: POSTGRESQL 16 • EVENT BUS: REDIS PUB/SUB • ORM: SQLALCHEMY 2.0</span>
            <span className="text-foreground font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-primary" />
              SMART FALLBACK ACTIVE (OPENAI &amp; ANTHROPIC)
            </span>
          </div>
        </motion.div>

        {/* ── Key Metrics Strip Below Mockup ── */}
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {HERO_STATS.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
