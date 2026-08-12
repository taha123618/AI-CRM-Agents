import { Activity, Cpu } from 'lucide-react';
import { useAgentStore } from '@/stores/use-agent-store';

export function AgentStatusPanel() {
  const { agentStatuses } = useAgentStore();
  const agentsList = Object.values(agentStatuses);

  return (
    <div className="glass-panel-premium rounded-3xl p-5 border border-slate-800/80 mb-6 glow-card-brand relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 blur-3xl pointer-events-none rounded-full" />

      <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <Cpu className="w-5 h-5 text-brand-400 animate-pulse" />
          </div>
          <div>
            <span className="font-bold text-sm text-white block">Autonomous Agent Fleet</span>
            <span className="text-[10px] text-slate-400">Multi-agent orchestrator panel</span>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>6 Agents Online</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 relative z-10">
        {agentsList.map((agent) => (
          <div
            key={agent.name}
            className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex flex-col justify-between hover:border-brand-500/50 hover:bg-slate-900/60 transition-all hover:scale-[1.03] duration-300 group shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60">
                {agent.model}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-200 mt-3 truncate group-hover:text-brand-300 transition-colors" title={agent.name}>
              {agent.name.replace('Agent', '')}
            </p>
            <span className="text-[9px] text-brand-400 font-bold uppercase tracking-wider mt-1 block">Active</span>
          </div>
        ))}
      </div>
    </div>
  );
}
