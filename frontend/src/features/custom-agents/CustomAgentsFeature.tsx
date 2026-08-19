import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useTranslation } from '@/features/multi-language';
import {
  useCustomAgents,
  useDeleteCustomAgent,
  useUpdateCustomAgent,
} from './hooks/useCustomAgents';
import { CustomAgent } from './types/customAgent.types';
import { CustomAgentBuilderModal } from './components/CustomAgentBuilderModal';
import { AgentSandboxDrawer } from './components/AgentSandboxDrawer';
import { AgentExecutionsModal } from './components/AgentExecutionsModal';
import { PromptEvaluationModal } from './components/PromptEvaluationModal';
import {
  Bot,
  Plus,
  Play,
  History,
  Pencil,
  Trash2,
  Sparkles,
  Zap,
  Activity,
  Cpu,
  RefreshCw,
} from 'lucide-react';

export function CustomAgentsFeature() {
  const { t } = useTranslation();
  const { data: agents, isLoading, refetch, isRefetching } = useCustomAgents();
  const deleteMutation = useDeleteCustomAgent();
  const updateMutation = useUpdateCustomAgent();

  // Modals & Drawers state
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isEvalOpen, setIsEvalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<CustomAgent | null>(null);
  const [sandboxAgent, setSandboxAgent] = useState<CustomAgent | null>(null);
  const [historyAgent, setHistoryAgent] = useState<CustomAgent | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  const handleOpenCreate = () => {
    setEditingAgent(null);
    setIsBuilderOpen(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, agent: CustomAgent) => {
    e.stopPropagation();
    setEditingAgent(agent);
    setIsBuilderOpen(true);
  };

  const handleToggleActive = async (e: React.MouseEvent, agent: CustomAgent) => {
    e.stopPropagation();
    try {
      await updateMutation.mutateAsync({
        id: agent.id,
        payload: { is_active: !agent.is_active },
      });
    } catch {
      // Error handled by mutation
    }
  };

  const handleDelete = async (e: React.MouseEvent, agent: CustomAgent) => {
    e.stopPropagation();
    if (confirm(t('custom_agents.confirm_delete', { name: agent.name }) || `Are you sure you want to delete custom agent "${agent.name}"?`)) {
      try {
        await deleteMutation.mutateAsync(agent.id);
      } catch {
        // Error handled by mutation
      }
    }
  };

  const filteredAgents = (agents || []).filter((a) => {
    if (filterType === 'active') return a.is_active;
    if (filterType === 'paused') return !a.is_active;
    if (filterType === 'event') return a.trigger_type === 'event';
    if (filterType === 'webhook') return a.trigger_type === 'webhook';
    if (filterType === 'manual') return a.trigger_type === 'manual';
    return true;
  });

  const totalExecutions = (agents || []).reduce((acc, a) => acc + (a.execution_count || 0), 0);
  const activeCount = (agents || []).filter((a) => a.is_active).length;

  return (
    <div className="space-y-4 font-mono">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1F2833] p-4 border border-[#3A4552]">
        <div>
          <h1 className="text-base font-black tracking-wider text-white uppercase flex items-center gap-2">
            <Bot className="w-5 h-5 text-[#FFB800]" />
            <span>{t('custom_agents.title') || 'NO-CODE AGENT STUDIO'}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 uppercase">
            {t('custom_agents.subtitle') || 'VISUALLY DESIGN AUTONOMOUS CUSTOM AI AGENTS, CONFIGURE MODEL PERSONAS, AND DEPLOY CRM WORKFLOWS.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEvalOpen(true)}
            className="text-xs h-7"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1 text-[#FFB800]" />
            <span>PROMPT BENCHMARK</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            isLoading={isRefetching}
            className="text-xs h-7"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            <span>{t('custom_agents.refresh') || 'REFRESH'}</span>
          </Button>

          <Button variant="primary" size="sm" onClick={handleOpenCreate} className="text-xs h-7">
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>{t('custom_agents.create_agent') || 'CREATE CUSTOM AGENT'}</span>
          </Button>
        </div>
      </div>

      {/* KPI Highlights Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-3 bg-[#1F2833] border-[#3A4552]">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
            <span>{t('custom_agents.total_agents') || 'TOTAL AGENTS'}</span>
            <Bot className="w-4 h-4 text-[#FFB800]" />
          </div>
          <div className="text-2xl font-black text-white mt-1 font-mono">{agents?.length || 0}</div>
        </Card>

        <Card className="p-3 bg-[#1F2833] border-[#3A4552]">
          <div className="flex items-center justify-between text-[10px] font-bold text-[#FFB800] uppercase">
            <span>{t('custom_agents.active_deployments') || 'ACTIVE FLEET'}</span>
            <Activity className="w-4 h-4 text-[#FFB800]" />
          </div>
          <div className="text-2xl font-black text-[#FFB800] mt-1 font-mono">{activeCount}</div>
        </Card>

        <Card className="p-3 bg-[#1F2833] border-[#3A4552]">
          <div className="flex items-center justify-between text-[10px] font-bold text-cyan-400 uppercase">
            <span>{t('custom_agents.total_executions') || 'EXECUTIONS'}</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400 mt-1 font-mono">{totalExecutions}</div>
        </Card>

        <Card className="p-3 bg-[#1F2833] border-[#3A4552]">
          <div className="flex items-center justify-between text-[10px] font-bold text-[#FFB800] uppercase">
            <span>{t('custom_agents.runtime_engine') || 'RUNTIME ENGINE'}</span>
            <Cpu className="w-4 h-4 text-[#FFB800]" />
          </div>
          <div className="text-[10px] font-bold text-[#FFB800] mt-2 flex items-center gap-1.5 uppercase font-mono">
            <span className="w-1.5 h-1.5 rounded-none bg-[#FFB800] animate-pulse" />
            {t('custom_agents.smart_fallback_active') || 'SMART FALLBACK ACTIVE'}
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 font-mono">
        {[
          { id: 'all', labelKey: 'custom_agents.filter_all', defaultLabel: 'ALL AGENTS' },
          { id: 'active', labelKey: 'custom_agents.filter_active', defaultLabel: 'ACTIVE ONLY' },
          { id: 'paused', labelKey: 'custom_agents.filter_paused', defaultLabel: 'PAUSED' },
          { id: 'event', labelKey: 'custom_agents.filter_event', defaultLabel: 'EVENT-DRIVEN' },
          { id: 'webhook', labelKey: 'custom_agents.filter_webhook', defaultLabel: 'WEBHOOK' },
          { id: 'manual', labelKey: 'custom_agents.filter_manual', defaultLabel: 'MANUAL ON-DEMAND' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1 rounded-none text-xs font-mono font-bold uppercase transition-none ${filterType === tab.id
                ? 'bg-[#FFB800] text-[#0B0C10] border border-[#FFB800]'
                : 'bg-[#0B0C10] text-slate-400 hover:text-white border border-[#3A4552]'
              }`}
          >
            {t(tab.labelKey) || tab.defaultLabel}
          </button>
        ))}
      </div>

      {/* Custom Agents Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-500 text-xs font-mono uppercase">LOADING AGENT FLEET...</div>
      ) : filteredAgents.length === 0 ? (
        <div className="py-16 text-center rounded-none bg-[#0B0C10] border border-[#3A4552] space-y-2.5 font-mono">
          <Bot className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-xs font-bold text-white uppercase">{t('custom_agents.no_agents_found') || 'NO CUSTOM AGENTS FOUND'}</h3>
          <p className="text-[10px] text-slate-500 max-w-sm mx-auto uppercase">
            {t('custom_agents.no_agents_desc') || 'DESIGN YOUR FIRST CUSTOM AUTONOMOUS AGENT TO AUTOMATE SPECIALIZED CRM WORKFLOWS.'}
          </p>
          <Button variant="primary" size="sm" onClick={handleOpenCreate} className="mt-2 text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>{t('custom_agents.create_agent') || 'CREATE CUSTOM AGENT'}</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredAgents.map((agent) => (
            <Card
              key={agent.id}
              className="p-4 bg-[#1F2833] border-[#3A4552] hover:border-[#FFB800] transition-none flex flex-col justify-between group space-y-3 font-mono"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-none bg-[#0B0C10] border border-[#FFB800]/50 text-[#FFB800]">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase group-hover:text-[#FFB800] transition-none">
                        {agent.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="px-1 py-0.2 rounded-none text-[8px] font-mono uppercase font-bold bg-[#0B0C10] text-[#FFB800] border border-[#FFB800]/40">
                          {agent.trigger_type}
                        </span>
                        <span className="text-[9px] text-slate-500 uppercase">
                          • {agent.model_name || 'SMART-FALLBACK'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleToggleActive(e, agent)}
                    className={`px-1.5 py-0.2 rounded-none text-[8px] font-mono uppercase font-bold border transition-none ${agent.is_active
                        ? 'bg-[#0B0C10] text-[#FFB800] border-[#FFB800]'
                        : 'bg-[#0B0C10] text-slate-500 border-[#3A4552]'
                      }`}
                    title="Toggle Active Status"
                  >
                    {agent.is_active ? 'ACTIVE' : 'PAUSED'}
                  </button>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 uppercase">
                  {agent.description || 'NO DESCRIPTION PROVIDED.'}
                </p>

                {/* Tools enabled */}
                <div className="space-y-1 pt-1">
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">
                    {t('custom_agents.step_capabilities') || 'CAPABILITIES'} ({agent.tools_enabled?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(agent.tools_enabled || []).map((tool) => (
                      <span
                        key={tool}
                        className="px-1.5 py-0.2 rounded-none text-[9px] font-mono uppercase bg-[#0B0C10] text-cyan-400 border border-[#3A4552]"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-2 border-t border-[#3A4552] space-y-2">
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono uppercase">
                  <span className="flex items-center gap-1 text-cyan-400 font-bold">
                    <Zap className="w-3 h-3" />
                    {agent.execution_count || 0} {t('custom_agents.runs') || 'RUNS'}
                  </span>
                  <span>
                    {agent.last_run_at ? new Date(agent.last_run_at).toLocaleDateString() : t('custom_agents.never_run') || 'NEVER RUN'}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-1 pt-1">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSandboxAgent(agent)}
                      className="h-6 px-2 text-[10px]"
                    >
                      <Play className="w-3 h-3 mr-1 fill-current text-[#FFB800]" />
                      <span>{t('custom_agents.sandbox') || 'SANDBOX'}</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setHistoryAgent(agent)}
                      className="h-6 px-1.5 text-xs text-slate-400 hover:text-white"
                      title={t('custom_agents.view_history') || 'View Run History & Telemetry'}
                    >
                      <History className="w-3 h-3" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleOpenEdit(e, agent)}
                      className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                      title={t('custom_agents.edit_agent') || 'Edit Agent Configuration'}
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDelete(e, agent)}
                      className="h-6 w-6 p-0 text-slate-400 hover:text-[#FF2A54]"
                      title={t('custom_agents.delete_agent') || 'Delete Agent'}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Builder Modal */}
      {isBuilderOpen && (
        <CustomAgentBuilderModal
          isOpen={isBuilderOpen}
          onClose={() => setIsBuilderOpen(false)}
          agentToEdit={editingAgent}
        />
      )}

      {/* Sandbox Drawer */}
      {sandboxAgent && (
        <AgentSandboxDrawer
          isOpen={Boolean(sandboxAgent)}
          onClose={() => setSandboxAgent(null)}
          agent={sandboxAgent}
        />
      )}

      {/* Executions History Modal */}
      {historyAgent && (
        <AgentExecutionsModal
          isOpen={Boolean(historyAgent)}
          onClose={() => setHistoryAgent(null)}
          agent={historyAgent}
        />
      )}

      {/* Prompt Benchmark & Evaluation Studio Modal */}
      <PromptEvaluationModal
        isOpen={isEvalOpen}
        onClose={() => setIsEvalOpen(false)}
        agentName="Custom Agent Studio"
      />
    </div>
  );
}
