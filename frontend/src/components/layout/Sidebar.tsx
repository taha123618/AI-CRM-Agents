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
        'fixed top-0 left-0 z-40 h-screen bg-[#0D0D0D] border-r border-[#252b36] transition-none flex flex-col',
        sidebarOpen ? 'w-64' : 'w-20'
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-[#252b36]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-none bg-gradient-to-tr from-[#FF2A54] to-[#be123c] flex items-center justify-center shadow-[0_0_12px_rgba(255,42,84,0.4)] shrink-0 border border-[#FF2A54]/50">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && (
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-white font-mono">AI-CRM // SAAS</span>
              <span className="text-[9px] font-mono uppercase tracking-widest text-[#FF2A54]">Stealth Architecture</span>
            </div>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-none text-slate-400 hover:bg-[#1A1F26] hover:text-white transition-none"
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
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-none text-xs font-medium transition-none group relative cursor-pointer',
                isActive
                  ? 'bg-[#1A1F26] text-white border-l-2 border-l-[#FF2A54] border-t border-r border-b border-t-[#252b36] border-r-[#252b36] border-b-[#252b36] shadow-[inset_0_0_10px_rgba(255,42,84,0.1)] font-semibold'
                  : 'text-slate-400 hover:bg-[#1A1F26]/60 hover:text-slate-200 border border-transparent'
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4 shrink-0 transition-none',
                  isActive ? 'text-[#FF2A54]' : 'group-hover:text-slate-200 text-slate-400'
                )}
              />
              {sidebarOpen && <span className="truncate">{t(item.labelKey, item.defaultLabel)}</span>}

              {item.badge && sidebarOpen && (
                <span
                  className={cn(
                    'ml-auto text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-none border',
                    item.badge.includes('Active')
                      ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                      : 'bg-[#FF2A54]/15 text-[#FF2A54] border-[#FF2A54]/30'
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
        <div className="p-3 border border-[#252b36] m-2 rounded-none bg-[#1A1F26]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-none bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-none h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-mono font-medium text-slate-300">FastAPI Backend</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 font-mono uppercase tracking-wider">v1.0.0 • Connected</p>
        </div>
      )}
    </aside>
  );
}

