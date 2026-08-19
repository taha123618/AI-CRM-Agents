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
    <div className="fixed inset-0 z-50 bg-background/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto font-mono">
      <div className="w-full max-w-5xl bg-card border border-border rounded-none shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-card">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">LLM PROMPT EVALUATION &amp; BENCHMARKING STUDIO</h2>
              <Badge variant="purple" className="text-[9px] uppercase font-mono">
                A/B BENCHMARK
              </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5 uppercase">
              TESTING CANDIDATE INSTRUCTIONS AGAINST {agentName.toUpperCase()} BENCHMARK TEST SUITES.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-none text-muted-foreground hover:text-white hover:bg-background transition-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 font-mono">
          {error && (
            <div className="p-3 rounded-none bg-background border border-destructive text-xs text-destructive font-mono uppercase">
              {error}
            </div>
          )}

          {/* Side-by-Side Prompt Editors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Variant A */}
            <div className="p-3.5 rounded-none bg-background border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  VARIANT A (BASELINE PROMPT)
                </span>
                <span className="text-[10px] text-muted-foreground/60 font-mono">Control</span>
              </div>
              <textarea
                rows={6}
                value={promptA}
                onChange={(e) => setPromptA(e.target.value)}
                className="w-full rounded-none bg-card border border-border p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary font-mono"
                placeholder="Baseline system prompt..."
              />
            </div>

            {/* Variant B */}
            <div className="p-3.5 rounded-none bg-background border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                  VARIANT B (CANDIDATE REFINEMENT)
                </span>
                <span className="text-[10px] text-muted-foreground/60 font-mono">Challenger</span>
              </div>
              <textarea
                rows={6}
                value={promptB}
                onChange={(e) => setPromptB(e.target.value)}
                className="w-full rounded-none bg-card border border-border p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary font-mono"
                placeholder="Candidate system prompt..."
              />
            </div>
          </div>

          {/* Action Trigger */}
          <div className="flex items-center justify-between p-3 rounded-none bg-background border border-border">
            <div className="text-[10px] text-muted-foreground uppercase font-mono">
              EVALUATES AGENT OUTPUT ACCURACY, SCHEMA COMPLIANCE, AND LATENCY OVER {datasetSize} TEST CASES
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleRun}
              disabled={isRunning}
              className="text-xs uppercase"
            >
              {isRunning ? <LoadingSpinner size="sm" /> : <Play className="w-3.5 h-3.5 mr-1" />}
              <span>{isRunning ? 'EVALUATING...' : 'RUN BENCHMARK'}</span>
            </Button>
          </div>

          {/* Results Display */}
          {benchmarkData && (
            <div className="space-y-3 pt-2 font-mono">
              {/* Winner Banner */}
              <div className="p-3 rounded-none bg-background border border-primary flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-none bg-card text-primary border border-border">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase">
                      RECOMMENDED WINNER: {benchmarkData.winner === 'variant_b' ? 'VARIANT B (CHALLENGER)' : 'VARIANT A (BASELINE)'}
                    </h3>
                    <p className="text-[10px] text-muted-foreground uppercase mt-0.5">
                      {benchmarkData.rationale}
                    </p>
                  </div>
                </div>

                {onApplyWinner && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      onApplyWinner(benchmarkData.winner === 'variant_b' ? promptB : promptA);
                      onClose();
                    }}
                    className="text-xs uppercase shrink-0"
                  >
                    <span>APPLY WINNING PROMPT</span>
                  </Button>
                )}
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Variant A Score Card */}
                <div className="p-3.5 rounded-none bg-background border border-border space-y-2">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span className="text-xs font-bold text-cyan-400 uppercase">VARIANT A SCORECARD</span>
                    <Badge variant="default" className="text-[9px] uppercase font-mono">
                      {metricsA?.composite_score ?? 0}% COMPOSITE
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px] uppercase font-mono">
                    <div className="p-2 rounded-none bg-card border border-border">
                      <span className="text-muted-foreground/60 block">SCHEMA COMPLIANCE</span>
                      <span className="text-xs font-bold text-white">{metricsA?.schema_compliance ?? 0}%</span>
                    </div>
                    <div className="p-2 rounded-none bg-card border border-border">
                      <span className="text-muted-foreground/60 block">AVG LATENCY</span>
                      <span className="text-xs font-bold text-white">{metricsA?.avg_latency_ms ?? 0}MS</span>
                    </div>
                    <div className="p-2 rounded-none bg-card border border-border">
                      <span className="text-muted-foreground/60 block">QUALITY RATING</span>
                      <span className="text-xs font-bold text-primary">{metricsA?.quality_score ?? 0}%</span>
                    </div>
                  </div>
                </div>

                {/* Variant B Score Card */}
                <div className="p-3.5 rounded-none bg-background border border-border space-y-2">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span className="text-xs font-bold text-purple-400 uppercase">VARIANT B SCORECARD</span>
                    <Badge variant="purple" className="text-[9px] uppercase font-mono">
                      {metricsB?.composite_score ?? 0}% COMPOSITE
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px] uppercase font-mono">
                    <div className="p-2 rounded-none bg-card border border-border">
                      <span className="text-muted-foreground/60 block">SCHEMA COMPLIANCE</span>
                      <span className="text-xs font-bold text-white">{metricsB?.schema_compliance ?? 0}%</span>
                    </div>
                    <div className="p-2 rounded-none bg-card border border-border">
                      <span className="text-muted-foreground/60 block">AVG LATENCY</span>
                      <span className="text-xs font-bold text-white">{metricsB?.avg_latency_ms ?? 0}MS</span>
                    </div>
                    <div className="p-2 rounded-none bg-card border border-border">
                      <span className="text-muted-foreground/60 block">QUALITY RATING</span>
                      <span className="text-xs font-bold text-primary">{metricsB?.quality_score ?? 0}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
