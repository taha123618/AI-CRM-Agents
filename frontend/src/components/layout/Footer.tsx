import { Bot, Radio, ShieldCheck, Heart } from 'lucide-react';
import { useAgentStore } from '@/stores/use-agent-store';

export function Footer() {
  const { connectionStatus } = useAgentStore();

  return (
    <footer className="border-t border-[#3A4552] bg-[#0B0C10] px-6 py-4 mt-12 transition-none font-mono">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-none bg-[#1F2833] text-[#FFB800] border border-[#3A4552]">
            <Bot className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-slate-200 uppercase tracking-wider">AI CRM COMMAND FLEET</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 uppercase">AUTONOMOUS MULTI-AGENT CRM</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase">
            <Radio
              className={`w-3 h-3 ${connectionStatus === 'OPEN' ? 'text-[#FFB800] animate-pulse' : 'text-[#FFB800]'}`}
            />
            <span className="text-slate-300">{connectionStatus === 'OPEN' ? 'TELEMETRY ACTIVE' : 'POLLING STREAM'}</span>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FFB800]" />
            <span>POSTGRESQL SYNCED</span>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase">
            <span>BUILT WITH</span>
            <Heart className="w-3 h-3 text-[#FF2A54] fill-[#FF2A54]" />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
