import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Cpu,
  Database,
  Shield,
  Layers,
  Terminal,
  Code2,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { slideUp, staggerContainer } from '@/lib/animations';

const ARCHITECTURE_PILLARS = [
  {
    title: '1. Event Ingestion & Pub/Sub Bus',
    category: 'Low-Latency Transport',
    icon: <Zap className="w-5 h-5 text-primary" />,
    specs: [
      'Sub-millisecond Redis Pub/Sub inter-agent bus',
      'Unified WebSocket stream (/ws) with ConnectionManager',
      'Gmail SMTP on port 587 with STARTTLS & RFC-5321 verification',
      'Meta Cloud API webhook synchronization for WhatsApp',
    ],
  },
  {
    title: '2. Multi-Agent Reasoning Swarm',
    category: 'AI Orchestration Layer',
    icon: <Cpu className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
    specs: [
      'Custom BaseAgent architecture with TraceMixin token traces',
      'SmartFallbackLLM dynamically routing between OpenAI and Anthropic',
      'Live speech turn analysis with Web Audio API capture',
      'Stochastic 10,000-run Monte Carlo simulation engine',
    ],
  },
  {
    title: '3. Resilient Persistence & Worker',
    category: 'Data & Task Pipeline',
    icon: <Database className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
    specs: [
      'PostgreSQL 14+ with SQLAlchemy 2.0 ORM & Alembic migrations',
      'Asynchronous task queue with exponential backoff retries',
      'Standalone worker.py daemon process for background jobs',
      'Optimized indexed queries on email, stage, and tenant IDs',
    ],
  },
  {
    title: '4. Enterprise Cybersecurity Hardening',
    category: 'Zero-Trust Defense',
    icon: <Shield className="w-5 h-5 text-destructive" />,
    specs: [
      'Strict SecurityHeadersMiddleware (CSP, HSTS, X-Frame DENY)',
      'Outbound SSRF validation blocking private/loopback addresses',
      'CSV formula injection sanitization on all exports',
      'Fine-grained RBAC with HTTP-Only secure cookie token rotation',
    ],
  },
];

const SAMPLE_PAYLOAD = {
  event_id: "evt_9024_exec",
  agent_sender: "WarRoomStrategistAgent",
  action: "MULTI_AGENT_CONSENSUS_REACHED",
  telemetry: {
    deal_id: "deal_acme_450k",
    win_probability: 0.88,
    simulated_runs: 10000,
    sla_latency_ms: 140,
    llm_provider: "claude-3-5-sonnet-20241022",
    fallback_engaged: false
  },
  verdict: {
    status: "APPROVED_FOR_PROPOSAL_DISPATCH",
    risk_level: "LOW",
    action_items_enqueued: 3
  }
};

export function ArchitectureSpecs() {
  const [activeTab, setActiveTab] = useState<'specs' | 'payload'>('specs');

  return (
    <section id="architecture" className="py-20 lg:py-28 border-b border-border bg-background font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-none text-[10px] font-bold bg-primary/10 text-primary border border-primary/30 uppercase tracking-widest flex items-center gap-1.5">
              <Layers className="w-3 h-3" />
              ENTERPRISE ARCHITECT BLUEPRINT
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-foreground">
            Hardened Multi-Agent System Architecture
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground uppercase font-mono leading-relaxed">
            Built from the ground up for strict isolation, deterministic persistence, and sub-second agent collaboration across all customer touchpoints.
          </p>

          {/* Toggle View */}
          <div className="pt-2 flex justify-center gap-2">
            <button
              onClick={() => setActiveTab('specs')}
              className={`px-3 py-1.5 text-xs font-bold uppercase transition-none border cursor-pointer ${
                activeTab === 'specs'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              System Pillars
            </button>
            <button
              onClick={() => setActiveTab('payload')}
              className={`px-3 py-1.5 text-xs font-bold uppercase transition-none border cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'payload'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Event Packet Schema</span>
            </button>
          </div>
        </div>

        {/* View 1: 4 Pillars Grid */}
        {activeTab === 'specs' && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {ARCHITECTURE_PILLARS.map((pillar) => (
              <motion.div
                key={pillar.title}
                variants={slideUp}
                className="p-6 sm:p-8 bg-card border border-border rounded-none shadow-sm space-y-6 hover:border-primary transition-none"
              >
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-background border border-border text-foreground">
                      {pillar.icon}
                    </div>
                    <div>
                      <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block">
                        {pillar.category}
                      </span>
                      <h3 className="text-base font-bold text-foreground uppercase tracking-wide">
                        {pillar.title}
                      </h3>
                    </div>
                  </div>
                </div>

                <ul className="space-y-3 text-xs text-muted-foreground font-mono">
                  {pillar.specs.map((spec, sIdx) => (
                    <li key={sIdx} className="flex items-start gap-2 uppercase">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-foreground">{spec}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* View 2: Live Event Packet JSON Viewer */}
        {activeTab === 'payload' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto border border-border bg-card shadow-2xl rounded-none overflow-hidden"
          >
            <div className="px-4 py-2 bg-background border-b border-border flex items-center justify-between text-[10px] text-muted-foreground uppercase">
              <span className="flex items-center gap-1.5 font-bold">
                <Terminal className="w-3 h-3 text-primary" />
                SCHEMA: CRM_AGENT_EVENT_PACKET_V2.JSON
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">VERIFIED RFC-JSON</span>
            </div>
            <div className="p-6 bg-background overflow-x-auto text-xs font-mono">
              <pre className="text-primary leading-relaxed">
                {JSON.stringify(SAMPLE_PAYLOAD, null, 2)}
              </pre>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
