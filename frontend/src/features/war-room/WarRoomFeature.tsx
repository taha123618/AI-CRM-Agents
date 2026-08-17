import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { warRoomApi } from './api/warRoomApi';
import { WarRoomDeal } from './types/warRoom.types';
import { ProposalStudioModal } from './components/ProposalStudioModal';
import { AutomationRulesModal } from './components/AutomationRulesModal';
import {
  Swords,
  Shield,
  Zap,
  FileText,
  Users,
  Target,
  Sparkles,
  TrendingUp,
  Bot,
  ArrowUpRight,
  Crosshair,
  RefreshCw,
  Award,
  Copy,
  Check,
  Flame,
  Briefcase,
  ChevronRight,
} from 'lucide-react';

export function WarRoomFeature() {
  const [selectedDeal, setSelectedDeal] = useState<WarRoomDeal | null>(null);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [showAutomationsModal, setShowAutomationsModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'swot' | 'stakeholders' | 'actions'>('overview');

  // Interactive Checklist State
  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>({});
  const [copiedCard, setCopiedCard] = useState<string | null>(null);

  // Fetch all deals for the War Room selector
  const {
    data: deals,
    isLoading: isLoadingDeals,
    refetch: refetchDeals,
    isRefetching,
  } = useQuery({
    queryKey: ['war-room-deals'],
    queryFn: () => warRoomApi.getDeals(),
  });

  const activeDeal = selectedDeal || (deals && deals.length > 0 ? deals[0] : null);

  // Fetch real-time strategy matrix for the active deal
  const { data: strategy, isLoading: isLoadingStrategy } = useQuery({
    queryKey: ['war-room-strategy', activeDeal?.id],
    queryFn: () => (activeDeal ? warRoomApi.getStrategyMatrix(activeDeal.id) : null),
    enabled: Boolean(activeDeal?.id),
  });

  const toggleActionItem = (actionText: string) => {
    setCompletedActions((prev) => ({
      ...prev,
      [actionText]: !prev[actionText],
    }));
  };

  const handleCopyBattleCard = (competitor: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCard(competitor);
    setTimeout(() => setCopiedCard(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* ── Header Banner ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-rose-950/50 via-slate-900/80 to-purple-950/50 border border-rose-500/30 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start sm:items-center gap-4 z-10">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-rose-500/30 to-purple-500/20 border border-rose-500/40 text-rose-400 shadow-xl shadow-rose-500/20 shrink-0">
            <Swords className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                AI Deal War Room
              </h1>
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3 h-3 text-rose-400 animate-bounce" />
                Live Consensus Engine
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Cross-agent collaborative war room aligning Sales Pipeline, Lead Qualifier, Voice AI, and Customer Success on high-stakes enterprise accounts.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchDeals()}
            isLoading={isRefetching}
            className="border-slate-800 bg-slate-900/90 hover:bg-slate-800 text-slate-300 text-xs h-9 px-3.5 rounded-xl"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            <span>Refresh</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAutomationsModal(true)}
            className="border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 hover:text-white text-xs h-9 px-3.5 rounded-xl shadow-lg shadow-purple-500/10"
          >
            <Zap className="w-3.5 h-3.5 mr-1.5" />
            <span>Triggers & Automations</span>
          </Button>

          {activeDeal && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowProposalModal(true)}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-lg shadow-emerald-600/30"
            >
              <FileText className="w-4 h-4 mr-1.5" />
              <span>Smart Proposal Studio</span>
            </Button>
          )}
        </div>
      </div>

      {/* ── Active Deal Selector Strip (Horizontal Mobile Scrollable) ── */}
      <div className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Crosshair className="w-3.5 h-3.5 text-rose-400" />
            <span>Target Enterprise Accounts ({deals?.length || 0})</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
            Select an account to load cross-agent consensus
          </span>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-1 scrollbar-thin">
          {isLoadingDeals ? (
            <div className="text-xs text-slate-500 py-2">Loading target accounts...</div>
          ) : !deals?.length ? (
            <div className="text-xs text-slate-500 py-2">No deals registered in pipeline yet.</div>
          ) : (
            deals.map((d) => {
              const isSelected = activeDeal?.id === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedDeal(d)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-3 border shrink-0 ${isSelected
                    ? 'bg-gradient-to-r from-rose-500/20 to-purple-500/20 border-rose-500/50 text-white shadow-xl shadow-rose-500/15 scale-[1.02]'
                    : 'bg-slate-950/80 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <Briefcase className={`w-3.5 h-3.5 ${isSelected ? 'text-rose-400' : 'text-slate-500'}`} />
                    <span>{d.company}</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">
                    ${d.value.toLocaleString()}
                  </span>
                  <Badge
                    variant={d.health_score >= 70 ? 'success' : 'warning'}
                    className="text-[9px] px-1.5 py-0.5"
                  >
                    {d.win_probability_pct}% win
                  </Badge>
                </button>
              );
            })
          )}
        </div>
      </div>

      {activeDeal && strategy ? (
        <div className="space-y-6">
          {/* ── Key Metrics & Consensus Gauge Strip ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Multi-Agent Verdict & Radial Meter */}
            <Card className="p-5 sm:p-6 bg-slate-900/60 backdrop-blur-xl border-slate-800/80 flex items-center justify-between gap-4 relative overflow-hidden group hover:border-rose-500/40 transition-all duration-300">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  Consensus Verdict
                </span>
                <div className="text-base sm:text-lg font-black text-white leading-tight">
                  {strategy.cross_agent_verdict}
                </div>
                <Badge variant="success" className="bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                  {activeDeal.stage.toUpperCase()} STAGE
                </Badge>
              </div>

              {/* Circular SVG Meter */}
              <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-rose-500 transition-all duration-1000 ease-out"
                    strokeDasharray={`${strategy.consensus_health_score}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-base font-black font-mono text-white">
                    {strategy.consensus_health_score}
                  </span>
                  <span className="text-[8px] font-mono text-slate-400">SCORE</span>
                </div>
              </div>
            </Card>

            {/* 2. Target ARR & Deal Momentum */}
            <Card className="p-5 sm:p-6 bg-slate-900/60 backdrop-blur-xl border-slate-800/80 flex flex-col justify-between space-y-3 hover:border-blue-500/40 transition-all duration-300">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                  Account Valuation & Velocity
                </span>
                <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 mt-1">
                  ${strategy.value.toLocaleString()} <span className="text-xs text-slate-400 font-sans">ARR</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-300 font-mono bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                <span>Closing Window: ~18 Days</span>
                <span className="text-purple-300 font-bold">Enterprise Tier</span>
              </div>
            </Card>

            {/* 3. Primary Win Action Highlight */}
            <Card className="p-5 sm:p-6 bg-gradient-to-br from-rose-950/40 via-slate-900/90 to-purple-950/40 border-rose-500/30 flex flex-col justify-between space-y-3 shadow-xl">
              <div>
                <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                  Recommended War Room Play
                </span>
                <p className="text-xs text-slate-200 mt-1.5 font-medium leading-relaxed">
                  {strategy.recommended_win_actions[0]}
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowProposalModal(true)}
                className="bg-rose-600 hover:bg-rose-500 font-bold text-xs shadow-lg shadow-rose-600/30 w-full h-9 rounded-xl"
              >
                <span>Launch Pitch Proposal Studio</span>
                <ArrowUpRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Card>
          </div>

          {/* ── Sub-Navigation Tabs ── */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
            {[
              { id: 'overview', label: 'Cross-Agent Perspectives', icon: Bot },
              { id: 'swot', label: 'SWOT Matrix & Battle-Cards', icon: Shield },
              { id: 'stakeholders', label: 'Buying Committee Map', icon: Users },
              { id: 'actions', label: 'Win Action Checklist', icon: Target },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-2 whitespace-nowrap ${isActive
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-lg shadow-rose-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ── Tab 1: Cross-Agent Perspectives Grid ── */}
          {activeTab === 'overview' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Bot className="w-4 h-4 text-purple-400" />
                  <span>Specialized Agent Strategic Audits</span>
                </h2>
                <span className="text-[10px] text-emerald-400 font-mono">
                  4 AI Agents Jointly Analyzing {activeDeal.company}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {strategy.agent_perspectives.map((agent, i) => (
                  <div
                    key={i}
                    className="p-5 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 hover:border-purple-500/40 transition-all duration-300 space-y-3 group hover:shadow-xl hover:shadow-purple-500/5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-white group-hover:text-purple-300 transition-colors truncate">
                        {agent.agent_name}
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                        {agent.rating}%
                      </span>
                    </div>

                    <span className="text-[10px] text-purple-400 font-mono block">
                      {agent.role}
                    </span>

                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80">
                      {agent.insight}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Tab 2: SWOT Matrix & Competitor Battle-Cards ── */}
          {activeTab === 'swot' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-200">
              {/* SWOT Matrix */}
              <div className="space-y-4">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Account SWOT Analysis</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Strengths */}
                  <div className="p-4.5 rounded-3xl bg-emerald-950/30 border border-emerald-500/30 space-y-2.5 shadow-lg">
                    <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Strengths
                    </span>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {strategy.swot_analysis.strengths.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-400 font-bold shrink-0">✓</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="p-4.5 rounded-3xl bg-amber-950/30 border border-amber-500/30 space-y-2.5 shadow-lg">
                    <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      Vulnerabilities
                    </span>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {strategy.swot_analysis.weaknesses.map((w, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-400 font-bold shrink-0">•</span>
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Opportunities */}
                  <div className="p-4.5 rounded-3xl bg-blue-950/30 border border-blue-500/30 space-y-2.5 shadow-lg">
                    <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                      Expansion Opportunities
                    </span>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {strategy.swot_analysis.opportunities.map((o, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-blue-400 font-bold shrink-0">↗</span>
                          <span>{o}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Threats */}
                  <div className="p-4.5 rounded-3xl bg-rose-950/30 border border-rose-500/30 space-y-2.5 shadow-lg">
                    <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-400" />
                      Incumbent Threats
                    </span>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {strategy.swot_analysis.threats.map((t, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-rose-400 font-bold shrink-0">×</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Competitor Battle-Cards */}
              <div className="space-y-4">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Target className="w-4 h-4 text-rose-400" />
                  <span>Live Competitor Battle-Cards</span>
                </h2>

                <div className="space-y-3.5">
                  {strategy.competitor_battle_cards.map((card, idx) => {
                    const isCopied = copiedCard === card.competitor;
                    return (
                      <div
                        key={idx}
                        className="p-5 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 space-y-3 shadow-xl hover:border-slate-700 transition-all"
                      >
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                          <span className="text-xs font-black text-rose-400 uppercase tracking-wider">
                            vs. {card.competitor}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleCopyBattleCard(
                                  card.competitor,
                                  `Competitor: ${card.competitor}\nVulnerabilities: ${card.vulnerabilities}\nCounter: ${card.counter_objection}\nKill-Shot: ${card.kill_shot}`
                                )
                              }
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
                              title="Copy battle-card"
                            >
                              {isCopied ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <Badge variant="danger" className="text-[9px] bg-rose-500/20 text-rose-300">
                              Displacement Play
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            Vulnerabilities:
                          </span>
                          <p className="text-xs text-slate-300">{card.vulnerabilities}</p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-emerald-400 uppercase">
                            Counter-Objection Playbook:
                          </span>
                          <p className="text-xs text-emerald-200/90 leading-relaxed">
                            {card.counter_objection}
                          </p>
                        </div>

                        <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-200 flex items-start gap-2 shadow-inner">
                          <span className="font-bold shrink-0 text-rose-400">🎯 Kill-Shot:</span>
                          <span>{card.kill_shot}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── Tab 3: Stakeholder Influence & Buying Committee ── */}
          {activeTab === 'stakeholders' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>Buying Committee & Stakeholder Alignment</span>
                </h2>
                <span className="text-[10px] text-purple-300 font-mono">
                  {strategy.stakeholder_influence_map.length} Decision Makers Profiled
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {strategy.stakeholder_influence_map.map((stakeholder, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 hover:border-blue-500/40 transition-all duration-300 space-y-3 shadow-xl"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white truncate">{stakeholder.name}</h4>
                      <Badge
                        variant={
                          stakeholder.stance === 'Champion'
                            ? 'success'
                            : stakeholder.stance === 'Neutral'
                              ? 'default'
                              : 'warning'
                        }
                        className="text-[9px]"
                      >
                        {stakeholder.stance}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>{stakeholder.role}</span>
                      <span className="text-purple-300 font-bold">Influence: {stakeholder.influence}</span>
                    </div>

                    <p className="text-xs text-slate-300 bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 leading-relaxed">
                      <strong className="text-slate-400 font-bold">Targeted Strategy: </strong>
                      {stakeholder.strategy}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Tab 4: Interactive Win Action Checklist ── */}
          {activeTab === 'actions' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <span>Executive Win Plays & Action Items</span>
                </h2>
                <span className="text-[10px] text-slate-400 font-mono">
                  {Object.values(completedActions).filter(Boolean).length} /{' '}
                  {strategy.recommended_win_actions.length} Completed
                </span>
              </div>

              <div className="space-y-3">
                {strategy.recommended_win_actions.map((act, idx) => {
                  const isDone = Boolean(completedActions[act]);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleActionItem(act)}
                      className={`p-4.5 rounded-2xl border cursor-pointer transition-all duration-200 flex items-center justify-between gap-4 ${isDone
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-400 line-through'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-white shadow-lg'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${isDone
                            ? 'bg-emerald-500 border-emerald-400 text-white'
                            : 'border-slate-700 bg-slate-950 text-transparent'
                            }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                        <span className="text-xs sm:text-sm font-medium">{act}</span>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : isLoadingStrategy ? (
        <div className="py-24 text-center text-slate-500 text-xs">
          Loading war room consensus strategy...
        </div>
      ) : null}

      {/* Modals */}
      {showProposalModal && activeDeal && (
        <ProposalStudioModal deal={activeDeal} onClose={() => setShowProposalModal(false)} />
      )}
      {showAutomationsModal && (
        <AutomationRulesModal onClose={() => setShowAutomationsModal(false)} />
      )}
    </div>
  );
}
