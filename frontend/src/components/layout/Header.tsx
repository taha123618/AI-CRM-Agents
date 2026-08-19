import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Radio, Bot, Plus, User, LogOut } from 'lucide-react';
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

    const checkBackend = async () => {
      try {
        const res = await fetch('/health');
        if (res.ok) setBackendHealth('healthy');
        else setBackendHealth('error');
      } catch {
        setBackendHealth('error');
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 30000);

    return () => {
      unsubStatus();
      unsubEvents();
      clearInterval(interval);
    };
  }, [setConnectionStatus, addEvent]);

  const getRoleBadgeVariant = (role: string): 'purple' | 'info' | 'warning' | 'default' => {
    switch (role) {
      case 'admin':
        return 'purple';
      case 'sales':
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
        className={`sticky top-0 z-30 h-14 bg-card border-b border-border px-4 sm:px-6 flex items-center justify-between transition-none font-mono ${sidebarOpen ? 'ltr:ml-64 rtl:mr-64' : 'ltr:ml-16 rtl:mr-16'
          }`}
      >
        {/* Search & AI Spotlight Bar */}
        <div className="flex items-center gap-3 w-64 sm:w-80 lg:w-96">
          <div
            onClick={() => setGlobalSearchOpen(true)}
            className="relative flex items-center w-full cursor-pointer group"
          >
            <Search className="absolute ltr:left-3 rtl:right-3 w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-none pointer-events-none" />
            <input
              type="text"
              readOnly
              value={searchQuery}
              onFocus={() => setGlobalSearchOpen(true)}
              placeholder="SEARCH OR EXECUTE COMMAND (⌘K)..."
              className="w-full bg-background text-foreground placeholder:text-muted-foreground text-xs font-mono rounded-none ltr:pl-9 ltr:pr-14 rtl:pr-9 rtl:pl-14 py-1.5 border border-border group-hover:border-primary cursor-pointer transition-none uppercase"
            />
            <kbd className="absolute ltr:right-2 rtl:left-2 px-1 py-0.2 text-[8px] font-mono text-primary bg-card border border-border rounded-none pointer-events-none">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Status, Language Selector & Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher */}
          <LanguageSelector onOpenSettings={() => setIsLangManagerOpen(true)} />

          {/* Realtime Stream Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-none bg-background border border-border text-xs font-mono">
            <Radio
              className={`w-3.5 h-3.5 ${connectionStatus === 'OPEN' ? 'text-primary' : 'text-amber-400'
                }`}
            />
            <span className="text-foreground font-bold uppercase text-[10px]">
              {connectionStatus === 'OPEN' ? 'WS STREAM ONLINE' : 'POLLING'}
            </span>
            <span
              className={`w-1.5 h-1.5 rounded-none ${backendHealth === 'healthy' ? 'bg-primary' : 'bg-destructive'
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
            className="hidden md:inline-flex text-xs h-7"
          >
            <Bot className="w-3.5 h-3.5 text-primary" />
            <span>{t('nav.agents', 'AGENTS')}</span>
          </Button>

          {/* Quick Add Actions */}
          <div className="flex items-center gap-1.5">
            <Button size="sm" variant="primary" onClick={() => setLeadModalOpen(true)} className="text-xs h-7 px-2.5">
              <Plus className="w-3.5 h-3.5" />
              <span>{t('leads.qualify_btn', 'LEAD')}</span>
            </Button>

            <Button variant="primary" size="sm" onClick={() => setDealModalOpen(true)} className="text-xs h-7 px-2.5">
              <Plus className="w-3.5 h-3.5" />
              <span>{t('deals.title', 'DEAL')}</span>
            </Button>
          </div>

          {/* Authenticated User & Logout */}
          {user && (
            <div className="flex items-center gap-2 ltr:pl-2 rtl:pr-2 border-l border-border">
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-7 h-7 rounded-none bg-background border border-border flex items-center justify-center text-primary font-bold text-xs font-mono">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div className="text-left leading-tight hidden xl:block font-mono">
                  <div className="text-xs font-bold text-foreground truncate max-w-[120px] uppercase">{user.full_name}</div>
                  <Badge variant={getRoleBadgeVariant(user.role)} className="text-[8px] py-0 px-1 font-mono">
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
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-1.5 h-7 w-7"
              >
                <LogOut className="w-3.5 h-3.5" />
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
