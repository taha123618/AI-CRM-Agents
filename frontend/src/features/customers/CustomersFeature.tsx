import { useState } from 'react';
import { Building2, Activity, Bot, TrendingDown, Zap, CheckCircle2, AlertTriangle, BarChart3, Users, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCustomers, useCustomerHealth } from '@/hooks/use-customers';
import { useTriggerCustomerSuccess } from '@/hooks/use-agents';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, getScoreColor } from '@/lib/utils';
import { Customer } from '@/types/crm.types';

function ChurnGauge({ probability }: { probability: number }) {
  const pct = Math.min(100, Math.max(0, probability));
  const color = pct >= 70 ? '#f43f5e' : pct >= 40 ? '#f59e0b' : '#10b981';
  const radius = 32;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="#1e293b" strokeWidth="8" />
        <circle
          cx="40" cy="40" r={radius} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        <text x="40" y="44" textAnchor="middle" fill={color} fontSize="13" fontWeight="700">{pct}%</text>
      </svg>
      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Churn Risk</span>
    </div>
  );
}

function EngagementBar({ label, value, max = 100, unit = '' }: { label: string; value: number; max?: number; unit?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  const color = pct >= 60 ? 'bg-emerald-500' : pct >= 30 ? 'bg-amber-500' : 'bg-rose-500';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="text-white font-semibold">{value}{unit}</span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function CustomersFeature() {
  const { data: customers, isLoading, refetch } = useCustomers();
  const monitorCustomerMutation = useTriggerCustomerSuccess();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [monitoringId, setMonitoringId] = useState<string | null>(null);
  const [monitorResult, setMonitorResult] = useState<Record<string, any> | null>(null);
  const [isBulkMonitoring, setIsBulkMonitoring] = useState(false);

  const { data: healthData, isLoading: healthLoading } = useCustomerHealth(selectedCustomer?.id || '');

  const handleMonitor = async (customer: Customer) => {
    setMonitoringId(customer.id);
    try {
      const response: any = await monitorCustomerMutation.mutateAsync(customer.id);
      const payload = response?.result || response;
      setMonitorResult(payload);

      const updatedCust = payload?.updated_customer;
      if (updatedCust) {
        setSelectedCustomer((prev) => prev ? {
          ...prev,
          health_score: updatedCust.health_score ?? prev.health_score,
          churn_risk: updatedCust.churn_risk ?? prev.churn_risk,
          churn_probability: updatedCust.churn_probability ?? prev.churn_probability,
          recommended_actions: updatedCust.recommended_actions ?? prev.recommended_actions,
        } : customer);
      } else {
        setSelectedCustomer(customer);
      }
      await refetch();
    } finally {
      setMonitoringId(null);
    }
  };

  const handleBulkMonitor = async () => {
    setIsBulkMonitoring(true);
    try {
      await monitorCustomerMutation.mutateAsync('all');
      await refetch();
    } finally {
      setIsBulkMonitoring(false);
    }
  };

  const handleViewHealth = (customer: Customer) => {
    setMonitorResult(null);
    setSelectedCustomer(customer);
  };

  const getRiskClass = (risk: string) => {
    if (risk === 'high') return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    if (risk === 'medium') return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  };

  const activeAgentData = monitorResult?.result || monitorResult;
  const currentHealthScore = activeAgentData?.health_score ?? selectedCustomer?.health_score ?? 0;
  const currentChurnRisk = (activeAgentData?.churn_risk?.level || activeAgentData?.churn_risk || selectedCustomer?.churn_risk || 'low').toString();
  const currentChurnProb = activeAgentData?.churn_risk?.probability ?? activeAgentData?.churn_probability ?? selectedCustomer?.churn_probability ?? 0;
  const currentActions = activeAgentData?.recommended_actions || selectedCustomer?.recommended_actions || [];
  const currentRiskFactors = activeAgentData?.churn_risk?.factors || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-emerald-400" />
            Customer Success & Churn Risk Console
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Health scores, churn probability, and engagement telemetry monitored by <span className="text-emerald-400 font-semibold">CustomerSuccessAgent</span>
          </p>
        </div>

        <Button onClick={handleBulkMonitor} isLoading={isBulkMonitoring}>
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Run AI Fleet Health Audit</span>
        </Button>
      </div>

      {/* Summary KPI row */}
      {!isLoading && customers && customers.length > 0 && (() => {
        const highRisk = customers.filter(c => c.churn_risk === 'high').length;
        const avgHealth = Math.round(customers.reduce((a, c) => a + c.health_score, 0) / customers.length);
        const totalMrr = customers.reduce((a, c) => a + (c.mrr || 0), 0);
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Accounts', value: customers.length, icon: Users, color: 'text-brand-400' },
              { label: 'High Churn Risk', value: highRisk, icon: AlertTriangle, color: 'text-rose-400', warn: highRisk > 0 },
              { label: 'Avg Health Score', value: `${avgHealth}/100`, icon: Activity, color: 'text-emerald-400' },
              { label: 'Total MRR', value: formatCurrency(totalMrr), icon: BarChart3, color: 'text-amber-400' },
            ].map(({ label, value, icon: Icon, color, warn }) => (
              <div key={label} className={`p-4 rounded-2xl border backdrop-blur-sm ${warn ? 'bg-rose-500/5 border-rose-500/20' : 'bg-slate-900/60 border-slate-800/60'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span className="text-xs text-slate-400 font-medium">{label}</span>
                </div>
                <div className={`text-xl font-bold ${color}`}>{value}</div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Customer Table */}
      <Card>
        <CardHeader>
          <CardTitle>Monitored Accounts</CardTitle>
        </CardHeader>
        <div className="pt-2">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !customers || customers.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">No customers currently monitored.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>MRR</TableHead>
                  <TableHead>Health</TableHead>
                  <TableHead>Churn Risk</TableHead>
                  <TableHead>Churn Probability</TableHead>
                  <TableHead>Engagement</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((cust) => (
                  <TableRow key={cust.id} className="group cursor-pointer" onClick={() => handleViewHealth(cust)}>
                    <TableCell className="font-semibold text-white capitalize">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs">
                          <Zap className="w-3 h-3 text-brand-400" />
                          {cust.plan}
                        </span>
                        {(Boolean(cust.recommended_actions?.length) || (selectedCustomer?.id === cust.id && Boolean(monitorResult))) && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" />
                            NEW AI DATA
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono font-bold text-emerald-400">{formatCurrency(cust.mrr)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${cust.health_score >= 70 ? 'bg-emerald-500' : cust.health_score >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${cust.health_score}%` }}
                          />
                        </div>
                        <span className={`text-xs font-bold ${getScoreColor(cust.health_score).split(' ')[0]}`}>
                          {cust.health_score}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${getRiskClass(cust.churn_risk)}`}>
                        {cust.churn_risk === 'high' && <AlertTriangle className="w-3 h-3" />}
                        {cust.churn_risk} risk
                      </span>
                    </TableCell>
                    <TableCell>
                      {cust.churn_probability != null ? (
                        <span className={`text-sm font-bold ${cust.churn_probability >= 70 ? 'text-rose-400' : cust.churn_probability >= 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {cust.churn_probability}%
                        </span>
                      ) : (
                        <span className="text-slate-600 text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-slate-400 space-y-0.5">
                        {cust.logins_per_week != null && <div>{cust.logins_per_week} logins/wk</div>}
                        {cust.features_used != null && <div>{cust.features_used} features</div>}
                        {cust.license_usage_percent != null && <div>{cust.license_usage_percent}% license</div>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="secondary"
                        size="sm"
                        isLoading={monitoringId === cust.id}
                        onClick={() => handleMonitor(cust)}
                      >
                        <Bot className="w-3.5 h-3.5 text-brand-400" />
                        <span>AI Monitor</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      {/* Customer Health & AI Detail Modal */}
      {selectedCustomer && (
        <Modal
          isOpen={Boolean(selectedCustomer)}
          onClose={() => { setSelectedCustomer(null); setMonitorResult(null); }}
          title="Customer Health & AI Analysis"
          description={`CustomerSuccessAgent telemetry for ${selectedCustomer.plan} plan account`}
          className="max-w-2xl"
        >
          <div className="space-y-4">
            {/* Churn probability gauge + health score side by side */}
            <div className="flex items-center justify-around p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <ChurnGauge probability={currentChurnProb} />
              <div className="flex flex-col items-center gap-1">
                <div className={`text-4xl font-black ${getScoreColor(currentHealthScore).split(' ')[0]}`}>
                  {currentHealthScore}
                </div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Health Score</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className={`text-2xl font-bold px-3 py-1 rounded-xl border ${getRiskClass(currentChurnRisk)}`}>
                  {currentChurnRisk.toUpperCase()}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Churn Risk</span>
              </div>
            </div>

            {/* Engagement bars */}
            {healthLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (healthData || activeAgentData?.engagement) ? (
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-brand-400" />
                  Engagement Telemetry
                </h4>
                <EngagementBar
                  label="Logins / Week"
                  value={activeAgentData?.engagement?.logins_per_week ?? healthData?.engagement?.logins_per_week ?? selectedCustomer.logins_per_week ?? 0}
                  max={20}
                />
                <EngagementBar
                  label="Features Active"
                  value={activeAgentData?.engagement?.features_used ?? healthData?.engagement?.features_used ?? selectedCustomer.features_used ?? 0}
                  max={15}
                />
                <EngagementBar
                  label="License Utilization"
                  value={activeAgentData?.engagement?.license_usage_percent ?? healthData?.engagement?.license_usage_percent ?? selectedCustomer.license_usage_percent ?? 0}
                  unit="%"
                />
              </div>
            ) : null}

            {/* AI Recommended Actions from CustomerSuccessAgent */}
            {currentActions.length > 0 && (
              <div className="p-4 rounded-2xl bg-brand-500/5 border border-brand-500/20 space-y-2">
                <h4 className="text-xs font-bold text-brand-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-brand-400" />
                  CustomerSuccessAgent Recommended Actions
                </h4>
                <ul className="space-y-1.5">
                  {currentActions.map((action: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 mt-0.5 shrink-0" />
                      <span className="break-words flex-1">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Churn risk factors from agent result */}
            {currentRiskFactors.length > 0 && (
              <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-2">
                <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                  Risk Factors Detected
                </h4>
                <ul className="space-y-1.5">
                  {currentRiskFactors.map((f: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-rose-300">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />
                      <span className="break-words flex-1">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <Button variant="outline" onClick={() => { setSelectedCustomer(null); setMonitorResult(null); }}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
