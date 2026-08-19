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
      title={`${t('custom_agents.sandbox_title') || 'LIVE SANDBOX'} — ${agent.name.toUpperCase()}`}
      description={t('custom_agents.sandbox_desc') || 'TEST DYNAMIC PROMPT RENDERING, CONTEXTUAL VARIABLE SUBSTITUTION, AND TOOL CAPABILITY EXECUTION IN REAL-TIME.'}
      className="max-w-4xl font-mono"
    >
      <div className="space-y-4 font-mono">
        {/* Top Info Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-none bg-[#0B0C10] border border-[#3A4552] text-xs">
          <div>
            <span className="text-[9px] text-slate-500 uppercase font-bold block">MODEL ENGINE</span>
            <span className="font-bold text-white uppercase">{agent.model_name || 'smart-fallback'}</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 uppercase font-bold block">TEMPERATURE</span>
            <span className="font-bold text-[#FFB800]">{agent.temperature ?? 0.3}</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 uppercase font-bold block">TRIGGER TYPE</span>
            <span className="font-bold text-cyan-400 uppercase">{agent.trigger_type}</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 uppercase font-bold block">TOOLS ENABLED</span>
            <span className="font-bold text-purple-400 uppercase">{agent.tools_enabled?.length || 0} ACTIVE</span>
          </div>
        </div>

        {/* Prompt Inspection Toggle */}
        <div className="rounded-none bg-[#0B0C10] border border-[#3A4552] overflow-hidden">
          <button
            type="button"
            onClick={() => setShowPromptPreview(!showPromptPreview)}
            className="w-full flex items-center justify-between p-3 text-xs font-bold text-slate-300 hover:text-white uppercase"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#FFB800]" />
              <span>INSPECT BASE SYSTEM PROMPT</span>
            </div>
            {showPromptPreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showPromptPreview && (
            <div className="p-3 border-t border-[#3A4552] bg-[#121212] text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
              {agent.system_prompt}
            </div>
          )}
        </div>

        {/* Two-Column Testing Sandbox */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Input Payload Console */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-300 uppercase flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                INPUT TEST PAYLOAD (JSON)
              </label>
              <button
                type="button"
                onClick={() => setPayloadText(JSON.stringify(DEFAULT_SAMPLE_PAYLOAD, null, 2))}
                className="text-[9px] text-slate-400 hover:text-[#FFB800] uppercase font-bold"
              >
                RESET PAYLOAD
              </button>
            </div>
            <textarea
              rows={12}
              value={payloadText}
              onChange={(e) => setPayloadText(e.target.value)}
              className="w-full bg-[#0B0C10] border border-[#3A4552] rounded-none p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-[#FFB800] leading-relaxed"
            />
          </div>

          {/* Execution Output Console */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-300 uppercase flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#FFB800]" />
              OUTPUT TELEMETRY &amp; SYNTHESIS
            </label>

            {executionResult ? (
              <div className="bg-[#0B0C10] border border-[#FFB800] rounded-none p-3 space-y-3 h-[278px] overflow-y-auto font-mono text-xs">
                {/* Result header telemetry */}
                <div className="flex items-center justify-between border-b border-[#3A4552] pb-2 text-[10px] uppercase">
                  <div className="flex items-center gap-1.5 text-[#FFB800] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>STATUS: {executionResult.status}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {executionResult.duration_ms}MS
                    </span>
                    <span className="flex items-center gap-1">
                      <Cpu className="w-3 h-3" />
                      {executionResult.tokens_used} TOKENS
                    </span>
                  </div>
                </div>

                {/* Recommendation summary */}
                {(executionResult.response || executionResult.output?.recommendation) && (
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-500 uppercase font-bold block">AGENT SYNTHESIS</span>
                    <p className="text-slate-200 uppercase leading-relaxed">
                      {executionResult.response || executionResult.output?.recommendation}
                    </p>
                  </div>
                )}

                {/* Raw JSON Payload */}
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">STRUCTURED DATA</span>
                  <pre className="p-2 bg-[#121212] border border-[#3A4552] rounded-none text-[10px] text-slate-300 overflow-x-auto">
                    {JSON.stringify(executionResult.output, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="bg-[#0B0C10] border border-[#3A4552] rounded-none p-8 h-[278px] flex flex-col items-center justify-center text-center text-slate-500 space-y-2 uppercase">
                <Play className="w-8 h-8 opacity-30 text-[#FFB800]" />
                <p className="text-xs">CLICK 'RUN TEST' TO TRIGGER AGENT INFERENCE</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-[#3A4552]">
          <span className="text-[10px] text-slate-500 uppercase font-mono">
            USES SMARTFALLBACK ENGINE WITH ZERO LATENCY SPIKES
          </span>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs uppercase">
              {t('common.cancel') || 'CLOSE'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleRunTest}
              isLoading={executeMutation.isPending}
              className="text-xs uppercase"
            >
              <Play className="w-3.5 h-3.5 mr-1" />
              <span>RUN INFERENCE TEST</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
