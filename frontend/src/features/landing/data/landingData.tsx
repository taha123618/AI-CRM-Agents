import {
  PhoneCall,
  MessageSquare,
  TrendingUp,
  ShieldAlert,
  Send,
  HeartHandshake,
  Bot,
  Zap,
  Flame,
  Database,
} from 'lucide-react';
import {
  FeatureItem,
  HowItWorksStep,
  TestimonialItem,
  PricingTier,
} from '../types/landing.types';

export const HERO_STATS = [
  { label: 'Autonomous SLA Speed', value: '140ms', sub: 'Zero latency response' },
  { label: 'Pipeline Velocity Boost', value: '+340%', sub: 'Multi-agent cadences' },
  { label: 'Live Agent Fleets', value: '9 Agents', sub: 'Synchronized event bus' },
  { label: 'Forecast Accuracy', value: '99.4%', sub: 'P10-P90 Monte Carlo' },
];

export const TRUSTED_LOGOS = [
  { name: 'OpenAI API', label: 'GPT-4o & Function Calling', type: 'AI Infrastructure' },
  { name: 'Anthropic', label: 'Claude 3.5 Sonnet Fleet', type: 'Reasoning Engine' },
  { name: 'Meta Llama', label: 'Sovereign On-Prem Fleet', type: 'Open Weights' },
  { name: 'PostgreSQL 16', label: 'SQLAlchemy 2.0 ORM', type: 'Relational DB' },
  { name: 'Redis Pub/Sub', label: 'Sub-Millisecond Bus', type: 'Event Broker' },
  { name: 'FastAPI', label: 'Async Python Backend', type: 'API Framework' },
  { name: 'Docker', label: 'Container Orchestration', type: 'DevOps' },
  { name: 'TanStack Query', label: 'Realtime UI Sync', type: 'Frontend Engine' },
];

export const PLATFORM_FEATURES: FeatureItem[] = [
  {
    id: 'voice-ai',
    title: 'Voice AI Call Intelligence',
    category: 'Realtime Telemetry',
    description:
      'Real-time live speech turn-by-turn analysis, intent scoring, objection battle-cards, and post-call automated CRM synthesis.',
    icon: <PhoneCall className="w-5 h-5 text-primary" />,
    statLabel: 'Call Synthesis SLA',
    statValue: '2.4s',
    accentColor: 'border-primary/40',
    badgeText: 'AUDIO TELEMETRY',
  },
  {
    id: 'whatsapp-hub',
    title: 'WhatsApp Multi-Agent Hub',
    category: 'Omnichannel Chat',
    description:
      '24/7 AI Auto-Pilot lead qualification, broadcast template messaging campaigns, conversation tagging, and seamless human-in-the-loop handoff.',
    icon: <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
    statLabel: 'Auto-Pilot Rate',
    statValue: '94.2%',
    accentColor: 'border-emerald-500/40',
    badgeText: 'META CLOUD API',
  },
  {
    id: 'war-room',
    title: 'AI Deal War Room & Strategy Studio',
    category: 'Consensus Engine',
    description:
      'Multi-agent consensus verdicts, live competitor SWOT quadrant matrices, buying committee mapping, and 1-click tailored proposal generation.',
    icon: <ShieldAlert className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
    statLabel: 'Win-Rate Lift',
    statValue: '+48%',
    accentColor: 'border-purple-500/40',
    badgeText: 'MULTI-AGENT DEBATE',
  },
  {
    id: 'forecasting',
    title: 'Monte Carlo Revenue Forecasting',
    category: 'Predictive ML',
    description:
      'Stochastic 10,000-run ARR simulations calculating P10 conservative, P50 expected, and P90 optimistic revenue bounds with pipeline velocity hazard matrices.',
    icon: <TrendingUp className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />,
    statLabel: 'Simulation Runs',
    statValue: '10,000',
    accentColor: 'border-cyan-500/40',
    badgeText: 'STOCHASTIC MATH',
  },
  {
    id: 'sequences',
    title: 'AI SDR Outreach & Cadence Studio',
    category: 'Autonomous Outreach',
    description:
      'Omnichannel cadences across Email, WhatsApp, and Voice AI briefings with dynamic cohort enrollment and live context-aware prompt generation.',
    icon: <Send className="w-5 h-5 text-amber-500" />,
    statLabel: 'Reply Rate Lift',
    statValue: '3.8x',
    accentColor: 'border-amber-500/40',
    badgeText: 'MULTI-TOUCH SDR',
  },
  {
    id: 'journey-churn',
    title: 'Autonomous Retention & Churn Radar',
    category: 'Customer Success',
    description:
      'Telemetry-guided lifecycle progression from onboarding to renewal, real-time churn probability radar, and 1-click automated rescue playbooks.',
    icon: <HeartHandshake className="w-5 h-5 text-destructive" />,
    statLabel: 'ARR Protected',
    statValue: '$4.2M',
    accentColor: 'border-destructive/40',
    badgeText: 'CHURN DEFENSE',
  },
];

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    step: '01',
    title: 'Telemetry Ingestion & Signal Capture',
    description:
      'Inbound emails, WhatsApp chats, live sales call audio streams, and web events are ingested in real-time through the WebSocket & Redis event broker.',
    badge: 'EVENT STREAM',
    subBullets: [
      'Sub-millisecond WebSocket event bus',
      'RFC-5321 verified SMTP queue',
      'Web Audio spectrum capture',
    ],
    icon: <Database className="w-5 h-5 text-primary" />,
  },
  {
    step: '02',
    title: 'Multi-Agent Collaborative Reasoning',
    description:
      'Specialized agents (Lead Qualification, Email Intelligence, War Room Strategist, Customer Success) synthesize inputs and execute TraceMixin LLM thinking.',
    badge: 'PARALLEL CONSENSUS',
    subBullets: [
      'Transparent reasoning trace & token accounting',
      'Smart fallback between OpenAI and Anthropic',
      'Dynamic SWOT & objection generation',
    ],
    icon: <Bot className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
  },
  {
    step: '03',
    title: 'Autonomous Action & Orchestrated Execution',
    description:
      'Agents trigger qualified SDR sequences, draft high-conversion email proposals, schedule calendar slots, and execute churn mitigation playbooks.',
    badge: 'ZERO MANUAL TOIL',
    subBullets: [
      'Asynchronous task queue with exponential backoff',
      '1-Click Proposal Studio with SLA terms',
      'WhatsApp Auto-Pilot replies',
    ],
    icon: <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
  },
  {
    step: '04',
    title: 'Continuous Revenue & Pipeline Compounding',
    description:
      'All closed deals and lifecycle touchpoints feed into Monte Carlo ARR progression models and fine-tune agent behavior across the entire CRM fleet.',
    badge: 'COMPOUNDING ARR',
    subBullets: [
      'Stochastic P10/P50/P90 confidence bands',
      'Stage velocity & hazard conversion matrix',
      'Automated audit logs & governance trail',
    ],
    icon: <Flame className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />,
  },
];

export const TESTIMONIALS: TestimonialItem[] = [
  {
    id: '1',
    quote:
      'Deploying the AI-Powered CRM Multi-Agent fleet eliminated 85% of our manual sales admin work. Our SDR team doubled their pipeline capacity in 3 weeks, and our win-rate jumped by 48%.',
    author: 'Elena Rostova',
    role: 'Chief Revenue Officer',
    company: 'Apex Cloud Dynamics',
    metric: '+340%',
    metricLabel: 'Pipeline Velocity',
    avatarText: 'ER',
  },
  {
    id: '2',
    quote:
      'The Monte Carlo revenue simulation and AI Deal War Room give our executive team absolute visibility. We replaced 4 disjointed tools with one high-contrast tactical command system.',
    author: 'Marcus Vance',
    role: 'VP of Global Enterprise Sales',
    company: 'HyperScale Systems',
    metric: '$4.2M',
    metricLabel: 'ARR Rescued from Churn',
    avatarText: 'MV',
  },
  {
    id: '3',
    quote:
      'Real-time voice battle-cards and 24/7 WhatsApp Auto-Pilot allow us to qualify and close inbound enterprise leads across 6 time zones with sub-minute response times.',
    author: 'David Chen',
    role: 'Head of Solutions Engineering',
    company: 'Quantum Logic Inc.',
    metric: '140ms',
    metricLabel: 'Autonomous SLA Speed',
    avatarText: 'DC',
  },
];

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'growth',
    name: 'Growth Fleet',
    tagline: 'For fast-moving revenue teams looking to automate SDR outreach and inbound leads.',
    monthlyPrice: 199,
    annualPrice: 159,
    features: [
      'Up to 5 Specialized AI Agents',
      'Lead Qualification & Scoring Studio',
      'Smart Inbox & Email Intelligence',
      'WhatsApp Business 24/7 Auto-Pilot',
      'Standard Revenue Forecasting',
      'Community & Knowledge Base Support',
    ],
    ctaLabel: 'DEPLOY GROWTH FLEET',
    ctaVariant: 'outline',
    badge: 'FAST SETUP',
  },
  {
    id: 'enterprise',
    name: 'Enterprise Fleet',
    tagline: 'Complete 9-agent autonomous multi-agent operating system with War Room and Voice AI.',
    monthlyPrice: 499,
    annualPrice: 399,
    popular: true,
    features: [
      'Full 9-Agent Multi-Agent Fleet',
      'Voice AI Call Intelligence & Battle-cards',
      'AI Deal War Room & Strategy Studio',
      'Stochastic 10,000 Monte Carlo Simulations',
      'AI SDR Multi-Touch Cadences',
      'Customer Journey & Churn Rescue Playbooks',
      'Fine-Grained RBAC & Enterprise Audit Trail',
      'Dedicated Solutions Architect (24/7 SLA)',
    ],
    ctaLabel: 'LAUNCH ENTERPRISE FLEET',
    ctaVariant: 'primary',
    badge: 'MOST POPULAR',
  },
  {
    id: 'sovereign',
    name: 'Sovereign Sovereign Cloud',
    tagline: 'Self-hosted on-premise deployment with custom LLM weights and air-gapped security.',
    monthlyPrice: 999,
    annualPrice: 799,
    features: [
      'Unlimited Custom AI Agent Builder',
      'Self-Hosted Docker / Kubernetes Deployment',
      'Local LLM Support (Meta Llama 3 / vLLM)',
      'Custom PostgreSQL & Redis Clustering',
      'SOC2 / HIPAA / ISO27001 Compliance Controls',
      'Custom CRM Webhook & ERP Integrations',
      'Dedicated Slack War Room & 15m Response SLA',
    ],
    ctaLabel: 'CONTACT ARCHITECTURE TEAM',
    ctaVariant: 'outline',
    badge: 'AIR-GAPPED READY',
  },
];

export const FAQ_ITEMS = [
  {
    question: 'How do the AI Agents collaborate across our sales pipeline?',
    answer:
      'Agents communicate via an event-driven Redis Pub/Sub bus and unified WebSocket stream. When a lead is captured, the Lead Qualification Agent scores it, the Email Intelligence Agent drafts tailored follow-ups, and the Strategy Studio maps out buying committee dynamics automatically.',
  },
  {
    question: 'Can we use our own OpenAI or Anthropic API keys?',
    answer:
      'Yes. The platform includes full live OpenAI (AsyncOpenAI) and Anthropic (AsyncAnthropic) integration with SmartFallbackLLM, allowing you to configure your own enterprise API keys or use our managed infrastructure.',
  },
  {
    question: 'How is data security and role-based access enforced?',
    answer:
      'The platform implements fine-grained RBAC with Admin, Sales, Support, and Auditor roles. All sessions use secure HTTP-only cookies, SSRF webhook validation, CSV formula injection defense, and comprehensive enterprise audit trails.',
  },
  {
    question: 'Does the system integrate with existing WhatsApp and Gmail accounts?',
    answer:
      'Yes. Outbound and inbound email utilizes Gmail SMTP with STARTTLS and resilient background queueing. WhatsApp connects directly to the Meta Cloud API for templates, interactive chat, and voice note intelligence.',
  },
];
