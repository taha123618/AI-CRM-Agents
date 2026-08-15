import { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown, Settings } from 'lucide-react';
import { useLanguageStore } from '../stores/useLanguageStore';
import { Language } from '../types/language.types';

interface LanguageSelectorProps {
  onOpenSettings?: () => void;
  className?: string;
}

export function LanguageSelector({ onOpenSettings, className = '' }: LanguageSelectorProps) {
  const { currentLanguage, availableLanguages, setLanguage, fetchLanguages } = useLanguageStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchLanguages();
  }, [fetchLanguages]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeLang = availableLanguages.find((l) => l.code === currentLanguage) || {
    code: 'en',
    name: 'English',
    english_name: 'English',
    flag_emoji: '🇺🇸',
    direction: 'ltr',
  };

  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang.code);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 hover:text-white hover:bg-slate-800/80 hover:border-brand-500/40 transition-all shadow-sm group"
        title="Switch Application Language"
      >
        <span className="text-sm leading-none">{activeLang.flag_emoji || <Globe className="w-3.5 h-3.5 text-brand-400" />}</span>
        <span className="font-semibold">{activeLang.name}</span>
        {activeLang.direction === 'rtl' && (
          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 font-bold border border-brand-500/30">
            RTL
          </span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl z-50 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-2 border-b border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Select Language</span>
            <Globe className="w-3.5 h-3.5 text-brand-400" />
          </div>

          <div className="max-h-60 overflow-y-auto py-1">
            {availableLanguages
              .filter((l) => l.is_enabled)
              .map((lang) => {
                const isSelected = lang.code === currentLanguage;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelectLanguage(lang)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors ${
                      isSelected
                        ? 'bg-brand-600/15 text-brand-300 font-bold'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{lang.flag_emoji || '🌐'}</span>
                      <div className="text-left">
                        <div className="font-medium text-white">{lang.name}</div>
                        <div className="text-[10px] text-slate-400">{lang.english_name}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {lang.direction === 'rtl' && (
                        <span className="text-[9px] font-mono uppercase px-1 py-0.5 rounded bg-slate-800 text-slate-400">
                          RTL
                        </span>
                      )}
                      {isSelected && <Check className="w-4 h-4 text-brand-400" />}
                    </div>
                  </button>
                );
              })}
          </div>

          {onOpenSettings && (
            <div className="pt-1 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenSettings();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:text-brand-300 hover:bg-slate-900 font-medium transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Manage Languages & Translations</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
