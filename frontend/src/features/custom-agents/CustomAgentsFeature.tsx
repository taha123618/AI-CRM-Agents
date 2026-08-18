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
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
              <Bot className="w-6 h-6" />
            </div>
            <span>{t('custom_agents.title') || 'No-Code Agent Studio'}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t('custom_agents.subtitle') || 'Visually design autonomous custom AI agents, configure model personas, and deploy CRM workflows without writing code.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEvalOpen(true)}
            className="border-purple-500/30 text-purple-300 hover:bg-purple-950/40"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
            <span>Prompt Benchmark</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            isLoading={isRefetching}
            className="border-slate-800 bg-slate-900/50 hover:bg-slate-800"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            <span>{t('custom_agents.refresh') || 'Refresh'}</span>
          </Button>

          <Button variant="primary" size="sm" onClick={handleOpenCreate}>
            <Plus className="w-4 h-4 mr-1.5" />
            <span>{t('custom_agents.create_agent') || 'Create Custom Agent'}</span>
          </Button>
        </div>
      </div>

      {/* KPI Highlights Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-900/60 border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{t('custom_agents.total_agents') || 'Total Custom Agents'}</span>
            <Bot className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1 font-mono">{agents?.length || 0}</div>
        </Card>

        <Card className="p-4 bg-slate-900/60 border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{t('custom_agents.active_deployments') || 'Active Deployments'}</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">{activeCount}</div>
        </Card>

        <Card className="p-4 bg-slate-900/60 border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{t('custom_agents.total_executions') || 'Total Executions'}</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400 mt-1 font-mono">{totalExecutions}</div>
        </Card>

        <Card className="p-4 bg-slate-900/60 border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{t('custom_agents.runtime_engine') || 'Runtime Engine'}</span>
            <Cpu className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xs font-bold text-amber-400 mt-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            {t('custom_agents.smart_fallback_active') || 'SmartFallback Active'}
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', labelKey: 'custom_agents.filter_all', defaultLabel: 'All Custom Agents' },
          { id: 'active', labelKey: 'custom_agents.filter_active', defaultLabel: 'Active Only' },
          { id: 'paused', labelKey: 'custom_agents.filter_paused', defaultLabel: 'Paused' },
          { id: 'event', labelKey: 'custom_agents.filter_event', defaultLabel: 'Event-Driven' },
          { id: 'webhook', labelKey: 'custom_agents.filter_webhook', defaultLabel: 'Webhook' },
          { id: 'manual', labelKey: 'custom_agents.filter_manual', defaultLabel: 'Manual On-Demand' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filterType === tab.id
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {t(tab.labelKey) || tab.defaultLabel}
          </button>
        ))}
      </div>

      {/* Custom Agents Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-500 text-xs">Loading Custom Agents...</div>
      ) : filteredAgents.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-slate-900/30 border border-slate-800 space-y-3">
          <Bot className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">{t('custom_agents.no_agents_found') || 'No custom agents found'}</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {t('custom_agents.no_agents_desc') || 'Design your first custom autonomous agent to automate specialized customer success, sales pipeline, or legal workflows.'}
          </p>
          <Button variant="primary" size="sm" onClick={handleOpenCreate} className="mt-2">
            <Plus className="w-4 h-4 mr-1.5" />
            <span>{t('custom_agents.create_agent') || 'Create Custom Agent'}</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgents.map((agent) => (
            <Card
              key={agent.id}
              className="p-5 bg-slate-900/70 border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col justify-between group space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 group-hover:scale-105 transition-transform">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors">
                        {agent.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-slate-800 text-slate-400">
                          {agent.trigger_type}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          • {agent.model_name || 'smart-fallback'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleToggleActive(e, agent)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                      agent.is_active
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                        : 'bg-slate-800 text-slate-500 border-slate-700 hover:bg-slate-700'
                    }`}
                    title="Toggle Active Status"
                  >
                    {agent.is_active ? 'Active' : 'Paused'}
                  </button>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {agent.description || 'No description provided.'}
                </p>

                {/* Tools enabled */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                    {t('custom_agents.step_capabilities') || 'Capabilities'} ({agent.tools_enabled?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(agent.tools_enabled || []).map((tool) => (
                      <span
                        key={tool}
                        className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-800/80 text-cyan-400 border border-slate-700/60"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span className="flex items-center gap-1 text-purple-400">
                    <Zap className="w-3 h-3" />
                    {agent.execution_count || 0} {t('custom_agents.runs') || 'runs'}
                  </span>
                  <span>
                    {agent.last_run_at ? new Date(agent.last_run_at).toLocaleDateString() : t('custom_agents.never_run') || 'Never run'}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-1.5 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSandboxAgent(agent)}
                      className="h-8 px-2.5 text-xs text-brand-400 border-brand-500/30 hover:bg-brand-500/10"
                    >
                      <Play className="w-3.5 h-3.5 mr-1 fill-current" />
                      <span>{t('custom_agents.sandbox') || 'Sandbox'}</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setHistoryAgent(agent)}
                      className="h-8 px-2 text-xs text-slate-400 hover:text-white"
                      title={t('custom_agents.view_history') || 'View Run History & Telemetry'}
                    >
                      <History className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleOpenEdit(e, agent)}
                      className="h-8 w-8 p-0 text-slate-500 hover:text-brand-400"
                      title={t('custom_agents.edit_agent') || 'Edit Agent Configuration'}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDelete(e, agent)}
                      className="h-8 w-8 p-0 text-slate-500 hover:text-rose-400"
                      title={t('custom_agents.delete_agent') || 'Delete Agent'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
