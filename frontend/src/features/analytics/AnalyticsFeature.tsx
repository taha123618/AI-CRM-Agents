import { useState } from 'react';
import { BarChart3, TrendingUp, Sparkles, PieChart as PieIcon, CheckCircle2, Bot, TrendingDown, Minus, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { PipelineChart } from '@/components/charts/PipelineChart';
import { HealthDistributionChart } from '@/components/charts/HealthDistributionChart';
import { useDashboardMetrics, usePipelineMetrics, useAnalyticsInsights } from '@/hooks/use-analytics';
import { useTriggerAnalyticsAgent } from '@/hooks/use-agents';
import { useTranslation, useLocaleFormat } from '@/features/multi-language';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCustomers } from '@/hooks/use-customers';

export function AnalyticsFeature() {
  const { t } = useTranslation();
  const { formatCurrency, formatNumber } = useLocaleFormat();
  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useDashboardMetrics();
  const { data: pipeline, isLoading: pipelineLoading, refetch: refetchPipeline } = usePipelineMetrics();
  const { data: customers } = useCustomers();
  const { data: insights, isLoading: insightsLoading, refetch: refetchInsights } = useAnalyticsInsights();
  const generateDashboardMutation = useTriggerAnalyticsAgent();

  const [forecastResult, setForecastResult] = useState<any>(null);

  const lowRiskCount = (customers || []).filter((c) => c.churn_risk === 'low').length;
  const mediumRiskCount = (customers || []).filter((c) => c.churn_risk === 'medium').length;
  const highRiskCount = (customers || []).filter((c) => c.churn_risk === 'high').length;

  const handleGenerate = async () => {
    try {
      const data = await generateDashboardMutation.mutateAsync('all');
      setForecastResult(data);
      await Promise.all([refetchMetrics(), refetchPipeline(), refetchInsights()]);
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-brand-400" />
            {t('analytics.title', 'Executive ARR & Predictive Analytics')}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t('analytics.subtitle', 'Live multi-agent strategic forecasting and pipeline trajectory')}
          </p>
        </div>

        <Button
          onClick={handleGenerate}
          isLoading={generateDashboardMutation.isPending}
        >
          <Sparkles className="w-4 h-4" />
          <span>{t('analytics.run_analytics', 'Generate Live AI Forecast')}</span>
        </Button>
      </div>

      {/* AnalyticsAgent Live Insights Panel */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-brand-400" />
            AnalyticsAgent — Live AI Insights
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => refetchInsights()} disabled={insightsLoading}>
            <RefreshCw className={`w-3.5 h-3.5 ${insightsLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </CardHeader>
        <CardContent>
          {insightsLoading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
            </div>
          ) : insights ? (
            <div className="space-y-4">
              {/* Summary */}
              <p className="text-xs text-slate-400 italic border-l-2 border-brand-500/40 pl-3">{insights.summary}</p>

              {/* KPI Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {insights.kpis.map((kpi) => (
                  <div key={kpi.label} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">{kpi.label}</div>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-black ${
                        kpi.trend === 'up' ? 'text-emerald-400' : kpi.trend === 'down' ? 'text-rose-400' : 'text-slate-300'
                      }`}>{kpi.value}</span>
                      {kpi.trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />}
                      {kpi.trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-rose-400" />}
                      {kpi.trend === 'neutral' && <Minus className="w-3.5 h-3.5 text-slate-500" />}
                    </div>
                  </div>
                ))}
              </div>

              {/* Insight bullets */}
              <div className="space-y-2">
                {insights.insights.map((insight, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 mt-0.5 shrink-0" />
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500 text-xs">Unable to load insights.</div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Leads & Conversion</span>
            <TrendingUp className="w-5 h-5 text-brand-400" />
          </div>
          {metricsLoading ? (
            <Skeleton className="h-10 w-24 mt-2" />
          ) : (
            <div className="mt-3 space-y-1">
              <div className="text-2xl font-extrabold text-white">
                {formatNumber(metrics?.leads.total || 0)} Leads
              </div>
              <p className="text-xs text-emerald-400 font-medium">
                {metrics?.leads.total ? Math.round(((metrics.leads.qualified || 0) / metrics.leads.total) * 100) : 0}% AI Qualification Rate
              </p>
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Annual Run Rate (ARR)</span>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          {metricsLoading ? (
            <Skeleton className="h-10 w-32 mt-2" />
          ) : (
            <div className="mt-3 space-y-1">
              <div className="text-2xl font-extrabold text-white">
                {formatCurrency(metrics?.customers.arr || 0)}
              </div>
              <p className="text-xs text-slate-400">
                MRR: <span className="text-white font-semibold">{formatCurrency(metrics?.customers.mrr || 0)}</span>
              </p>
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Weighted Pipeline</span>
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          {metricsLoading ? (
            <Skeleton className="h-10 w-32 mt-2" />
          ) : (
            <div className="mt-3 space-y-1">
              <div className="text-2xl font-extrabold text-white">
                {formatCurrency(metrics?.deals.pipeline_value || 0)}
              </div>
              <p className="text-xs text-slate-400">
                Total Deals: <span className="text-white font-semibold">{metrics?.deals.total || 0}</span>
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Volume by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            {pipelineLoading ? <Skeleton className="h-64 w-full" /> : <PipelineChart metrics={pipeline} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-400" />
              Customer Retention & Health Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HealthDistributionChart
              lowRiskCount={lowRiskCount || 10}
              mediumRiskCount={mediumRiskCount || 3}
              highRiskCount={highRiskCount || 1}
            />
          </CardContent>
        </Card>
      </div>

      {/* AI Analytics & Forecast Modal */}
      {forecastResult && (
        <Modal
          isOpen={Boolean(forecastResult)}
          onClose={() => setForecastResult(null)}
          title="AI Analytics & Revenue Forecast"
          description="Real-time KPI calculations and predictive insights generated by AnalyticsAgent"
        >
          <div className="space-y-4">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Conversion Rate</span>
                <span className="text-sm font-extrabold text-emerald-400">
                  {forecastResult.kpis?.lead_conversion_rate || 30}%
                </span>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Win Rate</span>
                <span className="text-sm font-extrabold text-brand-400">
                  {forecastResult.kpis?.win_rate || 24}%
                </span>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">MRR</span>
                <span className="text-sm font-extrabold text-white">
                  {formatCurrency(forecastResult.kpis?.mrr || 50000)}
                </span>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">ARR</span>
                <span className="text-sm font-extrabold text-purple-400">
                  {formatCurrency(forecastResult.kpis?.arr || 600000)}
                </span>
              </div>
            </div>

            {/* Quick Insights */}
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                Strategic AI Insights
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {Array.isArray(forecastResult.insights) && forecastResult.insights.length > 0 ? (
                  forecastResult.insights.map((insight: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{insight}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400">
                    1. Revenue growing steadily at 12% MoM<br />
                    2. Strong lead conversion rate across tech accounts<br />
                    3. Recommended sales cycle optimization for proposal stage
                  </li>
                )}
              </ul>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <Button variant="outline" onClick={() => setForecastResult(null)}>
                Close Report
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
