import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Building2,
  Mail,
  Calendar,
  BarChart3,
  FileText,
  Bot,
  Globe,
  Sparkles,
  PhoneCall,
  MessageSquare,
  TrendingUp,
  Swords,
  ChevronLeft,
  ChevronRight,
  Milestone,
  Send,
  Sliders,
  Terminal,
} from 'lucide-react';
import { useUIStore, ActivePage } from '@/stores/use-ui-store';
import { useTranslation } from '@/features/multi-language';
import { cn } from '@/lib/utils';

interface NavItem {
  id: ActivePage;
  labelKey: string;
  defaultLabel: string;
  icon: React.ElementType;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', labelKey: 'nav.dashboard', defaultLabel: 'Dashboard', icon: LayoutDashboard },
  { id: 'leads', labelKey: 'nav.leads', defaultLabel: 'Leads', icon: Users, badge: '' },
  { id: 'deals', labelKey: 'nav.deals', defaultLabel: 'Deals Pipeline', icon: Briefcase },
  { id: 'war-room', labelKey: 'nav.war_room', defaultLabel: 'Deal War Room', icon: Swords, badge: 'AI' },
  { id: 'sequences', labelKey: 'nav.sequences', defaultLabel: 'AI SDR Cadences', icon: Send, badge: 'AI' },
  { id: 'customers', labelKey: 'nav.customers', defaultLabel: 'Customer Success', icon: Building2 },
  { id: 'journey', labelKey: 'nav.journey', defaultLabel: 'Journey & Churn', icon: Milestone, badge: 'New' },
  { id: 'emails', labelKey: 'nav.emails', defaultLabel: 'Smart Inbox', icon: Mail, badge: '' },
  { id: 'meetings', labelKey: 'nav.meetings', defaultLabel: 'AI Calendar', icon: Calendar },
  { id: 'voice-ai', labelKey: 'nav.voice_ai', defaultLabel: 'Voice AI Studio', icon: PhoneCall, badge: 'Live' },
  { id: 'whatsapp', labelKey: 'nav.whatsapp', defaultLabel: 'WhatsApp Hub', icon: MessageSquare, badge: '' },
  { id: 'forecasting', labelKey: 'nav.forecasting', defaultLabel: 'ARR Forecasting', icon: TrendingUp, badge: 'AI' },
  { id: 'analytics', labelKey: 'nav.analytics', defaultLabel: 'Analytics', icon: BarChart3 },
  { id: 'reports', labelKey: 'nav.reports', defaultLabel: 'AI Reports', icon: FileText, badge: '' },
  { id: 'agents', labelKey: 'nav.agents', defaultLabel: 'Agent Console', icon: Bot, badge: '' },
  { id: 'custom-agents', labelKey: 'nav.custom_agents', defaultLabel: 'Agent Studio', icon: Sparkles, badge: 'New' },
  { id: 'languages', labelKey: 'nav.languages', defaultLabel: 'Languages & I18n', icon: Globe, badge: '' },
  { id: 'settings', labelKey: 'nav.settings', defaultLabel: 'Settings & Security', icon: Sliders, badge: 'Auth' },
];

export function Sidebar() {
  const { activePage, setActivePage, sidebarOpen, toggleSidebar } = useUIStore();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleNav = (id: ActivePage) => {
    setActivePage(id);
    navigate(`/${id}`);
  };

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 z-40 h-screen bg-[#1F2833] border-r border-[#3A4552] transition-none flex flex-col font-mono',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-14 px-3 border-b border-[#3A4552] bg-[#0B0C10]">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-none bg-[#39FF14] text-[#0B0C10] flex items-center justify-center font-mono font-black text-xs shrink-0 border border-[#39FF14]">
            <Terminal className="w-4 h-4 text-[#0B0C10]" />
          </div>
          {sidebarOpen && (
            <div className="flex flex-col">
              <span className="font-bold text-xs uppercase tracking-wider text-white">TACTICAL CRM</span>
              <span className="text-[9px] font-mono text-[#39FF14] uppercase">COMMAND OS</span>
            </div>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-none text-slate-400 hover:bg-[#1F2833] hover:text-white transition-none"
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={cn(
                'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-none text-xs font-mono font-bold uppercase transition-none group relative',
                isActive
                  ? 'bg-[#0B0C10] text-[#39FF14] border-l-2 border-l-[#39FF14] border border-[#39FF14]/40'
                  : 'text-slate-400 hover:bg-[#0B0C10] hover:text-white border border-transparent'
              )}
            >
              <Icon className={cn('w-4 h-4 shrink-0 transition-none', isActive ? 'text-[#39FF14]' : 'group-hover:text-white')} />
              {sidebarOpen && <span className="truncate">{t(item.labelKey, item.defaultLabel)}</span>}

              {item.badge && sidebarOpen && (
                <span
                  className={cn(
                    'ml-auto text-[8px] font-mono font-bold px-1.5 py-0.2 rounded-none border',
                    isActive
                      ? 'bg-[#39FF14] text-[#0B0C10] border-[#39FF14]'
                      : 'bg-[#0B0C10] text-[#39FF14] border-[#39FF14]/40'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      {sidebarOpen && (
        <div className="p-3 border-t border-[#3A4552] bg-[#0B0C10] font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-none bg-[#39FF14]"></span>
            <span className="text-[11px] font-bold uppercase text-slate-300">COMMAND TELEMETRY</span>
          </div>
          <p className="text-[9px] text-slate-500 mt-0.5 font-mono uppercase">ONLINE • POSTGRES &amp; REDIS</p>
        </div>
      )}
    </aside>
  );
}
