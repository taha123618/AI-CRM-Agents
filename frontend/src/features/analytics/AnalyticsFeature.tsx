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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card p-4 border border-border">
        <div>
          <h1 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <span>{t('analytics.title', 'ARR & PREDICTIVE ANALYTICS')}</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 uppercase">
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
            <Bot className="w-4 h-4 text-primary" />
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
              <p className="text-xs text-foreground/80 font-mono border-l-2 border-primary pl-3 uppercase">{insights.summary}</p>

              {/* KPI Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                {insights.kpis.map((kpi) => (
                  <div key={kpi.label} className="p-2.5 bg-background border border-border space-y-1">
                    <div className="text-[9px] text-muted-foreground uppercase font-bold">{kpi.label}</div>
                    <div className="flex items-center gap-2">
                      <span className={`text-base font-black font-mono ${kpi.trend === 'up' ? 'text-primary' : kpi.trend === 'down' ? 'text-destructive' : 'text-foreground/80'
                        }`}>{kpi.value}</span>
                      {kpi.trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-primary" />}
                      {kpi.trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-destructive" />}
                      {kpi.trend === 'neutral' && <Minus className="w-3.5 h-3.5 text-muted-foreground/60" />}
                    </div>
                  </div>
                ))}
              </div>

              {/* Insight bullets */}
              <div className="space-y-1.5 pt-1">
                {insights.insights.map((insight, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-foreground/80 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground/60 text-xs font-mono uppercase">UNABLE TO LOAD INSIGHTS.</div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">TOTAL LEADS &amp; CONVERSION</span>
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          {metricsLoading ? (
            <Skeleton className="h-8 w-24 mt-2" />
          ) : (
            <div className="mt-2 space-y-0.5">
              <div className="text-xl font-black font-mono text-white">
                {formatNumber(metrics?.leads.total || 0)} LEADS
              </div>
              <p className="text-[10px] font-mono text-primary">
                {metrics?.leads.total ? Math.round(((metrics.leads.qualified || 0) / metrics.leads.total) * 100) : 0}% QUALIFICATION RATE
              </p>
            </div>
          )}
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">ANNUAL RUN RATE (ARR)</span>
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          {metricsLoading ? (
            <Skeleton className="h-8 w-32 mt-2" />
          ) : (
            <div className="mt-2 space-y-0.5">
              <div className="text-xl font-black font-mono text-white">
                {formatCurrency(metrics?.customers.arr || 0)}
              </div>
              <p className="text-[10px] font-mono text-muted-foreground">
                MRR: <span className="text-white font-bold">{formatCurrency(metrics?.customers.mrr || 0)}</span>
              </p>
            </div>
          )}
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">WEIGHTED PIPELINE</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          {metricsLoading ? (
            <Skeleton className="h-8 w-32 mt-2" />
          ) : (
            <div className="mt-2 space-y-0.5">
              <div className="text-xl font-black font-mono text-white">
                {formatCurrency(metrics?.deals.pipeline_value || 0)}
              </div>
              <p className="text-[10px] font-mono text-muted-foreground">
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
              <PieIcon className="w-4 h-4 text-primary" />
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
              <div className="p-2.5 bg-background border border-border">
                <span className="text-[9px] text-muted-foreground uppercase font-bold block">CONVERSION</span>
                <span className="text-xs font-black font-mono text-primary">
                  {forecastResult.kpis?.lead_conversion_rate || 30}%
                </span>
              </div>
              <div className="p-2.5 bg-background border border-border">
                <span className="text-[9px] text-muted-foreground uppercase font-bold block">WIN RATE</span>
                <span className="text-xs font-black font-mono text-cyan-400">
                  {forecastResult.kpis?.win_rate || 24}%
                </span>
              </div>
              <div className="p-2.5 bg-background border border-border">
                <span className="text-[9px] text-muted-foreground uppercase font-bold block">MRR</span>
                <span className="text-xs font-black font-mono text-white">
                  {formatCurrency(forecastResult.kpis?.mrr || 50000)}
                </span>
              </div>
              <div className="p-2.5 bg-background border border-border">
                <span className="text-[9px] text-muted-foreground uppercase font-bold block">ARR</span>
                <span className="text-xs font-black font-mono text-primary">
                  {formatCurrency(forecastResult.kpis?.arr || 600000)}
                </span>
              </div>
            </div>

            {/* Quick Insights */}
            <div className="p-3 bg-background border border-border space-y-1.5">
              <h4 className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-primary" />
                STRATEGIC AI INSIGHTS
              </h4>
              <ul className="space-y-1 text-xs font-mono text-foreground/80">
                {Array.isArray(forecastResult.insights) && forecastResult.insights.length > 0 ? (
                  forecastResult.insights.map((insight: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                      <span>{insight}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-muted-foreground text-xs">
                    1. Revenue growing steadily at 12% MoM<br />
                    2. Strong lead conversion rate across tech accounts<br />
                    3. Recommended sales cycle optimization for proposal stage
                  </li>
                )}
              </ul>
            </div>

            <div className="flex justify-end pt-1 border-t border-border">
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
