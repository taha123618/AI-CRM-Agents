import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useTranslation } from '@/features/multi-language';
import { CustomAgent } from '../types/customAgent.types';
import { useAgentExecutions } from '../hooks/useCustomAgents';
import { History, Clock, Cpu, CheckCircle2, XCircle, Wrench } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  agent: CustomAgent | null;
}

export function AgentExecutionsModal({ isOpen, onClose, agent }: Props) {
  const { t } = useTranslation();
  const { data: executions, isLoading } = useAgentExecutions(agent ? agent.id : null);

  if (!agent) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${t('custom_agents.telemetry_title') || 'Telemetry & Run History'} — ${agent.name}`}
      description={`${t('custom_agents.telemetry_desc') || 'Audit trail of all autonomous runs and sandbox executions'} (${executions?.length || 0} total records)`}
      className="max-w-3xl"
    >
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-12 text-center text-slate-500 text-xs">{t('custom_agents.loading_telemetry') || 'Loading execution logs...'}</div>
        ) : !executions || executions.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <History className="w-8 h-8 mx-auto opacity-40" />
            <p className="text-xs">{t('custom_agents.no_telemetry') || 'No execution telemetry recorded yet for this agent.'}</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {executions.map((exec) => (
              <div
                key={exec.id}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {exec.status === 'success' ? (
                      <Badge variant="success" className="gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {t('custom_agents.success') || 'Success'}
                      </Badge>
                    ) : (
                      <Badge variant="danger" className="gap-1">
                        <XCircle className="w-3 h-3" />
                        {t('custom_agents.failed') || 'Failed'}
                      </Badge>
                    )}
                    <span className="text-xs font-mono font-medium text-slate-300">
                      {t('custom_agents.status') || 'Trigger'}: {exec.trigger_event}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Clock className="w-3 h-3" />
                      {exec.duration_ms}ms
                    </span>
                    <span className="flex items-center gap-1 text-brand-400">
                      <Cpu className="w-3 h-3" />
                      {exec.tokens_used} tokens
                    </span>
                    <span>{new Date(exec.created_at).toLocaleString()}</span>
                  </div>
                </div>

                {/* Output recommendation */}
                {exec.output_payload?.recommendation && (
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
                    {exec.output_payload.recommendation}
                  </div>
                )}

                {/* Tools invoked */}
                {exec.tool_calls && exec.tool_calls.length > 0 && (
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                      <Wrench className="w-3 h-3 text-brand-400" />
                      {t('custom_agents.tools') || 'Tools'}:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {exec.tool_calls.map((tc, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        >
                          {tc.tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end border-t border-slate-800 pt-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            {t('common.close') || 'Close'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
