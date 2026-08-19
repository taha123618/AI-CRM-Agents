import { Bot, Radio, ShieldCheck } from 'lucide-react';
import { useAgentStore } from '@/stores/use-agent-store';

export function Footer() {
  const { connectionStatus } = useAgentStore();

  return (
    <footer className="border-t border-[#252b36] bg-[#0D0D0D] px-6 py-4 mt-12 transition-none">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-none bg-[#FF2A54]/10 text-[#FF2A54] border border-[#FF2A54]/30">
            <Bot className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-slate-200">AI-POWERED CRM</span>
          <span className="text-slate-700">|</span>
          <span className="text-slate-400">Autonomous Multi-Agent Enterprise Engine</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            <Radio
              className={`w-3 h-3 ${connectionStatus === 'OPEN' ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`}
            />
            <span className="text-slate-300 uppercase">{connectionStatus === 'OPEN' ? 'Live Telemetry Active' : 'Polling Stream'}</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-500 uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>PostgreSQL Synchronized</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;


