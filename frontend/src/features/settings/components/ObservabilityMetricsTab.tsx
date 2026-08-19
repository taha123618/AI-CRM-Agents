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
    <div className="space-y-4 font-mono">
      {/* Header & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-none bg-[#121212] border border-[#3A4552]">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#FFB800]" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">PROMETHEUS &amp; OPENTELEMETRY OBSERVABILITY</h2>
            <Badge variant="success" className="text-[9px] uppercase font-mono">
              LIVE 10S SCRAPE
            </Badge>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5 uppercase">
            TRACK AGENT EXECUTION LATENCY, TOKEN CONSUMPTION, TASK QUEUE STATUS, AND API THROUGHPUT.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="text-xs h-7 uppercase flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3 h-3 ${isRefetching ? 'animate-spin text-[#FFB800]' : ''}`} />
            <span>REFRESH</span>
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={handleCopy}
            disabled={!metricsText}
            className="text-xs h-7 uppercase flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3 h-3 text-[#0B0C10]" /> : <Copy className="w-3 h-3 text-[#0B0C10]" />}
            <span>{copied ? 'COPIED!' : 'COPY EXPOSITION'}</span>
          </Button>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-none bg-[#121212] border border-[#3A4552] space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase">ACTIVE WEBSOCKETS</span>
            <Network className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <p className="text-xl font-bold text-white font-mono">{wsActive}</p>
          <span className="text-[9px] text-[#FFB800] uppercase">REAL-TIME BROADCAST CHANNELS</span>
        </div>

        <div className="p-3.5 rounded-none bg-[#121212] border border-[#3A4552] space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase">TOTAL API CALLS</span>
            <Database className="w-3.5 h-3.5 text-[#FFB800]" />
          </div>
          <p className="text-xl font-bold text-white font-mono">{totalApiRequests}</p>
          <span className="text-[9px] text-slate-400 uppercase">SERVER-SIDE TELEMETRY</span>
        </div>

        <div className="p-3.5 rounded-none bg-[#121212] border border-[#3A4552] space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase">AGENT EXECUTIONS</span>
            <Cpu className="w-3.5 h-3.5 text-[#FFB800]" />
          </div>
          <p className="text-xl font-bold text-white font-mono">{agentExecs}</p>
          <span className="text-[9px] text-[#FFB800] uppercase">AUTONOMOUS ORCHESTRATIONS</span>
        </div>

        <div className="p-3.5 rounded-none bg-[#121212] border border-[#3A4552] space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase">TASK QUEUE JOBS</span>
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <p className="text-xl font-bold text-white font-mono">{taskJobs}</p>
          <span className="text-[9px] text-slate-400 uppercase">REDIS QUEUE PROCESSED</span>
        </div>
      </div>

      {/* Terminal View */}
      <div className="rounded-none bg-[#0B0C10] border border-[#3A4552] overflow-hidden">
        <div className="p-3 bg-[#121212] border-b border-[#3A4552] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-[#FFB800]" />
            <span className="text-xs font-bold text-white uppercase">/API/METRICS EXPOSITION STREAM</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="FILTER METRIC LABELS..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="bg-[#0B0C10] border border-[#3A4552] rounded-none px-2.5 py-1 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-[#FFB800] uppercase font-mono w-56"
            />
            {filterText && (
              <Button size="sm" variant="ghost" onClick={() => setFilterText('')} className="text-xs h-7 px-2 uppercase">
                CLEAR
              </Button>
            )}
          </div>
        </div>

        <div className="p-4 max-h-[480px] overflow-y-auto font-mono text-[11px] leading-relaxed text-slate-300 select-text">
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : filteredLines.length === 0 ? (
            <div className="text-center py-12 text-slate-600 uppercase">NO METRICS MATCHING '{filterText}'</div>
          ) : (
            filteredLines.map((line, idx) => {
              if (line.startsWith('# HELP')) {
                return (
                  <div key={idx} className="text-slate-500 font-semibold mt-2">
                    {line}
                  </div>
                );
              }
              if (line.startsWith('# TYPE')) {
                return (
                  <div key={idx} className="text-[#FFB800] mb-0.5">
                    {line}
                  </div>
                );
              }
              if (!line.trim()) {
                return <div key={idx} className="h-2" />;
              }

              // Highlight metric name and values
              const parts = line.split(' ');
              const metricName = parts[0];
              const value = parts.slice(1).join(' ');

              return (
                <div key={idx} className="flex items-baseline justify-between hover:bg-[#121212] px-1 py-0.5 transition-none">
                  <span className="text-cyan-400">{metricName}</span>
                  <span className="text-[#FFB800] font-bold">{value}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
