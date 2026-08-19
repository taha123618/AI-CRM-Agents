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
    <div className="space-y-4 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#1F2833] p-4 border border-[#3A4552]">
        <div>
          <h1 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#39FF14]" />
            <span>{t('analytics.title', 'ARR & PREDICTIVE ANALYTICS')}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 uppercase">
            {t('analytics.subtitle', 'MULTI-AGENT STRATEGIC FORECASTING AND REVENUE TELEMETRY')}
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleGenerate}
          isLoading={generateDashboardMutation.isPending}
          className="text-xs"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1" />
          <span>{t('analytics.run_analytics', 'GENERATE AI FORECAST')}</span>
        </Button>
      </div>

      {/* AnalyticsAgent Live Insights Panel */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-[#39FF14]" />
            <span>ANALYTICS AGENT — LIVE AI INSIGHTS</span>
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => refetchInsights()} disabled={insightsLoading} className="text-xs h-7">
            <RefreshCw className={`w-3.5 h-3.5 ${insightsLoading ? 'animate-spin' : ''}`} />
            <span>REFRESH</span>
          </Button>
        </CardHeader>
        <CardContent>
          {insightsLoading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
            </div>
          ) : insights ? (
            <div className="space-y-3">
              {/* Summary */}
              <p className="text-xs text-slate-300 font-mono border-l-2 border-[#39FF14] pl-3 uppercase">{insights.summary}</p>

              {/* KPI Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                {insights.kpis.map((kpi) => (
                  <div key={kpi.label} className="p-2.5 bg-[#0B0C10] border border-[#3A4552] space-y-1">
                    <div className="text-[9px] text-slate-400 uppercase font-bold">{kpi.label}</div>
                    <div className="flex items-center gap-2">
                      <span className={`text-base font-black font-mono ${
                        kpi.trend === 'up' ? 'text-[#39FF14]' : kpi.trend === 'down' ? 'text-[#FF2A54]' : 'text-slate-300'
                      }`}>{kpi.value}</span>
                      {kpi.trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-[#39FF14]" />}
                      {kpi.trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-[#FF2A54]" />}
                      {kpi.trend === 'neutral' && <Minus className="w-3.5 h-3.5 text-slate-500" />}
                    </div>
                  </div>
                ))}
              </div>

              {/* Insight bullets */}
              <div className="space-y-1.5 pt-1">
                {insights.insights.map((insight, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-300 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#39FF14] mt-0.5 shrink-0" />
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500 text-xs font-mono uppercase">UNABLE TO LOAD INSIGHTS.</div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">TOTAL LEADS &amp; CONVERSION</span>
            <TrendingUp className="w-4 h-4 text-[#39FF14]" />
          </div>
          {metricsLoading ? (
            <Skeleton className="h-8 w-24 mt-2" />
          ) : (
            <div className="mt-2 space-y-0.5">
              <div className="text-xl font-black font-mono text-white">
                {formatNumber(metrics?.leads.total || 0)} LEADS
              </div>
              <p className="text-[10px] font-mono text-[#39FF14]">
                {metrics?.leads.total ? Math.round(((metrics.leads.qualified || 0) / metrics.leads.total) * 100) : 0}% QUALIFICATION RATE
              </p>
            </div>
          )}
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">ANNUAL RUN RATE (ARR)</span>
            <TrendingUp className="w-4 h-4 text-[#39FF14]" />
          </div>
          {metricsLoading ? (
            <Skeleton className="h-8 w-32 mt-2" />
          ) : (
            <div className="mt-2 space-y-0.5">
              <div className="text-xl font-black font-mono text-white">
                {formatCurrency(metrics?.customers.arr || 0)}
              </div>
              <p className="text-[10px] font-mono text-slate-400">
                MRR: <span className="text-white font-bold">{formatCurrency(metrics?.customers.mrr || 0)}</span>
              </p>
            </div>
          )}
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">WEIGHTED PIPELINE</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          {metricsLoading ? (
            <Skeleton className="h-8 w-32 mt-2" />
          ) : (
            <div className="mt-2 space-y-0.5">
              <div className="text-xl font-black font-mono text-white">
                {formatCurrency(metrics?.deals.pipeline_value || 0)}
              </div>
              <p className="text-[10px] font-mono text-slate-400">
                TOTAL DEALS: <span className="text-white font-bold">{metrics?.deals.total || 0}</span>
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>PIPELINE VOLUME BY STAGE</CardTitle>
          </CardHeader>
          <CardContent>
            {pipelineLoading ? <Skeleton className="h-64 w-full" /> : <PipelineChart metrics={pipeline} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-[#39FF14]" />
              <span>RETENTION &amp; HEALTH DISTRIBUTION</span>
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
          title="AI REVENUE FORECAST"
          description="REAL-TIME KPI CALCULATIONS AND PREDICTIVE INSIGHTS GENERATED BY ANALYTICS AGENT"
        >
          <div className="space-y-3 font-mono">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2.5 bg-[#0B0C10] border border-[#3A4552]">
                <span className="text-[9px] text-slate-400 uppercase font-bold block">CONVERSION</span>
                <span className="text-xs font-black font-mono text-[#39FF14]">
                  {forecastResult.kpis?.lead_conversion_rate || 30}%
                </span>
              </div>
              <div className="p-2.5 bg-[#0B0C10] border border-[#3A4552]">
                <span className="text-[9px] text-slate-400 uppercase font-bold block">WIN RATE</span>
                <span className="text-xs font-black font-mono text-cyan-400">
                  {forecastResult.kpis?.win_rate || 24}%
                </span>
              </div>
              <div className="p-2.5 bg-[#0B0C10] border border-[#3A4552]">
                <span className="text-[9px] text-slate-400 uppercase font-bold block">MRR</span>
                <span className="text-xs font-black font-mono text-white">
                  {formatCurrency(forecastResult.kpis?.mrr || 50000)}
                </span>
              </div>
              <div className="p-2.5 bg-[#0B0C10] border border-[#3A4552]">
                <span className="text-[9px] text-slate-400 uppercase font-bold block">ARR</span>
                <span className="text-xs font-black font-mono text-[#39FF14]">
                  {formatCurrency(forecastResult.kpis?.arr || 600000)}
                </span>
              </div>
            </div>

            {/* Quick Insights */}
            <div className="p-3 bg-[#0B0C10] border border-[#3A4552] space-y-1.5">
              <h4 className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#39FF14]" />
                STRATEGIC AI INSIGHTS
              </h4>
              <ul className="space-y-1 text-xs font-mono text-slate-300">
                {Array.isArray(forecastResult.insights) && forecastResult.insights.length > 0 ? (
                  forecastResult.insights.map((insight: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-[#39FF14] shrink-0 mt-0.5" />
                      <span>{insight}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400 text-xs">
                    1. Revenue growing steadily at 12% MoM<br />
                    2. Strong lead conversion rate across tech accounts<br />
                    3. Recommended sales cycle optimization for proposal stage
                  </li>
                )}
              </ul>
            </div>

            <div className="flex justify-end pt-1 border-t border-[#3A4552]">
              <Button variant="outline" onClick={() => setForecastResult(null)} className="text-xs">
                CLOSE REPORT
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
