import { useState, DragEvent } from 'react';
import {
  Plus,
  Briefcase,
  AlertTriangle,
  ArrowRight,
  Bot,
  Pencil,
  Trash2,
  AlertCircle,
  GripVertical,
  DollarSign,
  Activity,
  Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useDeals, useUpdateDealStage, useUpdateDeal, useDeleteDeal } from '@/hooks/use-deals';
import { useTriggerSalesPipeline } from '@/hooks/use-agents';
import { useUIStore } from '@/stores/use-ui-store';
import { useTranslation, useLocaleFormat } from '@/features/multi-language';
import { Deal, DealStage } from '@/types/crm.types';

const STAGES: { id: DealStage; titleKey: string; defaultTitle: string; color: string; badgeColor: string }[] = [
  { id: 'prospecting', titleKey: 'deals.stage_discovery', defaultTitle: 'Discovery', color: 'border-slate-700', badgeColor: 'bg-slate-800 text-slate-300' },
  { id: 'qualification', titleKey: 'leads.qualification_status', defaultTitle: 'Qualification', color: 'border-brand-500/50', badgeColor: 'bg-brand-500/20 text-brand-300' },
  { id: 'proposal', titleKey: 'deals.stage_proposal', defaultTitle: 'Proposal Sent', color: 'border-blue-500/50', badgeColor: 'bg-blue-500/20 text-blue-300' },
  { id: 'negotiation', titleKey: 'deals.stage_negotiation', defaultTitle: 'Negotiation', color: 'border-amber-500/50', badgeColor: 'bg-amber-500/20 text-amber-300' },
  { id: 'closed_won', titleKey: 'deals.stage_closed_won', defaultTitle: 'Closed Won', color: 'border-emerald-500/50', badgeColor: 'bg-emerald-500/20 text-emerald-300' },
  { id: 'closed_lost', titleKey: 'deals.stage_closed_lost', defaultTitle: 'Closed Lost', color: 'border-rose-500/50', badgeColor: 'bg-rose-500/20 text-rose-300' },
];

export function DealsFeature() {
  const { t } = useTranslation();
  const { formatCurrency, formatNumber } = useLocaleFormat();
  const { data: deals, isLoading, isError, error, refetch } = useDeals();
  const updateStageMutation = useUpdateDealStage();
  const updateDealMutation = useUpdateDeal();
  const deleteDealMutation = useDeleteDeal();
  const analyzeDealMutation = useTriggerSalesPipeline();
  const { setDealModalOpen, searchQuery } = useUIStore();

  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [isBulkAnalyzing, setIsBulkAnalyzing] = useState(false);
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<DealStage | null>(null);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Edit Deal Form State
  const [editName, setEditName] = useState('');
  const [editValue, setEditValue] = useState<number>(0);
  const [editStage, setEditStage] = useState<DealStage>('prospecting');
  const [editHealthScore, setEditHealthScore] = useState<number>(50);
  const [editIsStalled, setEditIsStalled] = useState<boolean>(false);
  const [editRiskFactors, setEditRiskFactors] = useState('');
  const [editCloseProbability, setEditCloseProbability] = useState<number>(50);
  const [editNextActions, setEditNextActions] = useState('');
  const [editForecastDate, setEditForecastDate] = useState('');

  const handleOpenEdit = (deal: Deal) => {
    setEditingDeal(deal);
    setEditName(deal.name);
    setEditValue(deal.value);
    setEditStage(deal.stage);
    setEditHealthScore(deal.health_score ?? 50);
    setEditIsStalled(Boolean(deal.is_stalled));
    setEditRiskFactors(deal.risk_factors ? deal.risk_factors.join(', ') : '');
    setEditCloseProbability(deal.close_probability ?? 50);
    setEditNextActions(deal.next_actions ? deal.next_actions.join('\n') : '');
    setEditForecastDate(deal.forecast_close_date ?? '');
  };

  const handleSaveEdit = async () => {
    if (!editingDeal) return;
    try {
      await updateDealMutation.mutateAsync({
        id: editingDeal.id,
        payload: {
          name: editName,
          value: editValue,
          stage: editStage,
          health_score: editHealthScore,
          is_stalled: editIsStalled,
          risk_factors: editRiskFactors
            ? editRiskFactors.split(',').map((s) => s.trim()).filter(Boolean)
            : [],
          close_probability: editCloseProbability,
          next_actions: editNextActions
            ? editNextActions.split('\n').map((s) => s.trim()).filter(Boolean)
            : [],
          forecast_close_date: editForecastDate || undefined,
        },
      });
      setEditingDeal(null);
      await refetch();
    } catch {
      // Handled by mutation error state
    }
  };

  const handleDeleteDeal = async (id: string) => {
    if (!confirm('Are you sure you want to delete this deal opportunity?')) return;
    setDeletingId(id);
    try {
      await deleteDealMutation.mutateAsync(id);
      await refetch();
    } finally {
      setDeletingId(null);
    }
  };

  const handleStageMove = (deal: Deal, targetStage: DealStage) => {
    if (deal.stage === targetStage) return;
    updateStageMutation.mutate({ id: deal.id, stage: targetStage });
  };

  const handleAnalyze = async (dealId: string) => {
    setAnalyzingId(dealId);
    try {
      await analyzeDealMutation.mutateAsync(dealId);
      await refetch();
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleBulkAnalyze = async () => {
    if (!deals || deals.length === 0) return;
    setIsBulkAnalyzing(true);
    try {
      for (const d of deals.slice(0, 5)) {
        await analyzeDealMutation.mutateAsync(d.id);
      }
      await refetch();
    } finally {
      setIsBulkAnalyzing(false);
    }
  };

  // Drag and Drop Event Handlers
  const handleDragStart = (e: DragEvent<HTMLDivElement>, deal: Deal) => {
    e.dataTransfer.setData('text/plain', deal.id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedDealId(deal.id);
  };

  const handleDragEnd = () => {
    setDraggedDealId(null);
    setDragOverStage(null);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, stageId: DealStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStage !== stageId) {
      setDragOverStage(stageId);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDragOverStage(null);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, targetStage: DealStage) => {
    e.preventDefault();
    setDragOverStage(null);
    const dealId = e.dataTransfer.getData('text/plain') || draggedDealId;
    if (!dealId) return;

    const targetDeal = (deals || []).find((d) => d.id === dealId);
    if (targetDeal && targetDeal.stage !== targetStage) {
      updateStageMutation.mutate({ id: dealId, stage: targetStage });
    }
    setDraggedDealId(null);
  };

  const filteredDeals = (deals || []).filter(
    (d) => !searchQuery || d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-brand-400" />
            {t('deals.title', 'Sales Pipeline & Kanban Board')}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t('deals.subtitle', 'Drag and drop deals across stages with automated AI deal health auditing')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleBulkAnalyze} isLoading={isBulkAnalyzing}>
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>{t('deals.run_pipeline_audit', 'Run AI Pipeline Health Audit')}</span>
          </Button>
          <Button onClick={() => setDealModalOpen(true)}>
            <Plus className="w-4 h-4" />
            <span>{t('deals.add_deal', 'New Deal')}</span>
          </Button>
        </div>
      </div>

      {/* Mutation Error Notification Banner */}
      {updateStageMutation.isError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Failed to update deal stage. Reverted changes to original state.</span>
          </div>
          <button
            onClick={() => updateStageMutation.reset()}
            className="text-[10px] uppercase font-bold text-rose-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Fetch Error State */}
      {isError && (
        <Card className="p-6 text-center border-rose-500/30 bg-rose-500/5">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white">Error Loading Deals</h3>
          <p className="text-xs text-slate-400 mt-1">
            {error instanceof Error ? error.message : 'Unable to connect to FastAPI backend.'}
          </p>
        </Card>
      )}

      {/* Kanban Board Columns */}
      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGE_OPTIONS_SKELETON()}
        </div>
      ) : (
        <div className="flex overflow-x-auto gap-4 pb-6 pt-2 items-stretch h-[calc(100vh-14rem)] min-h-[550px] w-full select-none">
          {STAGES.map((col) => {
            const colDeals = filteredDeals.filter((d) => d.stage === col.id);
            const totalValue = colDeals.reduce((sum, d) => sum + d.value, 0);
            const isTargetColumn = dragOverStage === col.id;

            const topStripeClass =
              col.id === 'prospecting'
                ? 'border-t-slate-500'
                : col.id === 'qualification'
                ? 'border-t-brand-500'
                : col.id === 'proposal'
                ? 'border-t-blue-500'
                : col.id === 'negotiation'
                ? 'border-t-amber-500'
                : col.id === 'closed_won'
                ? 'border-t-emerald-500'
                : 'border-t-rose-500';

            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`flex flex-col w-[280px] shrink-0 rounded-2xl p-3 transition-all duration-250 border h-full ${
                  isTargetColumn
                    ? 'bg-brand-500/10 ring-2 ring-brand-500/40 border-brand-500/30 scale-[1.01]'
                    : 'bg-slate-900/30 border-slate-900'
                }`}
              >
                {/* Kanban Column Header with Colored Stripe */}
                <div
                  className={`p-3 rounded-xl bg-slate-950/80 border-t-2 ${topStripeClass} border-x border-b border-slate-800/80 flex flex-col gap-1 shadow-md shrink-0`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                      {t(col.titleKey, col.defaultTitle)}
                    </h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${col.badgeColor}`}>
                      {formatNumber(colDeals.length)}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold font-mono">
                    {formatCurrency(totalValue)}
                  </span>
                </div>

                {/* Deal Cards Scrollable Container */}
                <div className="flex-1 overflow-y-auto mt-4 space-y-3.5 pr-1 max-h-full">
                  {colDeals.length === 0 ? (
                    <div
                      className={`h-28 border border-dashed rounded-xl flex flex-col items-center justify-center text-xs transition-colors ${
                        isTargetColumn
                          ? 'border-brand-500/60 bg-brand-500/10 text-brand-300 font-bold'
                          : 'border-slate-800/60 text-slate-650'
                      }`}
                    >
                      <span>{isTargetColumn ? 'Drop Here' : 'No Deals'}</span>
                    </div>
                  ) : (
                    colDeals.map((deal) => {
                      const isBeingDragged = draggedDealId === deal.id;
                      return (
                        <Card
                          key={deal.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, deal)}
                          onDragEnd={handleDragEnd}
                          className={`p-3.5 space-y-2.5 transition-all shadow-md group cursor-grab active:cursor-grabbing border ${
                            isBeingDragged
                              ? 'opacity-40 border-brand-500/80 ring-2 ring-brand-500/40 scale-95'
                              : 'hover:border-slate-700/90 border-slate-800'
                          }`}
                        >
                          {/* Header with Grip Icon */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-1.5 flex-1">
                              <GripVertical className="w-4 h-4 text-slate-600 group-hover:text-slate-400 shrink-0 mt-0.5" />
                              <div>
                                <h4 className="font-semibold text-xs text-white line-clamp-2">{deal.name}</h4>
                                {Boolean(deal.next_actions?.length) && (
                                  <span className="mt-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/40 uppercase tracking-wider inline-flex items-center gap-0.5">
                                    <Sparkles className="w-2.5 h-2.5" />
                                    NEW AI ANALYZED
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              {deal.is_stalled && (
                                <span
                                  className="p-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                  title="Stalled Deal - Sales Pipeline Warning"
                                >
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                </span>
                              )}
                              <button
                                onClick={() => handleOpenEdit(deal)}
                                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                title="Edit Deal Details"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteDeal(deal.id)}
                                disabled={deletingId === deal.id}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                title="Delete Deal"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Value & Health Score */}
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-sm font-extrabold text-emerald-400 font-mono">
                              {formatCurrency(deal.value)}
                            </span>
                            <Badge variant={deal.health_score && deal.health_score >= 70 ? 'success' : 'warning'}>
                              Health: {deal.health_score}%
                            </Badge>
                          </div>

                          {/* AI Risk Factors */}
                          {deal.risk_factors && deal.risk_factors.length > 0 && (
                            <div className="pt-2 border-t border-slate-850 space-y-1">
                              <span className="text-[9px] uppercase font-bold text-amber-400 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-amber-400" />
                                <span>AI Risk Factors</span>
                              </span>
                              <ul className="text-[10px] text-slate-400 space-y-1 pl-3.5 list-disc">
                                {deal.risk_factors.map((risk, idx) => (
                                  <li key={idx} className="leading-tight">{risk}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Close Probability + Forecast */}
                          {(deal.close_probability != null || deal.forecast_close_date) && (
                            <div className="pt-2 border-t border-slate-800/60 space-y-1">
                              {deal.close_probability != null && (
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] uppercase font-bold text-emerald-400">Win %</span>
                                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all ${
                                        deal.close_probability >= 70 ? 'bg-emerald-500' : deal.close_probability >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                                      }`}
                                      style={{ width: `${deal.close_probability}%` }}
                                    />
                                  </div>
                                  <span className={`text-[10px] font-bold ${
                                    deal.close_probability >= 70 ? 'text-emerald-400' : deal.close_probability >= 40 ? 'text-amber-400' : 'text-rose-400'
                                  }`}>{deal.close_probability}%</span>
                                </div>
                              )}
                              {deal.forecast_close_date && (
                                <div className="text-[9px] text-slate-500">
                                  <span className="text-slate-400">Forecast: </span>
                                  {deal.forecast_close_date}
                                </div>
                              )}
                            </div>
                          )}

                          {/* AI Next Actions */}
                          {deal.next_actions && deal.next_actions.length > 0 && (
                            <div className="pt-1 space-y-0.5">
                              <span className="text-[9px] uppercase font-bold text-brand-400">Next Actions</span>
                              <ul className="space-y-0.5">
                                {deal.next_actions.slice(0, 2).map((action, idx) => (
                                  <li key={idx} className="text-[9px] text-slate-400 flex items-start gap-1">
                                    <span className="text-brand-400 shrink-0">›</span>
                                    <span className="leading-tight">{action}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Quick Actions Footer */}
                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-[10px]"
                              isLoading={analyzingId === deal.id}
                              onClick={() => handleAnalyze(deal.id)}
                            >
                              <Bot className="w-3 h-3 text-brand-400" />
                              <span>AI Check</span>
                            </Button>

                            {col.id !== 'closed_won' && (
                              <button
                                onClick={() => {
                                  const currentIndex = STAGES.findIndex((s) => s.id === col.id);
                                  if (currentIndex < STAGES.length - 1) {
                                    handleStageMove(deal, STAGES[currentIndex + 1].id);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                                title="Move to Next Stage"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </Card>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Deal Modal */}
      {editingDeal && (
        <Modal
          isOpen={Boolean(editingDeal)}
          onClose={() => setEditingDeal(null)}
          title="Edit Opportunity Details"
          description={`Update value, pipeline stage, and health metrics for deal ${editingDeal.name}`}
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Deal Name</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter opportunity name..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Deal Value ($)</label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <Input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(Number(e.target.value))}
                    className="pl-8"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Pipeline Stage</label>
                <select
                  value={editStage}
                  onChange={(e) => setEditStage(e.target.value as DealStage)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-brand-500"
                >
                  {STAGES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {t(s.titleKey, s.defaultTitle)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-brand-400" />
                  <span>Health Score (0-100)</span>
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={editHealthScore}
                  onChange={(e) => setEditHealthScore(Number(e.target.value))}
                />
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editIsStalled}
                    onChange={(e) => setEditIsStalled(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 bg-slate-800 border-slate-700"
                  />
                  <span className="text-xs font-medium text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Flag as Stalled</span>
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                AI Risk Factors (comma separated)
              </label>
              <Input
                value={editRiskFactors}
                onChange={(e) => setEditRiskFactors(e.target.value)}
                placeholder="e.g. Budget constraint, Unclear timeline, No executive sponsor"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Close Probability (%)</label>
                <Input
                  type="number" min="0" max="100"
                  value={editCloseProbability}
                  onChange={(e) => setEditCloseProbability(Number(e.target.value))}
                  placeholder="0-100"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Forecast Close Date</label>
                <Input
                  value={editForecastDate}
                  onChange={(e) => setEditForecastDate(e.target.value)}
                  placeholder="e.g. Q4 2025 or 2025-12-01"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                AI Next Actions (one per line)
              </label>
              <textarea
                rows={3}
                value={editNextActions}
                onChange={(e) => setEditNextActions(e.target.value)}
                placeholder="e.g. Schedule technical review&#10;Send security questionnaire&#10;Loop in procurement"
                className="w-full bg-slate-900 text-slate-100 border border-slate-700/80 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <Button variant="outline" onClick={() => setEditingDeal(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} isLoading={updateDealMutation.isPending}>
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function STAGE_OPTIONS_SKELETON() {
  return [...Array(6)].map((_, i) => (
    <div key={i} className="flex flex-col w-[280px] shrink-0 space-y-3">
      <Skeleton className="h-16 w-full rounded-xl" />
      <Skeleton className="h-[450px] w-full rounded-2xl" />
    </div>
  ));
}
