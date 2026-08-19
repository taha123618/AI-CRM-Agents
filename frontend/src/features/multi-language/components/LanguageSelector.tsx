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
    <div className={`relative inline-block text-left font-mono ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1 rounded-none bg-[#1F2833] border border-[#3A4552] text-xs text-slate-200 hover:text-white hover:border-[#FFB800] transition-none group font-mono uppercase"
        title="Switch Application Language"
      >
        <span className="text-xs leading-none">{activeLang.flag_emoji || <Globe className="w-3.5 h-3.5 text-[#FFB800]" />}</span>
        <span className="font-bold text-[11px]">{activeLang.name}</span>
        {activeLang.direction === 'rtl' && (
          <span className="text-[9px] font-mono uppercase px-1 py-0.2 rounded-none bg-[#0B0C10] text-[#FFB800] font-bold border border-[#FFB800]">
            RTL
          </span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-none ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-56 rounded-none bg-[#1F2833] border border-[#3A4552] shadow-2xl z-50 py-1 overflow-hidden font-mono">
          <div className="px-3 py-1.5 border-b border-[#3A4552] flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SELECT LOCALE</span>
            <Globe className="w-3.5 h-3.5 text-[#FFB800]" />
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
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-xs uppercase transition-none ${isSelected
                        ? 'bg-[#0B0C10] text-[#FFB800] font-bold border-l-2 border-[#FFB800]'
                        : 'text-slate-300 hover:bg-[#0B0C10] hover:text-white'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{lang.flag_emoji}</span>
                      <span>{lang.name}</span>
                      {lang.code !== lang.english_name.toLowerCase() && (
                        <span className="text-[10px] text-slate-500 font-mono">({lang.english_name})</span>
                      )}
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#FFB800]" />}
                  </button>
                );
              })}
          </div>

          {onOpenSettings && (
            <div className="pt-1 mt-1 border-t border-[#3A4552] px-2">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenSettings();
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-[10px] text-slate-400 hover:text-white hover:bg-[#0B0C10] rounded-none uppercase transition-none font-mono"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>MANAGE ALL LANGUAGES</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
