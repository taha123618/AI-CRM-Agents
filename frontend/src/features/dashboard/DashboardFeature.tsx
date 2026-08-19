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
        <Card className="bg-white dark:bg-[#1D1B18] border-[#E9E6E0] dark:border-[#35322E] hover:border-[#DEDAD3] dark:hover:border-[#3F3B36] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#85817A] dark:text-[#807C75]">
              {t('dashboard.total_leads', 'Total Monitored Leads')}
            </span>
            <div className="p-2 rounded-xl bg-[#FAF9F6] dark:bg-[#25231F] text-[#1A1917] dark:text-[#F5F3EE] border border-[#E9E6E0] dark:border-[#35322E]">
              <Users className="w-4 h-4 text-[#1A1917] dark:text-[#F5F3EE]" />
            </div>
          </div>
          {metricsLoading ? (
            <Skeleton className="h-8 w-24 mt-3" />
          ) : (
            <div className="mt-3">
              <div className="text-2xl font-bold text-[#1A1917] dark:text-[#F5F3EE] tracking-tight font-mono">
                {formatNumber(metrics?.leads.total || 0)}
              </div>
              <p className="text-xs text-[#5F5C56] dark:text-[#B9B5AD] mt-1.5 flex items-center gap-1">
                <span className="text-[#64705B] font-semibold">{metrics?.leads.qualified || 0} Qualified</span> by AI Agent
              </p>
            </div>
          )}
        </Card>

        {/* Pipeline Value */}
        <Card className="bg-white dark:bg-[#1D1B18] border-[#E9E6E0] dark:border-[#35322E] hover:border-[#DEDAD3] dark:hover:border-[#3F3B36] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#85817A] dark:text-[#807C75]">
              {t('dashboard.active_pipeline', 'Active Pipeline Value')}
            </span>
            <div className="p-2 rounded-xl bg-[#FAF9F6] dark:bg-[#25231F] text-[#1A1917] dark:text-[#F5F3EE] border border-[#E9E6E0] dark:border-[#35322E]">
              <Briefcase className="w-4 h-4 text-[#1A1917] dark:text-[#F5F3EE]" />
            </div>
          </div>
          {metricsLoading ? (
            <Skeleton className="h-8 w-28 mt-3" />
          ) : (
            <div className="mt-3">
              <div className="text-2xl font-bold text-[#1A1917] dark:text-[#F5F3EE] tracking-tight font-mono">
                {formatCurrency(metrics?.deals.pipeline_value || 0)}
              </div>
              <p className="text-xs text-[#5F5C56] dark:text-[#B9B5AD] mt-1.5 flex items-center gap-1">
                <span className="text-[#806638] dark:text-[#DEC28C] font-semibold">{formatNumber(metrics?.deals.total || 0)} Deals</span> in progress
              </p>
            </div>
          )}
        </Card>

        {/* Total Customers */}
        <Card className="bg-white dark:bg-[#1D1B18] border-[#E9E6E0] dark:border-[#35322E] hover:border-[#DEDAD3] dark:hover:border-[#3F3B36] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#85817A] dark:text-[#807C75]">
              {t('dashboard.active_customers', 'Active Accounts')}
            </span>
            <div className="p-2 rounded-xl bg-[#FAF9F6] dark:bg-[#25231F] text-[#1A1917] dark:text-[#F5F3EE] border border-[#E9E6E0] dark:border-[#35322E]">
              <Building2 className="w-4 h-4 text-[#1A1917] dark:text-[#F5F3EE]" />
            </div>
          </div>
          {metricsLoading ? (
            <Skeleton className="h-8 w-24 mt-3" />
          ) : (
            <div className="mt-3">
              <div className="text-2xl font-bold text-[#1A1917] dark:text-[#F5F3EE] tracking-tight font-mono">
                {formatNumber(metrics?.customers.total || 0)}
              </div>
              <p className="text-xs text-[#5F5C56] dark:text-[#B9B5AD] mt-1.5 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-[#64705B]" />
                <span className="text-[#64705B] font-semibold">100% Health Monitored</span>
              </p>
            </div>
          )}
        </Card>

        {/* Monthly Recurring Revenue */}
        <Card className="bg-white dark:bg-[#1D1B18] border-[#E9E6E0] dark:border-[#35322E] hover:border-[#DEDAD3] dark:hover:border-[#3F3B36] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#85817A] dark:text-[#807C75]">
              {t('dashboard.monthly_revenue', 'Monthly Recurring Revenue')}
            </span>
            <div className="p-2 rounded-xl bg-[#FAF9F6] dark:bg-[#25231F] text-[#1A1917] dark:text-[#F5F3EE] border border-[#E9E6E0] dark:border-[#35322E]">
              <DollarSign className="w-4 h-4 text-[#1A1917] dark:text-[#F5F3EE]" />
            </div>
          </div>
          {metricsLoading ? (
            <Skeleton className="h-8 w-28 mt-3" />
          ) : (
            <div className="mt-3">
              <div className="text-2xl font-bold text-[#1A1917] dark:text-[#F5F3EE] tracking-tight font-mono">
                {formatCurrency(metrics?.customers.mrr || 0)}
              </div>
              <p className="text-xs text-[#5F5C56] dark:text-[#B9B5AD] mt-1.5 flex items-center gap-1">
                <span className="text-[#1A1917] dark:text-[#F5F3EE] font-semibold">ARR: {formatCurrency(metrics?.customers.arr || 0)}</span>
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Main Dashboard Section: Chart & Real-Time Event Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Chart */}
        <Card className="lg:col-span-2 bg-white dark:bg-[#1D1B18]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>{t('deals.title', 'Sales Pipeline Distribution')}</CardTitle>
              <p className="text-xs text-[#5F5C56] dark:text-[#B9B5AD] mt-1">
                {t('deals.subtitle', 'Real-time opportunity values across stages managed by SalesPipelineAgent')}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setActivePage('deals')}>
              View Board
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            {pipelineLoading ? <Skeleton className="h-64 w-full" /> : <PipelineChart metrics={pipeline} />}
          </CardContent>
        </Card>

        {/* Real-time Agent Activity Feed */}
        <Card className="bg-white dark:bg-[#1D1B18]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>
                <Zap className="w-4 h-4 text-[#C7A66A]" />
                {t('dashboard.agent_telemetry', 'Live Agent Telemetry')}
              </CardTitle>
              <p className="text-xs text-[#5F5C56] dark:text-[#B9B5AD] mt-1">Real-time WebSocket event stream</p>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {events.length === 0 ? (
                <div className="text-center py-8 text-[#85817A] dark:text-[#807C75] text-xs">Waiting for agent events...</div>
              ) : (
                events.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3 rounded-xl bg-[#FAF9F6] dark:bg-[#25231F] border border-[#E9E6E0] dark:border-[#35322E] text-xs space-y-1 hover:border-[#DEDAD3] dark:hover:border-[#3F3B36] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#1A1917] dark:text-[#F5F3EE] font-mono">{evt.agent}</span>
                      <span className="text-[10px] text-[#85817A] dark:text-[#807C75] font-mono">
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-[#5F5C56] dark:text-[#B9B5AD] font-medium">{evt.type.replace('_', ' ')}</p>
                    {evt.data?.message && <p className="text-[11px] text-[#85817A] dark:text-[#807C75]">{evt.data.message}</p>}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Agent Execution Triggers Banner */}
      <Card className="bg-[#FAF9F6] dark:bg-[#25231F] border-[#E9E6E0] dark:border-[#35322E]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-2">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#1A1917] dark:bg-[#1D1B18] border border-[#35332F] flex items-center justify-center text-white shrink-0">
              <Bot className="w-5 h-5 text-[#C7A66A]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#1A1917] dark:text-[#F5F3EE]">Trigger Autonomous Workflows</h4>
              <p className="text-xs text-[#5F5C56] dark:text-[#B9B5AD] mt-0.5">
                Run lead qualification, analyze emails, monitor churn risk, or schedule calendar prep automatically.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="primary" onClick={() => setLeadModalOpen(true)}>
              <Sparkles className="w-3.5 h-3.5 text-[#C7A66A]" />
              <span>Qualify Lead</span>
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setDealModalOpen(true)}>
              <span>Analyze Deal</span>
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEmailModalOpen(true)}>
              <span>Analyze Email</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
