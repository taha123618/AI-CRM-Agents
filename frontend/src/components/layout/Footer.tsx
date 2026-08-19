import { Bot, Radio, ShieldCheck } from 'lucide-react';
import { useAgentStore } from '@/stores/use-agent-store';

export function Footer() {
  const { connectionStatus } = useAgentStore();

  return (
    <footer className="border-t border-[#E9E6E0] dark:border-[#35322E] bg-[#FAF9F6] dark:bg-[#1D1B18] px-6 py-4 mt-12 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#85817A] dark:text-[#807C75]">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-[#EAE8E3] dark:bg-[#25231F] text-[#1A1917] dark:text-[#F5F3EE]">
            <Bot className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-[#252421] dark:text-[#F5F3EE]">AI-Powered CRM Agents</span>
          <span className="text-[#DEDAD3] dark:text-[#35322E]">|</span>
          <span>Enterprise Multi-Agent Platform</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[11px]">
            <Radio
              className={`w-3 h-3 ${connectionStatus === 'OPEN' ? 'text-[#64705B]' : 'text-[#9A6B2F]'}`}
            />
            <span className="text-[#5F5C56] dark:text-[#B9B5AD]">{connectionStatus === 'OPEN' ? 'Live Telemetry Active' : 'Polling Stream'}</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-[#85817A] dark:text-[#807C75]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#64705B]" />
            <span>PostgreSQL Synchronized</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
