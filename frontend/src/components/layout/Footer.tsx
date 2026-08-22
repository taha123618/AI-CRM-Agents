import { Bot, Radio, ShieldCheck, Heart } from 'lucide-react';
import { useAgentStore } from '@/stores/use-agent-store';

export function Footer() {
  const { connectionStatus } = useAgentStore();

  return (
    <footer className="border-t border-border bg-background px-6 py-4 mt-12 transition-none font-mono">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-none bg-card text-primary border border-border">
            <Bot className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-foreground uppercase tracking-wider">AI CRM COMMAND FLEET</span>
          <span className="text-border">|</span>
          <span className="text-muted-foreground uppercase">AUTONOMOUS MULTI-AGENT CRM</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase">
            <Radio
              className={`w-3 h-3 ${connectionStatus === 'OPEN' ? 'text-primary animate-pulse' : 'text-primary'}`}
            />
            <span className="text-foreground">{connectionStatus === 'OPEN' ? 'TELEMETRY ACTIVE' : 'POLLING STREAM'}</span>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>POSTGRESQL SYNCED</span>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase">
            <span>BUILT WITH</span>
            <Heart className="w-3 h-3 text-destructive fill-destructive" />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
