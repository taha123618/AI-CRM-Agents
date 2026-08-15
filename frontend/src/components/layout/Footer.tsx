import { Bot, Radio, ShieldCheck, Heart } from 'lucide-react';
import { useAgentStore } from '@/stores/use-agent-store';

export function Footer() {
  const { connectionStatus } = useAgentStore();

  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/60 backdrop-blur-md px-6 py-4 mt-12 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <Bot className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-slate-300">AI-Powered CRM Agents</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Autonomous Multi-Agent Enterprise System</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            <Radio
              className={`w-3 h-3 ${connectionStatus === 'OPEN' ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`}
            />
            <span className="text-slate-300">{connectionStatus === 'OPEN' ? 'Live Telemetry Active' : 'Polling Stream'}</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>PostgreSQL Synchronized</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <span>Built with</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

