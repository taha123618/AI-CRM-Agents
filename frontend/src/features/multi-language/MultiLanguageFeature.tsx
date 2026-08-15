import { useState } from 'react';
import {
  Globe,
  Languages,
  Plus,
  BookOpen,
  Sparkles,
  Shield,
  Download,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useLanguageStore } from './stores/useLanguageStore';
import { useTranslation } from './hooks/useTranslation';
import { useLocaleFormat } from './hooks/useLocaleFormat';
import { LanguageManagerModal } from './components/LanguageManagerModal';
import { TranslationEditorModal } from './components/TranslationEditorModal';
import { languagesApi } from './api/languagesApi';

export function MultiLanguageFeature() {
  const { t, currentLanguage, currentDirection, isRTL } = useTranslation();
  const { formatCurrency, formatDate, formatNumber } = useLocaleFormat();
  const { availableLanguages, setLanguage } = useLanguageStore();

  const [isLangManagerOpen, setIsLangManagerOpen] = useState(false);
  const [editingLangCode, setEditingLangCode] = useState<string | null>(null);

  const activeLang = availableLanguages.find((l) => l.code === currentLanguage) || {
    code: 'en',
    name: 'English',
    english_name: 'English',
    flag_emoji: '🇺🇸',
    direction: 'ltr',
  };

  const handleExportAll = async () => {
    try {
      const data = await languagesApi.exportLanguage(currentLanguage);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `translations-${currentLanguage}.json`;
      a.click();
    } catch (err: any) {
      alert('Export failed: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Globe className="w-6 h-6 text-brand-400" />
            {t('languages.title', 'Multi-Language & Localization Console')}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t('languages.subtitle', 'Manage supported languages, customize translation strings, and configure locale formats')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportAll}>
            <Download className="w-3.5 h-3.5" />
            <span>{t('languages.export_translations', 'Export JSON')}</span>
          </Button>

          <Button size="sm" onClick={() => setIsLangManagerOpen(true)}>
            <Plus className="w-3.5 h-3.5" />
            <span>{t('languages.add_language', 'Manage Languages')}</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {t('languages.active_language', 'Active Language')}
          </span>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-2xl">{activeLang.flag_emoji || '🌐'}</span>
            <div>
              <div className="text-lg font-extrabold text-white">{activeLang.name}</div>
              <div className="text-xs text-slate-400 font-mono">ISO: {activeLang.code}</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {t('languages.direction', 'Text Direction')}
          </span>
          <div className="flex items-center gap-2 pt-1">
            <div className="text-lg font-extrabold text-white uppercase">{currentDirection}</div>
            <Badge variant={isRTL ? 'info' : 'purple'}>
              {isRTL ? 'Right-to-Left (RTL)' : 'Left-to-Right (LTR)'}
            </Badge>
          </div>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Installed Languages
          </span>
          <div className="text-lg font-extrabold text-white pt-1">
            {availableLanguages.length} Locales
          </div>
          <span className="text-xs text-emerald-400 font-medium">
            {availableLanguages.filter((l) => l.is_enabled).length} Enabled for Users
          </span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Fallback Resolution
          </span>
          <div className="flex items-center gap-1.5 text-lg font-extrabold text-brand-400 pt-1">
            <Shield className="w-5 h-5 text-brand-400" />
            <span>English (en)</span>
          </div>
          <span className="text-xs text-slate-400">Zero missing key crashes</span>
        </Card>
      </div>

      {/* Languages Directory Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Languages className="w-4 h-4 text-brand-400" />
            Configured System Languages
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableLanguages.map((lang) => {
            const isCurrent = lang.code === currentLanguage;
            return (
              <Card
                key={lang.code}
                className={`p-5 space-y-4 hover:border-brand-500/50 transition-all flex flex-col justify-between ${
                  isCurrent ? 'border-brand-500/60 ring-1 ring-brand-500/20' : ''
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{lang.flag_emoji || '🌐'}</span>
                      <div>
                        <h4 className="font-bold text-base text-white">{lang.name}</h4>
                        <span className="text-xs text-slate-400">{lang.english_name}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {lang.is_default && (
                        <Badge variant="purple" className="text-[10px]">
                          Default
                        </Badge>
                      )}
                      {lang.direction === 'rtl' && (
                        <Badge variant="info" className="text-[10px]">
                          RTL
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 font-mono flex items-center gap-2">
                    <span>Code: {lang.code}</span>
                    <span>•</span>
                    <span className={lang.is_enabled ? 'text-emerald-400' : 'text-slate-500'}>
                      {lang.is_enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant={isCurrent ? 'secondary' : 'primary'}
                    onClick={() => setLanguage(lang.code)}
                    disabled={isCurrent || !lang.is_enabled}
                  >
                    {isCurrent ? 'Active Language' : 'Switch to this'}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingLangCode(lang.code)}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Translations</span>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Locale Format Preview Card */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-400" />
          Live Locale-Aware Formatting Sandbox ({activeLang.name})
        </h3>
        <p className="text-xs text-slate-400">
          Currencies, numbers, dates, and times automatically adapt based on the active locale selection.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Currency Formatter</span>
            <div className="text-base font-bold text-emerald-400">{formatCurrency(124500.5)}</div>
            <span className="text-[10px] text-slate-500 font-mono">124,500.50 USD</span>
          </div>

          <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Number Formatter</span>
            <div className="text-base font-bold text-brand-300">{formatNumber(9876543)}</div>
            <span className="text-[10px] text-slate-500 font-mono">9,876,543 leads</span>
          </div>

          <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Date Formatter</span>
            <div className="text-base font-bold text-white">{formatDate(new Date())}</div>
            <span className="text-[10px] text-slate-500 font-mono">Short Month, Day, Year</span>
          </div>

          <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Layout Direction</span>
            <div className="text-base font-bold text-amber-400 uppercase">{currentDirection}</div>
            <span className="text-[10px] text-slate-500 font-mono">HTML dir="{currentDirection}"</span>
          </div>
        </div>
      </Card>

      {/* Modals */}
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
    </div>
  );
}
