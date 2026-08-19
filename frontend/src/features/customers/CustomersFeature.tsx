import { useState } from 'react';
import { Building2, Activity, Bot, TrendingDown, Zap, CheckCircle2, AlertTriangle, BarChart3, Users, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCustomers, useCustomerHealth } from '@/hooks/use-customers';
import { useTriggerCustomerSuccess } from '@/hooks/use-agents';
import { Modal } from '@/components/ui/Modal';
import { useTranslation, useLocaleFormat } from '@/features/multi-language';
import { getScoreColor } from '@/lib/utils';
import { Customer } from '@/types/crm.types';

function ChurnGauge({ probability }: { probability: number }) {
  const pct = Math.min(100, Math.max(0, probability));
  const color = pct >= 70 ? '#FF2A54' : pct >= 40 ? '#FFB800' : '#FFB800';
  const radius = 32;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1 font-mono">
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="#0B0C10" strokeWidth="8" />
        <circle
          cx="40" cy="40" r={radius} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="square"
          transform="rotate(-90 40 40)"
        />
        <text x="40" y="44" textAnchor="middle" fill={color} fontSize="13" fontWeight="900" fontFamily="monospace">{pct}%</text>
      </svg>
      <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider font-mono">CHURN RISK</span>
    </div>
  );
}

function EngagementBar({ label, value, max = 100, unit = '' }: { label: string; value: number; max?: number; unit?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  const color = pct >= 60 ? 'bg-primary' : pct >= 30 ? 'bg-primary' : 'bg-destructive';
  return (
    <div className="space-y-1 font-mono">
      <div className="flex justify-between text-xs font-mono">
        <span className="text-muted-foreground uppercase text-[10px]">{label}</span>
        <span className="text-white font-bold">{value}{unit}</span>
      </div>
      <div className="h-1.5 bg-background rounded-none border border-border overflow-hidden">
        <div className={`h-full ${color} rounded-none transition-none`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function CustomersFeature() {
  const { t } = useTranslation();
  const { formatCurrency, formatNumber } = useLocaleFormat();
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
    if (risk === 'high') return 'text-destructive bg-background border-destructive';
    if (risk === 'medium') return 'text-primary bg-background border-primary';
    return 'text-primary bg-background border-primary';
  };

  const activeAgentData = monitorResult?.result || monitorResult;
  const currentHealthScore = activeAgentData?.health_score ?? selectedCustomer?.health_score ?? 0;
  const currentChurnRisk = (activeAgentData?.churn_risk?.level || activeAgentData?.churn_risk || selectedCustomer?.churn_risk || 'low').toString();
  const currentChurnProb = activeAgentData?.churn_risk?.probability ?? activeAgentData?.churn_probability ?? selectedCustomer?.churn_probability ?? 0;
  const currentActions = activeAgentData?.recommended_actions || selectedCustomer?.recommended_actions || [];
  const currentRiskFactors = activeAgentData?.churn_risk?.factors || [];

  return (
    <div className="space-y-4 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card p-4 border border-border">
        <div>
          <h1 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <span>{t('customers.title', 'ACCOUNT HEALTH & CHURN RISK INTELLIGENCE')}</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 uppercase">
            {t('customers.subtitle', 'CUSTOMER RETENTION TELEMETRY, HEALTH SCORES, AND AUTOMATED INTERVENTIONS')}
          </p>
        </div>

        <Button onClick={handleBulkMonitor} isLoading={isBulkMonitoring} variant="primary" className="text-xs">
          <Sparkles className="w-3.5 h-3.5 mr-1" />
          <span>{t('customers.run_churn_audit', 'RUN AI FLEET RETENTION AUDIT')}</span>
        </Button>
      </div>

      {/* Summary KPI row */}
      {!isLoading && customers && customers.length > 0 && (() => {
        const highRisk = customers.filter(c => c.churn_risk === 'high').length;
        const avgHealth = Math.round(customers.reduce((a, c) => a + c.health_score, 0) / customers.length);
        const totalMrr = customers.reduce((a, c) => a + (c.mrr || 0), 0);
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: t('customers.all_accounts', 'TOTAL ACCOUNTS'), value: formatNumber(customers.length), icon: Users, color: 'text-white' },
              { label: t('customers.churn_risk', 'HIGH CHURN RISK'), value: formatNumber(highRisk), icon: AlertTriangle, color: 'text-destructive', warn: highRisk > 0 },
              { label: t('deals.health_score', 'AVG HEALTH SCORE'), value: `${avgHealth}/100`, icon: Activity, color: 'text-primary' },
              { label: t('customers.mrr', 'TOTAL MRR'), value: formatCurrency(totalMrr), icon: BarChart3, color: 'text-white' },
            ].map(({ label, value, icon: Icon, color, warn }) => (
              <div key={label} className={`p-3 border font-mono ${warn ? 'bg-background border-destructive' : 'bg-card border-border'}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className={`w-3.5 h-3.5 ${color}`} />
                  <span className="text-[10px] text-muted-foreground font-bold uppercase">{label}</span>
                </div>
                <div className={`text-xl font-black font-mono ${color}`}>{value}</div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Customer Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('customers.all_accounts', 'MONITORED ACCOUNTS')}</CardTitle>
        </CardHeader>
        <div className="pt-2">
          {isLoading ? (
            <div className="p-4 space-y-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !customers || customers.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground/60 text-xs font-mono uppercase">NO CUSTOMERS MONITORED.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PLAN</TableHead>
                  <TableHead>{t('customers.mrr', 'MRR')}</TableHead>
                  <TableHead>{t('deals.health_score', 'HEALTH')}</TableHead>
                  <TableHead>{t('customers.churn_risk', 'CHURN RISK')}</TableHead>
                  <TableHead>{t('customers.churn_risk', 'PROBABILITY')}</TableHead>
                  <TableHead>{t('customers.telemetry_usage', 'ENGAGEMENT')}</TableHead>
                  <TableHead className="text-right">{t('common.actions', 'ACTIONS')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((cust) => (
                  <TableRow key={cust.id} className="cursor-pointer" onClick={() => handleViewHealth(cust)}>
                    <TableCell className="font-bold text-white uppercase">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-background border border-border text-[10px] font-mono">
                          <Zap className="w-3 h-3 text-primary" />
                          {cust.plan}
                        </span>
                        {(Boolean(cust.recommended_actions?.length) || (selectedCustomer?.id === cust.id && Boolean(monitorResult))) && (
                          <span className="px-1.5 py-0.2 text-[8px] font-black bg-background text-primary border border-primary uppercase flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" />
                            AI DATA
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono font-bold text-primary">{formatCurrency(cust.mrr)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-background border border-border overflow-hidden">
                          <div
                            className={`h-full ${cust.health_score >= 70 ? 'bg-primary' : cust.health_score >= 40 ? 'bg-primary' : 'bg-destructive'}`}
                            style={{ width: `${cust.health_score}%` }}
                          />
                        </div>
                        <span className={`text-xs font-bold font-mono ${getScoreColor(cust.health_score).split(' ')[0]}`}>
                          {cust.health_score}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 text-[9px] font-bold font-mono uppercase border ${getRiskClass(cust.churn_risk)}`}>
                        {cust.churn_risk === 'high' && <AlertTriangle className="w-3 h-3" />}
                        {cust.churn_risk} RISK
                      </span>
                    </TableCell>
                    <TableCell>
                      {cust.churn_probability != null ? (
                        <span className={`text-xs font-black font-mono ${cust.churn_probability >= 70 ? 'text-destructive' : cust.churn_probability >= 40 ? 'text-primary' : 'text-primary'}`}>
                          {cust.churn_probability}%
                        </span>
                      ) : (
                        <span className="text-slate-600 text-xs font-mono">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-[10px] text-muted-foreground font-mono space-y-0.5 uppercase">
                        {cust.logins_per_week != null && <div>{cust.logins_per_week} LOGINS/WK</div>}
                        {cust.features_used != null && <div>{cust.features_used} FEATURES</div>}
                        {cust.license_usage_percent != null && <div>{cust.license_usage_percent}% USAGE</div>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="secondary"
                        size="sm"
                        isLoading={monitoringId === cust.id}
                        onClick={() => handleMonitor(cust)}
                        className="text-xs h-7 px-2"
                      >
                        <Bot className="w-3 h-3 text-primary" />
                        <span>MONITOR</span>
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
          title="CUSTOMER HEALTH &amp; AI ANALYSIS"
          description={`CUSTOMERSUCCESSAGENT TELEMETRY FOR ${selectedCustomer.plan.toUpperCase()} PLAN ACCOUNT`}
          className="max-w-2xl font-mono"
        >
          <div className="space-y-3">
            {/* Churn probability gauge + health score side by side */}
            <div className="flex items-center justify-around p-3 bg-background border border-border">
              <ChurnGauge probability={currentChurnProb} />
              <div className="flex flex-col items-center gap-0.5">
                <div className={`text-3xl font-black font-mono ${getScoreColor(currentHealthScore).split(' ')[0]}`}>
                  {currentHealthScore}
                </div>
                <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider font-mono">HEALTH SCORE</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className={`text-xs font-bold px-2 py-0.5 border font-mono ${getRiskClass(currentChurnRisk)}`}>
                  {currentChurnRisk.toUpperCase()}
                </span>
                <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider font-mono">CHURN RISK</span>
              </div>
            </div>

            {/* Engagement bars */}
            {healthLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (healthData || activeAgentData?.engagement) ? (
              <div className="p-3 bg-background border border-border space-y-2 font-mono">
                <h4 className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                  <Activity className="w-3 h-3 text-primary" />
                  ENGAGEMENT TELEMETRY
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
              <div className="p-3 bg-background border border-primary/40 space-y-1.5">
                <h4 className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                  <Bot className="w-3 h-3 text-primary" />
                  RECOMMENDED ACTIONS
                </h4>
                <ul className="space-y-1">
                  {currentActions.map((action: string, i: number) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-foreground/80 font-mono uppercase">
                      <CheckCircle2 className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                      <span className="break-words flex-1">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Churn risk factors from agent result */}
            {currentRiskFactors.length > 0 && (
              <div className="p-3 bg-background border border-destructive/40 space-y-1.5">
                <h4 className="text-[10px] font-bold text-destructive uppercase tracking-wider flex items-center gap-1">
                  <TrendingDown className="w-3 h-3 text-destructive" />
                  RISK FACTORS DETECTED
                </h4>
                <ul className="space-y-1">
                  {currentRiskFactors.map((f: string, i: number) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-destructive font-mono uppercase">
                      <AlertTriangle className="w-3 h-3 text-destructive mt-0.5 shrink-0" />
                      <span className="break-words flex-1">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end pt-1 border-t border-border">
              <Button variant="outline" onClick={() => { setSelectedCustomer(null); setMonitorResult(null); }} className="text-xs">
                CLOSE
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
