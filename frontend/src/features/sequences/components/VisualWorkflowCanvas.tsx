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
  { id: 'lead_qualification', name: 'LEAD QUALIFICATION AGENT', category: 'sdr' },
  { id: 'email_intelligence', name: 'EMAIL INTELLIGENCE AGENT', category: 'outreach' },
  { id: 'sales_pipeline', name: 'SALES PIPELINE & WAR ROOM', category: 'deals' },
  { id: 'customer_success', name: 'CUSTOMER SUCCESS & RETENTION', category: 'cs' },
  { id: 'whatsapp_agent', name: 'WHATSAPP AUTO-PILOT AGENT', category: 'messaging' },
  { id: 'voice_call_agent', name: 'VOICE AI INTELLIGENCE AGENT', category: 'voice' },
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
        { id: 'n-start', type: 'trigger', label: 'INITIAL TRIGGER' },
        { id: 'n-agent', type: 'agent', label: 'LEAD QUALIFICATION AGENT', agent: 'lead_qualification' },
        { id: 'n-action', type: 'action', label: 'AUTONOMOUS OUTREACH ACTION' },
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
    <div className="space-y-4 font-mono">
      {/* Canvas Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-none bg-[#1F2833] border border-[#3A4552]">
        <div>
          <div className="flex items-center gap-2">
            <Workflow className="w-4 h-4 text-[#FFB800]" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">VISUAL AGENT WORKFLOW CANVAS</h2>
            <Badge variant="purple" className="text-[9px] uppercase font-mono">
              NODE PIPELINE
            </Badge>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5 uppercase">
            BUILD, CONNECT, AND SIMULATE AUTONOMOUS MULTI-AGENT TRIGGERS ACROSS CADENCES, WAR ROOMS, AND CS PLAYBOOKS.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsCreateModalOpen(true)}
            className="text-xs h-7 uppercase"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>NEW PIPELINE</span>
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={handleRunSimulation}
            disabled={executeMutation.isPending || !activeWf}
            className="flex items-center gap-1 text-xs h-7 uppercase"
          >
            {executeMutation.isPending ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Play className="w-3 h-3 fill-current text-[#0B0C10]" />
            )}
            <span>{executeMutation.isPending ? 'SIMULATING...' : 'RUN SIMULATION'}</span>
          </Button>
        </div>
      </div>

      {/* Workflow Selector Bar */}
      <div className="flex items-center justify-between gap-3 border-b border-[#3A4552] pb-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          {workflows?.map((wf) => (
            <button
              key={wf.id}
              onClick={() => {
                setSelectedWorkflowId(wf.id);
                setSimulationTrace(null);
              }}
              className={`px-3 py-1.5 rounded-none text-[11px] font-bold uppercase whitespace-nowrap transition-none flex items-center gap-2 ${activeWf?.id === wf.id
                  ? 'bg-[#FFB800] text-[#0B0C10] border border-[#FFB800]'
                  : 'bg-[#0B0C10] text-slate-400 hover:text-white border border-[#3A4552]'
                }`}
            >
              <Zap className="w-3 h-3" />
              <span>{wf.name}</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-none bg-[#1F2833] text-slate-300 font-mono border border-[#3A4552]">
                {wf.execution_count} RUNS
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
              className="text-xs h-7 uppercase"
            >
              <Plus className="w-3 h-3 mr-1" />
              <span>ADD STEP NODE</span>
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                if (confirm(`Delete workflow "${activeWf.name}"?`)) {
                  deleteWfMutation.mutate(activeWf.id);
                }
              }}
              className="h-7 px-2 text-slate-500 hover:text-[#FF2A54]"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : activeWf ? (
        <div className="space-y-4">
          {/* Visual Interactive Graph Stage */}
          <div className="relative min-h-[300px] rounded-none bg-[#0B0C10] border border-[#3A4552] p-6 overflow-x-auto flex items-center justify-between gap-6">
            {/* Background Grid Accent */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1F2833_1px,transparent_1px),linear-gradient(to_bottom,#1F2833_1px,transparent_1px)] bg-[size:20px_20px] opacity-40 pointer-events-none" />

            {/* Nodes Pipeline */}
            <div className="relative z-10 flex items-center gap-4 mx-auto font-mono">
              {activeWf.nodes?.map((node, index) => (
                <div key={node.id} className="flex items-center gap-4">
                  {/* Node Card */}
                  <div className="w-56 p-3.5 rounded-none bg-[#1F2833] border border-[#3A4552] hover:border-[#FFB800] transition-none space-y-2 group relative">
                    <button
                      onClick={() => handleRemoveNode(node.id)}
                      className="absolute top-2.5 right-2.5 text-slate-500 hover:text-[#FF2A54] opacity-0 group-hover:opacity-100 transition-none"
                      title="Remove Step"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>

                    <div className="flex items-center justify-between pr-4">
                      <Badge variant={getNodeBadgeVariant(node.type)} className="text-[9px] uppercase font-mono">
                        {node.type}
                      </Badge>
                      <span className="text-[10px] font-mono text-slate-400">STEP #{index + 1}</span>
                    </div>

                    <h4 className="text-xs font-bold text-white group-hover:text-[#FFB800] transition-none uppercase">
                      {node.label}
                    </h4>

                    {node.agent && (
                      <div className="flex items-center gap-1 text-[10px] font-mono text-purple-400 uppercase">
                        <Bot className="w-3 h-3" />
                        <span>{node.agent}</span>
                      </div>
                    )}
                  </div>

                  {/* Flow Arrow */}
                  {index < activeWf.nodes.length - 1 && (
                    <div className="text-[#3A4552] flex items-center">
                      <ArrowRight className="w-4 h-4 text-[#FFB800]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Simulation Trace */}
          {simulationTrace && (
            <div className="p-4 rounded-none bg-[#1F2833] border border-[#FFB800] space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FFB800]" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">SIMULATION PIPELINE COMPLETE</h3>
                  <Badge variant="success" className="text-[9px] uppercase">
                    {simulationTrace.nodes_processed} NODES EXECUTED
                  </Badge>
                </div>

                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  EXECUTED AT: {new Date(simulationTrace.executed_at).toLocaleTimeString()}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {simulationTrace.trace?.map((step: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-none bg-[#0B0C10] border border-[#3A4552] flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-none bg-[#1F2833] text-[#FFB800] border border-[#3A4552] flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </span>
                      <span className="text-slate-200 font-bold text-[11px] uppercase">{step.node}</span>
                    </div>
                    <span className="font-mono text-[9px] text-[#FFB800]">{step.latency_ms}MS</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Add Step Node Modal */}
      {isAddNodeOpen && (
        <div className="fixed inset-0 z-50 bg-[#0B0C10]/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono">
          <div className="w-full max-w-md bg-[#1F2833] border border-[#3A4552] rounded-none p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#3A4552] pb-2.5">
              <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                <Plus className="w-4 h-4 text-[#FFB800]" />
                APPEND WORKFLOW STEP NODE
              </h3>
              <button onClick={() => setIsAddNodeOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-300 mb-1">STEP TYPE</label>
                <select
                  value={nodeType}
                  onChange={(e) => setNodeType(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-none bg-[#0B0C10] border border-[#3A4552] text-xs text-white focus:outline-none focus:border-[#FFB800] uppercase"
                >
                  <option value="agent">AUTONOMOUS AI AGENT</option>
                  <option value="action">OUTBOUND CRM ACTION</option>
                  <option value="trigger">CONDITIONAL CHECK / TRIGGER</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-300 mb-1">STEP NAME / LABEL *</label>
                <input
                  type="text"
                  required
                  placeholder="E.G. EMAIL INTELLIGENCE CADENCE STEP"
                  value={nodeLabel}
                  onChange={(e) => setNodeLabel(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-none bg-[#0B0C10] border border-[#3A4552] text-xs text-white focus:outline-none focus:border-[#FFB800] uppercase font-mono"
                />
              </div>

              {nodeType === 'agent' && (
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-300 mb-1">TARGET AI AGENT</label>
                  <select
                    value={nodeAgent}
                    onChange={(e) => setNodeAgent(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-none bg-[#0B0C10] border border-[#3A4552] text-xs text-white focus:outline-none focus:border-[#FFB800] uppercase"
                  >
                    {AVAILABLE_AGENTS.map((ag) => (
                      <option key={ag.id} value={ag.id}>
                        {ag.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2 border-t border-[#3A4552]">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddNodeOpen(false)} className="text-xs uppercase">
                  CANCEL
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleAddNodeToActive}
                  disabled={updateWfMutation.isPending || !nodeLabel.trim()}
                  className="text-xs uppercase"
                >
                  {updateWfMutation.isPending ? 'ADDING...' : 'ADD NODE TO PIPELINE'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create New Pipeline Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0B0C10]/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono">
          <div className="w-full max-w-md bg-[#1F2833] border border-[#3A4552] rounded-none p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#3A4552] pb-2.5">
              <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                <Workflow className="w-4 h-4 text-[#FFB800]" />
                CREATE NEW WORKFLOW PIPELINE
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateWorkflowSubmit} className="space-y-3 font-mono">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-300 mb-1">PIPELINE NAME *</label>
                <input
                  type="text"
                  required
                  placeholder="E.G. ENTERPRISE CHURN DEFENSE PIPELINE"
                  value={newWfName}
                  onChange={(e) => setNewWfName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-none bg-[#0B0C10] border border-[#3A4552] text-xs text-white focus:outline-none focus:border-[#FFB800] uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-300 mb-1">DESCRIPTION</label>
                <textarea
                  rows={3}
                  placeholder="SUMMARIZE MULTI-AGENT CADENCE GOALS..."
                  value={newWfDesc}
                  onChange={(e) => setNewWfDesc(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-none bg-[#0B0C10] border border-[#3A4552] text-xs text-white focus:outline-none focus:border-[#FFB800] uppercase font-mono resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-300 mb-1">TRIGGER EXECUTION MODE</label>
                <select
                  value={newWfTrigger}
                  onChange={(e) => setNewWfTrigger(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-none bg-[#0B0C10] border border-[#3A4552] text-xs text-white focus:outline-none focus:border-[#FFB800] uppercase"
                >
                  <option value="event">REAL-TIME CRM EVENT TRIGGER</option>
                  <option value="manual">MANUAL 1-CLICK TRIGGER</option>
                  <option value="webhook">INBOUND WEBHOOK TRIGGER</option>
                  <option value="schedule">SCHEDULED CRON TRIGGER</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#3A4552]">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)} className="text-xs uppercase">
                  CANCEL
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={createWfMutation.isPending} className="text-xs uppercase">
                  {createWfMutation.isPending ? 'CREATING...' : 'CREATE PIPELINE'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
