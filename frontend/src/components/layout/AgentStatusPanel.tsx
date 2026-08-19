import { Activity, Cpu, RefreshCw } from 'lucide-react';
import { useAgentStore } from '@/stores/use-agent-store';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/features/multi-language';

export function AgentStatusPanel({ onRefresh }: { onRefresh?: () => void }) {
  const { t } = useTranslation();
  const { agentStatuses } = useAgentStore();
  const agentsList = Object.values(agentStatuses);

  return (
    <div className="bg-white dark:bg-[#1D1B18] rounded-2xl p-5 border border-[#E9E6E0] dark:border-[#35322E] mb-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#E9E6E0] dark:border-[#35322E] mb-4 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#FAF9F6] dark:bg-[#25231F] text-[#1A1917] dark:text-[#F5F3EE] border border-[#E9E6E0] dark:border-[#35322E]">
            <Cpu className="w-4 h-4 text-[#1A1917] dark:text-[#F5F3EE]" />
          </div>
          <div>
            <span className="font-semibold text-sm text-[#1A1917] dark:text-[#F5F3EE] block">
              {t('agents.title', 'Autonomous Agent Fleet')}
            </span>
            <span className="text-xs text-[#85817A] dark:text-[#807C75]">Multi-agent orchestrator panel</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="w-3.5 h-3.5 text-[#5F5C56] dark:text-[#B9B5AD]" />
              <span>Refresh Metrics</span>
            </Button>
          )}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF0EA] dark:bg-[#1E231C] text-[#64705B] border border-[#D8DDD0] dark:border-[#2E362A] text-xs font-medium shrink-0">
            <Activity className="w-3.5 h-3.5" />
            <span>6 Agents Online</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {agentsList.map((agent) => (
          <div
            key={agent.name}
            className="p-3.5 rounded-xl bg-[#FAF9F6] dark:bg-[#25231F] border border-[#E9E6E0] dark:border-[#35322E] flex flex-col justify-between hover:border-[#DEDAD3] dark:hover:border-[#3F3B36] hover:bg-[#F6F5F2] dark:hover:bg-[#302D28] transition-colors group"
          >
            <div className="flex items-center justify-between">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#64705B]"></span>
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#EAE8E3] dark:bg-[#1D1B18] text-[#5F5C56] dark:text-[#B9B5AD] border border-[#DEDAD3] dark:border-[#35322E]">
                {agent.model}
              </span>
            </div>
            <p className="text-xs font-semibold text-[#1A1917] dark:text-[#F5F3EE] mt-3 truncate" title={agent.name}>
              {agent.name.replace('Agent', '')}
            </p>
            <span className="text-[10px] text-[#806638] dark:text-[#DEC28C] font-medium mt-1 block">Active</span>
          </div>
        ))}
      </div>
    </div>
  );
}
