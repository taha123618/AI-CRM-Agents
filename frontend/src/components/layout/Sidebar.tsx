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
  ChevronLeft,
  ChevronRight,
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
  { id: 'customers', labelKey: 'nav.customers', defaultLabel: 'Customer Success', icon: Building2 },
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
        'fixed top-0 left-0 z-40 h-screen glass-panel border-r border-slate-800/80 transition-all duration-300 flex flex-col',
        sidebarOpen ? 'w-64' : 'w-20'
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 via-orange-500 to-orange-500 flex items-center justify-center shadow-lg shadow-brand-500/20 shrink-0">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          {sidebarOpen && (
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-white">AI-Powered CRM</span>
              <span className="text-[10px] font-mono text-brand-400">Agentic Architecture</span>
            </div>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                isActive
                  ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30 shadow-md shadow-brand-500/5'
                  : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200 border border-transparent'
              )}
            >
              <Icon className={cn('w-5 h-5 shrink-0 transition-colors', isActive ? 'text-brand-400' : 'group-hover:text-slate-200')} />
              {sidebarOpen && <span className="truncate">{t(item.labelKey, item.defaultLabel)}</span>}

              {item.badge && sidebarOpen && (
                <span
                  className={cn(
                    'ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                    item.badge.includes('Active')
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-brand-500/10 text-brand-400 border-brand-500/20'
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
        <div className="p-4 border-t border-slate-800/80 m-3 rounded-xl bg-slate-900/50 border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-slate-300">FastAPI Backend</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">v1.0.0 • Connected to API</p>
        </div>
      )}
    </aside>
  );
}
