import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { warRoomApi } from '../api/warRoomApi';
import { AutomationRule } from '../types/warRoom.types';
import {
  Zap,
  X,
  Plus,
  Trash2,
  Play,
  Pause,
  Bot,
  ArrowRight,
  Sparkles,
  Edit2,
  CheckCircle,
  Activity,
  Copy,
  Check,
  Cpu,
} from 'lucide-react';

interface AutomationRulesModalProps {
  onClose: () => void;
}

interface ExecutionResult {
  message: string;
  ai_generated_payload?: string;
  llm_engine?: string;
  action_agent?: string;
  action_type?: string;
}

export function AutomationRulesModal({ onClose }: AutomationRulesModalProps) {
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

  const [ruleName, setRuleName] = useState('');
  const [triggerEvent, setTriggerEvent] = useState('lead_score_above');
  const [triggerThreshold, setTriggerThreshold] = useState('80');
  const [actionAgent, setActionAgent] = useState('whatsapp_agent');
  const [actionType, setActionType] = useState('send_welcome_template');

  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [copiedResult, setCopiedResult] = useState(false);

  const { data: rules, isLoading } = useQuery({
    queryKey: ['war-room-automations'],
    queryFn: () => warRoomApi.getAutomations(),
  });

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        name: ruleName,
        trigger_event: triggerEvent,
        trigger_threshold: isNaN(Number(triggerThreshold))
          ? triggerThreshold
          : Number(triggerThreshold),
        action_agent: actionAgent,
        action_type: actionType,
      };

      if (editingRuleId) {
        return warRoomApi.updateAutomation(editingRuleId, payload);
      } else {
        return warRoomApi.createAutomation(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['war-room-automations'] });
      resetForm();
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => warRoomApi.toggleAutomation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['war-room-automations'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => warRoomApi.deleteAutomation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['war-room-automations'] });
    },
  });

  const testExecutionMutation = useMutation({
    mutationFn: (id: string) => warRoomApi.executeAutomation(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['war-room-automations'] });
      setExecutionResult({
        message: data?.message || 'Automation trigger executed successfully!',
        ai_generated_payload: data?.ai_generated_payload,
        llm_engine: data?.llm_engine || 'Multi-Agent Smart Inference Engine',
        action_agent: data?.action_agent,
        action_type: data?.action_type,
      });
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingRuleId(null);
    setRuleName('');
    setTriggerEvent('lead_score_above');
    setTriggerThreshold('80');
    setActionAgent('whatsapp_agent');
    setActionType('send_welcome_template');
  };

  const handleStartEdit = (rule: AutomationRule) => {
    setEditingRuleId(rule.id);
    setRuleName(rule.name);
    setTriggerEvent(rule.trigger_event);
    setTriggerThreshold(String(rule.trigger_threshold));
    setActionAgent(rule.action_agent);
    setActionType(rule.action_type);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim()) return;
    saveMutation.mutate();
  };

  const handleCopyExecution = () => {
    if (!executionResult?.ai_generated_payload) return;
    navigator.clipboard.writeText(executionResult.ai_generated_payload);
    setCopiedResult(true);
    setTimeout(() => setCopiedResult(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>Multi-Agent Workflow Automation Triggers</span>
                <Badge variant="purple" className="text-[10px] bg-purple-500/20 text-purple-300">
                  OpenAI & Claude Orchestrator
                </Badge>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Autonomous event triggers executed directly through AgentOrchestrator and specialized AI agents.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live AI Execution HUD Banner */}
        {executionResult && (
          <div className="p-4 bg-gradient-to-r from-purple-950/60 via-slate-950/90 to-emerald-950/60 border-b border-purple-500/30 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{executionResult.message}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-purple-300 font-mono flex items-center gap-1 bg-purple-500/10 px-2 py-0.5 rounded-lg border border-purple-500/20">
                  <Cpu className="w-3 h-3" />
                  {executionResult.llm_engine}
                </span>
                <button
                  type="button"
                  onClick={() => setExecutionResult(null)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              </div>
            </div>

            {executionResult.ai_generated_payload && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-sans space-y-2">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono border-b border-slate-850 pb-1">
                  <span>AI Generated Output ({executionResult.action_agent})</span>
                  <button
                    type="button"
                    onClick={handleCopyExecution}
                    className="flex items-center gap-1 text-purple-300 hover:text-purple-200"
                  >
                    {copiedResult ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedResult ? 'Copied' : 'Copy Output'}</span>
                  </button>
                </div>
                <p className="leading-relaxed whitespace-pre-wrap">
                  {executionResult.ai_generated_payload}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 scrollbar-thin">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-purple-400" />
              <span>Configured Triggers ({rules?.length || 0})</span>
            </span>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (showForm) resetForm();
                else {
                  resetForm();
                  setShowForm(true);
                }
              }}
              className="bg-purple-600 hover:bg-purple-500 text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>{showForm ? 'Cancel Edit' : 'New Automation'}</span>
            </Button>
          </div>

          {/* Form (Create / Edit) */}
          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="p-5 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-4 animate-in fade-in duration-150 shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-black text-purple-300 uppercase tracking-wider">
                  {editingRuleId ? 'Edit Automation Rule' : 'Create New Automation Rule'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {editingRuleId ? `ID: ${editingRuleId}` : 'New Autonomous Trigger'}
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Rule Name
                </label>
                <input
                  type="text"
                  required
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="e.g. High Value Lead ➔ Trigger Voice AI Battle-Card Briefing"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Trigger Event
                  </label>
                  <select
                    value={triggerEvent}
                    onChange={(e) => setTriggerEvent(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="lead_score_above">Lead Score Exceeds Threshold</option>
                    <option value="deal_stage_changed">Deal Stage Advances</option>
                    <option value="churn_risk_above">Churn Risk High Alert</option>
                    <option value="voice_objection_detected">Voice Call Objection Logged</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Threshold / Parameter
                  </label>
                  <input
                    type="text"
                    required
                    value={triggerThreshold}
                    onChange={(e) => setTriggerThreshold(e.target.value)}
                    placeholder="e.g. 80 or proposal"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Target Agent
                  </label>
                  <select
                    value={actionAgent}
                    onChange={(e) => setActionAgent(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="whatsapp_agent">WhatsApp Business Auto-Pilot</option>
                    <option value="proposal_agent">Smart Proposal Studio</option>
                    <option value="customer_success_agent">Customer Success Agent</option>
                    <option value="voice_agent">Voice Call Intelligence Agent</option>
                    <option value="lead_agent">Lead Qualification Agent</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Action Type
                  </label>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="send_welcome_template">Send WhatsApp Template Broadcast</option>
                    <option value="draft_enterprise_proposal">Auto-Draft Enterprise Proposal</option>
                    <option value="schedule_retention_call">Auto-Schedule Account Review</option>
                    <option value="generate_battle_card">Generate Competitor Battle-Card</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={resetForm}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={saveMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-500"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  <span>{editingRuleId ? 'Update Trigger' : 'Create Trigger'}</span>
                </Button>
              </div>
            </form>
          )}

          {/* Rules List */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="py-12 text-center text-slate-500 text-xs">Loading automation rules...</div>
            ) : !rules?.length ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No active automation rules. Click "New Automation" to create one.
              </div>
            ) : (
              rules.map((rule) => {
                const isActive = rule.status === 'active';
                return (
                  <div
                    key={rule.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md"
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white truncate">{rule.name}</h4>
                        <Badge
                          variant={isActive ? 'success' : 'default'}
                          className={`text-[9px] ${
                            isActive
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {rule.status.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 font-mono">
                        <span className="text-slate-300 font-bold">{rule.trigger_event}</span>
                        <span>({String(rule.trigger_threshold)})</span>
                        <ArrowRight className="w-3 h-3 text-purple-400" />
                        <span className="text-purple-300 font-bold flex items-center gap-1">
                          <Bot className="w-3 h-3 text-purple-400" />
                          {rule.action_agent}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 text-[10px]">
                          {rule.action_type}
                        </span>
                        <span className="text-emerald-400 font-bold text-[10px]">
                          ⚡ {rule.executions_count} executions
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Test Execute Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testExecutionMutation.mutate(rule.id)}
                        isLoading={testExecutionMutation.isPending}
                        className="text-[11px] h-8 px-2.5 border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20"
                        title="Execute with Live AI Orchestrator"
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        <span>Run AI Trigger</span>
                      </Button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleStartEdit(rule)}
                        className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
                        title="Edit Rule"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Toggle Pause / Resume Button */}
                      <button
                        type="button"
                        onClick={() => toggleMutation.mutate(rule.id)}
                        className={`p-2 rounded-xl border text-xs font-bold transition-colors ${
                          isActive
                            ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-amber-400'
                            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                        }`}
                        title={isActive ? 'Pause rule' : 'Resume rule'}
                      >
                        {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => deleteMutation.mutate(rule.id)}
                        className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Delete rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
