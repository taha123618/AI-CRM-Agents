import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Workflow,
  Play,
  CheckCircle2,
  ArrowRight,
  Bot,
  Zap,
  Plus,
  Trash2,
} from 'lucide-react';
import { settingsApi } from '@/features/settings/api';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const AVAILABLE_AGENTS = [
  { id: 'lead_qualification', name: 'Lead Qualification Agent', category: 'sdr' },
  { id: 'email_intelligence', name: 'Email Intelligence Agent', category: 'outreach' },
  { id: 'sales_pipeline', name: 'Sales Pipeline & War Room', category: 'deals' },
  { id: 'customer_success', name: 'Customer Success & Retention', category: 'cs' },
  { id: 'whatsapp_agent', name: 'WhatsApp Auto-Pilot Agent', category: 'messaging' },
  { id: 'voice_call_agent', name: 'Voice AI Intelligence Agent', category: 'voice' },
];

export function VisualWorkflowCanvas() {
  const queryClient = useQueryClient();
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [simulationTrace, setSimulationTrace] = useState<any | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddNodeOpen, setIsAddNodeOpen] = useState(false);

  // New Workflow form
  const [newWfName, setNewWfName] = useState('');
  const [newWfDesc, setNewWfDesc] = useState('');
  const [newWfTrigger, setNewWfTrigger] = useState('event');

  // New Node form
  const [nodeType, setNodeType] = useState<'trigger' | 'agent' | 'action'>('agent');
  const [nodeLabel, setNodeLabel] = useState('');
  const [nodeAgent, setNodeAgent] = useState('lead_qualification');

  const { data: workflows, isLoading } = useQuery({
    queryKey: ['workflows-list'],
    queryFn: settingsApi.getWorkflows,
  });

  const activeWf =
    workflows?.find((w) => w.id === selectedWorkflowId) || (workflows && workflows.length > 0 ? workflows[0] : null);

  const executeMutation = useMutation({
    mutationFn: (id: string) => settingsApi.executeWorkflow(id),
    onSuccess: (data) => {
      setSimulationTrace(data);
      queryClient.invalidateQueries({ queryKey: ['workflows-list'] });
    },
  });

  const createWfMutation = useMutation({
    mutationFn: (payload: any) => settingsApi.createWorkflow(payload),
    onSuccess: (newWf) => {
      queryClient.invalidateQueries({ queryKey: ['workflows-list'] });
      setSelectedWorkflowId(newWf.id);
      setIsCreateModalOpen(false);
      setNewWfName('');
      setNewWfDesc('');
    },
  });

  const updateWfMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => settingsApi.updateWorkflow(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows-list'] });
      setIsAddNodeOpen(false);
    },
  });

  const deleteWfMutation = useMutation({
    mutationFn: (id: string) => settingsApi.deleteWorkflow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows-list'] });
      setSelectedWorkflowId(null);
    },
  });

  const handleRunSimulation = () => {
    if (activeWf) {
      executeMutation.mutate(activeWf.id);
    }
  };

  const handleAddNodeToActive = () => {
    if (!activeWf || !nodeLabel.trim()) return;

    const newNodeId = `node-${Date.now().toString().slice(-4)}`;
    const updatedNodes = [
      ...(activeWf.nodes || []),
      {
        id: newNodeId,
        type: nodeType,
        label: nodeLabel.trim(),
        agent: nodeType === 'agent' ? nodeAgent : undefined,
      },
    ];

    // Auto connect to prior node
    const updatedEdges = [...(activeWf.edges || [])];
    if (activeWf.nodes && activeWf.nodes.length > 0) {
      const priorNode = activeWf.nodes[activeWf.nodes.length - 1];
      updatedEdges.push({
        id: `edge-${priorNode.id}-${newNodeId}`,
        source: priorNode.id,
        target: newNodeId,
      });
    }

    updateWfMutation.mutate({
      id: activeWf.id,
      payload: {
        nodes: updatedNodes,
        edges: updatedEdges,
      },
    });

    setNodeLabel('');
  };

  const handleRemoveNode = (nodeId: string) => {
    if (!activeWf) return;
    const updatedNodes = (activeWf.nodes || []).filter((n) => n.id !== nodeId);
    const updatedEdges = (activeWf.edges || []).filter((e) => e.source !== nodeId && e.target !== nodeId);

    updateWfMutation.mutate({
      id: activeWf.id,
      payload: {
        nodes: updatedNodes,
        edges: updatedEdges,
      },
    });
  };

  const handleCreateWorkflowSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWfName.trim()) return;

    createWfMutation.mutate({
      name: newWfName.trim(),
      description: newWfDesc.trim() || undefined,
      trigger_type: newWfTrigger,
      trigger_config: { event: 'custom_trigger' },
      nodes: [
        { id: 'n-start', type: 'trigger', label: 'Initial Trigger' },
        { id: 'n-agent', type: 'agent', label: 'Lead Qualification Agent', agent: 'lead_qualification' },
        { id: 'n-action', type: 'action', label: 'Autonomous Outreach Action' },
      ],
      edges: [
        { id: 'e-1', source: 'n-start', target: 'n-agent' },
        { id: 'e-2', source: 'n-agent', target: 'n-action' },
      ],
      is_active: true,
    });
  };

  const getNodeBadgeVariant = (type: string): 'purple' | 'info' | 'success' | 'warning' | 'default' => {
    switch (type) {
      case 'trigger':
        return 'warning';
      case 'agent':
        return 'purple';
      case 'action':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Canvas Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Workflow className="w-5 h-5 text-brand-400" />
            <h2 className="text-lg font-bold text-white">Visual Multi-Agent Workflow Canvas</h2>
            <Badge variant="purple" className="text-[10px]">
              Node Pipeline
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Build, connect, and simulate autonomous multi-agent triggers across Lead SDR cadences, Deal War Rooms, and Churn prevention.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsCreateModalOpen(true)}
            className="border-slate-800 bg-slate-900/80 hover:bg-slate-800"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>New Pipeline</span>
          </Button>

          <Button
            size="sm"
            variant="orange"
            onClick={handleRunSimulation}
            disabled={executeMutation.isPending || !activeWf}
            className="flex items-center gap-1.5"
          >
            {executeMutation.isPending ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current text-white" />
            )}
            <span>{executeMutation.isPending ? 'Simulating...' : 'Run Simulation'}</span>
          </Button>
        </div>
      </div>

      {/* Workflow Selector Bar */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          {workflows?.map((wf) => (
            <button
              key={wf.id}
              onClick={() => {
                setSelectedWorkflowId(wf.id);
                setSimulationTrace(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                activeWf?.id === wf.id
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{wf.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/40 text-slate-300 font-mono">
                {wf.execution_count} runs
              </span>
            </button>
          ))}
        </div>

        {activeWf && (
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsAddNodeOpen(true)}
              className="text-xs h-8 border-brand-500/30 text-brand-300 hover:bg-brand-500/10"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Add Step Node</span>
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                if (confirm(`Delete workflow "${activeWf.name}"?`)) {
                  deleteWfMutation.mutate(activeWf.id);
                }
              }}
              className="h-8 px-2 text-slate-500 hover:text-rose-400"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="py-16 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : activeWf ? (
        <div className="space-y-6">
          {/* Visual Interactive Graph Stage */}
          <div className="relative min-h-[320px] rounded-3xl bg-slate-950 border border-slate-800/90 p-8 overflow-x-auto flex items-center justify-between gap-6 shadow-inner">
            {/* Background Grid Accent */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-20 pointer-events-none" />

            {/* Nodes Pipeline */}
            <div className="relative z-10 flex items-center gap-4 mx-auto">
              {activeWf.nodes?.map((node, index) => (
                <div key={node.id} className="flex items-center gap-4">
                  {/* Node Card */}
                  <div className="w-56 p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-brand-500/50 shadow-xl transition-all space-y-2 group relative">
                    <button
                      onClick={() => handleRemoveNode(node.id)}
                      className="absolute top-3 right-3 text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove Step"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>

                    <div className="flex items-center justify-between pr-4">
                      <Badge variant={getNodeBadgeVariant(node.type)} className="text-[9px] uppercase font-mono">
                        {node.type}
                      </Badge>
                      <span className="text-[10px] font-mono text-slate-500">Step #{index + 1}</span>
                    </div>

                    <h4 className="text-xs font-bold text-white group-hover:text-brand-400 transition-colors">
                      {node.label}
                    </h4>

                    {node.agent && (
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-purple-400">
                        <Bot className="w-3.5 h-3.5" />
                        <span>{node.agent}</span>
                      </div>
                    )}
                  </div>

                  {/* Flow Arrow */}
                  {index < activeWf.nodes.length - 1 && (
                    <div className="text-slate-600 flex items-center">
                      <ArrowRight className="w-5 h-5 animate-pulse text-brand-500/60" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Simulation Trace */}
          {simulationTrace && (
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-brand-500/30 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Simulation Pipeline Complete</h3>
                  <Badge variant="success" className="text-[10px]">
                    {simulationTrace.nodes_processed} Nodes Executed
                  </Badge>
                </div>

                <span className="text-xs font-mono text-slate-400">
                  Executed at: {new Date(simulationTrace.executed_at).toLocaleTimeString()}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {simulationTrace.trace?.map((step: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </span>
                      <span className="text-slate-200 font-medium">{step.node}</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-500">{step.latency_ms}ms</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Add Step Node Modal */}
      {isAddNodeOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-brand-400" />
                Append Workflow Step Node
              </h3>
              <button onClick={() => setIsAddNodeOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Step Type</label>
                <select
                  value={nodeType}
                  onChange={(e) => setNodeType(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="agent">Autonomous AI Agent</option>
                  <option value="action">Outbound CRM Action</option>
                  <option value="trigger">Conditional Check / Trigger</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Step Name / Label *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Email Intelligence Cadence Step"
                  value={nodeLabel}
                  onChange={(e) => setNodeLabel(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              {nodeType === 'agent' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target AI Agent</label>
                  <select
                    value={nodeAgent}
                    onChange={(e) => setNodeAgent(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    {AVAILABLE_AGENTS.map((ag) => (
                      <option key={ag.id} value={ag.id}>
                        {ag.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-3 flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddNodeOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="orange"
                  size="sm"
                  onClick={handleAddNodeToActive}
                  disabled={updateWfMutation.isPending || !nodeLabel.trim()}
                >
                  {updateWfMutation.isPending ? 'Adding...' : 'Add Node to Pipeline'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create New Pipeline Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Workflow className="w-5 h-5 text-brand-400" />
                Create New Workflow Pipeline
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateWorkflowSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Pipeline Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enterprise Churn Defense Pipeline"
                  value={newWfName}
                  onChange={(e) => setNewWfName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Summarize the multi-agent cadence goals..."
                  value={newWfDesc}
                  onChange={(e) => setNewWfDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Trigger Execution Mode</label>
                <select
                  value={newWfTrigger}
                  onChange={(e) => setNewWfTrigger(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="event">Real-time CRM Event Trigger</option>
                  <option value="manual">Manual 1-Click Trigger</option>
                  <option value="webhook">Inbound Webhook Trigger</option>
                  <option value="schedule">Scheduled Cron Trigger</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="orange" size="sm" disabled={createWfMutation.isPending}>
                  {createWfMutation.isPending ? 'Creating...' : 'Create Pipeline'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
