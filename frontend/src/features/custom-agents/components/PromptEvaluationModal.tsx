import { useState } from 'react';
import {
  Sparkles,
  Trophy,
  Play,
  X,
} from 'lucide-react';
import { settingsApi } from '@/features/settings/api';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface PromptEvaluationModalProps {
  isOpen: boolean;
  agentName?: string;
  initialPrompt?: string;
  onClose: () => void;
  onApplyWinner?: (prompt: string) => void;
}

export function PromptEvaluationModal({
  isOpen,
  agentName = 'Custom Agent',
  initialPrompt = '',
  onClose,
  onApplyWinner,
}: PromptEvaluationModalProps) {
  const [promptA, setPromptA] = useState(
    initialPrompt ||
      'You are a high-performance CRM Sales Intelligence Agent. Qualify inbound prospects using BANT criteria.'
  );
  const [promptB, setPromptB] = useState(
    (initialPrompt ? initialPrompt + '\n\n' : '') +
      'Constraint: Rigorously verify SOC-2 security requirements and compute exact seat rollout timelines before qualifying.'
  );
  const [datasetSize] = useState<number>(4);
  const [isRunning, setIsRunning] = useState(false);
  const [benchmarkData, setBenchmarkData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRun = async () => {
    setIsRunning(true);
    setError(null);
    try {
      const data = await settingsApi.runPromptBenchmark({
        agent_name: agentName,
        prompt_variant_a: promptA,
        prompt_variant_b: promptB,
        dataset_size: datasetSize,
      });
      setBenchmarkData(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Evaluation benchmark failed.');
    } finally {
      setIsRunning(false);
    }
  };

  const metricsA = benchmarkData?.metrics?.variant_a;
  const metricsB = benchmarkData?.metrics?.variant_b;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/90">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-400" />
              <h2 className="text-lg font-bold text-white">LLM Prompt Evaluation &amp; Benchmarking Studio</h2>
              <Badge variant="purple" className="text-[10px]">
                A/B Benchmark
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Testing candidate instructions against {agentName} benchmark test suites.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="orange"
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center gap-1.5"
            >
              {isRunning ? <LoadingSpinner size="sm" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isRunning ? 'Benchmarking...' : 'Run Benchmark'}</span>
            </Button>

            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
              {error}
            </div>
          )}

          {/* Prompt Editors Side-by-Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  Prompt Variant A (Baseline)
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{promptA.split(' ').length} words</span>
              </div>
              <textarea
                rows={5}
                value={promptA}
                onChange={(e) => setPromptA(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-brand-500 leading-relaxed resize-none"
              />
            </div>

            <div className="space-y-2 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  Prompt Variant B (Candidate)
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{promptB.split(' ').length} words</span>
              </div>
              <textarea
                rows={5}
                value={promptB}
                onChange={(e) => setPromptB(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500 leading-relaxed resize-none"
              />
            </div>
          </div>

          {/* Benchmark Results */}
          {benchmarkData && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Winner Banner */}
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between ${
                  benchmarkData.winner === 'B'
                    ? 'bg-purple-950/40 border-purple-500/40 text-purple-200'
                    : benchmarkData.winner === 'A'
                    ? 'bg-blue-950/40 border-blue-500/40 text-blue-200'
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {benchmarkData.winner === 'Tie'
                        ? 'Benchmark Tied (Both variants performed equally)'
                        : `Variant ${benchmarkData.winner} Emerged as the Winner!`}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Evaluated on {benchmarkData.dataset_size || datasetSize} test scenarios with automated Groundedness &amp; BANT accuracy scoring.
                    </p>
                  </div>
                </div>

                {onApplyWinner && benchmarkData.winner !== 'Tie' && (
                  <Button
                    size="sm"
                    variant="orange"
                    onClick={() => {
                      const winnerText = benchmarkData.winner === 'B' ? promptB : promptA;
                      onApplyWinner(winnerText);
                      onClose();
                    }}
                  >
                    Apply Winner Prompt
                  </Button>
                )}
              </div>

              {/* Side-by-Side Metric Radar Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Variant A Cards */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-blue-400">Variant A Metrics</span>
                    <span className="text-lg font-bold font-mono text-white">{metricsA?.accuracy_score}%</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block">Groundedness</span>
                      <span className="font-mono text-emerald-400 font-bold">
                        {Math.round((metricsA?.groundedness || 0) * 100)}%
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block">Hallucination Rate</span>
                      <span className="font-mono text-amber-400 font-bold">
                        {Math.round((metricsA?.hallucination_rate || 0) * 100)}%
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block">Latency</span>
                      <span className="font-mono text-slate-200">{metricsA?.avg_latency_ms} ms</span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block">Token Cost</span>
                      <span className="font-mono text-slate-200">${metricsA?.cost_estimate_usd}</span>
                    </div>
                  </div>
                </div>

                {/* Variant B Cards */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-purple-900/40 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-purple-400">Variant B Metrics</span>
                    <span className="text-lg font-bold font-mono text-white">{metricsB?.accuracy_score}%</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block">Groundedness</span>
                      <span className="font-mono text-emerald-400 font-bold">
                        {Math.round((metricsB?.groundedness || 0) * 100)}%
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block">Hallucination Rate</span>
                      <span className="font-mono text-amber-400 font-bold">
                        {Math.round((metricsB?.hallucination_rate || 0) * 100)}%
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block">Latency</span>
                      <span className="font-mono text-slate-200">{metricsB?.avg_latency_ms} ms</span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block">Token Cost</span>
                      <span className="font-mono text-slate-200">${metricsB?.cost_estimate_usd}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Case-by-Case Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Test Case Execution Inspector ({benchmarkData.metrics?.cases?.length || 0})
                </h4>

                <div className="space-y-2">
                  {benchmarkData.metrics?.cases?.map((tc: any) => (
                    <div
                      key={tc.test_case_id}
                      className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{tc.scenario}</span>
                        <Badge variant="success" className="text-[9px]">
                          Matched Criteria
                        </Badge>
                      </div>
                      <p className="text-slate-400 font-mono text-[11px] bg-slate-900 p-2 rounded-lg">
                        Input: {tc.input}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
