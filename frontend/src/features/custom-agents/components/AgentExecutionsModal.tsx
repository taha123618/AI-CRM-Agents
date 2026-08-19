import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useTranslation } from '@/features/multi-language';
import { CustomAgent } from '../types/customAgent.types';
import { useAgentExecutions } from '../hooks/useCustomAgents';
import { History, Clock, Cpu, CheckCircle2, XCircle } from 'lucide-react';

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
      title={`${t('custom_agents.telemetry_title') || 'TELEMETRY & RUN HISTORY'} — ${agent.name.toUpperCase()}`}
      description={`${t('custom_agents.telemetry_desc') || 'AUDIT TRAIL OF ALL AUTONOMOUS RUNS AND SANDBOX EXECUTIONS'} (${executions?.length || 0} TOTAL RECORDS)`}
      className="max-w-3xl font-mono"
    >
      <div className="space-y-3 font-mono">
        {isLoading ? (
          <div className="py-10 text-center text-slate-500 text-xs uppercase">{t('custom_agents.loading_telemetry') || 'LOADING EXECUTION LOGS...'}</div>
        ) : !executions || executions.length === 0 ? (
          <div className="py-10 text-center text-slate-500 space-y-2 uppercase">
            <History className="w-8 h-8 mx-auto opacity-30 text-[#39FF14]" />
            <p className="text-xs">{t('custom_agents.no_telemetry') || 'NO EXECUTION TELEMETRY RECORDED YET FOR THIS AGENT.'}</p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {executions.map((exec) => (
              <div
                key={exec.id}
                className="p-3 rounded-none bg-[#0B0C10] border border-[#3A4552] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {exec.status === 'success' ? (
                      <Badge variant="success" className="gap-1 text-[9px] uppercase">
                        <CheckCircle2 className="w-3 h-3" />
                        {t('custom_agents.success') || 'SUCCESS'}
                      </Badge>
                    ) : (
                      <Badge variant="danger" className="gap-1 text-[9px] uppercase">
                        <XCircle className="w-3 h-3" />
                        {t('custom_agents.failed') || 'FAILED'}
                      </Badge>
                    )}
                    <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                      {t('custom_agents.status') || 'TRIGGER'}: {exec.trigger_event}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 uppercase">
                    <span className="flex items-center gap-1 text-[#39FF14]">
                      <Clock className="w-3 h-3" />
                      {exec.duration_ms}MS
                    </span>
                    <span className="flex items-center gap-1 text-cyan-400">
                      <Cpu className="w-3 h-3" />
                      {exec.tokens_used} TOKENS
                    </span>
                    <span>{new Date(exec.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>

                {/* Output recommendation */}
                {exec.output_payload?.recommendation && (
                  <div className="p-2.5 rounded-none bg-[#1F2833] border border-[#3A4552] text-xs text-slate-200 leading-relaxed font-mono uppercase">
                    {exec.output_payload.recommendation}
                  </div>
                )}

                {/* Input Payload details */}
                {exec.input_payload && (
                  <div className="p-2 rounded-none bg-[#1F2833] border border-[#3A4552] text-[10px] font-mono text-slate-400 overflow-x-auto">
                    <span className="text-slate-500 block mb-1 uppercase font-bold">INPUT PAYLOAD:</span>
                    <pre>{JSON.stringify(exec.input_payload, null, 2)}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-[#3A4552]">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs uppercase">
            {t('common.cancel') || 'CLOSE'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
