import { useState, useEffect } from 'react';
import { Search, Radio, Bot, Plus } from 'lucide-react';
import { useUIStore } from '@/stores/use-ui-store';
import { useAgentStore } from '@/stores/use-agent-store';
import { Button } from '@/components/ui/Button';
import { realtimeClient } from '@/lib/websocket/client';

export function Header() {
  const { searchQuery, setSearchQuery, sidebarOpen, setLeadModalOpen, setDealModalOpen, setActivePage } = useUIStore();
  const { connectionStatus, setConnectionStatus, addEvent } = useAgentStore();
  const [backendHealth, setBackendHealth] = useState<'healthy' | 'checking' | 'error'>('checking');

  useEffect(() => {
    realtimeClient.connect();
    const unsubStatus = realtimeClient.onStatusChange(setConnectionStatus);
    const unsubEvents = realtimeClient.subscribe((event) => {
      addEvent(event);
    });

    fetch('http://localhost:8000/health')
      .then((res) => (res.ok ? setBackendHealth('healthy') : setBackendHealth('error')))
      .catch(() => setBackendHealth('error'));

    return () => {
      unsubStatus();
      unsubEvents();
    };
  }, [setConnectionStatus, addEvent]);

  return (
    <header
      className={`sticky top-0 z-30 h-16 glass-panel border-b border-slate-800/80 px-6 flex items-center justify-between transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'
        }`}
    >
      {/* Search Input */}
      <div className="relative flex items-center w-64 md:w-96">
        <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search leads, deals, customers..."
          className="w-full bg-slate-900/80 text-slate-200 placeholder:text-slate-500 text-xs rounded-xl pl-9 pr-4 py-2 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-all"
        />
      </div>

      {/* Status & Quick Actions */}
      <div className="flex items-center gap-4">
        {/* Realtime Stream Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs">
          <Radio
            className={`w-3.5 h-3.5 ${connectionStatus === 'OPEN'
              ? 'text-emerald-400 animate-pulse'
              : 'text-amber-400'
              }`}
          />
          <span className="text-slate-300 font-medium">
            {connectionStatus === 'OPEN' ? 'WS Realtime Stream' : 'Event Stream (Polling)'}
          </span>
          <span
            className={`w-2 h-2 rounded-full ${backendHealth === 'healthy' ? 'bg-emerald-400' : 'bg-rose-400'
              }`}
          />
        </div>

        {/* Agent Console Quick Link */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setActivePage('agents')}
          className="hidden md:inline-flex"
        >
          <Bot className="w-4 h-4 text-brand-400" />
          <span>Agents Hub</span>
        </Button>

        {/* Quick Add Actions */}
        <div className="flex items-center gap-2">
          <Button size="sm" variant="orange" onClick={() => setLeadModalOpen(true)}>
            <Plus className="w-4 h-4" />
            <span>New Lead</span>
          </Button>

          <Button variant="orange" size="sm" onClick={() => setDealModalOpen(true)}>
            <Plus className="w-4 h-4" />
            <span>New Deal</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
