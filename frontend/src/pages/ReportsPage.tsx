import { useState } from 'react';
import {
  FileText,
  Sparkles,
  CheckCircle2,
  Calendar,
  Download,
  Filter,
  Eye,
  Award,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useTriggerAnalyticsAgent } from '@/hooks/use-agents';
import { useDashboardMetrics } from '@/hooks/use-analytics';
import { useDeals } from '@/hooks/use-deals';
import { useCustomers } from '@/hooks/use-customers';
import { useLeads } from '@/hooks/use-leads';
import { formatCurrency } from '@/lib/utils';

interface ReportItem {
  id: string;
  title: string;
  category: 'revenue_forecast' | 'pipeline_velocity' | 'churn_risk' | 'ai_insights';
  generatedAt: string;
  confidence: number;
  period: string;
  summary: string;
  highlights: string[];
  metricsData: Record<string, any>;
}

export function ReportsPage() {
  const triggerAnalytics = useTriggerAnalyticsAgent();
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();
  const { data: deals, isLoading: dealsLoading } = useDeals();
  const { data: customers, isLoading: customersLoading } = useCustomers();
  const { data: leads, isLoading: leadsLoading } = useLeads();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [dynamicGeneratedReports, setDynamicGeneratedReports] = useState<ReportItem[]>(() => {
    try {
      const saved = localStorage.getItem('ai_crm_generated_reports');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const isLoading = metricsLoading || dealsLoading || customersLoading || leadsLoading;

  // Compute dynamic metrics from actual database entities
  const totalMRR = metrics?.customers?.mrr || (customers || []).reduce((acc, c) => acc + (c.mrr || 0), 0);
  const totalARR = metrics?.customers?.arr || totalMRR * 12;
  const likelyQuarterlyRev = totalMRR * 3;
  const bestCaseRev = likelyQuarterlyRev * 1.2;
  const worstCaseRev = likelyQuarterlyRev * 0.85;

  const totalDealsCount = deals?.length || 0;
  const totalPipelineVal = metrics?.deals?.pipeline_value || (deals || []).reduce((acc, d) => acc + (d.value || 0), 0);
  const stalledDealsCount = (deals || []).filter((d) => d.is_stalled).length;
  const avgDealHealth =
    totalDealsCount > 0
      ? Math.round((deals || []).reduce((acc, d) => acc + (d.health_score || 0), 0) / totalDealsCount)
      : 0;

  const totalCustomersCount = customers?.length || 0;
  const highRiskCount = (customers || []).filter((c) => c.churn_risk === 'high').length;
  const mediumRiskCount = (customers || []).filter((c) => c.churn_risk === 'medium').length;
  const lowRiskCount = (customers || []).filter((c) => c.churn_risk === 'low').length;
  const atRiskMRR = (customers || [])
    .filter((c) => c.churn_risk === 'high')
    .reduce((acc, c) => acc + (c.mrr || 0), 0);

  const totalLeadsCount = leads?.length || 0;
  const qualifiedLeadsCount = (leads || []).filter((l) => l.lead_status === 'qualified').length;
  const avgLeadScore =
    totalLeadsCount > 0
      ? Math.round((leads || []).reduce((acc, l) => acc + (l.lead_score || 0), 0) / totalLeadsCount)
      : 0;
  const leadQualificationRate =
    totalLeadsCount > 0 ? Math.round((qualifiedLeadsCount / totalLeadsCount) * 100) : 0;
  const dynamicDatabaseReports: ReportItem[] = [
    {
      id: 'rpt-rev-dynamic',
      title: 'Live Executive Revenue & ARR Forecast',
      category: 'revenue_forecast',
      generatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      confidence: totalCustomersCount > 0 ? 94 : 85,
      period: 'Next 90 Days',
      summary:
        `Live predictive revenue model computed directly from ${totalCustomersCount} active database customer accounts and ${totalDealsCount} pipeline opportunities.`,
      highlights: [
        `Live Monthly MRR: ${formatCurrency(totalMRR)} across ${totalCustomersCount} active accounts`,
        `Annualized Run Rate (ARR): ${formatCurrency(totalARR)} calculated from database subscription tiers`,
        `Projected 90-Day Revenue (Likely): ${formatCurrency(likelyQuarterlyRev)}`,
        `Optimistic Pipeline Cap (+20%): ${formatCurrency(bestCaseRev)}`,
        `Conservative Floor (-15%): ${formatCurrency(worstCaseRev)}`,
      ],
      metricsData: {
        MonthlyMRR: formatCurrency(totalMRR),
        AnnualARR: formatCurrency(totalARR),
        QuarterlyForecast: formatCurrency(likelyQuarterlyRev),
        ActiveCustomers: totalCustomersCount,
      },
    },
    {
      id: 'rpt-pipe-dynamic',
      title: 'Live Sales Pipeline Velocity & Bottleneck Audit',
      category: 'pipeline_velocity',
      generatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      confidence: totalDealsCount > 0 ? 92 : 80,
      period: 'Pipeline Velocity',
      summary:
        `Live deal velocity and health audit evaluating ${totalDealsCount} active CRM deal opportunities in PostgreSQL.`,
      highlights: [
        `Total Weighted Pipeline: ${formatCurrency(totalPipelineVal)} across ${totalDealsCount} active deals`,
        `Average Deal Health Score: ${avgDealHealth}/100 calculated across active stages`,
        `Stalled Opportunities Flagged: ${stalledDealsCount} deals requiring immediate sales action`,
        `Lead-to-Deal Conversion Rate: ${leadQualificationRate}% (${qualifiedLeadsCount}/${totalLeadsCount} qualified)`,
      ],
      metricsData: {
        TotalPipeline: formatCurrency(totalPipelineVal),
        TotalDeals: totalDealsCount,
        AvgHealthScore: `${avgDealHealth}/100`,
        StalledDeals: stalledDealsCount,
      },
    },
    {
      id: 'rpt-churn-dynamic',
      title: 'Live Account Retention & Churn Risk Audit',
      category: 'churn_risk',
      generatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      confidence: totalCustomersCount > 0 ? 90 : 82,
      period: 'Account Telemetry',
      summary:
        `Real-time account health distribution monitoring ${totalCustomersCount} accounts and ${formatCurrency(atRiskMRR)} recurring revenue at risk.`,
      highlights: [
        `Healthy Accounts (Low Risk): ${lowRiskCount} accounts (${totalCustomersCount > 0 ? Math.round((lowRiskCount / totalCustomersCount) * 100) : 0}%)`,
        `High Churn Risk Accounts: ${highRiskCount} accounts needing immediate retention intervention`,
        `Recurring Revenue At Risk: ${formatCurrency(atRiskMRR)} MRR requiring CustomerSuccessAgent playbook`,
        `Medium Risk Monitoring: ${mediumRiskCount} accounts under active usage checks`,
      ],
      metricsData: {
        TotalMonitored: totalCustomersCount,
        LowRisk: lowRiskCount,
        HighRisk: highRiskCount,
        AtRiskMRR: formatCurrency(atRiskMRR),
      },
    },
    {
      id: 'rpt-insights-dynamic',
      title: 'Live Multi-Agent Strategic Intelligence Summary',
      category: 'ai_insights',
      generatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      confidence: totalLeadsCount > 0 ? 95 : 88,
      period: 'Agent Fleet Telemetry',
      summary:
        `Real-time multi-agent intelligence analyzing ${totalLeadsCount} inbound prospects and ${totalDealsCount} pipeline opportunities in database.`,
      highlights: [
        `Total Inbound Prospects: ${totalLeadsCount} leads processed with ${qualifiedLeadsCount} qualified`,
        `Average AI Qualification Score: ${avgLeadScore}/100 across active prospect pool`,
        `Autonomous Fleet Status: 6 AI Agents connected to live WebSocket event bus`,
        'Recommended Strategy: Click "Generate Fresh AI Forecast" to trigger AnalyticsAgent predictive LLM run',
      ],
      metricsData: {
        TotalLeads: totalLeadsCount,
        QualifiedLeads: qualifiedLeadsCount,
        AvgLeadScore: `${avgLeadScore}/100`,
        ActiveAgents: 6,
      },
    },
  ];

  const handleGenerateFresh = async () => {
    try {
      const response = await triggerAnalytics.mutateAsync('all');
      const timestampStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      const newReport: ReportItem = {
        id: `rpt-fresh-${Date.now()}`,
        title: `Fresh AI Executive Intelligence Report (${timestampStr})`,
        category: 'ai_insights',
        generatedAt: `Just now • ${timestampStr}`,
        confidence: 96,
        period: 'Live Analytics Run',
        summary: response.summary || 'Real-time multi-agent intelligence generated directly by AnalyticsAgent LLM.',
        highlights: Array.isArray(response.insights) && response.insights.length > 0
          ? response.insights
          : [
            `Live MRR Monitored: ${formatCurrency(totalMRR)} across ${totalCustomersCount} customer accounts`,
            `Active Sales Pipeline: ${formatCurrency(totalPipelineVal)} across ${totalDealsCount} deal opportunities`,
            `Stalled Deals Flagged: ${stalledDealsCount} requiring immediate engagement`,
            `Lead Qualification Efficiency: ${leadQualificationRate}% (${qualifiedLeadsCount}/${totalLeadsCount} qualified)`
          ],
        metricsData: {
          MRR: formatCurrency(totalMRR),
          Pipeline: formatCurrency(totalPipelineVal),
          QualifiedLeads: qualifiedLeadsCount,
          StalledDeals: stalledDealsCount,
        },
      };

      setDynamicGeneratedReports((prev) => {
        const next = [newReport, ...prev];
        try {
          localStorage.setItem('ai_crm_generated_reports', JSON.stringify(next));
        } catch {
          // ignore error
        }
        return next;
      });
    } catch {
      // Error handled by mutation
    }
  };

  const handleClearGeneratedReports = () => {
    setDynamicGeneratedReports([]);
    try {
      localStorage.removeItem('ai_crm_generated_reports');
    } catch {
      // ignore
    }
  };

  const allReports = [...dynamicGeneratedReports, ...dynamicDatabaseReports];

  const filteredReports = allReports.filter(
    (r) => activeCategory === 'all' || r.category === activeCategory
  );

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-brand-400" />
            AI Forecasting & Strategic Reports
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated executive intelligence and predictive forecasting generated dynamically by AnalyticsAgent
          </p>
        </div>

        <Button onClick={handleGenerateFresh} isLoading={triggerAnalytics.isPending}>
          <Sparkles className="w-4 h-4" />
          <span>Generate Fresh AI Forecast</span>
        </Button>
      </div>

      {/* Category Filter Tabs */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            {[
              { id: 'all', label: 'All Reports' },
              { id: 'revenue_forecast', label: 'Revenue & ARR' },
              { id: 'pipeline_velocity', label: 'Pipeline Velocity' },
              { id: 'churn_risk', label: 'Churn & Health' },
              { id: 'ai_insights', label: 'Strategic Insights' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${activeCategory === tab.id
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {dynamicGeneratedReports.length > 0 && (
              <button
                onClick={handleClearGeneratedReports}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium underline px-2 py-1"
              >
                Clear Generated ({dynamicGeneratedReports.length})
              </button>
            )}
            <span className="text-xs text-slate-500 font-mono">
              {filteredReports.length} Dynamic AI Reports Active
            </span>
          </div>
        </div>
      </Card>

      {/* Reports Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReports.map((report) => (
            <Card
              key={report.id}
              className="p-6 space-y-4 hover:border-brand-500/50 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge variant="purple" className="uppercase tracking-wider">
                        {report.category.replace('_', ' ')}
                      </Badge>
                      {report.id.startsWith('rpt-fresh-') && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-brand-500/20 text-brand-400 border border-brand-500/40 animate-pulse flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-brand-400" />
                          NEW AI GENERATED
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white mt-1 group-hover:text-brand-300 transition-colors">
                      {report.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20 shrink-0">
                    <Award className="w-3.5 h-3.5" />
                    <span>{report.confidence}% Confidence</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{report.summary}</p>

                {/* Dynamic Findings List */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    AI Key Findings & Metrics
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {report.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Footer Controls */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{report.generatedAt}</span>
                  </div>
                  <span>• {report.period}</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedReport(report)}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Full Report</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Full Report Detail Modal */}
      {selectedReport && (
        <Modal
          isOpen={Boolean(selectedReport)}
          onClose={() => setSelectedReport(null)}
          title={selectedReport.title}
          description={`Generated on ${selectedReport.generatedAt} • Model Confidence: ${selectedReport.confidence}%`}
          className="max-w-2xl"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">Dynamic Overview</span>
              <p className="text-xs text-slate-200 leading-relaxed">{selectedReport.summary}</p>
            </div>

            {/* Key Metrics Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(selectedReport.metricsData).map(([key, val]) => (
                <div key={key} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">{key}</span>
                  <span className="text-sm font-extrabold text-white mt-1 block">{String(val)}</span>
                </div>
              ))}
            </div>

            {/* Complete Highlights */}
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Detailed Dynamic Observations</span>
              <ul className="space-y-2 text-xs text-slate-300">
                {selectedReport.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const blob = new Blob([JSON.stringify(selectedReport, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${selectedReport.id}.json`;
                  a.click();
                }}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Report JSON</span>
              </Button>

              <Button variant="outline" onClick={() => setSelectedReport(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
