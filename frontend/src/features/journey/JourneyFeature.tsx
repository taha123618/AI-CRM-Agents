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
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-950/50 via-slate-900/80 to-purple-950/50 border border-blue-500/30 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
        <div className="flex items-start sm:items-center gap-4 z-10">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-500/30 to-purple-500/20 border border-blue-500/40 text-blue-400 shadow-xl shadow-blue-500/20 shrink-0">
            <Milestone className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Customer Journey & Churn Prevention Studio
              </h1>
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 uppercase tracking-wider">
                Telemetry Guided
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Track lifecycle stage velocity, monitor real-time health decay, and trigger 1-click autonomous retention rescue interventions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            isLoading={isRefetching}
            className="border-slate-800 bg-slate-900/90 hover:bg-slate-800 text-slate-300 text-xs h-9 px-3.5 rounded-xl"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            <span>Refresh Telemetry</span>
          </Button>
        </div>
      </div>

      {/* Summary KPI Ribbon */}
      {journeyData?.summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 bg-slate-900/60 backdrop-blur-xl border-slate-800/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Monitored ARR
            </span>
            <div className="text-2xl font-black font-mono text-white mt-1">
              ${journeyData.summary.total_arr.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-400 font-mono mt-1 block">
              Across {journeyData.summary.total_customers} accounts
            </span>
          </Card>

          <Card className="p-5 bg-rose-950/30 border-rose-500/30">
            <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider block flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              Revenue at Risk
            </span>
            <div className="text-2xl font-black font-mono text-rose-400 mt-1">
              ${journeyData.summary.at_risk_arr.toLocaleString()}
            </div>
            <span className="text-[11px] text-rose-300/80 font-mono mt-1 block">
              {journeyData.summary.at_risk_count} accounts flagged
            </span>
          </Card>

          <Card className="p-5 bg-emerald-950/30 border-emerald-500/30">
            <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Expansion Potential ARR
            </span>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
              ${journeyData.summary.expansion_arr.toLocaleString()}
            </div>
            <span className="text-[11px] text-emerald-300/80 font-mono mt-1 block">
              High health advocates
            </span>
          </Card>

          <Card className="p-5 bg-purple-950/30 border-purple-500/30">
            <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              Autonomous Rescue Fleet
            </span>
            <div className="text-2xl font-black font-mono text-purple-300 mt-1">
              24/7 AI Auto-Pilot
            </div>
            <span className="text-[11px] text-purple-300/80 font-mono mt-1 block">
              Customer Success Agent
            </span>
          </Card>
        </div>
      )}

      {/* Lifecycle Stage Progression Track */}
      {journeyData?.stages && journeyData?.distribution && (
        <div className="p-5 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Milestone className="w-4 h-4 text-blue-400" />
              <span>Customer Lifecycle Pipeline</span>
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveStageFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeStageFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                All ({allCustomers.length})
              </button>
              {journeyData.stages.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setActiveStageFilter(st.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeStageFilter === st.id
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {st.label} ({journeyData.distribution[st.id]?.count || 0})
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {journeyData.stages.map((st) => {
              const bucket = journeyData.distribution[st.id] || { count: 0, total_arr: 0 };
              const isFiltered = activeStageFilter === st.id;
              return (
                <div
                  key={st.id}
                  onClick={() => setActiveStageFilter(isFiltered ? 'all' : st.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isFiltered
                      ? 'bg-slate-950 border-blue-500 shadow-lg shadow-blue-500/10'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">{st.label}</span>
                    <Badge variant="default" className="text-[10px]">
                      {bucket.count}
                    </Badge>
                  </div>
                  <div className="text-base font-black font-mono text-emerald-400 mt-2">
                    ${bucket.total_arr.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Stage ARR</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Grid: Customer Fleet + Detailed Journey Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Searchable & Sortable Accounts List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Accounts in Stage ({filteredCustomers.length})
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortAscending(!sortAscending)}
              className="text-[10px] h-7 px-2 border-slate-800"
            >
              <ArrowUpDown className="w-3 h-3 mr-1" />
              <span>{sortAscending ? 'Health: Low to High' : 'Health: High to Low'}</span>
            </Button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search accounts by name..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredCustomers.map(({ stage: _stage, customer }) => {
              const isSelected = activeCust?.id === customer.id;
              const isAtRisk = customer.churn_risk_pct >= 40 || customer.health_score < 50;
              return (
                <div
                  key={customer.id}
                  onClick={() => setSelectedCustomer(customer)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500 text-white shadow-xl shadow-blue-500/10'
                      : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                      <h4 className="text-xs font-bold text-white truncate">{customer.name}</h4>
                    </div>
                    <Badge
                      variant={isAtRisk ? 'danger' : customer.health_score >= 75 ? 'success' : 'warning'}
                      className="text-[9px]"
                    >
                      {customer.health_score}% Health
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono mt-2 pt-2 border-t border-slate-800/60">
                    <span className="text-emerald-400 font-bold">${customer.arr.toLocaleString()} ARR</span>
                    <span className="text-slate-400">{customer.churn_risk_pct}% Churn Risk</span>
                  </div>

                  {isAtRisk && (
                    <div className="mt-2.5 pt-2 border-t border-rose-500/20 flex items-center justify-between">
                      <span className="text-[10px] text-rose-300 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-400" />
                        Rescue Play Ready
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInterventionCustomer(customer);
                        }}
                        className="text-[10px] h-7 px-2 border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                      >
                        <span>Trigger Rescue</span>
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
            <div className="p-6 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 space-y-6 shadow-xl">
              {/* Account Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-black text-white">{customerDetails.customer_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="info" className="text-[10px] uppercase font-mono">
                      Stage: {customerDetails.lifecycle_stage}
                    </Badge>
                    <span className="text-xs text-slate-400 font-mono">
                      MRR: ${customerDetails.mrr.toLocaleString()}
                    </span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setInterventionCustomer(activeCust)}
                  className="bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 font-bold text-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  <span>Launch Retention Playbook</span>
                </Button>
              </div>

              {/* Journey Timeline */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  <span>Lifecycle Milestone Timeline</span>
                </span>

                <div className="space-y-2">
                  {customerDetails.timeline.map((t, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2
                          className={`w-4 h-4 ${
                            t.status === 'completed'
                              ? 'text-emerald-400'
                              : t.status === 'in_progress'
                              ? 'text-blue-400 animate-pulse'
                              : t.status === 'flagged'
                              ? 'text-rose-400'
                              : 'text-slate-600'
                          }`}
                        />
                        <span className="text-slate-200 font-medium">{t.event}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">{t.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Interventions History */}
              {customerDetails.active_interventions && customerDetails.active_interventions.length > 0 && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    <span>Dispatched Interventions ({customerDetails.active_interventions.length})</span>
                  </span>

                  <div className="space-y-2">
                    {customerDetails.active_interventions.map((intv) => (
                      <div
                        key={intv.id}
                        className="p-3 rounded-xl bg-slate-950 border border-rose-500/30 flex items-start justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white uppercase font-mono text-[10px]">
                              {intv.intervention_type}
                            </span>
                            <Badge variant={intv.status === 'completed' ? 'success' : 'warning'} className="text-[9px]">
                              {intv.status}
                            </Badge>
                          </div>
                          <p className="text-slate-300 text-[11px] mt-1">{intv.action_summary}</p>
                        </div>

                        {intv.status !== 'completed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resolveMutation.mutate(intv.id)}
                            isLoading={resolveMutation.isPending}
                            className="text-[10px] h-7 px-2 shrink-0 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            <span>Resolve</span>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Plays */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Proactive AI Recommendations</span>
                </span>

                <div className="space-y-2">
                  {customerDetails.recommended_plays.map((play, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-950/80 border border-purple-500/20 text-xs text-slate-300 flex items-start gap-2.5"
                    >
                      <span className="text-purple-400 font-bold shrink-0">⚡</span>
                      <span>{play}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : isLoadingDetails ? (
            <div className="p-12 text-center text-slate-500 text-xs">Loading customer journey details...</div>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs">Select an account to view telemetry.</div>
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
