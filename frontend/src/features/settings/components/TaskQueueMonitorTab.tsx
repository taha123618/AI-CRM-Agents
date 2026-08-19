import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Cpu, Play, CheckCircle2, RefreshCw, Layers, Sparkles, Mic, Trash2, XCircle, Search, Filter, RotateCcw } from 'lucide-react';
import { settingsApi } from '../api';
import { BackgroundTask } from '../types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { TablePagination } from './TablePagination';

export function TaskQueueMonitorTab() {
  const queryClient = useQueryClient();
  const [simCount, setSimCount] = useState(500);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Search, Filter & Pagination State
  const [taskSearch, setTaskSearch] = useState('');
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const { data: tasks = [], isLoading } = useQuery<BackgroundTask[]>({
    queryKey: ['background-tasks'],
    queryFn: settingsApi.getTasks,
    refetchInterval: 2500,
  });

  const launchSimMutation = useMutation({
    mutationFn: (count: number) => settingsApi.triggerMonteCarloTask(count),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['background-tasks'] });
      setFeedback(`Monte Carlo task queued (${data.task_id.slice(0, 8)}...). Worker running in background.`);
      setTimeout(() => setFeedback(null), 4000);
    },
  });

  const launchEnrichMutation = useMutation({
    mutationFn: () => settingsApi.triggerBulkEnrichmentTask(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['background-tasks'] });
      setFeedback(`Bulk Lead Enrichment task queued (${data.task_id.slice(0, 8)}...).`);
      setTimeout(() => setFeedback(null), 4000);
    },
  });

  const launchAudioMutation = useMutation({
    mutationFn: () =>
      settingsApi.triggerAudioSynthesisTask(
        'call-live-exec-demo',
        'Customer expressed urgent interest in enterprise SOC2 compliance and automated CRM migrations.'
      ),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['background-tasks'] });
      setFeedback(`Audio Synthesis task queued (${data.task_id.slice(0, 8)}...).`);
      setTimeout(() => setFeedback(null), 4000);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (taskId: string) => settingsApi.cancelTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['background-tasks'] });
      setFeedback('Task cancelled.');
      setTimeout(() => setFeedback(null), 3000);
    },
  });

  const clearCompletedMutation = useMutation({
    mutationFn: () => settingsApi.clearCompletedTasks(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['background-tasks'] });
      setFeedback(`Cleared ${data.cleared_tasks_count} completed/failed/cancelled tasks.`);
      setTimeout(() => setFeedback(null), 3000);
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success" className="text-[9px] uppercase">COMPLETED</Badge>;
      case 'running':
        return <Badge variant="purple" className="text-[9px] uppercase animate-pulse">RUNNING</Badge>;
      case 'queued':
        return <Badge variant="warning" className="text-[9px] uppercase">QUEUED</Badge>;
      case 'failed':
        return <Badge variant="danger" className="text-[9px] uppercase">FAILED</Badge>;
      case 'cancelled':
        return <Badge variant="default" className="text-[9px] uppercase">CANCELLED</Badge>;
      default:
        return <Badge variant="default" className="text-[9px] uppercase">{status}</Badge>;
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'monte_carlo_simulation':
        return <Layers className="w-3.5 h-3.5 text-cyan-400" />;
      case 'bulk_lead_enrichment':
        return <Sparkles className="w-3.5 h-3.5 text-[#FFB800]" />;
      case 'voice_call_audio_synthesis':
        return <Mic className="w-3.5 h-3.5 text-[#FFB800]" />;
      default:
        return <Cpu className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const typeStr = t.task_type || t.task_name || '';
      const idStr = t.task_id || '';
      const errStr = t.error || '';
      const matchSearch =
        !taskSearch ||
        typeStr.toLowerCase().includes(taskSearch.toLowerCase()) ||
        idStr.toLowerCase().includes(taskSearch.toLowerCase()) ||
        errStr.toLowerCase().includes(taskSearch.toLowerCase());
      const matchStatus = taskStatusFilter === 'all' || t.status === taskStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [tasks, taskSearch, taskStatusFilter]);

  const totalPages = Math.ceil(filteredTasks.length / pageSize) || 1;
  const paginatedTasks = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredTasks.slice(start, start + pageSize);
  }, [filteredTasks, page, pageSize]);

  return (
    <div className="space-y-4 font-mono">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-none bg-[#1F2833] border border-[#3A4552]">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#FFB800]" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">ASYNC TASK QUEUE &amp; WORKER MONITOR</h2>
            <Badge variant="purple" className="text-[9px] uppercase font-mono">
              WORKER.PY ACTIVE
            </Badge>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5 uppercase">
            RESILIENT DISTRIBUTED WORKER PROCESS RUNNING SIMULATIONS, EMAIL DELIVERY, AND ENRICHMENTS.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => clearCompletedMutation.mutate()}
            disabled={clearCompletedMutation.isPending || tasks.length === 0}
            className="text-xs h-7 uppercase"
          >
            <Trash2 className="w-3 h-3 mr-1 text-slate-400" />
            <span>PURGE LOGS</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['background-tasks'] })}
            className="text-xs h-7 uppercase"
          >
            <RefreshCw className="w-3 h-3 mr-1 text-[#FFB800]" />
            <span>REFRESH</span>
          </Button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-[#0B0C10] border border-[#FFB800] text-[#FFB800] text-xs flex items-center gap-2 uppercase animate-in fade-in font-mono">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Trigger Quick-Action Launchpad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="p-4 bg-[#1F2833] border-[#3A4552] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-400" />
              MONTE CARLO SIMULATION
            </span>
          </div>
          <p className="text-[10px] text-slate-400 uppercase leading-relaxed">
            DISPATCH COMPLEX STOCHASTIC SIMULATION RUNS OVER THE PIPELINE TO WORKER.PY.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={100}
              max={10000}
              step={100}
              value={simCount}
              onChange={(e) => setSimCount(Number(e.target.value))}
              className="w-20 bg-[#0B0C10] border border-[#3A4552] rounded-none px-2 py-1 text-xs text-white font-mono"
            />
            <Button
              size="sm"
              variant="primary"
              onClick={() => launchSimMutation.mutate(simCount)}
              disabled={launchSimMutation.isPending}
              className="flex-1 text-xs uppercase h-7"
            >
              <Play className="w-3 h-3 mr-1 text-[#0B0C10]" />
              <span>LAUNCH SIM</span>
            </Button>
          </div>
        </Card>

        <Card className="p-4 bg-[#1F2833] border-[#3A4552] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#FFB800]" />
              BULK LEAD ENRICHMENT
            </span>
          </div>
          <p className="text-[10px] text-slate-400 uppercase leading-relaxed">
            BATCH QUALIFY &amp; ENRICH UNTOUCHED INBOUND PROSPECTS WITH LLM SCORING.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => launchEnrichMutation.mutate()}
            disabled={launchEnrichMutation.isPending}
            className="w-full text-xs uppercase h-7"
          >
            <Play className="w-3 h-3 mr-1 text-[#FFB800]" />
            <span>TRIGGER ENRICHMENT</span>
          </Button>
        </Card>

        <Card className="p-4 bg-[#1F2833] border-[#3A4552] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-[#FFB800]" />
              AUDIO CALL SYNTHESIS
            </span>
          </div>
          <p className="text-[10px] text-slate-400 uppercase leading-relaxed">
            GENERATE FULL POST-CALL CRM NOTES, ACTION ITEMS, AND SENTIMENT RADAR.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => launchAudioMutation.mutate()}
            disabled={launchAudioMutation.isPending}
            className="w-full text-xs uppercase h-7"
          >
            <Play className="w-3 h-3 mr-1 text-[#FFB800]" />
            <span>SYNTHESIZE CALL</span>
          </Button>
        </Card>
      </div>

      {/* Task Queue Table Container */}
      <Card className="bg-[#1F2833] border-[#3A4552] overflow-hidden">
        {/* Search and Filters Bar */}
        <div className="p-3 bg-[#0B0C10] border-b border-[#3A4552] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="SEARCH TASK ID OR TYPE..."
              value={taskSearch}
              onChange={(e) => {
                setTaskSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#1F2833] border border-[#3A4552] rounded-none pl-8 pr-3 py-1 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#FFB800] uppercase font-mono"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={taskStatusFilter}
              onChange={(e) => {
                setTaskStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-[#1F2833] border border-[#3A4552] text-xs text-slate-200 rounded-none px-2 py-1 focus:outline-none focus:border-[#FFB800] uppercase font-mono"
            >
              <option value="all">ALL STATUSES</option>
              <option value="completed">COMPLETED</option>
              <option value="running">RUNNING</option>
              <option value="queued">QUEUED</option>
              <option value="failed">FAILED</option>
              <option value="cancelled">CANCELLED</option>
            </select>

            {(taskSearch || taskStatusFilter !== 'all') && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setTaskSearch('');
                  setTaskStatusFilter('all');
                  setPage(1);
                }}
                className="text-xs h-7 px-2 text-slate-400 hover:text-white uppercase"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                RESET
              </Button>
            )}
          </div>
        </div>

        {/* Task List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono">
            <thead>
              <tr className="border-b border-[#3A4552] bg-[#0B0C10] text-[10px] uppercase font-bold text-slate-400">
                <th className="py-2.5 px-3">TASK ID / TYPE</th>
                <th className="py-2.5 px-3">STATUS</th>
                <th className="py-2.5 px-3">PROGRESS</th>
                <th className="py-2.5 px-3">TIMING</th>
                <th className="py-2.5 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3A4552] text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500">
                    <LoadingSpinner size="sm" />
                  </td>
                </tr>
              ) : paginatedTasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 uppercase">
                    NO BACKGROUND TASKS MATCHING FILTER.
                  </td>
                </tr>
              ) : (
                paginatedTasks.map((task) => {
                  const taskType = task.task_type || task.task_name || 'background_task';
                  return (
                    <tr key={task.task_id} className="hover:bg-[#0B0C10] transition-none">
                      <td className="py-2.5 px-3 space-y-0.5">
                        <div className="flex items-center gap-1.5 font-bold text-white uppercase text-[11px]">
                          {getTaskIcon(taskType)}
                          <span>{taskType.replace(/_/g, ' ')}</span>
                        </div>
                        <span className="text-[9px] text-slate-500 font-mono block">
                          ID: {task.task_id}
                        </span>
                      </td>

                      <td className="py-2.5 px-3">{getStatusBadge(task.status)}</td>

                      <td className="py-2.5 px-3 space-y-1">
                        <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono uppercase">
                          <span>{task.progress}%</span>
                        </div>
                        <div className="w-32 h-1 bg-[#0B0C10] border border-[#3A4552] rounded-none overflow-hidden">
                          <div
                            className="h-full bg-[#FFB800] transition-none"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </td>

                      <td className="py-2.5 px-3 space-y-0.5 text-[10px] text-slate-400 uppercase">
                        <div>QUEUED: {new Date(task.created_at).toLocaleTimeString()}</div>
                        {task.completed_at && (
                          <div className="text-slate-500">
                            DONE: {new Date(task.completed_at).toLocaleTimeString()}
                          </div>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        {task.status === 'running' || task.status === 'pending' ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => cancelMutation.mutate(task.task_id)}
                            className="h-6 px-2 text-slate-400 hover:text-[#FF2A54] text-[10px] uppercase"
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            CANCEL
                          </Button>
                        ) : (
                          <span className="text-[10px] text-slate-500 uppercase">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <TablePagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={filteredTasks.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
        />
      </Card>
    </div>
  );
}
