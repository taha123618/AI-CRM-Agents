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
        return <Badge variant="success">Completed</Badge>;
      case 'running':
        return <Badge variant="warning">Running</Badge>;
      case 'failed':
        return <Badge variant="danger">Failed</Badge>;
      case 'cancelled':
        return <Badge variant="purple">Cancelled</Badge>;
      default:
        return <Badge variant="default">Pending</Badge>;
    }
  };

  const runningCount = tasks.filter((t) => t.status === 'running').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  // Filtered & Paginated Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const typeStr = t.task_type || t.task_name || '';
      const matchesSearch =
        !taskSearch.trim() ||
        t.task_id.toLowerCase().includes(taskSearch.toLowerCase()) ||
        typeStr.toLowerCase().includes(taskSearch.toLowerCase()) ||
        (t.error && t.error.toLowerCase().includes(taskSearch.toLowerCase()));

      const matchesStatus = taskStatusFilter === 'all' || t.status === taskStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tasks, taskSearch, taskStatusFilter]);

  const totalPages = Math.ceil(filteredTasks.length / pageSize) || 1;
  const paginatedTasks = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredTasks.slice(start, start + pageSize);
  }, [filteredTasks, page, pageSize]);

  const hasActiveFilters = taskSearch !== '' || taskStatusFilter !== 'all';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-brand-400" />
            Persistent Background Task Queue & Worker Telemetry
          </h2>
          <p className="text-sm text-slate-400">
            Monitor asynchronous Redis-backed background workers handling Monte Carlo simulations, bulk enrichments, and audio synthesis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => clearCompletedMutation.mutate()}
            disabled={clearCompletedMutation.isPending}
            className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Prune Finished
          </Button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          {feedback}
        </div>
      )}

      {/* Task Queue Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card border border-slate-800/80 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">Total Jobs Enqueued</span>
            <Layers className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{tasks.length}</div>
          <div className="text-xs text-slate-500 mt-1">Managed across Redis & memory buffer</div>
        </Card>

        <Card className="glass-card border border-slate-800/80 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">Active Workers</span>
            <RefreshCw className={`w-4 h-4 text-amber-400 ${runningCount > 0 ? 'animate-spin' : ''}`} />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-2">{runningCount}</div>
          <div className="text-xs text-slate-500 mt-1">Executing in background processes</div>
        </Card>

        <Card className="glass-card border border-slate-800/80 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">Completed Jobs</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">{completedCount}</div>
          <div className="text-xs text-slate-500 mt-1">Successfully finished execution</div>
        </Card>
      </div>

      {/* Quick Launch Task Triggers */}
      <Card className="glass-card border border-slate-800/80 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Play className="w-4 h-4 text-brand-400" />
          Launch Heavy Async Background Jobs
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Monte Carlo Card */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">Monte Carlo Simulation</span>
              <Cpu className="w-4 h-4 text-brand-400" />
            </div>
            <p className="text-xs text-slate-400">
              Run stochastic revenue distribution model with 200–1,000 statistical iterations.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <select
                value={simCount}
                onChange={(e) => setSimCount(Number(e.target.value))}
                className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-2 py-1.5 flex-1 focus:outline-none"
              >
                <option value={200}>200 Iterations</option>
                <option value={500}>500 Iterations</option>
                <option value={1000}>1,000 Iterations</option>
              </select>
              <Button
                size="sm"
                onClick={() => launchSimMutation.mutate(simCount)}
                disabled={launchSimMutation.isPending}
                className="text-xs bg-orange-600 hover:bg-orange-500 text-white"
              >
                Enqueue
              </Button>
            </div>
          </div>

          {/* Lead Enrichment Card */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">Bulk Lead OSINT Enrichment</span>
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-xs text-slate-400">
              Query external sources (Clearbit, LinkedIn, Hunter) asynchronously for all leads.
            </p>
            <div className="pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => launchEnrichMutation.mutate()}
                disabled={launchEnrichMutation.isPending}
                className="w-full text-xs border-purple-500/40 text-purple-300 hover:bg-purple-950/40"
              >
                Launch Enrichment
              </Button>
            </div>
          </div>

          {/* Audio Synthesis Card */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">Audio Intelligence Synthesis</span>
              <Mic className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xs text-slate-400">
              Process long-form audio transcripts into structured CRM action items and intent scores.
            </p>
            <div className="pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => launchAudioMutation.mutate()}
                disabled={launchAudioMutation.isPending}
                className="w-full text-xs border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/40"
              >
                Synthesize Audio Call
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Task Queue Table */}
      <Card className="glass-card border border-slate-800/80 overflow-hidden">
        {/* Table Filters */}
        <div className="p-4 border-b border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/40">
          <div>
            <h3 className="text-sm font-semibold text-white">Job Execution Queue & State</h3>
            <span className="text-[11px] text-slate-400">Auto-refreshing every 2.5s</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-52">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={taskSearch}
                onChange={(e) => {
                  setTaskSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search task ID or type..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={taskStatusFilter}
                onChange={(e) => {
                  setTaskStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="running">Running</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {hasActiveFilters && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setTaskSearch('');
                  setTaskStatusFilter('all');
                  setPage(1);
                }}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </Button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/60 text-slate-400 text-xs uppercase font-semibold border-b border-slate-800/80">
              <tr>
                <th className="px-6 py-3.5">Task ID</th>
                <th className="px-6 py-3.5">Type</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Progress</th>
                <th className="px-6 py-3.5">Created At</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {paginatedTasks.map((task) => (
                <tr key={task.task_id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-brand-400">
                    {task.task_id.slice(0, 13)}...
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-200">
                    {(task.task_type || task.task_name || 'JOB').replace(/_/g, ' ').toUpperCase()}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(task.status)}</td>
                  <td className="px-6 py-4">
                    <div className="w-32 bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          task.status === 'completed'
                            ? 'bg-emerald-500'
                            : task.status === 'failed'
                            ? 'bg-rose-500'
                            : task.status === 'cancelled'
                            ? 'bg-purple-500'
                            : 'bg-brand-500'
                        }`}
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    {new Date(task.created_at).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {(task.status === 'pending' || task.status === 'running') && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => cancelMutation.mutate(task.task_id)}
                        disabled={cancelMutation.isPending}
                        className="text-xs text-rose-400 hover:bg-rose-950/40 flex items-center gap-1"
                      >
                        <XCircle className="w-3 h-3" />
                        Cancel
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {paginatedTasks.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    {hasActiveFilters
                      ? 'No tasks match the filter criteria.'
                      : 'No background tasks registered yet. Launch a job above to test the queue.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Task Queue Pagination */}
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
          pageSizeOptions={[5, 10, 25, 50]}
        />
      </Card>
    </div>
  );
}
