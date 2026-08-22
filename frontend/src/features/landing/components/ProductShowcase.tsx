import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  PhoneCall,
  MessageSquare,
  TrendingUp,
  Terminal,
  Layers,
} from 'lucide-react';
import { ShowcaseModule } from '../types/landing.types';

const SHOWCASE_MODULES: ShowcaseModule[] = [
  {
    id: 'war-room',
    title: 'AI Deal War Room & Strategy Studio',
    subtitle: 'Multi-Agent Consensus & Live Competitor SWOT Matrix',
    tag: 'CONSENSUS ENGINE',
    description:
      'Evaluate critical enterprise deals with autonomous agent debates. Generate real-time buying committee maps, competitive battle-cards, and 1-click tailored proposals.',
    icon: <ShieldAlert className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
    metrics: [
      { label: 'Consensus Verdict', value: 'GO (HIGH WIN PROBABILITY)' },
      { label: 'Risk Factor', value: 'Budget Authority Deficit' },
      { label: 'Competitor Moat', value: '9-Agent Fleet Orchestration' },
    ],
    terminalLogs: [
      '[WAR-ROOM-AGENT] Ingested 3 discovery transcripts and $450k commercial scope.',
      '[STRATEGY-STUDIO] Identified CFO objection: Requires multi-tenant SOC2 Type II.',
      '[PROPOSAL-STUDIO] Generated 3-tier custom proposal with e-signature URL.',
    ],
    mockupContent: (
      <div className="p-4 bg-background border border-border space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <span className="font-bold text-foreground uppercase">DEAL: ACME GLOBAL ($450,000 ARR)</span>
          <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            VERDICT: WINNABLE (88%)
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div className="p-2.5 bg-card border border-border">
            <span className="font-bold text-primary block uppercase">STRENGTHS</span>
            <span className="text-muted-foreground uppercase block mt-1">• 140ms response SLA</span>
            <span className="text-muted-foreground uppercase block">• Pre-built WhatsApp hub</span>
          </div>
          <div className="p-2.5 bg-card border border-border">
            <span className="font-bold text-destructive block uppercase">OBJECTIONS</span>
            <span className="text-muted-foreground uppercase block mt-1">• Security audit delay</span>
            <span className="text-muted-foreground uppercase block">• On-prem requirement</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'voice-ai',
    title: 'Voice AI Call Intelligence Studio',
    subtitle: 'Live Speech Turn Analysis & Realtime Objection Cards',
    tag: 'SPEECH TELEMETRY',
    description:
      'Listen to live sales call streams with turn-by-turn transcription, objection identification, buyer intent classification, and instant CRM sync.',
    icon: <PhoneCall className="w-4 h-4 text-primary" />,
    metrics: [
      { label: 'Speech Turn Latency', value: '80ms' },
      { label: 'Objections Extracted', value: '4 Battle-cards' },
      { label: 'Action Items', value: '3 Tasks Enqueued' },
    ],
    terminalLogs: [
      '[VOICE-AI] Inbound Web Audio stream connected (Sampling: 44.1kHz).',
      '[OBJECTION-RADAR] Competitor mention detected: "Evaluating legacy CRM X".',
      '[BATTLECARD-AI] Pushed live rebuttal: "Multi-agent fleet vs single-agent bot".',
    ],
    mockupContent: (
      <div className="p-4 bg-background border border-border space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-none bg-destructive animate-ping" />
            <span className="font-bold text-foreground uppercase">LIVE CALL: VP OF SALES (ORION CORP)</span>
          </div>
          <span className="text-[10px] text-primary font-bold">04:18 ACTIVE</span>
        </div>
        <div className="p-2.5 bg-card border border-primary/40 space-y-1">
          <span className="text-[9px] font-bold text-primary uppercase block">LIVE OBJECTION BATTLE-CARD</span>
          <p className="text-[11px] text-foreground uppercase leading-relaxed">
            "Highlight our native Redis pub/sub queue and 140ms response speed compared to their 12s polling delay."
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'whatsapp',
    title: 'WhatsApp Business Multi-Agent Hub',
    subtitle: '24/7 AI Auto-Pilot & Meta Cloud API Sync',
    tag: 'OMNICHANNEL CHAT',
    description:
      'Engage leads 24/7 with autonomous conversational AI, voice note recording and transcription, broadcast campaigns, and instant sales rep handoff.',
    icon: <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
    metrics: [
      { label: 'Auto-Pilot Rate', value: '94.2%' },
      { label: 'Avg SLA Time', value: '3.4s' },
      { label: 'Broadcast Status', value: '2,400 Delivered' },
    ],
    terminalLogs: [
      '[WHATSAPP-HUB] Inbound message received from +1 (415) 890-2144.',
      '[AUTO-PILOT] Lead intent classified: REQUEST_ENTERPRISE_PRICING.',
      '[DISPATCH] Automated response sent with SaaS_Tier_Pricing_Matrix_2026.pdf.',
    ],
    mockupContent: (
      <div className="p-4 bg-background border border-border space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <span className="font-bold text-foreground uppercase">WHATSAPP: SARAH CONNOR (CTO)</span>
          <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            AUTO-PILOT ACTIVE
          </span>
        </div>
        <div className="space-y-2">
          <div className="p-2 bg-card border border-border text-[11px] text-muted-foreground uppercase">
            "Can your agents handle both voice calls and WhatsApp follow-ups simultaneously?"
          </div>
          <div className="p-2 bg-card border border-emerald-500/40 text-[11px] text-foreground uppercase">
            "Yes! Our multi-agent fleet synchronizes speech, WhatsApp, and email touchpoints over a unified event bus."
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'forecasting',
    title: 'Stochastic Monte Carlo Revenue Engine',
    subtitle: 'P10, P50 & P90 Confidence Simulations',
    tag: 'PREDICTIVE REVENUE',
    description:
      'Run 10,000 Monte Carlo stochastic ARR iterations based on pipeline stage conversion hazards, historical rep velocities, and contract deal sizes.',
    icon: <TrendingUp className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />,
    metrics: [
      { label: 'P10 Conservative', value: '$3,850,000' },
      { label: 'P50 Expected', value: '$4,820,000' },
      { label: 'P90 Optimistic', value: '$5,940,000' },
    ],
    terminalLogs: [
      '[MONTE-CARLO] Initialized 10,000 stochastic ARR iterations.',
      '[VELOCITY-MATRIX] Stage conversion rate calculated at 68.4%.',
      '[CONFIDENCE-BOUNDS] P10: $3.85M | P50: $4.82M | P90: $5.94M verified.',
    ],
    mockupContent: (
      <div className="p-4 bg-background border border-border space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <span className="font-bold text-foreground uppercase">ARR SIMULATION (10,000 RUNS)</span>
          <span className="text-[10px] text-primary font-bold">99.4% ACCURACY</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
          <div className="p-2 bg-card border border-border">
            <span className="text-muted-foreground block uppercase">P10 (90% CONF)</span>
            <span className="text-foreground font-bold font-mono text-xs mt-0.5">$3.85M</span>
          </div>
          <div className="p-2 bg-card border border-primary">
            <span className="text-primary font-bold block uppercase">P50 EXPECTED</span>
            <span className="text-primary font-black font-mono text-xs mt-0.5">$4.82M</span>
          </div>
          <div className="p-2 bg-card border border-border">
            <span className="text-muted-foreground block uppercase">P90 (10% CONF)</span>
            <span className="text-foreground font-bold font-mono text-xs mt-0.5">$5.94M</span>
          </div>
        </div>
      </div>
    ),
  },
];

export function ProductShowcase() {
  const [activeTab, setActiveTab] = useState<string>('war-room');
  const activeModule = SHOWCASE_MODULES.find((m) => m.id === activeTab) || SHOWCASE_MODULES[0];

  return (
    <section id="showcase" className="py-20 lg:py-28 border-b border-border bg-card font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-none text-[10px] font-bold bg-primary/10 text-primary border border-primary/30 uppercase tracking-widest flex items-center gap-1.5">
              <Layers className="w-3 h-3" />
              INTERACTIVE FLEET SHOWCASE
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-foreground">
            Explore the Specialized AI Command Modules
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground uppercase font-mono leading-relaxed">
            Click across the core operational modules below to preview how autonomous multi-agent reasoning transforms sales execution.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
          {SHOWCASE_MODULES.map((module) => {
            const isActive = activeTab === module.id;
            return (
              <button
                key={module.id}
                onClick={() => setActiveTab(module.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-none text-xs font-bold uppercase transition-none border cursor-pointer ${
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-border hover:text-foreground hover:border-border'
                }`}
              >
                {module.icon}
                <span>{module.title.split('&')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Active Module Showcase Card */}
        <AnimatePresence>
          <motion.div
            key={activeModule.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-background border border-border p-6 sm:p-8 rounded-none shadow-xl"
          >
            {/* Left Column: Description & Telemetry Metrics */}
            <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[9px] font-bold bg-primary/10 text-primary border border-primary/30 uppercase">
                    {activeModule.tag}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase">{activeModule.subtitle}</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-foreground uppercase tracking-wide">
                  {activeModule.title}
                </h3>

                <p className="text-xs sm:text-sm text-muted-foreground uppercase font-mono leading-relaxed">
                  {activeModule.description}
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
                {activeModule.metrics.map((metric) => (
                  <div key={metric.label} className="p-3 bg-card border border-border">
                    <span className="text-[9px] text-muted-foreground uppercase font-bold block">{metric.label}</span>
                    <span className="text-xs sm:text-sm font-black text-primary font-mono block mt-1">
                      {metric.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Interactive Mockup & Simulated Terminal */}
            <div className="lg:col-span-6 space-y-4">
              {/* Visual Mockup Container */}
              <div className="border border-border bg-card rounded-none overflow-hidden">
                <div className="px-3 py-1.5 bg-background border-b border-border flex items-center justify-between text-[10px] text-muted-foreground uppercase">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Terminal className="w-3 h-3 text-primary" />
                    LIVE MODULE PREVIEW
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">SYNCHRONIZED</span>
                </div>
                {activeModule.mockupContent}
              </div>

              {/* Execution Terminal Feed */}
              <div className="p-3 bg-card border border-border space-y-1.5 text-[11px] font-mono">
                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest block border-b border-border pb-1">
                  EXECUTION TRACE LOGS
                </span>
                {activeModule.terminalLogs.map((log, index) => (
                  <div key={index} className="text-muted-foreground uppercase font-mono text-[10px]">
                    <span className="text-primary font-bold">&gt; </span>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
