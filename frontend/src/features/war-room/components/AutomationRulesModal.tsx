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
  Edit2,
  CheckCircle,
  Copy,
  Check,
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
        llm_engine: data?.llm_engine,
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

  const handleEdit = (rule: AutomationRule) => {
    setEditingRuleId(rule.id);
    setRuleName(rule.name);
    setTriggerEvent(rule.trigger_event);
    setTriggerThreshold(String(rule.trigger_threshold));
    setActionAgent(rule.action_agent);
    setActionType(rule.action_type);
    setShowForm(true);
  };

  const handleCopyPayload = () => {
    if (executionResult?.ai_generated_payload) {
      navigator.clipboard.writeText(executionResult.ai_generated_payload);
      setCopiedResult(true);
      setTimeout(() => setCopiedResult(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0C10]/85 backdrop-blur-md font-mono">
      <div className="bg-[#1F2833] border border-[#3A4552] rounded-none w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#3A4552] bg-[#1F2833] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-none bg-[#0B0C10] text-[#FFB800] border border-[#3A4552]">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>MULTI-AGENT WORKFLOW AUTOMATION TRIGGERS</span>
                <Badge variant="purple" className="text-[9px] uppercase font-mono">
                  ACTIVE STUDIO
                </Badge>
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5 uppercase">
                CONFIGURE EVENT-DRIVEN DISPATCH CHAINS ACROSS CRM AGENTS WITH REAL-TIME TEST SIMULATION.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-none text-slate-400 hover:text-white hover:bg-[#0B0C10] transition-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 font-mono">
          {/* Action Toolbar */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              REGISTERED RULES ({rules?.length || 0})
            </span>
            {!showForm && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setShowForm(true)}
                className="text-xs h-7 uppercase"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span>NEW AUTOMATION TRIGGER</span>
              </Button>
            )}
          </div>

          {/* Form */}
          {showForm && (
            <div className="p-4 rounded-none bg-[#0B0C10] border border-[#3A4552] space-y-3">
              <div className="flex items-center justify-between border-b border-[#3A4552] pb-2">
                <span className="text-xs font-bold text-white uppercase">
                  {editingRuleId ? 'EDIT AUTOMATION TRIGGER' : 'CREATE AUTOMATION TRIGGER'}
                </span>
                <button onClick={resetForm} className="text-slate-400 hover:text-white text-xs">
                  CANCEL
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                    RULE NAME
                  </label>
                  <input
                    type="text"
                    required
                    value={ruleName}
                    onChange={(e) => setRuleName(e.target.value)}
                    placeholder="E.G. HIGH-INTENT LEAD WHATSAPP AUTO-DISPATCH"
                    className="w-full bg-[#1F2833] border border-[#3A4552] rounded-none px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#FFB800] uppercase font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                    TRIGGER EVENT
                  </label>
                  <select
                    value={triggerEvent}
                    onChange={(e) => setTriggerEvent(e.target.value)}
                    className="w-full bg-[#1F2833] border border-[#3A4552] rounded-none px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#FFB800] uppercase font-mono"
                  >
                    <option value="lead_score_above">LEAD SCORE &gt; THRESHOLD</option>
                    <option value="deal_stage_changed">DEAL STAGE CHANGED</option>
                    <option value="churn_risk_above">CHURN RISK &gt; THRESHOLD</option>
                    <option value="inbound_email_intent">INBOUND EMAIL INTENT DETECTED</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                    TRIGGER THRESHOLD / MATCH
                  </label>
                  <input
                    type="text"
                    required
                    value={triggerThreshold}
                    onChange={(e) => setTriggerThreshold(e.target.value)}
                    placeholder="E.G. 80 OR 'PROPOSAL_SENT'"
                    className="w-full bg-[#1F2833] border border-[#3A4552] rounded-none px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#FFB800] uppercase font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                    TARGET AGENT
                  </label>
                  <select
                    value={actionAgent}
                    onChange={(e) => setActionAgent(e.target.value)}
                    className="w-full bg-[#1F2833] border border-[#3A4552] rounded-none px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#FFB800] uppercase font-mono"
                  >
                    <option value="whatsapp_agent">WHATSAPP AUTO-PILOT AGENT</option>
                    <option value="email_intelligence">EMAIL INTELLIGENCE AGENT</option>
                    <option value="voice_call_agent">VOICE AI INTELLIGENCE AGENT</option>
                    <option value="customer_success">CUSTOMER SUCCESS AGENT</option>
                    <option value="sales_pipeline">SALES PIPELINE AGENT</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                    ACTION DISPATCH TYPE
                  </label>
                  <input
                    type="text"
                    required
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                    placeholder="E.G. SEND_WELCOME_TEMPLATE"
                    className="w-full bg-[#1F2833] border border-[#3A4552] rounded-none px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#FFB800] uppercase font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#3A4552]">
                <Button type="button" variant="outline" size="sm" onClick={resetForm} className="text-xs uppercase">
                  CANCEL
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  disabled={!ruleName.trim()}
                  onClick={() => saveMutation.mutate()}
                  isLoading={saveMutation.isPending}
                  className="text-xs uppercase"
                >
                  <span>{editingRuleId ? 'UPDATE RULE' : 'SAVE RULE'}</span>
                </Button>
              </div>
            </div>
          )}

          {/* Test Execution Result Banner */}
          {executionResult && (
            <div className="p-4 rounded-none bg-[#0B0C10] border border-[#FFB800] space-y-2.5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#FFB800]" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    SIMULATED LIVE AGENT EXECUTION
                  </h4>
                  {executionResult.llm_engine && (
                    <Badge variant="purple" className="text-[9px] uppercase font-mono">
                      {executionResult.llm_engine}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {executionResult.ai_generated_payload && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopyPayload}
                      className="text-xs h-6 px-2 uppercase"
                    >
                      {copiedResult ? <Check className="w-3 h-3 text-[#FFB800]" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  )}
                  <button onClick={() => setExecutionResult(null)} className="text-slate-400 hover:text-white text-xs">
                    ✕
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-300 uppercase">{executionResult.message}</p>

              {executionResult.ai_generated_payload && (
                <div className="p-2.5 rounded-none bg-[#1F2833] border border-[#3A4552] font-mono text-[11px] text-[#FFB800] whitespace-pre-wrap">
                  {executionResult.ai_generated_payload}
                </div>
              )}
            </div>
          )}

          {/* Rules List */}
          <div className="space-y-2.5">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-slate-500 uppercase font-mono">LOADING RULES...</div>
            ) : rules?.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 uppercase font-mono">NO AUTOMATION RULES CONFIGURED.</div>
            ) : (
              rules?.map((r) => {
                const isActive = r.status === 'active';
                return (
                  <div
                    key={r.id}
                    className={`p-3.5 rounded-none border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-none ${isActive ? 'bg-[#0B0C10] border-[#3A4552]' : 'bg-[#0B0C10]/50 border-[#3A4552]/40 opacity-70'
                      }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white uppercase">{r.name}</span>
                        <Badge variant={isActive ? 'success' : 'default'} className="text-[9px] uppercase font-mono">
                          {isActive ? 'ACTIVE' : 'PAUSED'}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase">
                        <span>TRIGGER: <strong className="text-slate-200">{r.trigger_event}</strong> ({r.trigger_threshold})</span>
                        <span>→</span>
                        <span className="flex items-center gap-1 text-[#FFB800]">
                          <Bot className="w-3 h-3" />
                          {r.action_agent}: {r.action_type}
                        </span>
                      </div>

                      <span className="text-[9px] font-mono text-slate-500 block uppercase">
                        FIRED {r.executions_count || 0} TIMES
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => testExecutionMutation.mutate(r.id)}
                        isLoading={testExecutionMutation.isPending}
                        className="text-xs h-7 uppercase"
                      >
                        <Play className="w-3 h-3 mr-1 text-[#FFB800]" />
                        <span>TEST RUN</span>
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleMutation.mutate(r.id)}
                        className="h-7 px-2 text-slate-400 hover:text-white"
                      >
                        {isActive ? <Pause className="w-3.5 h-3.5 text-[#FFB800]" /> : <Play className="w-3.5 h-3.5 text-[#FFB800]" />}
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(r)}
                        className="h-7 px-2 text-slate-400 hover:text-white"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(r.id)}
                        className="h-7 px-2 text-slate-500 hover:text-[#FF2A54]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
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
