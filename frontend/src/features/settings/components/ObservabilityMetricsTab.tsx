import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, RefreshCw, Copy, Check, Terminal, Cpu, Database, Network, ShieldCheck } from 'lucide-react';
import { settingsApi } from '../api';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export function ObservabilityMetricsTab() {
  const [copied, setCopied] = useState(false);
  const [filterText, setFilterText] = useState('');

  const {
    data: metricsText,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['prometheus-metrics'],
    queryFn: settingsApi.getPrometheusMetrics,
    refetchInterval: 10000,
  });

  const handleCopy = () => {
    if (metricsText) {
      navigator.clipboard.writeText(metricsText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Parse key metrics from text for dashboard overview cards
  const parseMetric = (pattern: RegExp, defaultVal = 0): number => {
    if (!metricsText) return defaultVal;
    const match = metricsText.match(pattern);
    return match && match[1] ? parseFloat(match[1]) : defaultVal;
  };

  const wsActive = parseMetric(/crm_websocket_connections_active\s+(\d+)/);
  const totalApiRequests = parseMetric(/crm_api_requests_total\{[^}]*\}\s+(\d+)/);
  const agentExecs = parseMetric(/crm_agent_executions_total\{[^}]*\}\s+(\d+)/);
  const taskJobs = parseMetric(/crm_task_queue_jobs_total\{[^}]*\}\s+(\d+)/);

  const filteredLines = metricsText
    ? metricsText
        .split('\n')
        .filter((line) => !filterText || line.toLowerCase().includes(filterText.toLowerCase()))
    : [];

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-400" />
            <h2 className="text-lg font-bold text-white">Prometheus & OpenTelemetry Observability</h2>
            <Badge variant="success" className="text-[10px]">
              Live 10s Scrape
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Standard Prometheus text exposition format (v0.0.4) tracking agent execution latency, token consumption, task queue status, and API throughput.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin text-brand-400' : ''}`} />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={handleCopy}
            disabled={!metricsText}
            className="flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Metrics'}</span>
          </Button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-mono">Live WebSockets</span>
            <div className="text-xl font-bold text-white font-mono">{wsActive}</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-mono">Agent Runs</span>
            <div className="text-xl font-bold text-white font-mono">{agentExecs}</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-mono">Queue Jobs</span>
            <div className="text-xl font-bold text-white font-mono">{taskJobs}</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-mono">API Requests</span>
            <div className="text-xl font-bold text-white font-mono">{totalApiRequests}</div>
          </div>
        </div>
      </div>

      {/* Raw Prometheus Exporter Viewer */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 bg-slate-900/90 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-brand-400" />
            <span className="text-xs font-semibold text-white font-mono">/api/metrics &amp; /metrics Telemetry</span>
            <Badge variant="purple" className="text-[10px] font-mono">
              text/plain
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Filter metric keys (e.g. crm_agent)..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-950 text-slate-200 border border-slate-800 rounded-lg focus:outline-none focus:border-brand-500 w-56 font-mono"
            />
          </div>
        </div>

        <div className="p-4 max-h-[420px] overflow-y-auto font-mono text-xs text-slate-300 space-y-1 bg-slate-950/80">
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : filteredLines.length > 0 ? (
            filteredLines.map((line, idx) => {
              const isComment = line.startsWith('#');
              const isHelp = line.startsWith('# HELP');
              const isType = line.startsWith('# TYPE');

              return (
                <div
                  key={idx}
                  className={`leading-relaxed whitespace-pre-wrap ${
                    isHelp
                      ? 'text-slate-500'
                      : isType
                      ? 'text-brand-400/80'
                      : isComment
                      ? 'text-slate-600'
                      : 'text-emerald-400'
                  }`}
                >
                  {line}
                </div>
              );
            })
          ) : (
            <div className="text-slate-500 py-8 text-center">No metrics matching &quot;{filterText}&quot;</div>
          )}
        </div>
      </div>
    </div>
  );
}
