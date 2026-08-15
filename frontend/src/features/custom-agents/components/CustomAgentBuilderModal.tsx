import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useTranslation } from '@/features/multi-language';
import { CustomAgent, TriggerType } from '../types/customAgent.types';
import { useAvailableTools, useCreateCustomAgent, useUpdateCustomAgent } from '../hooks/useCustomAgents';
import {
  Bot,
  Sparkles,
  Sliders,
  Wrench,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Database,
  Mail,
  Calendar,
  FileText,
  TrendingUp,
  Webhook,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  agentToEdit?: CustomAgent | null;
}

const TEMPLATE_VARIABLES = [
  { label: '{{lead.name}}', desc: 'Prospect Name' },
  { label: '{{lead.email}}', desc: 'Prospect Email' },
  { label: '{{deal.name}}', desc: 'Deal Name' },
  { label: '{{deal.value}}', desc: 'Pipeline Amount' },
  { label: '{{deal.stage}}', desc: 'Sales Stage' },
  { label: '{{customer.name}}', desc: 'Account Name' },
  { label: '{{customer.mrr}}', desc: 'Monthly MRR' },
];

export function CustomAgentBuilderModal({ isOpen, onClose, agentToEdit }: Props) {
  const { t } = useTranslation();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const { data: availableTools } = useAvailableTools();
  const createMutation = useCreateCustomAgent();
  const updateMutation = useUpdateCustomAgent();

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Bot');
  const [triggerType, setTriggerType] = useState<TriggerType>('manual');
  const [eventName, setEventName] = useState('lead.created');
  const [modelName, setModelName] = useState('smart-fallback');
  const [temperature, setTemperature] = useState(0.3);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [selectedTools, setSelectedTools] = useState<string[]>(['query_crm']);
  const [isActive, setIsActive] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (agentToEdit) {
      setName(agentToEdit.name);
      setDescription(agentToEdit.description || '');
      setIcon(agentToEdit.icon || 'Bot');
      setTriggerType(agentToEdit.trigger_type || 'manual');
      setEventName(agentToEdit.trigger_config?.event_name || 'lead.created');
      setModelName(agentToEdit.model_name || 'smart-fallback');
      setTemperature(agentToEdit.temperature ?? 0.3);
      setSystemPrompt(agentToEdit.system_prompt || '');
      setSelectedTools(agentToEdit.tools_enabled || ['query_crm']);
      setIsActive(agentToEdit.is_active ?? true);
    } else {
      setName('');
      setDescription('');
      setIcon('Bot');
      setTriggerType('manual');
      setEventName('lead.created');
      setModelName('smart-fallback');
      setTemperature(0.3);
      setSystemPrompt(
        'You are an autonomous CRM specialist agent. Analyze incoming data, extract high-intent signals, and recommend structured actions.'
      );
      setSelectedTools(['query_crm']);
      setIsActive(true);
    }
    setStep(1);
    setErrorMsg(null);
  }, [agentToEdit, isOpen]);

  const handleToolToggle = (toolId: string) => {
    setSelectedTools((prev) =>
      prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId]
    );
  };

  const handleInsertVariable = (variableTag: string) => {
    setSystemPrompt((prev) => `${prev} ${variableTag}`);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setErrorMsg('Agent Name is required.');
      setStep(1);
      return;
    }
    if (!systemPrompt.trim()) {
      setErrorMsg('System Prompt is required.');
      setStep(2);
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      icon,
      trigger_type: triggerType,
      trigger_config: triggerType === 'event' ? { event_name: eventName } : {},
      model_provider: 'smart-fallback',
      model_name: modelName,
      temperature,
      system_prompt: systemPrompt.trim(),
      tools_enabled: selectedTools,
      is_active: isActive,
    };

    try {
      if (agentToEdit) {
        await updateMutation.mutateAsync({ id: agentToEdit.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail || err.message || 'Failed to save custom agent');
    }
  };

  const getToolIcon = (id: string) => {
    switch (id) {
      case 'query_crm':
        return <Database className="w-4 h-4 text-cyan-400" />;
      case 'update_deal':
        return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case 'send_email':
        return <Mail className="w-4 h-4 text-brand-400" />;
      case 'schedule_meeting':
        return <Calendar className="w-4 h-4 text-purple-400" />;
      case 'generate_summary':
        return <FileText className="w-4 h-4 text-amber-400" />;
      case 'webhook_call':
        return <Webhook className="w-4 h-4 text-rose-400" />;
      default:
        return <Wrench className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={agentToEdit ? `${t('custom_agents.edit_agent') || 'Edit Agent Configuration'}: ${agentToEdit.name}` : (t('custom_agents.builder_title') || 'No-Code Agent Builder Studio')}
      description={t('custom_agents.builder_desc') || 'Design, configure LLM reasoning parameters, connect CRM tools, and deploy autonomous agents.'}
      className="max-w-3xl"
    >
      <div className="space-y-6">
        {/* Step Indicator */}
        <div className="grid grid-cols-4 gap-2 border-b border-slate-800 pb-4 text-center">
          {[
            { num: 1, labelKey: 'custom_agents.step_identity', defaultLabel: 'Identity & Trigger', icon: Bot },
            { num: 2, labelKey: 'custom_agents.step_persona', defaultLabel: 'Persona & LLM', icon: Sliders },
            { num: 3, labelKey: 'custom_agents.step_capabilities', defaultLabel: 'CRM Capabilities', icon: Wrench },
            { num: 4, labelKey: 'custom_agents.step_deploy', defaultLabel: 'Deploy & Confirm', icon: CheckCircle2 },
          ].map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => setStep(s.num as any)}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-semibold transition-all ${
                step === s.num
                  ? 'bg-brand-500/10 text-brand-400 border border-brand-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <s.icon className="w-3.5 h-3.5" />
              <span>{t(s.labelKey) || s.defaultLabel}</span>
            </button>
          ))}
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* STEP 1: IDENTITY & TRIGGER */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                {t('custom_agents.agent_name') || 'Agent Name'} <span className="text-rose-400">*</span>
              </label>
              <Input
                placeholder="e.g. VIP Customer Onboarding Concierge"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                {t('custom_agents.mission_desc') || 'Mission Description'}
              </label>
              <Input
                placeholder="What objective does this agent accomplish autonomously?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                {t('custom_agents.trigger_mode') || 'Trigger Mode'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'manual', labelKey: 'custom_agents.filter_manual', defaultLabel: 'Manual Run', desc: 'Triggered on-demand' },
                  { id: 'event', labelKey: 'custom_agents.filter_event', defaultLabel: 'CRM Event', desc: 'On lead or deal change' },
                  { id: 'webhook', labelKey: 'custom_agents.filter_webhook', defaultLabel: 'Inbound Webhook', desc: 'External HTTP POST' },
                  { id: 'schedule', label: 'Scheduled Cron', desc: 'Periodic hourly/daily' }, // Keep cron as it is rare
                ].map((tItem) => (
                  <button
                    key={tItem.id}
                    type="button"
                    onClick={() => setTriggerType(tItem.id as TriggerType)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      triggerType === tItem.id
                        ? 'border-brand-500 bg-brand-500/10 text-white'
                        : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold">{tItem.labelKey ? t(tItem.labelKey) : tItem.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{tItem.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {triggerType === 'event' && (
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Trigger Event Name
                </label>
                <select
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="lead.created">On New Lead Created</option>
                  <option value="lead.qualified">On Lead Qualified (Score &gt; 70)</option>
                  <option value="deal.stage_changed">On Deal Stage Changed</option>
                  <option value="customer.tier1_created">On Tier-1 Customer Added</option>
                  <option value="email.received">On Inbound Prospect Email</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: PERSONA & LLM CONFIG */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  {t('custom_agents.llm_model') || 'LLM Model Engine'}
                </label>
                <select
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="smart-fallback">SmartFallback (Auto-Routing)</option>
                  <option value="gpt-4o">OpenAI GPT-4o</option>
                  <option value="claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet</option>
                  <option value="gpt-4o-mini">OpenAI GPT-4o Mini</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex justify-between">
                  <span>{t('custom_agents.temperature') || 'Temperature (Creativity)'}</span>
                  <span className="text-brand-400 font-mono">{temperature}</span>
                </label>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-brand-500 mt-2"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {t('custom_agents.system_prompt') || 'System Persona & Instructions'} <span className="text-rose-400">*</span>
                </label>
                <span className="text-[10px] text-slate-500">{t('custom_agents.insert_variables') || 'Insert variables into prompt'}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {TEMPLATE_VARIABLES.map((v) => (
                  <button
                    key={v.label}
                    type="button"
                    onClick={() => handleInsertVariable(v.label)}
                    className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-mono text-brand-400 hover:border-brand-500/50 transition-all"
                    title={v.desc}
                  >
                    + {v.label}
                  </button>
                ))}
              </div>
              <textarea
                rows={6}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Describe how the agent should think, what criteria to apply, and what decisions to produce..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-brand-500 resize-none leading-relaxed"
                required
              />
            </div>
          </div>
        )}

        {/* STEP 3: CAPABILITY TOOLS */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h4 className="text-xs font-semibold text-slate-300 mb-1">
                {t('custom_agents.authorized_tools') || 'Authorized CRM Capability Tools'}
              </h4>
              <p className="text-[11px] text-slate-500 mb-3">
                {t('custom_agents.enable_tools_desc') || 'Enable tools this agent is permitted to execute autonomously during workflows.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
              {(availableTools || []).map((tool) => {
                const isSelected = selectedTools.includes(tool.id);
                return (
                  <div
                    key={tool.id}
                    onClick={() => handleToolToggle(tool.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-brand-500/40 bg-brand-500/10 text-white'
                        : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                      {getToolIcon(tool.id)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">{tool.name}</span>
                        <Badge variant={isSelected ? 'success' : 'default'} className="text-[9px]">
                          {isSelected ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW & DEPLOY */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-400" />
                    <span>{name || 'Untitled Custom Agent'}</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">{description || 'No description'}</p>
                </div>
                <Badge variant={isActive ? 'success' : 'default'}>
                  {isActive ? 'Active & Ready' : 'Paused'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">{t('custom_agents.trigger_mode') || 'Trigger'}</span>
                  <span className="font-medium text-white capitalize">{triggerType}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">{t('custom_agents.llm_model') || 'Model Engine'}</span>
                  <span className="font-medium text-white">{modelName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">{t('custom_agents.temperature') || 'Temperature'}</span>
                  <span className="font-medium text-brand-400 font-mono">{temperature}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
                  {t('custom_agents.active_tools') || 'Active Tools'} ({selectedTools.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTools.map((tItem) => (
                    <span
                      key={tItem}
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20"
                    >
                      {tItem}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="activeToggle"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded accent-brand-500"
              />
              <label htmlFor="activeToggle" className="text-xs font-semibold text-slate-300 cursor-pointer">
                {t('custom_agents.enable_immediately') || 'Enable agent immediately upon creation'}
              </label>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep((prev) => Math.max(1, prev - 1) as any)}
            disabled={step === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {t('custom_agents.previous') || 'Previous'}
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              {t('common.cancel') || 'Cancel'}
            </Button>
            {step < 4 ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setStep((prev) => Math.min(4, prev + 1) as any)}
              >
                {t('custom_agents.next') || 'Next'}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmit}
                isLoading={createMutation.isPending || updateMutation.isPending}
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                {agentToEdit ? (t('common.save') || 'Save Changes') : (t('custom_agents.deploy') || 'Deploy Custom Agent')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
