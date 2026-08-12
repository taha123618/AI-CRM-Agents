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
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';

export function DashboardPage() {
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();
  const { data: pipeline, isLoading: pipelineLoading } = usePipelineMetrics();
  const { events } = useAgentStore();
  const { setLeadModalOpen, setDealModalOpen, setEmailModalOpen, setActivePage } = useUIStore();

  return (
    <div className="space-y-6">
      {/* Agent Status Panel */}
      <AgentStatusPanel />

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Leads */}
        <Card className="hover:border-brand-500/50 hover:scale-[1.02] transition-all duration-300 bg-slate-900/40 glow-card-brand">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Leads</span>
            <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          {metricsLoading ? (
            <Skeleton className="h-8 w-24 mt-3" />
          ) : (
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-white tracking-tight font-mono">
                {formatNumber(metrics?.leads.total || 0)}
              </div>
              <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                <span className="text-emerald-400 font-bold">{metrics?.leads.qualified || 0} Qualified</span> by AI Agent
              </p>
            </div>
          )}
        </Card>

        {/* Pipeline Value */}
        <Card className="hover:border-blue-500/50 hover:scale-[1.02] transition-all duration-300 bg-slate-900/40 glow-card-brand">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Pipeline</span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          {metricsLoading ? (
            <Skeleton className="h-8 w-28 mt-3" />
          ) : (
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-white tracking-tight font-mono">
                {formatCurrency(metrics?.deals.pipeline_value || 0)}
              </div>
              <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                <span className="text-blue-400 font-bold">{metrics?.deals.total || 0} Deals</span> in progress
              </p>
            </div>
          )}
        </Card>

        {/* Total Customers */}
        <Card className="hover:border-emerald-500/50 hover:scale-[1.02] transition-all duration-300 bg-slate-900/40 glow-card-emerald">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Customers</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          {metricsLoading ? (
            <Skeleton className="h-8 w-24 mt-3" />
          ) : (
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-white tracking-tight font-mono">
                {formatNumber(metrics?.customers.total || 0)}
              </div>
              <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">100% Health Monitored</span>
              </p>
            </div>
          )}
        </Card>

        {/* Monthly Recurring Revenue */}
        <Card className="hover:border-purple-500/50 hover:scale-[1.02] transition-all duration-300 bg-slate-900/40 glow-card-purple">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly Revenue (MRR)</span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          {metricsLoading ? (
            <Skeleton className="h-8 w-28 mt-3" />
          ) : (
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-white tracking-tight font-mono">
                {formatCurrency(metrics?.customers.mrr || 0)}
              </div>
              <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                <span className="text-purple-400 font-bold">ARR: {formatCurrency(metrics?.customers.arr || 0)}</span>
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Main Dashboard Section: Chart & Real-Time Event Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Sales Pipeline Distribution</CardTitle>
              <p className="text-xs text-slate-400 mt-1">
                Real-time opportunity values across stages managed by SalesPipelineAgent
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>
                <Zap className="w-4 h-4 text-brand-400 animate-pulse" />
                Live Agent Telemetry
              </CardTitle>
              <p className="text-xs text-slate-400 mt-1">Real-time WebSocket event stream</p>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {events.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">Waiting for agent events...</div>
              ) : (
                events.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-brand-400 font-mono">{evt.agent}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-slate-300 font-medium">{evt.type.replace('_', ' ')}</p>
                    {evt.data?.message && <p className="text-[11px] text-slate-400">{evt.data.message}</p>}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Agent Execution Triggers Banner */}
      <Card className="bg-gradient-to-r from-slate-900 via-brand-950/40 to-slate-900 border-brand-500/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-2">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-600/20 border border-brand-500/40 flex items-center justify-center text-brand-400 shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Trigger Autonomous Workflows</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Run lead qualification, analyze emails, monitor churn risk, or schedule calendar prep automatically.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={() => setLeadModalOpen(true)}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Qualify Lead</span>
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setDealModalOpen(true)}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Analyze Deal</span>
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEmailModalOpen(true)}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Analyze Email</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
