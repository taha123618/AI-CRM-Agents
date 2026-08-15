import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/features/multi-language';
import { CustomAgent, ExecutionResult } from '../types/customAgent.types';
import { useExecuteCustomAgent } from '../hooks/useCustomAgents';
import {
  Play,
  Sparkles,
  Terminal,
  Clock,
  Cpu,
  CheckCircle2,
  Wrench,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  agent: CustomAgent | null;
}

const DEFAULT_SAMPLE_PAYLOAD = {
  lead: {
    name: 'Sarah Connor',
    email: 'sarah.connor@cyberdyne.org',
    score: 88,
  },
  deal: {
    name: 'Cyberdyne Systems AI Expansion',
    value: 120000,
    stage: 'proposal',
  },
  customer: {
    name: 'Cyberdyne Enterprise',
    mrr: 10000,
    plan: 'Enterprise Tier-1',
  },
  message: 'Prospect requested custom SOC2 Type II compliance audit and liability cap adjustments.',
};

export function AgentSandboxDrawer({ isOpen, onClose, agent }: Props) {
  const { t } = useTranslation();
  const [payloadText, setPayloadText] = useState(JSON.stringify(DEFAULT_SAMPLE_PAYLOAD, null, 2));
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [showPromptPreview, setShowPromptPreview] = useState(false);
  const executeMutation = useExecuteCustomAgent();

  if (!agent) return null;

  const handleRunTest = async () => {
    let parsedPayload = {};
    try {
      parsedPayload = JSON.parse(payloadText);
    } catch {
      alert('Invalid JSON input payload.');
      return;
    }

    try {
      const res = await executeMutation.mutateAsync({
        id: agent.id,
        input_payload: parsedPayload,
        trigger_event: 'sandbox_test_run',
      });
      setExecutionResult(res);
    } catch (err: any) {
      alert(err?.response?.data?.detail || err.message || 'Execution failed');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${t('custom_agents.sandbox_title') || 'Live Sandbox'} — ${agent.name}`}
      description={t('custom_agents.sandbox_desc') || 'Test dynamic prompt rendering, contextual variable substitution, and tool capability execution in real-time.'}
      className="max-w-4xl"
    >
      <div className="space-y-4 min-w-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Column: Input Payload & Configuration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-brand-400" />
                <span>{t('custom_agents.test_context') || 'Test Context Payload (JSON)'}</span>
              </label>
              <Button
                variant="ghost"
                size="sm"
                className="text-[11px] h-6 px-2 text-slate-400 hover:text-white"
                onClick={() => setPayloadText(JSON.stringify(DEFAULT_SAMPLE_PAYLOAD, null, 2))}
              >
                {t('custom_agents.reset_sample') || 'Reset Sample'}
              </Button>
            </div>

            <textarea
              rows={12}
              value={payloadText}
              onChange={(e) => setPayloadText(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-300 focus:outline-none focus:border-brand-500 resize-none"
            />

            {/* Prompt View Toggle */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <button
                type="button"
                onClick={() => setShowPromptPreview(!showPromptPreview)}
                className="w-full flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                <span>{t('custom_agents.system_prompt') || 'Configured System Prompt'}</span>
                {showPromptPreview ? (
                  <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                )}
              </button>
              {showPromptPreview && (
                <p className="text-[11px] font-mono text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800 whitespace-pre-wrap leading-relaxed">
                  {agent.system_prompt}
                </p>
              )}
            </div>

            <Button
              variant="primary"
              className="w-full justify-center"
              onClick={handleRunTest}
              isLoading={executeMutation.isPending}
            >
              <Play className="w-4 h-4 mr-1.5 fill-current" />
              {t('custom_agents.execute_test') || 'Execute Live Sandbox Test'}
            </Button>
          </div>

          {/* Right Column: Execution Output & Reasoning Trace */}
          <div className="space-y-3 min-w-0">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>{t('custom_agents.agent_reasoning') || 'Agent Reasoning & Output'}</span>
              </label>
              {executionResult && (
                <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Clock className="w-3 h-3" />
                    {executionResult.duration_ms}ms
                  </span>
                  <span className="flex items-center gap-1 text-brand-400">
                    <Cpu className="w-3 h-3" />
                    ~{executionResult.tokens_used} tokens
                  </span>
                </div>
              )}
            </div>

            <div className="h-[340px] overflow-y-auto rounded-xl bg-slate-900/90 border border-slate-800 p-3 space-y-3 font-mono text-xs">
              {executeMutation.isPending ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
                  <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs">Agent is reasoning & invoking tools...</span>
                </div>
              ) : executionResult ? (
                <div className="space-y-3 animate-in fade-in">
                  {/* Thought Steps */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">
                      {t('custom_agents.execution_trace') || 'Execution Trace'}
                    </span>
                    {(executionResult.thought_trace || []).map((step, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] space-y-1"
                      >
                        <div className="flex items-center justify-between text-slate-500 text-[10px]">
                          <span className="font-bold text-brand-400">{step.step}</span>
                          <span>{step.timestamp}</span>
                        </div>
                        <p className="text-slate-300 font-sans leading-relaxed">{step.content}</p>
                      </div>
                    ))}
                  </div>

                  {/* Tool Invocations */}
                  {executionResult.tool_calls && executionResult.tool_calls.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">
                        {t('custom_agents.tool_invocations') || 'Tool Invocations'} ({executionResult.tool_calls.length})
                      </span>
                      {executionResult.tool_calls.map((tc, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-[11px] space-y-1"
                        >
                          <div className="flex items-center justify-between text-emerald-400 text-[10px]">
                            <span className="font-bold flex items-center gap-1">
                              <Wrench className="w-3 h-3" />
                              {tc.tool}
                            </span>
                            <span>{tc.timestamp}</span>
                          </div>
                          <pre className="text-[10px] text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                            {JSON.stringify(tc.result, null, 2)}
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Output Recommendation */}
                  <div className="p-3 rounded-lg bg-brand-500/10 border border-brand-500/30 text-white space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-brand-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t('custom_agents.synthesized_output') || 'Synthesized Output'}</span>
                    </div>
                    <p className="text-xs font-sans text-slate-200 leading-relaxed">
                      {executionResult.response}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
                  <Terminal className="w-8 h-8 opacity-40" />
                  <p className="text-center text-xs">
                    Click <strong>Execute Live Sandbox Test</strong> to evaluate prompt rendering and tool responses.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <Button variant="ghost" size="sm" onClick={onClose}>
            {t('custom_agents.close_sandbox') || 'Close Sandbox'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
