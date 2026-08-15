import { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  Download,
  Upload,
  Check,
  Save,
  Filter,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useLanguageStore } from '../stores/useLanguageStore';
import { languagesApi } from '../api/languagesApi';
import { DEFAULT_ENGLISH_TRANSLATIONS } from '../constants/defaultTranslations';

interface TranslationEditorModalProps {
  isOpen: boolean;
  languageCode: string;
  onClose: () => void;
}

export function TranslationEditorModal({
  isOpen,
  languageCode,
  onClose,
}: TranslationEditorModalProps) {
  const { availableLanguages, translations, updateTranslationInMemory, fetchTranslationsForLanguage } = useLanguageStore();

  const [activeNamespace, setActiveNamespace] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [editingValues, setEditingValues] = useState<Record<string, Record<string, string>>>({});
  const [saveSuccessMap, setSaveSuccessMap] = useState<Record<string, boolean>>({});

  const targetLang = availableLanguages.find((l) => l.code === languageCode) || {
    code: languageCode,
    name: languageCode,
    flag_emoji: '🌐',
  };

  useEffect(() => {
    if (isOpen && languageCode) {
      fetchTranslationsForLanguage(languageCode);
    }
  }, [isOpen, languageCode, fetchTranslationsForLanguage]);

  useEffect(() => {
    const currentData = translations[languageCode] || {};
    setEditingValues(JSON.parse(JSON.stringify(currentData)));
  }, [translations, languageCode]);

  const namespaces = [
    'all',
    'common',
    'nav',
    'dashboard',
    'leads',
    'deals',
    'customers',
    'emails',
    'meetings',
    'analytics',
    'reports',
    'agents',
    'languages',
  ];

  // Collect all known keys across default English and current translations
  const allNamespacesToRender =
    activeNamespace === 'all' ? namespaces.filter((n) => n !== 'all') : [activeNamespace];

  const translationRows: Array<{
    namespace: string;
    key: string;
    englishFallback: string;
    currentValue: string;
  }> = [];

  allNamespacesToRender.forEach((ns) => {
    const defaultNs = DEFAULT_ENGLISH_TRANSLATIONS[ns] || {};
    const currentNs = editingValues[ns] || {};
    const allKeys = Array.from(new Set([...Object.keys(defaultNs), ...Object.keys(currentNs)]));

    allKeys.forEach((key) => {
      const fallbackVal = defaultNs[key] || '';
      const currentVal = currentNs[key] !== undefined ? currentNs[key] : fallbackVal;

      if (
        !searchQuery ||
        key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        currentVal.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fallbackVal.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        translationRows.push({
          namespace: ns,
          key,
          englishFallback: fallbackVal,
          currentValue: currentVal,
        });
      }
    });
  });

  const handleInputChange = (ns: string, key: string, value: string) => {
    setEditingValues((prev) => ({
      ...prev,
      [ns]: {
        ...(prev[ns] || {}),
        [key]: value,
      },
    }));
  };

  const handleSaveSingleKey = async (ns: string, key: string) => {
    const val = editingValues[ns]?.[key] ?? '';
    const rowKey = `${ns}:${key}`;
    try {
      await languagesApi.updateSingleTranslation(languageCode, ns, key, val);
      updateTranslationInMemory(languageCode, ns, key, val);
      setSaveSuccessMap((prev) => ({ ...prev, [rowKey]: true }));
      setTimeout(() => {
        setSaveSuccessMap((prev) => ({ ...prev, [rowKey]: false }));
      }, 2000);
    } catch (err: any) {
      alert(err?.response?.data?.detail || err.message || 'Failed to update key');
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await languagesApi.bulkUpsertTranslations(languageCode, editingValues);
      await fetchTranslationsForLanguage(languageCode);
      alert('All translations saved successfully!');
    } catch (err: any) {
      alert(err?.response?.data?.detail || err.message || 'Failed to save translations');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportJSON = async () => {
    try {
      const data = await languagesApi.exportLanguage(languageCode);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `translations-${languageCode}.json`;
      a.click();
    } catch (err: any) {
      alert('Failed to export JSON: ' + err.message);
    }
  };

  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      await languagesApi.importLanguage(languageCode, payload);
      await fetchTranslationsForLanguage(languageCode);
      alert('Translations imported successfully!');
    } catch (err: any) {
      alert('Import failed: ' + err.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Translations — ${targetLang.flag_emoji} ${targetLang.name} (${languageCode})`}
      description="Update translated text strings with live preview and automatic English fallback."
      className="max-w-4xl"
    >
      <div className="space-y-4">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-slate-900 rounded-2xl border border-slate-800">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search translation keys or values..."
              className="pl-8 text-xs py-1.5 h-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="cursor-pointer">
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
              <Button size="sm" variant="outline" type="button">
                <Upload className="w-3.5 h-3.5" />
                <span>Import JSON</span>
              </Button>
            </label>

            <Button size="sm" variant="outline" onClick={handleExportJSON}>
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </Button>

            <Button size="sm" onClick={handleSaveAll} isLoading={isSaving}>
              <Save className="w-3.5 h-3.5" />
              <span>Save All</span>
            </Button>
          </div>
        </div>

        {/* Namespaces Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
          {namespaces.map((ns) => (
            <button
              key={ns}
              onClick={() => setActiveNamespace(ns)}
              className={`px-3 py-1 rounded-xl capitalize font-medium whitespace-nowrap transition-all ${
                activeNamespace === ns
                  ? 'bg-brand-600 text-white shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {ns}
            </button>
          ))}
        </div>

        {/* Translation Rows List */}
        <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
          {translationRows.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No matching translation keys found.
            </div>
          ) : (
            translationRows.map((row) => {
              const rowKey = `${row.namespace}:${row.key}`;
              const isSaved = saveSuccessMap[rowKey];
              const isCustomized = row.currentValue !== row.englishFallback;

              return (
                <div
                  key={rowKey}
                  className="p-3 bg-slate-900/80 hover:bg-slate-900 rounded-xl border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="info" className="text-[10px]">
                        {row.namespace}
                      </Badge>
                      <span className="font-mono text-xs font-bold text-slate-200">
                        {row.key}
                      </span>
                    </div>

                    {isCustomized ? (
                      <span className="text-[10px] text-emerald-400 font-medium">Localized</span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono">English Fallback</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {/* Fallback Reference */}
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-xs text-slate-400">
                      <span className="text-[9px] uppercase font-bold text-slate-500 block mb-0.5">
                        English Default Reference
                      </span>
                      <span>{row.englishFallback}</span>
                    </div>

                    {/* Target Translation Input */}
                    <div className="flex items-center gap-2">
                      <Input
                        value={row.currentValue}
                        onChange={(e) => handleInputChange(row.namespace, row.key, e.target.value)}
                        placeholder={`Translate in ${targetLang.name}...`}
                        className="text-xs h-9"
                      />
                      <Button
                        size="sm"
                        variant={isSaved ? 'primary' : 'secondary'}
                        onClick={() => handleSaveSingleKey(row.namespace, row.key)}
                        className="shrink-0 h-9 px-3"
                      >
                        {isSaved ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <span className="text-xs text-slate-500 font-mono">
            {translationRows.length} Translation Keys Available
          </span>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
