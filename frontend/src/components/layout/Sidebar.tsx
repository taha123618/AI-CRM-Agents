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
  { id: 'leads', labelKey: 'nav.leads', defaultLabel: 'Leads', icon: Users },
  { id: 'deals', labelKey: 'nav.deals', defaultLabel: 'Deals Pipeline', icon: Briefcase },
  { id: 'war-room', labelKey: 'nav.war_room', defaultLabel: 'Deal War Room', icon: Swords, badge: 'AI' },
  { id: 'sequences', labelKey: 'nav.sequences', defaultLabel: 'AI SDR Cadences', icon: Send, badge: 'AI' },
  { id: 'customers', labelKey: 'nav.customers', defaultLabel: 'Customer Success', icon: Building2 },
  { id: 'journey', labelKey: 'nav.journey', defaultLabel: 'Journey & Churn', icon: Milestone, badge: 'New' },
  { id: 'emails', labelKey: 'nav.emails', defaultLabel: 'Smart Inbox', icon: Mail },
  { id: 'meetings', labelKey: 'nav.meetings', defaultLabel: 'AI Calendar', icon: Calendar },
  { id: 'voice-ai', labelKey: 'nav.voice_ai', defaultLabel: 'Voice AI Studio', icon: PhoneCall, badge: 'Live' },
  { id: 'whatsapp', labelKey: 'nav.whatsapp', defaultLabel: 'WhatsApp Hub', icon: MessageSquare },
  { id: 'forecasting', labelKey: 'nav.forecasting', defaultLabel: 'ARR Forecasting', icon: TrendingUp, badge: 'AI' },
  { id: 'analytics', labelKey: 'nav.analytics', defaultLabel: 'Analytics', icon: BarChart3 },
  { id: 'reports', labelKey: 'nav.reports', defaultLabel: 'AI Reports', icon: FileText },
  { id: 'agents', labelKey: 'nav.agents', defaultLabel: 'Agent Console', icon: Bot },
  { id: 'custom-agents', labelKey: 'nav.custom_agents', defaultLabel: 'Agent Studio', icon: Sparkles, badge: 'New' },
  { id: 'languages', labelKey: 'nav.languages', defaultLabel: 'Languages & I18n', icon: Globe },
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
        'fixed top-0 left-0 z-40 h-screen bg-[#1A1917] border-r border-[#252421] transition-all duration-300 flex flex-col',
        sidebarOpen ? 'w-64' : 'w-20'
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-[#252421]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-[#252421] border border-[#35332F] flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-[#C7A66A]" />
          </div>
          {sidebarOpen && (
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-tight text-white">AI CRM</span>
              <span className="text-[10px] text-[#85817A] tracking-wider uppercase font-medium">Enterprise Suite</span>
            </div>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-[#85817A] hover:bg-[#2A2825] hover:text-white transition-colors"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors group relative',
                isActive
                  ? 'bg-[#35322E] text-white border-l-2 border-[#C7A66A]'
                  : 'text-[#B9B5AD] hover:bg-[#2A2825] hover:text-white border-l-2 border-transparent'
              )}
            >
              <Icon className={cn('w-4 h-4 shrink-0 transition-colors', isActive ? 'text-[#C7A66A]' : 'text-[#85817A] group-hover:text-white')} />
              {sidebarOpen && <span className="truncate">{t(item.labelKey, item.defaultLabel)}</span>}

              {item.badge && sidebarOpen && (
                <span
                  className={cn(
                    'ml-auto text-[9px] font-semibold px-2 py-0.5 rounded border',
                    item.badge === 'AI'
                      ? 'bg-[#2B2418] text-[#DEC28C] border-[#5A492B]'
                      : 'bg-[#252421] text-[#B9B5AD] border-[#35332F]'
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
        <div className="p-3 m-3 rounded-lg bg-[#252421] border border-[#35332F]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#64705B]"></span>
            </span>
            <span className="text-xs font-medium text-[#F5F3EE]">Autonomous Engine</span>
          </div>
          <p className="text-[10px] text-[#85817A] mt-0.5">Enterprise v1.0 • Connected</p>
        </div>
      )}
    </aside>
  );
}
