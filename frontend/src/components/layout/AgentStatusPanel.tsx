import { Activity, Cpu, RefreshCw } from 'lucide-react';
import { useAgentStore } from '@/stores/use-agent-store';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/features/multi-language';

export function AgentStatusPanel({ onRefresh }: { onRefresh?: () => void }) {
  const { t } = useTranslation();
  const { agentStatuses } = useAgentStore();
  const agentsList = Object.values(agentStatuses);

  return (
    <div className="bg-[#1A1F26] rounded-none p-5 border border-[#252b36] mb-6 glow-card-crimson relative overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#252b36] mb-4 relative z-10 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-none bg-[#FF2A54]/10 text-[#FF2A54] border border-[#FF2A54]/30">
            <Cpu className="w-5 h-5 text-[#FF2A54] animate-pulse" />
          </div>
          <div>
            <span className="font-bold text-sm text-white font-mono uppercase tracking-wider block">
              {t('agents.title', 'Autonomous Agent Fleet')}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Multi-agent orchestrator panel</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="w-3.5 h-3.5 text-[#FF2A54]" />
              <span className="font-mono text-xs">Refresh Dynamic Metrics</span>
            </Button>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-none bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-semibold shrink-0">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>6 AGENTS ONLINE</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 relative z-10">
        {agentsList.map((agent) => (
          <div
            key={agent.name}
            className="p-3.5 rounded-none bg-[#0D0D0D] border border-[#252b36] flex flex-col justify-between hover:border-[#FF2A54]/50 transition-none group shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-none bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-none h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-none bg-[#1A1F26] text-slate-300 border border-[#252b36]">
                {agent.model}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-200 mt-3 truncate group-hover:text-[#FF2A54] transition-none font-mono" title={agent.name}>
              {agent.name.replace('Agent', '')}
            </p>
            <span className="text-[9px] text-[#FF2A54] font-mono font-bold uppercase tracking-wider mt-1 block">ACTIVE</span>
          </div>
        ))}
      </div>
    </div>
  );
}

