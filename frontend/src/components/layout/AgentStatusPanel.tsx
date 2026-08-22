import { Activity, Cpu, RefreshCw } from 'lucide-react';
import { useAgentStore } from '@/stores/use-agent-store';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/features/multi-language';

export function AgentStatusPanel({ onRefresh }: { onRefresh?: () => void }) {
  const { t } = useTranslation();
  const { agentStatuses } = useAgentStore();
  const agentsList = Object.values(agentStatuses);

  return (
    <div className="bg-card rounded-none p-4 border border-border mb-6 relative overflow-hidden font-mono">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-border mb-3 relative z-10 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-none bg-background text-primary border border-border">
            <Cpu className="w-4 h-4 text-primary" />
          </div>
          <div>
            <span className="font-bold text-xs text-foreground block uppercase tracking-wider">
              {t('agents.title', 'AUTONOMOUS AGENT FLEET')}
            </span>
            <span className="text-[9px] text-muted-foreground uppercase">MULTI-AGENT ORCHESTRATOR DOCK</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh} className="text-xs h-7">
              <RefreshCw className="w-3 h-3 text-primary mr-1" />
              <span>REFRESH</span>
            </Button>
          )}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-none bg-background text-primary border border-primary text-[10px] font-bold uppercase shrink-0">
            <Activity className="w-3 h-3 text-primary" />
            <span>6 AGENTS ONLINE</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 relative z-10">
        {agentsList.map((agent) => (
          <div
            key={agent.name}
            className="p-2.5 rounded-none bg-background border border-border flex flex-col justify-between hover:border-primary transition-none group"
          >
            <div className="flex items-center justify-between">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-none h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-[8px] font-bold font-mono px-1.5 py-0.5 rounded-none bg-card text-muted-foreground border border-border uppercase">
                {agent.model}
              </span>
            </div>
            <p className="text-[11px] font-bold text-foreground mt-2 truncate group-hover:text-primary transition-none uppercase" title={agent.name}>
              {agent.name.replace('Agent', '')}
            </p>
            <span className="text-[8px] text-primary font-bold uppercase tracking-wider mt-1 block">ACTIVE</span>
          </div>
        ))}
      </div>
    </div>
  );
}
