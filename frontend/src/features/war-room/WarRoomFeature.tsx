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
    <div className="space-y-4 font-mono pb-12">
      {/* ── Tactical Header Banner ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 sm:p-5 rounded-none bg-[#121212] border border-[#3A4552] shadow-2xl relative overflow-hidden">
        <div className="flex items-start sm:items-center gap-3.5 z-10">
          <div className="p-3 rounded-none bg-[#0B0C10] border border-[#3A4552] text-[#FFB800] shadow-md shrink-0">
            <Swords className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
                AI DEAL WAR ROOM & STRATEGY COMMAND
              </h1>
              <span className="px-2 py-0.5 rounded-none text-[9px] font-mono font-bold bg-[#0B0C10] text-[#FFB800] border border-[#FFB800]/50 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3 h-3 text-[#FF2A54]" />
                CONSENSUS ENGINE ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl uppercase">
              CROSS-AGENT COLLABORATIVE WAR ROOM ALIGNING PIPELINE, LEAD QUALIFIER, VOICE AI, AND CS AGENTS ON HIGH-STAKES DEALS.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchDeals()}
            isLoading={isRefetching}
            className="text-xs h-8 px-3 uppercase"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1 text-slate-400" />
            <span>REFRESH</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAutomationsModal(true)}
            className="text-xs h-8 px-3 uppercase border-[#A855F7]/40 text-[#A855F7] hover:border-[#A855F7]"
          >
            <Zap className="w-3.5 h-3.5 mr-1" />
            <span>AUTOMATION RULES</span>
          </Button>

          {activeDeal && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowProposalModal(true)}
              className="text-xs h-8 px-3.5 uppercase font-bold"
            >
              <FileText className="w-4 h-4 mr-1 text-[#0B0C10]" />
              <span>SMART PROPOSAL STUDIO</span>
            </Button>
          )}
        </div>
      </div>

      {/* ── Active Deal Selector Strip (Horizontal Tactical Bar) ── */}
      <div className="p-3.5 rounded-none bg-[#121212] border border-[#3A4552] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Crosshair className="w-3.5 h-3.5 text-[#FF2A54]" />
            <span>TARGET ENTERPRISE ACCOUNTS ({deals?.length || 0})</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono hidden sm:inline uppercase">
            SELECT PIPELINE DEAL TO LOAD CROSS-AGENT CONSENSUS
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
          {isLoadingDeals ? (
            <div className="text-xs text-slate-500 py-2 uppercase">LOADING TARGET PIPELINE...</div>
          ) : !deals?.length ? (
            <div className="text-xs text-slate-500 py-2 uppercase">NO DEALS REGISTERED IN PIPELINE YET.</div>
          ) : (
            deals?.map((d) => {
              const isSelected = activeDeal?.id === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedDeal(d)}
                  className={`px-3.5 py-2 rounded-none text-xs font-bold whitespace-nowrap transition-none flex items-center gap-2.5 border shrink-0 ${isSelected
                      ? 'bg-[#0B0C10] border-[#FFB800] text-white shadow-lg'
                      : 'bg-[#0B0C10]/60 border-[#3A4552] text-slate-400 hover:text-white hover:border-slate-500'
                    }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Briefcase className={`w-3.5 h-3.5 ${isSelected ? 'text-[#FFB800]' : 'text-slate-500'}`} />
                    <span className="uppercase">{d.company}</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#FFB800] font-bold">
                    ${d.value.toLocaleString()}
                  </span>
                  <Badge
                    variant={d.health_score >= 70 ? 'success' : 'warning'}
                    className="text-[9px] px-1.5 py-0.2 uppercase font-mono"
                  >
                    {d.win_probability_pct}% WIN
                  </Badge>
                </button>
              );
            })
          )}
        </div>
      </div>

      {activeDeal && strategy ? (
        <div className="space-y-4">
          {/* ── Key Metrics & Consensus Gauge Strip ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* 1. Multi-Agent Verdict & Radial Meter */}
            <Card className="p-4 bg-[#121212] border-[#3A4552] rounded-none flex items-center justify-between gap-4 relative overflow-hidden group hover:border-[#FFB800] transition-none">
              <div className="space-y-1.5 min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#FFB800]" />
                  CONSENSUS VERDICT
                </span>
                <div className="text-base font-black text-white leading-tight uppercase truncate">
                  {strategy.cross_agent_verdict}
                </div>
                <Badge variant="success" className="text-[9px] uppercase font-mono">
                  {activeDeal.stage} STAGE
                </Badge>
              </div>

              {/* Square Meter Box */}
              <div className="w-16 h-16 shrink-0 bg-[#0B0C10] border border-[#3A4552] flex flex-col items-center justify-center text-center">
                <span className="text-lg font-black font-mono text-[#FFB800]">
                  {strategy.consensus_health_score}
                </span>
                <span className="text-[8px] font-mono text-slate-400 uppercase">HEALTH</span>
              </div>
            </Card>

            {/* 2. Target ARR & Deal Momentum */}
            <Card className="p-4 bg-[#121212] border-[#3A4552] rounded-none flex flex-col justify-between space-y-2.5 hover:border-[#FFB800] transition-none">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-[#00E5FF]" />
                  ACCOUNT VALUATION &amp; ARR
                </span>
                <div className="text-2xl font-black font-mono text-[#FFB800] mt-0.5">
                  ${strategy.value.toLocaleString()} <span className="text-xs text-slate-400 font-mono uppercase">USD</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-300 font-mono bg-[#0B0C10] p-2 rounded-none border border-[#3A4552] uppercase text-[10px]">
                <span>CLOSING WINDOW: ~18 DAYS</span>
                <span className="text-purple-400 font-bold">ENTERPRISE TIER</span>
              </div>
            </Card>

            {/* 3. Primary Win Action Highlight */}
            <Card className="p-4 bg-[#121212] border-[#3A4552] rounded-none flex flex-col justify-between space-y-2.5 hover:border-[#FFB800] transition-none">
              <div>
                <span className="text-[10px] font-bold text-[#FF2A54] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF2A54]" />
                  RECOMMENDED WAR ROOM PLAY
                </span>
                <p className="text-xs text-slate-200 mt-1 font-medium leading-relaxed uppercase">
                  {strategy.recommended_win_actions?.[0] || 'PROPOSE TAILORED SOC2 SECURITY PACK & DEDICATED ONBOARDING SLA'}
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowProposalModal(true)}
                className="font-bold text-xs uppercase w-full h-8 rounded-none"
              >
                <span>OPEN PROPOSAL STUDIO</span>
                <ArrowUpRight className="w-3.5 h-3.5 ml-1 text-[#0B0C10]" />
              </Button>
            </Card>
          </div>

          {/* ── Sub-Navigation Tabs ── */}
          <div className="flex items-center gap-1.5 border-b border-[#3A4552] pb-2 overflow-x-auto scrollbar-none">
            {[
              { id: 'overview', label: 'CROSS-AGENT PERSPECTIVES', icon: Bot },
              { id: 'swot', label: 'SWOT MATRIX & BATTLE-CARDS', icon: Shield },
              { id: 'stakeholders', label: 'BUYING COMMITTEE MAP', icon: Users },
              { id: 'actions', label: 'WIN ACTION CHECKLIST', icon: Target },
            ]?.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-none text-xs font-bold transition-none flex items-center gap-1.5 whitespace-nowrap uppercase font-mono ${isActive
                      ? 'bg-[#FFB800] text-[#0B0C10] border border-[#FFB800]'
                      : 'bg-[#121212] text-slate-300 border border-[#3A4552] hover:border-[#FFB800] hover:text-white'
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
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Bot className="w-4 h-4 text-[#FFB800]" />
                  <span>SPECIALIZED AGENT STRATEGIC AUDITS</span>
                </h2>
                <span className="text-[10px] text-[#FFB800] font-mono uppercase">
                  4 AI AGENTS JOINTLY ANALYZING {activeDeal.company}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {strategy.agent_perspectives.map((agent, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-none bg-[#121212] border border-[#3A4552] hover:border-[#FFB800] transition-none space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-white uppercase truncate">
                        {agent.agent_name}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#FFB800] bg-[#0B0C10] px-2 py-0.5 rounded-none border border-[#3A4552]">
                        {agent.rating}%
                      </span>
                    </div>

                    <span className="text-[10px] text-purple-400 font-mono block uppercase">
                      ROLE: {agent.role}
                    </span>

                    <p className="text-xs text-slate-300 leading-relaxed bg-[#0B0C10] p-3 rounded-none border border-[#3A4552] uppercase">
                      {agent.insight}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Tab 2: SWOT Matrix & Competitor Battle-Cards ── */}
          {activeTab === 'swot' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* SWOT Matrix */}
              <div className="space-y-3">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#FFB800]" />
                  <span>ACCOUNT SWOT MATRIX</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Strengths */}
                  <div className="p-3.5 rounded-none bg-[#121212] border border-[#FFB800]/50 space-y-2">
                    <span className="text-[11px] font-bold text-[#FFB800] uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-none bg-[#FFB800]" />
                      STRENGTHS
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-300 uppercase">
                      {strategy.swot_analysis.strengths.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-[#FFB800] font-bold shrink-0">✓</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="p-3.5 rounded-none bg-[#121212] border border-[#FFB800]/50 space-y-2">
                    <span className="text-[11px] font-bold text-[#FFB800] uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-none bg-[#FFB800]" />
                      VULNERABILITIES
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-300 uppercase">
                      {strategy.swot_analysis.weaknesses.map((w, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-[#FFB800] font-bold shrink-0">•</span>
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Opportunities */}
                  <div className="p-3.5 rounded-none bg-[#121212] border border-[#00E5FF]/50 space-y-2">
                    <span className="text-[11px] font-bold text-[#00E5FF] uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-none bg-[#00E5FF]" />
                      OPPORTUNITIES
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-300 uppercase">
                      {strategy.swot_analysis.opportunities.map((o, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-[#00E5FF] font-bold shrink-0">↗</span>
                          <span>{o}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Threats */}
                  <div className="p-3.5 rounded-none bg-[#121212] border border-[#FF2A54]/50 space-y-2">
                    <span className="text-[11px] font-bold text-[#FF2A54] uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-none bg-[#FF2A54]" />
                      INCUMBENT THREATS
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-300 uppercase">
                      {strategy.swot_analysis.threats.map((t, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-[#FF2A54] font-bold shrink-0">×</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Competitor Battle-Cards */}
              <div className="space-y-3">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#FF2A54]" />
                  <span>LIVE COMPETITOR BATTLE-CARDS</span>
                </h2>

                <div className="space-y-3">
                  {strategy.competitor_battle_cards.map((card, idx) => {
                    const isCopied = copiedCard === card.competitor;
                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-none bg-[#121212] border border-[#3A4552] space-y-2.5 hover:border-[#FFB800] transition-none"
                      >
                        <div className="flex items-center justify-between border-b border-[#3A4552] pb-2">
                          <span className="text-xs font-black text-[#FF2A54] uppercase tracking-wider">
                            VS. {card.competitor}
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
                              className="p-1.5 rounded-none bg-[#0B0C10] text-slate-400 hover:text-white border border-[#3A4552] transition-none"
                              title="Copy battle-card"
                            >
                              {isCopied ? (
                                <Check className="w-3.5 h-3.5 text-[#FFB800]" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <Badge variant="danger" className="text-[9px] uppercase font-mono">
                              DISPLACEMENT PLAY
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            VULNERABILITIES:
                          </span>
                          <p className="text-xs text-slate-300 uppercase">{card.vulnerabilities}</p>
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-[#FFB800] uppercase">
                            COUNTER-OBJECTION PLAYBOOK:
                          </span>
                          <p className="text-xs text-slate-300 leading-relaxed uppercase">
                            {card.counter_objection}
                          </p>
                        </div>

                        <div className="p-2.5 rounded-none bg-[#0B0C10] border border-[#FF2A54]/40 text-xs text-slate-200 flex items-start gap-2 uppercase">
                          <span className="font-bold shrink-0 text-[#FF2A54]">🎯 KILL-SHOT:</span>
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
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#00E5FF]" />
                  <span>BUYING COMMITTEE &amp; STAKEHOLDER ALIGNMENT</span>
                </h2>
                <span className="text-[10px] text-[#FFB800] font-mono uppercase">
                  {strategy.stakeholder_influence_map.length} DECISION MAKERS PROFILED
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {strategy.stakeholder_influence_map.map((stakeholder, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-none bg-[#121212] border border-[#3A4552] hover:border-[#FFB800] transition-none space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white uppercase truncate">{stakeholder.name}</h4>
                      <Badge
                        variant={
                          stakeholder.stance === 'Champion'
                            ? 'success'
                            : stakeholder.stance === 'Neutral'
                              ? 'default'
                              : 'warning'
                        }
                        className="text-[9px] uppercase font-mono"
                      >
                        {stakeholder.stance}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono uppercase">
                      <span>{stakeholder.role}</span>
                      <span className="text-[#FFB800] font-bold">INFLUENCE: {stakeholder.influence}</span>
                    </div>

                    <p className="text-xs text-slate-300 bg-[#0B0C10] p-2.5 rounded-none border border-[#3A4552] leading-relaxed uppercase">
                      <strong className="text-slate-400 font-bold">TARGET STRATEGY: </strong>
                      {stakeholder.strategy}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Tab 4: Interactive Win Action Checklist ── */}
          {activeTab === 'actions' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#FFB800]" />
                  <span>EXECUTIVE WIN PLAYS &amp; ACTION ITEMS</span>
                </h2>
                <span className="text-[10px] text-slate-400 font-mono uppercase">
                  {Object.values(completedActions).filter(Boolean).length} /{' '}
                  {(strategy.recommended_win_actions || []).length} COMPLETED
                </span>
              </div>

              <div className="space-y-2">
                {(strategy.recommended_win_actions || []).map((act, idx) => {
                  const isDone = Boolean(completedActions[act]);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleActionItem(act)}
                      className={`p-3.5 rounded-none border cursor-pointer transition-none flex items-center justify-between gap-3 ${isDone
                          ? 'bg-[#0B0C10] border-[#FFB800]/40 text-slate-500 line-through'
                          : 'bg-[#121212] border-[#3A4552] hover:border-[#FFB800] text-white'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          className={`w-5 h-5 rounded-none border flex items-center justify-center transition-none ${isDone
                              ? 'bg-[#FFB800] border-[#FFB800] text-[#0B0C10]'
                              : 'border-[#3A4552] bg-[#0B0C10] text-transparent'
                            }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                        <span className="text-xs uppercase font-medium">{act}</span>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : isLoadingStrategy ? (
        <div className="py-24 text-center text-slate-500 text-xs uppercase font-mono">
          LOADING WAR ROOM CONSENSUS STRATEGY...
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

