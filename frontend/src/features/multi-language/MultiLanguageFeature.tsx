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
    <div className="space-y-4 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card p-4 border border-border">
        <div>
          <h1 className="text-base font-black text-foreground uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            <span>{t('languages.title', 'MULTI-LANGUAGE & LOCALIZATION CONSOLE')}</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 uppercase">
            {t('languages.subtitle', 'MANAGE SUPPORTED LANGUAGES, CUSTOMIZE TRANSLATION STRINGS, AND CONFIGURE LOCALE FORMATS')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportAll} className="text-xs h-7">
            <Download className="w-3.5 h-3.5 mr-1" />
            <span>{t('languages.export_translations', 'EXPORT JSON')}</span>
          </Button>

          <Button size="sm" variant="primary" onClick={() => setIsLangManagerOpen(true)} className="text-xs h-7">
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>{t('languages.add_language', 'MANAGE LOCALES')}</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-3 bg-card border-border space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            {t('languages.active_language', 'ACTIVE LOCALE')}
          </span>
          <div className="flex items-center gap-2 pt-0.5">
            <span className="text-2xl">{activeLang.flag_emoji || '🌐'}</span>
            <div>
              <div className="text-sm font-black text-foreground uppercase">{activeLang.name}</div>
              <div className="text-[10px] text-muted-foreground font-mono uppercase">ISO: {activeLang.code}</div>
            </div>
          </div>
        </Card>

        <Card className="p-3 bg-card border-border space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            {t('languages.direction', 'TEXT DIRECTION')}
          </span>
          <div className="flex items-center gap-2 pt-0.5">
            <div className="text-sm font-black text-foreground uppercase">{currentDirection}</div>
            <Badge variant={isRTL ? 'info' : 'purple'} className="text-[8px] font-mono">
              {isRTL ? 'RIGHT-TO-LEFT (RTL)' : 'LEFT-TO-RIGHT (LTR)'}
            </Badge>
          </div>
        </Card>

        <Card className="p-3 bg-card border-border space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            INSTALLED LOCALES
          </span>
          <div className="text-sm font-black text-foreground pt-0.5 font-mono">
            {availableLanguages.length} LOCALES
          </div>
          <span className="text-[10px] text-primary font-bold uppercase">
            {availableLanguages.filter((l) => l.is_enabled).length} ENABLED FOR USERS
          </span>
        </Card>

        <Card className="p-3 bg-card border-border space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            FALLBACK RESOLUTION
          </span>
          <div className="flex items-center gap-1.5 text-sm font-black text-primary pt-0.5 uppercase">
            <Shield className="w-4 h-4 text-primary" />
            <span>ENGLISH (EN)</span>
          </div>
          <span className="text-[10px] text-muted-foreground uppercase">ZERO MISSING KEY CRASHES</span>
        </Card>
      </div>

      {/* Languages Directory Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-foreground uppercase flex items-center gap-2">
            <Languages className="w-3.5 h-3.5 text-primary" />
            CONFIGURED SYSTEM LANGUAGES
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {availableLanguages.map((lang) => {
            const isCurrent = lang.code === currentLanguage;
            return (
              <Card
                key={lang.code}
                className={`p-4 bg-card border-border space-y-3 hover:border-primary transition-none flex flex-col justify-between ${isCurrent ? 'border-primary' : ''
                  }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{lang.flag_emoji || '🌐'}</span>
                      <div>
                        <h4 className="font-bold text-xs text-foreground uppercase">{lang.name}</h4>
                        <span className="text-[10px] text-muted-foreground uppercase">{lang.english_name}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {lang.is_default && (
                        <Badge variant="purple" className="text-[8px]">
                          DEFAULT
                        </Badge>
                      )}
                      {lang.direction === 'rtl' && (
                        <Badge variant="info" className="text-[8px]">
                          RTL
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="text-[10px] text-foreground font-mono flex items-center gap-2">
                    <span>CODE: {lang.code}</span>
                    <span>•</span>
                    <span className={lang.is_enabled ? 'text-primary font-bold' : 'text-muted-foreground'}>
                      {lang.is_enabled ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant={isCurrent ? 'outline' : 'primary'}
                    onClick={() => setLanguage(lang.code)}
                    disabled={isCurrent || !lang.is_enabled}
                    className="text-xs h-7"
                  >
                    {isCurrent ? 'ACTIVE LOCALE' : 'SWITCH TO THIS'}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingLangCode(lang.code)}
                    className="text-xs h-7"
                  >
                    <BookOpen className="w-3.5 h-3.5 mr-1" />
                    <span>TRANSLATIONS</span>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Locale Format Preview Card */}
      <Card className="p-4 bg-card border-border space-y-3 font-mono">
        <h3 className="text-xs font-bold text-foreground uppercase flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          LOCALE-AWARE FORMATTING SANDBOX ({activeLang.name.toUpperCase()})
        </h3>
        <p className="text-[10px] text-muted-foreground uppercase">
          CURRENCIES, NUMBERS, DATES, AND TIMES AUTOMATICALLY ADAPT BASED ON THE ACTIVE LOCALE SELECTION.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          <div className="p-2.5 bg-background rounded-none border border-border space-y-0.5">
            <span className="text-[9px] uppercase font-bold text-muted-foreground block">CURRENCY FORMATTER</span>
            <div className="text-sm font-black text-primary">{formatCurrency(124500.5)}</div>
            <span className="text-[9px] text-muted-foreground font-mono">124,500.50 USD</span>
          </div>

          <div className="p-2.5 bg-background rounded-none border border-border space-y-0.5">
            <span className="text-[9px] uppercase font-bold text-muted-foreground block">NUMBER FORMATTER</span>
            <div className="text-sm font-black text-cyan-400">{formatNumber(9876543)}</div>
            <span className="text-[9px] text-muted-foreground font-mono">9,876,543 LEADS</span>
          </div>

          <div className="p-2.5 bg-background rounded-none border border-border space-y-0.5">
            <span className="text-[9px] uppercase font-bold text-muted-foreground block">DATE FORMATTER</span>
            <div className="text-sm font-black text-foreground">{formatDate(new Date())}</div>
            <span className="text-[9px] text-muted-foreground font-mono">SHORT MONTH, DAY, YEAR</span>
          </div>

          <div className="p-2.5 bg-background rounded-none border border-border space-y-0.5">
            <span className="text-[9px] uppercase font-bold text-muted-foreground block">LAYOUT DIRECTION</span>
            <div className="text-sm font-black text-primary uppercase">{currentDirection}</div>
            <span className="text-[9px] text-muted-foreground font-mono">HTML DIR=&ldquo;{currentDirection}&rdquo;</span>
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
