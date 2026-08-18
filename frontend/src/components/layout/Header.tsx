import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Radio, Bot, Plus, User, LogOut, Sparkles, Building2 } from 'lucide-react';
import { useUIStore } from '@/stores/use-ui-store';
import { useAgentStore } from '@/stores/use-agent-store';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { realtimeClient } from '@/lib/websocket/client';
import { LanguageSelector, LanguageManagerModal, TranslationEditorModal, useTranslation } from '@/features/multi-language';

export function Header() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { searchQuery, sidebarOpen, setLeadModalOpen, setDealModalOpen, setActivePage, setGlobalSearchOpen } = useUIStore();
  const { connectionStatus, setConnectionStatus, addEvent } = useAgentStore();
  const { user, logout, isLoggingOut } = useAuth();
  const [backendHealth, setBackendHealth] = useState<'healthy' | 'checking' | 'error'>('checking');
  const [isLangManagerOpen, setIsLangManagerOpen] = useState(false);
  const [editingLangCode, setEditingLangCode] = useState<string | null>(null);

  useEffect(() => {
    realtimeClient.connect();
    const unsubStatus = realtimeClient.onStatusChange(setConnectionStatus);
    const unsubEvents = realtimeClient.subscribe((event) => {
      addEvent(event);
    });

    fetch('/health')
      .then((res) => (res.ok ? setBackendHealth('healthy') : setBackendHealth('error')))
      .catch(() => {
        fetch('http://localhost:8000/health')
          .then((res) => (res.ok ? setBackendHealth('healthy') : setBackendHealth('error')))
          .catch(() => setBackendHealth('error'));
      });

    return () => {
      unsubStatus();
      unsubEvents();
    };
  }, [setConnectionStatus, addEvent]);

  const getRoleBadgeVariant = (role?: string): 'danger' | 'purple' | 'warning' | 'info' | 'default' => {
    switch (role) {
      case 'admin':
        return 'danger';
      case 'sales':
        return 'purple';
      case 'support':
        return 'warning';
      case 'auditor':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-30 h-16 glass-panel border-b border-slate-800/80 px-6 flex items-center justify-between transition-all duration-300 ${sidebarOpen ? 'ltr:ml-64 rtl:mr-64' : 'ltr:ml-20 rtl:mr-20'
          }`}
      >
        {/* Search & AI Spotlight Bar */}
        <div className="flex items-center gap-3 w-64 sm:w-80 lg:w-96">
          <div
            onClick={() => setGlobalSearchOpen(true)}
            className="relative flex items-center w-full cursor-pointer group"
          >
            <Search className="absolute ltr:left-3 rtl:right-3 w-4 h-4 text-slate-400 group-hover:text-brand-400 transition-colors pointer-events-none" />
            <input
              type="text"
              readOnly
              value={searchQuery}
              onFocus={() => setGlobalSearchOpen(true)}
              placeholder="Search or ask CRM AI... (⌘K)"
              className="w-full bg-slate-900/80 text-slate-200 placeholder:text-slate-500 text-xs rounded-xl ltr:pl-9 ltr:pr-14 rtl:pr-9 rtl:pl-14 py-2 border border-slate-800 group-hover:border-slate-700 cursor-pointer transition-all"
            />
            <kbd className="absolute ltr:right-2.5 rtl:left-2.5 px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-slate-950 border border-slate-800 rounded-md pointer-events-none">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Status, Language Selector & Quick Actions */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <LanguageSelector onOpenSettings={() => setIsLangManagerOpen(true)} />

          {/* Realtime Stream Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs">
            <Radio
              className={`w-3.5 h-3.5 ${connectionStatus === 'OPEN' ? 'text-emerald-400 animate-pulse' : 'text-amber-400'
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
            onClick={() => {
              setActivePage('agents');
              navigate('/agents');
            }}
            className="hidden md:inline-flex"
          >
            <Bot className="w-4 h-4 text-brand-400" />
            <span>{t('nav.agents', 'Agents Hub')}</span>
          </Button>

          {/* Quick Add Actions */}
          <div className="flex items-center gap-2">
            <Button size="sm" variant="orange" onClick={() => setLeadModalOpen(true)}>
              <Plus className="w-4 h-4" />
              <span>{t('leads.qualify_btn', 'New Lead')}</span>
            </Button>

            <Button variant="orange" size="sm" onClick={() => setDealModalOpen(true)}>
              <Plus className="w-4 h-4" />
              <span>{t('deals.title', 'New Deal')}</span>
            </Button>
          </div>

          {/* Authenticated User & Logout */}
          {user && (
            <div className="flex items-center gap-2 ltr:pl-2 rtl:pr-2 border-l border-slate-800">
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-brand-400 font-semibold text-xs">
                  <User className="w-4 h-4" />
                </div>
                <div className="text-left leading-tight hidden xl:block">
                  <div className="text-xs font-semibold text-white truncate max-w-[120px]">{user.full_name}</div>
                  <Badge variant={getRoleBadgeVariant(user.role)} className="text-[9px] py-0 px-1 font-mono">
                    {user.role.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
                disabled={isLoggingOut}
                title="Log Out & Invalidate Session Cookies"
                className="text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 p-2 h-8 w-8"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Language Management Modals */}
      <LanguageManagerModal
        isOpen={isLangManagerOpen}
        onClose={() => setIsLangManagerOpen(false)}
        onOpenTranslationEditor={(code) => setEditingLangCode(code)}
      />

      {editingLangCode && (
        <TranslationEditorModal
          isOpen={Boolean(editingLangCode)}
          languageCode={editingLangCode}
          onClose={() => setEditingLangCode(null)}
        />
      )}
    </>
  );
}
