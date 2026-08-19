import {
  Users,
  Briefcase,
  Building2,
  DollarSign,
  Sparkles,
  TrendingUp,
  Bot,
  Zap,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AgentStatusPanel } from '@/components/layout/AgentStatusPanel';
import { PipelineChart } from '@/components/charts/PipelineChart';
import { useDashboardMetrics, usePipelineMetrics } from '@/hooks/use-analytics';
import { useAgentStore } from '@/stores/use-agent-store';
import { useUIStore } from '@/stores/use-ui-store';
import { useTranslation, useLocaleFormat } from '@/features/multi-language';
import { Skeleton } from '@/components/ui/Skeleton';

export function DashboardFeature() {
  const { t } = useTranslation();
  const { formatCurrency, formatNumber } = useLocaleFormat();
  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useDashboardMetrics();
  const { data: pipeline, isLoading: pipelineLoading, refetch: refetchPipeline } = usePipelineMetrics();
  const { events } = useAgentStore();
  const { setLeadModalOpen, setDealModalOpen, setEmailModalOpen, setActivePage } = useUIStore();

  const handleRefreshMetrics = async () => {
    await Promise.all([refetchMetrics(), refetchPipeline()]);
  };

  return (
    <div className="space-y-6">
      {/* Agent Status Panel */}
      <AgentStatusPanel onRefresh={handleRefreshMetrics} />

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Leads */}
        <Card className="bg-[#1A1F26] border-[#252b36] rounded-none hover:border-[#FF2A54]/50 transition-none">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              {t('dashboard.total_leads', 'Total Monitored Leads')}
            </span>
            <div className="p-2 bg-[#0D0D0D] text-[#FF2A54] border border-[#252b36] rounded-none">
              <Users className="w-4 h-4" />
            </div>
          </div>
          {metricsLoading ? (
            <Skeleton className="h-8 w-24 mt-3" />
          ) : (
            <div className="mt-3">
              <div className="text-2xl font-bold text-white tracking-tight font-mono">
                {formatNumber(metrics?.leads.total || 0)}
              </div>
              <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1 font-mono">
                <span className="text-emerald-400 font-bold">{metrics?.leads.qualified || 0} QUALIFIED</span> BY AI
              </p>
            </div>
          )}
        </Card>

        {/* Pipeline Value */}
        <Card className="bg-[#1A1F26] border-[#252b36] rounded-none hover:border-cyan-500/50 transition-none">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              {t('dashboard.active_pipeline', 'Active Pipeline Value')}
            </span>
            <div className="p-2 bg-[#0D0D0D] text-cyan-400 border border-[#252b36] rounded-none">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          {metricsLoading ? (
            <Skeleton className="h-8 w-28 mt-3" />
          ) : (
            <div className="mt-3">
              <div className="text-2xl font-bold text-white tracking-tight font-mono">
                {formatCurrency(metrics?.deals.pipeline_value || 0)}
              </div>
              <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1 font-mono">
                <span className="text-cyan-400 font-bold">{formatNumber(metrics?.deals.total || 0)} DEALS</span> IN FLIGHT
              </p>
            </div>
          )}
        </Card>

        {/* Total Customers */}
        <Card className="bg-[#1A1F26] border-[#252b36] rounded-none hover:border-emerald-500/50 transition-none">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              {t('dashboard.active_customers', 'Active Accounts')}
            </span>
            <div className="p-2 bg-[#0D0D0D] text-emerald-400 border border-[#252b36] rounded-none">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          {metricsLoading ? (
            <Skeleton className="h-8 w-24 mt-3" />
          ) : (
            <div className="mt-3">
              <div className="text-2xl font-bold text-white tracking-tight font-mono">
                {formatNumber(metrics?.customers.total || 0)}
              </div>
              <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1 font-mono">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">100% MONITORED</span>
              </p>
            </div>
          )}
        </Card>

        {/* Monthly Recurring Revenue */}
        <Card className="bg-[#1A1F26] border-[#252b36] rounded-none hover:border-purple-500/50 transition-none">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              {t('dashboard.monthly_revenue', 'Monthly Recurring Revenue (MRR)')}
            </span>
            <div className="p-2 bg-[#0D0D0D] text-purple-400 border border-[#252b36] rounded-none">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          {metricsLoading ? (
            <Skeleton className="h-8 w-28 mt-3" />
          ) : (
            <div className="mt-3">
              <div className="text-2xl font-bold text-white tracking-tight font-mono">
                {formatCurrency(metrics?.customers.mrr || 0)}
              </div>
              <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1 font-mono">
                <span className="text-purple-400 font-bold">ARR: {formatCurrency(metrics?.customers.arr || 0)}</span>
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Main Dashboard Section: Chart & Real-Time Event Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Chart */}
        <Card className="lg:col-span-2 bg-[#1A1F26] border-[#252b36] rounded-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-[#252b36]">
            <div>
              <CardTitle className="font-mono uppercase text-sm tracking-wider">{t('deals.title', 'Sales Pipeline Distribution')}</CardTitle>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                {t('deals.subtitle', 'Real-time opportunity values across stages managed by SalesPipelineAgent')}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setActivePage('deals')} className="rounded-none font-mono text-xs uppercase border-[#252b36] hover:bg-[#0D0D0D]">
              View Board
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            {pipelineLoading ? <Skeleton className="h-64 w-full" /> : <PipelineChart metrics={pipeline} />}
          </CardContent>
        </Card>

        {/* Real-time Agent Activity Feed */}
        <Card className="bg-[#1A1F26] border-[#252b36] rounded-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-[#252b36]">
            <div>
              <CardTitle className="font-mono uppercase text-sm tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#FF2A54] animate-pulse" />
                {t('dashboard.agent_telemetry', 'Live Agent Telemetry')}
              </CardTitle>
              <p className="text-xs text-slate-400 mt-1 font-mono">Real-time WebSocket event stream</p>
            </div>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {events.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs font-mono">Waiting for agent events...</div>
              ) : (
                events.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3 bg-[#0D0D0D] border border-[#252b36] text-xs space-y-1 hover:border-[#FF2A54]/40 transition-none font-mono"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#FF2A54] uppercase">{evt.agent}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-slate-300 font-medium">{evt.type.replace('_', ' ')}</p>
                    {evt.data?.message && <p className="text-[11px] text-slate-400 font-sans">{evt.data.message}</p>}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Agent Execution Triggers Banner */}
      <Card className="bg-[#1A1F26] border border-[#FF2A54]/40 rounded-none shadow-[0_0_15px_rgba(255,42,84,0.15)]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-2">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-none bg-[#0D0D0D] border border-[#FF2A54]/50 flex items-center justify-center text-[#FF2A54] shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white font-mono uppercase">Trigger Autonomous Workflows</h4>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Run lead qualification, analyze emails, monitor churn risk, or schedule calendar prep automatically.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 font-mono">
            <Button size="sm" variant="primary" onClick={() => setLeadModalOpen(true)} className="rounded-none uppercase tracking-wider text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Qualify Lead</span>
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setDealModalOpen(true)} className="rounded-none uppercase tracking-wider text-xs border-[#252b36]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Analyze Deal</span>
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEmailModalOpen(true)} className="rounded-none uppercase tracking-wider text-xs border-[#252b36] hover:bg-[#0D0D0D]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Analyze Email</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

