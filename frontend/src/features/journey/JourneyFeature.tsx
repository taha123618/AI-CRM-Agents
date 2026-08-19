import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { journeyApi } from './api/journeyApi';
import { JourneyCustomer } from './types/journey.types';
import { InterventionModal } from './components/InterventionModal';
import {
  Milestone,
  ShieldAlert,
  TrendingUp,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Briefcase,
  Zap,
  Search,
  ArrowUpDown,
  CheckCircle,
} from 'lucide-react';

export function JourneyFeature() {
  const queryClient = useQueryClient();
  const [selectedCustomer, setSelectedCustomer] = useState<JourneyCustomer | null>(null);
  const [activeStageFilter, setActiveStageFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortAscending, setSortAscending] = useState(false);
  const [interventionCustomer, setInterventionCustomer] = useState<JourneyCustomer | null>(null);

  const {
    data: journeyData,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['journey-stages'],
    queryFn: () => journeyApi.getStages(),
  });

  const { data: customerDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['customer-journey-details', selectedCustomer?.id],
    queryFn: () => (selectedCustomer ? journeyApi.getCustomerJourney(selectedCustomer.id) : null),
    enabled: Boolean(selectedCustomer?.id),
  });

  const resolveMutation = useMutation({
    mutationFn: (interventionId: string) => journeyApi.resolveIntervention(interventionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journey-stages'] });
      if (selectedCustomer) {
        queryClient.invalidateQueries({ queryKey: ['customer-journey-details', selectedCustomer.id] });
      }
    },
  });

  // Extract all customers across stages
  const allCustomers: { stage: string; customer: JourneyCustomer }[] = [];
  if (journeyData?.distribution) {
    Object.entries(journeyData.distribution).forEach(([stageKey, bucket]) => {
      (bucket.customers || []).forEach((c) => {
        allCustomers.push({ stage: stageKey, customer: c });
      });
    });
  }

  // Filter & sort
  const filteredCustomers = allCustomers
    .filter((item) => {
      if (activeStageFilter !== 'all' && item.stage !== activeStageFilter) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return item.customer.name.toLowerCase().includes(q) || item.customer.status.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortAscending) {
        return a.customer.health_score - b.customer.health_score;
      }
      return b.customer.health_score - a.customer.health_score;
    });

  // Set default selected customer if none
  const activeCust = selectedCustomer || (filteredCustomers.length > 0 ? filteredCustomers[0].customer : null);

  return (
    <div className="space-y-4 font-mono pb-12">
      {/* ── Header Banner ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 sm:p-5 rounded-none bg-[#1F2833] border border-[#3A4552] shadow-2xl relative overflow-hidden">
        <div className="flex items-start sm:items-center gap-3.5 z-10">
          <div className="p-3 rounded-none bg-[#0B0C10] border border-[#3A4552] text-[#39FF14] shadow-md shrink-0">
            <Milestone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
                CUSTOMER JOURNEY &amp; CHURN RADAR STUDIO
              </h1>
              <span className="px-2 py-0.5 rounded-none text-[9px] font-mono font-bold bg-[#0B0C10] text-[#39FF14] border border-[#39FF14]/50 uppercase tracking-wider">
                TELEMETRY GUIDED
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl uppercase">
              TRACK LIFECYCLE STAGE VELOCITY, MONITOR REAL-TIME HEALTH DECAY, AND TRIGGER 1-CLICK AUTONOMOUS RETENTION RESCUE PLAYS.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            isLoading={isRefetching}
            className="text-xs h-8 px-3 uppercase"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1 text-slate-400" />
            <span>REFRESH TELEMETRY</span>
          </Button>
        </div>
      </div>

      {/* Summary KPI Ribbon */}
      {journeyData?.summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <Card className="p-4 bg-[#1F2833] border-[#3A4552] rounded-none hover:border-[#39FF14] transition-none">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              TOTAL MONITORED ARR
            </span>
            <div className="text-2xl font-black font-mono text-[#39FF14] mt-0.5">
              ${journeyData.summary.total_arr.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400 font-mono mt-1 block uppercase">
              ACROSS {journeyData.summary.total_customers} ACCOUNTS
            </span>
          </Card>

          <Card className="p-4 bg-[#1F2833] border-[#FF2A54]/50 rounded-none hover:border-[#FF2A54] transition-none">
            <span className="text-[10px] font-bold text-[#FF2A54] uppercase tracking-wider block flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-[#FF2A54]" />
              REVENUE AT RISK
            </span>
            <div className="text-2xl font-black font-mono text-[#FF2A54] mt-0.5">
              ${journeyData.summary.at_risk_arr.toLocaleString()}
            </div>
            <span className="text-[10px] text-[#FF2A54]/80 font-mono mt-1 block uppercase">
              {journeyData.summary.at_risk_count} ACCOUNTS FLAGGED
            </span>
          </Card>

          <Card className="p-4 bg-[#1F2833] border-[#3A4552] rounded-none hover:border-[#39FF14] transition-none">
            <span className="text-[10px] font-bold text-[#00E5FF] uppercase tracking-wider block flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#00E5FF]" />
              EXPANSION POTENTIAL ARR
            </span>
            <div className="text-2xl font-black font-mono text-[#00E5FF] mt-0.5">
              ${journeyData.summary.expansion_arr.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400 font-mono mt-1 block uppercase">
              HIGH HEALTH ADVOCATES
            </span>
          </Card>

          <Card className="p-4 bg-[#1F2833] border-[#3A4552] rounded-none hover:border-[#39FF14] transition-none">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              AUTONOMOUS RESCUE FLEET
            </span>
            <div className="text-2xl font-black font-mono text-purple-300 mt-0.5">
              24/7 AI AUTO-PILOT
            </div>
            <span className="text-[10px] text-slate-400 font-mono mt-1 block uppercase">
              CUSTOMER SUCCESS AGENT
            </span>
          </Card>
        </div>
      )}

      {/* Lifecycle Stage Progression Track */}
      {journeyData?.stages && journeyData?.distribution && (
        <div className="p-4 rounded-none bg-[#1F2833] border border-[#3A4552] space-y-3.5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Milestone className="w-4 h-4 text-[#39FF14]" />
              <span>CUSTOMER LIFECYCLE PIPELINE</span>
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveStageFilter('all')}
                className={`px-3 py-1 rounded-none text-xs font-bold uppercase transition-none ${
                  activeStageFilter === 'all'
                    ? 'bg-[#39FF14] text-[#0B0C10] border border-[#39FF14]'
                    : 'bg-[#0B0C10] text-slate-400 border border-[#3A4552] hover:text-white'
                }`}
              >
                ALL ({allCustomers.length})
              </button>
              {journeyData.stages.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setActiveStageFilter(st.id)}
                  className={`px-3 py-1 rounded-none text-xs font-bold uppercase transition-none ${
                    activeStageFilter === st.id
                      ? 'bg-[#39FF14] text-[#0B0C10] border border-[#39FF14]'
                      : 'bg-[#0B0C10] text-slate-400 border border-[#3A4552] hover:text-white'
                  }`}
                >
                  {st.label} ({journeyData.distribution[st.id]?.count || 0})
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {journeyData.stages.map((st) => {
              const bucket = journeyData.distribution[st.id] || { count: 0, total_arr: 0 };
              const isFiltered = activeStageFilter === st.id;
              return (
                <div
                  key={st.id}
                  onClick={() => setActiveStageFilter(isFiltered ? 'all' : st.id)}
                  className={`p-3.5 rounded-none border cursor-pointer transition-none ${
                    isFiltered
                      ? 'bg-[#0B0C10] border-[#39FF14] shadow-lg'
                      : 'bg-[#0B0C10]/60 border-[#3A4552] hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase">{st.label}</span>
                    <Badge variant="default" className="text-[9px] uppercase font-mono">
                      {bucket.count}
                    </Badge>
                  </div>
                  <div className="text-base font-black font-mono text-[#39FF14] mt-1.5">
                    ${bucket.total_arr.toLocaleString()}
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono uppercase">STAGE ARR</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Grid: Customer Fleet + Detailed Journey Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Searchable & Sortable Accounts List */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              ACCOUNTS IN STAGE ({filteredCustomers.length})
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortAscending(!sortAscending)}
              className="text-[10px] h-6 px-2 uppercase"
            >
              <ArrowUpDown className="w-3 h-3 mr-1" />
              <span>{sortAscending ? 'HEALTH: ASC' : 'HEALTH: DESC'}</span>
            </Button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH ACCOUNTS BY NAME..."
              className="w-full bg-[#1F2833] border border-[#3A4552] rounded-none pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#39FF14] font-mono uppercase"
            />
          </div>

          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredCustomers.map(({ stage: _stage, customer }) => {
              const isSelected = activeCust?.id === customer.id;
              const isAtRisk = customer.churn_risk_pct >= 40 || customer.health_score < 50;
              return (
                <div
                  key={customer.id}
                  onClick={() => setSelectedCustomer(customer)}
                  className={`p-3.5 rounded-none border cursor-pointer transition-none ${
                    isSelected
                      ? 'bg-[#1F2833] border-[#39FF14] text-white shadow-xl'
                      : 'bg-[#1F2833] border-[#3A4552] hover:border-[#39FF14] text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-[#39FF14]" />
                      <h4 className="text-xs font-bold text-white uppercase truncate">{customer.name}</h4>
                    </div>
                    <Badge
                      variant={isAtRisk ? 'danger' : customer.health_score >= 75 ? 'success' : 'warning'}
                      className="text-[9px] uppercase font-mono"
                    >
                      {customer.health_score}% HEALTH
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono mt-2 pt-2 border-t border-[#3A4552] uppercase">
                    <span className="text-[#39FF14] font-bold">${customer.arr.toLocaleString()} ARR</span>
                    <span className={isAtRisk ? 'text-[#FF2A54] font-bold' : 'text-slate-400'}>
                      {customer.churn_risk_pct}% CHURN RISK
                    </span>
                  </div>

                  {isAtRisk && (
                    <div className="mt-2 pt-2 border-t border-[#FF2A54]/30 flex items-center justify-between">
                      <span className="text-[9px] text-[#FF2A54] font-bold flex items-center gap-1 uppercase">
                        <AlertTriangle className="w-3 h-3 text-[#FF2A54]" />
                        RESCUE PLAY READY
                      </span>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInterventionCustomer(customer);
                        }}
                        className="text-[9px] h-6 px-2 uppercase font-bold"
                      >
                        <span>TRIGGER RESCUE</span>
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Account Journey & Interventions */}
        <div className="lg:col-span-7 space-y-4">
          {activeCust && customerDetails ? (
            <div className="p-4 sm:p-5 rounded-none bg-[#1F2833] border border-[#3A4552] space-y-4 shadow-xl">
              {/* Account Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#3A4552] pb-3.5">
                <div>
                  <h3 className="text-base font-black text-white uppercase">{customerDetails.customer_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="info" className="text-[9px] uppercase font-mono">
                      STAGE: {customerDetails.lifecycle_stage}
                    </Badge>
                    <span className="text-xs text-[#39FF14] font-mono font-bold">
                      MRR: ${customerDetails.mrr.toLocaleString()}
                    </span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setInterventionCustomer(activeCust)}
                  className="font-bold text-xs h-8 px-3 uppercase"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-[#0B0C10]" />
                  <span>LAUNCH RETENTION PLAYBOOK</span>
                </Button>
              </div>

              {/* Journey Timeline */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>LIFECYCLE MILESTONE TIMELINE</span>
                </span>

                <div className="space-y-1.5">
                  {customerDetails.timeline.map((t, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-none bg-[#0B0C10] border border-[#3A4552] flex items-center justify-between text-xs uppercase"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2
                          className={`w-3.5 h-3.5 ${
                            t.status === 'completed'
                              ? 'text-[#39FF14]'
                              : t.status === 'in_progress'
                              ? 'text-[#00E5FF]'
                              : t.status === 'flagged'
                              ? 'text-[#FF2A54]'
                              : 'text-slate-600'
                          }`}
                        />
                        <span className="text-slate-200 font-medium">{t.event}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{t.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Interventions History */}
              {customerDetails.active_interventions && customerDetails.active_interventions.length > 0 && (
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-[#FF2A54] uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-[#FF2A54]" />
                    <span>DISPATCHED INTERVENTIONS ({customerDetails.active_interventions.length})</span>
                  </span>

                  <div className="space-y-2">
                    {customerDetails.active_interventions.map((intv) => (
                      <div
                        key={intv.id}
                        className="p-3 rounded-none bg-[#0B0C10] border border-[#FF2A54]/50 flex items-start justify-between gap-3 text-xs uppercase"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white uppercase font-mono text-[10px]">
                              {intv.intervention_type}
                            </span>
                            <Badge variant={intv.status === 'completed' ? 'success' : 'warning'} className="text-[8px] uppercase font-mono">
                              {intv.status}
                            </Badge>
                          </div>
                          <p className="text-slate-300 text-[10px] mt-1">{intv.action_summary}</p>
                        </div>

                        {intv.status !== 'completed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resolveMutation.mutate(intv.id)}
                            isLoading={resolveMutation.isPending}
                            className="text-[9px] h-6 px-2 shrink-0 border-[#39FF14] text-[#39FF14] hover:bg-[#39FF14] hover:text-[#0B0C10] uppercase font-bold"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            <span>RESOLVE</span>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Plays */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#39FF14]" />
                  <span>PROACTIVE AI RECOMMENDATIONS</span>
                </span>

                <div className="space-y-1.5">
                  {customerDetails.recommended_plays.map((play, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-none bg-[#0B0C10] border border-[#3A4552] text-xs text-slate-300 flex items-start gap-2 uppercase"
                    >
                      <span className="text-[#39FF14] font-bold shrink-0">⚡</span>
                      <span>{play}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : isLoadingDetails ? (
            <div className="p-12 text-center text-slate-500 text-xs uppercase font-mono">
              LOADING CUSTOMER JOURNEY DETAILS...
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs uppercase font-mono">
              SELECT AN ACCOUNT TO VIEW TELEMETRY.
            </div>
          )}
        </div>
      </div>

      {/* Intervention Modal */}
      {interventionCustomer && (
        <InterventionModal
          customer={interventionCustomer}
          onClose={() => setInterventionCustomer(null)}
        />
      )}
    </div>
  );
}

