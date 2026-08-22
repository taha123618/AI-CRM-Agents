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
        return <TrendingUp className="w-4 h-4 text-primary" />;
      case 'send_email':
        return <Mail className="w-4 h-4 text-brand-400" />;
      case 'schedule_meeting':
        return <Calendar className="w-4 h-4 text-purple-400" />;
      case 'generate_summary':
        return <FileText className="w-4 h-4 text-primary" />;
      case 'webhook_call':
        return <Webhook className="w-4 h-4 text-destructive" />;
      default:
        return <Wrench className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={agentToEdit ? `${t('custom_agents.edit_agent') || 'EDIT AGENT'}: ${agentToEdit.name.toUpperCase()}` : (t('custom_agents.builder_title') || 'NO-CODE AGENT BUILDER STUDIO')}
      description={t('custom_agents.builder_desc') || 'DESIGN, CONFIGURE LLM REASONING PARAMETERS, CONNECT CRM TOOLS, AND DEPLOY AUTONOMOUS AGENTS.'}
      className="max-w-3xl font-mono"
    >
      <div className="space-y-4 font-mono">
        {/* Step Indicator */}
        <div className="grid grid-cols-4 gap-1.5 border-b border-border pb-3 text-center">
          {[
            { num: 1, labelKey: 'custom_agents.step_identity', defaultLabel: 'IDENTITY & TRIGGER', icon: Bot },
            { num: 2, labelKey: 'custom_agents.step_persona', defaultLabel: 'PERSONA & LLM', icon: Sliders },
            { num: 3, labelKey: 'custom_agents.step_capabilities', defaultLabel: 'CAPABILITIES', icon: Wrench },
            { num: 4, labelKey: 'custom_agents.step_deploy', defaultLabel: 'DEPLOY & CONFIRM', icon: CheckCircle2 },
          ].map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => setStep(s.num as any)}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 p-1.5 rounded-none text-[11px] font-bold uppercase transition-none ${step === s.num
                  ? 'bg-primary text-primary-foreground border border-primary'
                  : 'bg-background text-muted-foreground border border-border hover:text-foreground'
                }`}
            >
              <s.icon className="w-3.5 h-3.5" />
              <span>{t(s.labelKey) || s.defaultLabel}</span>
            </button>
          ))}
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-none bg-background border border-destructive text-destructive text-xs font-mono uppercase">
            {errorMsg}
          </div>
        )}

        {/* STEP 1: IDENTITY & TRIGGER */}
        {step === 1 && (
          <div className="space-y-3 font-mono">
            <div>
              <label className="text-[10px] font-bold text-foreground block mb-1 uppercase tracking-wider">
                {t('custom_agents.agent_name') || 'AGENT NAME'} <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="E.G. VIP CUSTOMER ONBOARDING CONCIERGE"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-foreground block mb-1 uppercase tracking-wider">
                {t('custom_agents.mission_desc') || 'MISSION DESCRIPTION'}
              </label>
              <Input
                placeholder="WHAT OBJECTIVE DOES THIS AGENT ACCOMPLISH AUTONOMOUSLY?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-foreground block mb-1 uppercase tracking-wider">
                {t('custom_agents.trigger_mode') || 'TRIGGER MODE'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'manual', labelKey: 'custom_agents.filter_manual', defaultLabel: 'MANUAL RUN', desc: 'TRIGGERED ON-DEMAND' },
                  { id: 'event', labelKey: 'custom_agents.filter_event', defaultLabel: 'CRM EVENT', desc: 'ON LEAD / DEAL CHANGE' },
                  { id: 'webhook', labelKey: 'custom_agents.filter_webhook', defaultLabel: 'INBOUND WEBHOOK', desc: 'EXTERNAL HTTP POST' },
                  { id: 'schedule', label: 'SCHEDULED CRON', desc: 'PERIODIC EXECUTION' },
                ].map((tItem) => (
                  <button
                    key={tItem.id}
                    type="button"
                    onClick={() => setTriggerType(tItem.id as TriggerType)}
                    className={`p-2.5 rounded-none border text-left transition-none uppercase font-mono ${triggerType === tItem.id
                        ? 'border-primary bg-background text-primary'
                        : 'border-border bg-background text-muted-foreground hover:border-border'
                      }`}
                  >
                    <div className="text-xs font-bold">{tItem.labelKey ? t(tItem.labelKey) : tItem.label}</div>
                    <div className="text-[9px] text-muted-foreground mt-0.5">{tItem.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {triggerType === 'event' && (
              <div>
                <label className="text-[10px] font-bold text-foreground block mb-1 uppercase tracking-wider">
                  TRIGGER EVENT NAME
                </label>
                <select
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="w-full bg-background border border-border rounded-none px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary uppercase font-mono"
                >
                  <option value="lead.created">ON NEW LEAD CREATED</option>
                  <option value="lead.qualified">ON LEAD QUALIFIED (SCORE &gt; 70)</option>
                  <option value="deal.stage_changed">ON DEAL STAGE CHANGED</option>
                  <option value="customer.tier1_created">ON TIER-1 CUSTOMER ADDED</option>
                  <option value="email.received">ON INBOUND PROSPECT EMAIL</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: PERSONA & LLM CONFIG */}
        {step === 2 && (
          <div className="space-y-3 font-mono">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-foreground block mb-1 uppercase tracking-wider">
                  {t('custom_agents.llm_model') || 'LLM MODEL ENGINE'}
                </label>
                <select
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full bg-background border border-border rounded-none px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary uppercase font-mono"
                >
                  <option value="smart-fallback">SMARTFALLBACK (AUTO-ROUTING)</option>
                  <option value="gpt-4o">OPENAI GPT-4O</option>
                  <option value="claude-3-5-sonnet">ANTHROPIC CLAUDE 3.5 SONNET</option>
                  <option value="gpt-4o-mini">OPENAI GPT-4O MINI</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-foreground block mb-1 flex justify-between uppercase tracking-wider">
                  <span>{t('custom_agents.temperature') || 'TEMPERATURE'}</span>
                  <span className="text-primary font-mono">{temperature}</span>
                </label>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-primary mt-2"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                  {t('custom_agents.system_prompt') || 'SYSTEM PERSONA & INSTRUCTIONS'} <span className="text-destructive">*</span>
                </label>
                <span className="text-[9px] text-muted-foreground uppercase">{t('custom_agents.insert_variables') || 'INSERT VARIABLES'}</span>
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {TEMPLATE_VARIABLES.map((v) => (
                  <button
                    key={v.label}
                    type="button"
                    onClick={() => handleInsertVariable(v.label)}
                    className="px-1.5 py-0.5 rounded-none bg-background border border-border text-[10px] font-mono text-primary hover:border-primary transition-none uppercase"
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
                placeholder="DESCRIBE HOW THE AGENT SHOULD REASON AND WHAT STRUCTURED OUTPUT TO PRODUCE..."
                className="w-full bg-background border border-border rounded-none p-2.5 text-xs font-mono text-foreground focus:outline-none focus:border-primary resize-none leading-relaxed uppercase"
                required
              />
            </div>
          </div>
        )}

        {/* STEP 3: CAPABILITY TOOLS */}
        {step === 3 && (
          <div className="space-y-3 font-mono">
            <div>
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-0.5">
                {t('custom_agents.authorized_tools') || 'AUTHORIZED CRM CAPABILITY TOOLS'}
              </h4>
              <p className="text-[10px] text-muted-foreground uppercase">
                {t('custom_agents.enable_tools_desc') || 'ENABLE TOOLS THIS AGENT IS PERMITTED TO EXECUTE AUTONOMOUSLY.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[280px] overflow-y-auto pr-1">
              {(availableTools || []).map((tool) => {
                const isSelected = selectedTools.includes(tool.id);
                return (
                  <div
                    key={tool.id}
                    onClick={() => handleToolToggle(tool.id)}
                    className={`p-2.5 rounded-none border cursor-pointer transition-none flex items-start gap-2.5 ${isSelected
                        ? 'border-primary bg-background text-foreground'
                        : 'border-border bg-background text-muted-foreground hover:border-border'
                      }`}
                  >
                    <div className="p-1.5 rounded-none bg-card border border-border shrink-0">
                      {getToolIcon(tool.id)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground uppercase truncate">{tool.name}</span>
                        <Badge variant={isSelected ? 'success' : 'default'} className="text-[8px] uppercase">
                          {isSelected ? 'ENABLED' : 'DISABLED'}
                        </Badge>
                      </div>
                      <p className="text-[9px] text-muted-foreground mt-0.5 uppercase leading-relaxed line-clamp-2">
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
          <div className="space-y-3 font-mono">
            <div className="p-3.5 rounded-none bg-background border border-border space-y-2.5">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div>
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-2 uppercase">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span>{name || 'UNTITLED CUSTOM AGENT'}</span>
                  </h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5 uppercase">{description || 'NO DESCRIPTION'}</p>
                </div>
                <Badge variant={isActive ? 'success' : 'default'} className="text-[9px] uppercase">
                  {isActive ? 'ACTIVE & READY' : 'PAUSED'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs uppercase">
                <div>
                  <span className="text-[9px] text-muted-foreground uppercase font-bold block">{t('custom_agents.trigger_mode') || 'TRIGGER'}</span>
                  <span className="font-bold text-foreground">{triggerType}</span>
                </div>
                <div>
                  <span className="text-[9px] text-muted-foreground uppercase font-bold block">{t('custom_agents.llm_model') || 'MODEL ENGINE'}</span>
                  <span className="font-bold text-foreground">{modelName}</span>
                </div>
                <div>
                  <span className="text-[9px] text-muted-foreground uppercase font-bold block">{t('custom_agents.temperature') || 'TEMPERATURE'}</span>
                  <span className="font-bold text-primary font-mono">{temperature}</span>
                </div>
              </div>

              <div>
                <span className="text-[9px] text-muted-foreground uppercase font-bold block mb-1">
                  {t('custom_agents.active_tools') || 'ACTIVE TOOLS'} ({selectedTools.length})
                </span>
                <div className="flex flex-wrap gap-1">
                  {selectedTools.map((tItem) => (
                    <span
                      key={tItem}
                      className="px-1.5 py-0.5 rounded-none text-[9px] font-bold bg-card text-primary border border-border uppercase"
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
                className="w-3.5 h-3.5 rounded-none accent-primary"
              />
              <label htmlFor="activeToggle" className="text-xs font-bold text-foreground uppercase cursor-pointer">
                {t('custom_agents.enable_immediately') || 'ENABLE AGENT IMMEDIATELY UPON CREATION'}
              </label>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-between border-t border-border pt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStep((prev) => Math.max(1, prev - 1) as any)}
            disabled={step === 1}
            className="text-xs uppercase"
          >
            <ChevronLeft className="w-3.5 h-3.5 mr-1" />
            {t('custom_agents.previous') || 'PREVIOUS'}
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs uppercase">
              {t('common.cancel') || 'CANCEL'}
            </Button>
            {step < 4 ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setStep((prev) => Math.min(4, prev + 1) as any)}
                className="text-xs uppercase"
              >
                {t('custom_agents.next') || 'NEXT'}
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmit}
                isLoading={createMutation.isPending || updateMutation.isPending}
                className="text-xs uppercase font-bold"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                {agentToEdit ? (t('common.save') || 'SAVE CHANGES') : (t('custom_agents.deploy') || 'DEPLOY CUSTOM AGENT')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
