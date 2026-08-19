import { useState, useEffect } from 'react';
import {
  Search,
  Download,
  Upload,
  Check,
  Save,
  Filter,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
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
    const englishNsKeys = (DEFAULT_ENGLISH_TRANSLATIONS as any)[ns] || {};
    const currentNsKeys = editingValues[ns] || {};
    const allKeys = Array.from(new Set([...Object.keys(englishNsKeys), ...Object.keys(currentNsKeys)]));

    allKeys.forEach((k) => {
      const fallback = englishNsKeys[k] || '';
      const current = currentNsKeys[k] !== undefined ? currentNsKeys[k] : fallback;

      if (
        !searchQuery ||
        k.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fallback.toLowerCase().includes(searchQuery.toLowerCase()) ||
        current.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        translationRows.push({
          namespace: ns,
          key: k,
          englishFallback: fallback,
          currentValue: current,
        });
      }
    });
  });

  const handleValueChange = (ns: string, key: string, val: string) => {
    setEditingValues((prev) => ({
      ...prev,
      [ns]: {
        ...(prev[ns] || {}),
        [key]: val,
      },
    }));
  };

  const handleSaveRow = async (ns: string, key: string) => {
    const value = editingValues[ns]?.[key] || '';
    try {
      await languagesApi.updateSingleTranslation(languageCode, ns, key, value);

      updateTranslationInMemory(languageCode, ns, key, value);
      setSaveSuccessMap((prev) => ({ ...prev, [`${ns}.${key}`]: true }));
      setTimeout(() => {
        setSaveSuccessMap((prev) => ({ ...prev, [`${ns}.${key}`]: false }));
      }, 2000);
    } catch (err: any) {
      alert(err?.response?.data?.detail || err.message || 'Failed to save translation');
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await languagesApi.bulkUpsertTranslations(languageCode, editingValues);
      for (const row of translationRows) {
        const value = editingValues[row.namespace]?.[row.key];
        if (value !== undefined) {
          updateTranslationInMemory(languageCode, row.namespace, row.key, value);
        }
      }
      alert(`All ${translationRows.length} translation strings saved successfully!`);
    } catch (err: any) {
      alert(err?.response?.data?.detail || err.message || 'Failed to batch save translations');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(editingValues, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `translations_${languageCode}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        setEditingValues(parsed);
        alert('Translation file imported into editor memory. Click "Save All Translations" to persist.');
      } catch {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`TRANSLATION DICTIONARY EDITOR: ${targetLang.name.toUpperCase()} (${languageCode.toUpperCase()})`}
      description="MODIFY LOCALIZED UI STRINGS, OVERRIDE LABELS, AND SYNCHRONIZE I18N STRINGS IN REAL-TIME."
      className="max-w-5xl font-mono"
    >
      <div className="space-y-3 font-mono">
        {/* Actions & Filters Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-3 bg-background border border-border rounded-none">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-muted-foreground/60 absolute left-3 top-2" />
              <input
                type="text"
                placeholder="SEARCH TRANSLATION KEYS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-card border border-border rounded-none pl-8 pr-3 py-1 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary uppercase font-mono"
              />
            </div>

            {/* Namespace Filter */}
            <div className="flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-muted-foreground/60" />
              <select
                value={activeNamespace}
                onChange={(e) => setActiveNamespace(e.target.value)}
                className="bg-card border border-border text-xs text-foreground rounded-none px-2 py-1 focus:outline-none focus:border-primary uppercase font-mono"
              >
                {namespaces.map((ns) => (
                  <option key={ns} value={ns} className="bg-background">
                    {ns.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold uppercase rounded-none bg-card hover:bg-popover text-foreground border border-border transition-none h-7">
              <Upload className="w-3 h-3 text-cyan-400" />
              <span>IMPORT JSON</span>
              <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
            </label>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportJson}
              className="text-xs h-7 uppercase flex items-center gap-1"
            >
              <Download className="w-3 h-3 text-primary" />
              <span>EXPORT</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveAll}
              isLoading={isSaving}
              className="text-xs h-7 uppercase flex items-center gap-1"
            >
              <Save className="w-3 h-3 text-primary-foreground" />
              <span>SAVE ALL</span>
            </Button>
          </div>
        </div>

        {/* Translation Keys Table */}
        <div className="border border-border rounded-none overflow-hidden max-h-[480px] overflow-y-auto">
          <table className="w-full text-left border-collapse font-mono">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-border bg-background text-[10px] uppercase font-bold text-muted-foreground">
                <th className="py-2 px-3 w-1/4">NAMESPACE &amp; KEY</th>
                <th className="py-2 px-3 w-1/3">ENGLISH FALLBACK</th>
                <th className="py-2 px-3 w-1/3">LOCALIZED TRANSLATION</th>
                <th className="py-2 px-3 text-right w-16">SAVE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3A4552] text-xs">
              {translationRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted-foreground/60 uppercase">
                    NO TRANSLATION KEYS FOUND FOR CURRENT QUERY.
                  </td>
                </tr>
              ) : (
                translationRows.map((row) => {
                  const rowId = `${row.namespace}.${row.key}`;
                  const isSaved = saveSuccessMap[rowId];
                  return (
                    <tr key={rowId} className="hover:bg-background transition-none">
                      <td className="py-2 px-3 font-mono space-y-0.5">
                        <Badge variant="default" className="text-[8px] uppercase font-mono px-1 py-0.2">
                          {row.namespace}
                        </Badge>
                        <span className="block text-[11px] text-primary font-bold truncate" title={row.key}>
                          {row.key}
                        </span>
                      </td>

                      <td className="py-2 px-3 text-muted-foreground text-xs">
                        <span className="line-clamp-2" title={row.englishFallback}>
                          {row.englishFallback || '—'}
                        </span>
                      </td>

                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={editingValues[row.namespace]?.[row.key] || ''}
                          onChange={(e) => handleValueChange(row.namespace, row.key, e.target.value)}
                          placeholder={row.englishFallback}
                          className="w-full bg-background border border-border rounded-none px-2 py-1 text-xs text-white focus:outline-none focus:border-primary font-mono"
                        />
                      </td>

                      <td className="py-2 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleSaveRow(row.namespace, row.key)}
                          className={`p-1 rounded-none border transition-none ${isSaved
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-card text-muted-foreground border-border hover:text-white hover:border-primary'
                            }`}
                          title="Save Key"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-[10px] text-muted-foreground/60 uppercase font-mono">
            {translationRows.length} STRINGS DISPLAYED • ALL EDITS IMMEDIATELY BROADCAST VIA REACT STATE
          </span>
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs uppercase">
            CLOSE EDITOR
          </Button>
        </div>
      </div>
    </Modal>
  );
}
