import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Radio, Bot, Plus, User, LogOut, Sun, Moon } from 'lucide-react';
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
  const { searchQuery, sidebarOpen, theme, toggleTheme, setLeadModalOpen, setDealModalOpen, setActivePage, setGlobalSearchOpen } = useUIStore();
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

  const getRoleBadgeVariant = (role?: string): 'danger' | 'warning' | 'info' | 'default' => {
    switch (role) {
      case 'admin':
        return 'danger';
      case 'sales':
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
        className={`sticky top-0 z-30 h-16 bg-white dark:bg-[#1D1B18] border-b border-[#E9E6E0] dark:border-[#35322E] px-6 flex items-center justify-between transition-colors duration-200 ${
          sidebarOpen ? 'ltr:ml-64 rtl:mr-64' : 'ltr:ml-20 rtl:mr-20'
        }`}
      >
        {/* Search Bar */}
        <div className="flex items-center gap-3 w-64 sm:w-80 lg:w-96">
          <div
            onClick={() => setGlobalSearchOpen(true)}
            className="relative flex items-center w-full cursor-pointer group"
          >
            <Search className="absolute ltr:left-3 rtl:right-3 w-4 h-4 text-[#85817A] dark:text-[#807C75] group-hover:text-[#1A1917] dark:group-hover:text-[#F5F3EE] transition-colors pointer-events-none" />
            <input
              type="text"
              readOnly
              value={searchQuery}
              onFocus={() => setGlobalSearchOpen(true)}
              placeholder="Search or ask CRM AI... (⌘K)"
              className="w-full bg-[#F6F5F2] dark:bg-[#141311] text-[#1A1917] dark:text-[#F5F3EE] placeholder:text-[#85817A] dark:placeholder:text-[#807C75] text-xs rounded-xl ltr:pl-9 ltr:pr-14 rtl:pr-9 rtl:pl-14 py-2 border border-[#E9E6E0] dark:border-[#35322E] group-hover:border-[#DEDAD3] dark:group-hover:border-[#3F3B36] cursor-pointer transition-all"
            />
            <kbd className="absolute ltr:right-2.5 rtl:left-2.5 px-1.5 py-0.5 text-[9px] font-mono text-[#85817A] dark:text-[#807C75] bg-[#EAE8E3] dark:bg-[#25231F] border border-[#DEDAD3] dark:border-[#35322E] rounded pointer-events-none">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Status, Theme Switcher, Language Selector & Quick Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Warm Neutral Light' : 'Switch to Charcoal Dark'}
            className="p-2 rounded-xl text-[#5F5C56] dark:text-[#B9B5AD] hover:bg-[#F6F5F2] dark:hover:bg-[#25231F] hover:text-[#1A1917] dark:hover:text-[#F5F3EE] transition-colors border border-[#E9E6E0] dark:border-[#35322E]"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-[#C7A66A]" /> : <Moon className="w-4 h-4 text-[#5F5C56]" />}
          </button>

          {/* Language Switcher */}
          <LanguageSelector onOpenSettings={() => setIsLangManagerOpen(false)} />

          {/* Realtime Stream Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF9F6] dark:bg-[#25231F] border border-[#E9E6E0] dark:border-[#35322E] text-xs">
            <Radio
              className={`w-3.5 h-3.5 ${
                connectionStatus === 'OPEN' ? 'text-[#64705B]' : 'text-[#9A6B2F]'
              }`}
            />
            <span className="text-[#5F5C56] dark:text-[#B9B5AD] font-medium text-xs">
              {connectionStatus === 'OPEN' ? 'Realtime Connected' : 'Event Stream'}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                backendHealth === 'healthy' ? 'bg-[#64705B]' : 'bg-[#A64B45]'
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
            <Bot className="w-3.5 h-3.5 text-[#85817A] dark:text-[#B9B5AD]" />
            <span>{t('nav.agents', 'Agents')}</span>
          </Button>

          {/* Quick Add Actions */}
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => setLeadModalOpen(true)}>
              <Plus className="w-3.5 h-3.5" />
              <span>{t('leads.qualify_btn', 'New Lead')}</span>
            </Button>

            <Button variant="primary" size="sm" onClick={() => setDealModalOpen(true)}>
              <Plus className="w-3.5 h-3.5" />
              <span>{t('deals.title', 'New Deal')}</span>
            </Button>
          </div>

          {/* Authenticated User & Logout */}
          {user && (
            <div className="flex items-center gap-2 ltr:pl-2 rtl:pr-2 border-l border-[#E9E6E0] dark:border-[#35322E]">
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#F6F5F2] dark:bg-[#25231F] border border-[#E9E6E0] dark:border-[#35322E] flex items-center justify-center text-[#1A1917] dark:text-[#F5F3EE] font-semibold text-xs">
                  <User className="w-4 h-4 text-[#5F5C56] dark:text-[#B9B5AD]" />
                </div>
                <div className="text-left leading-tight hidden xl:block">
                  <div className="text-xs font-semibold text-[#1A1917] dark:text-[#F5F3EE] truncate max-w-[120px]">{user.full_name}</div>
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
                title="Log Out"
                className="text-[#85817A] dark:text-[#807C75] hover:text-[#A64B45] hover:bg-[#FAECEA] dark:hover:bg-[#2C1817] p-2 h-8 w-8"
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
