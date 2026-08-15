import { useState } from 'react';
import { Globe, Plus, Trash2, CheckCircle2, Shield } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useLanguageStore } from '../stores/useLanguageStore';
import { languagesApi } from '../api/languagesApi';
import { Language } from '../types/language.types';

interface LanguageManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTranslationEditor?: (code: string) => void;
}

export function LanguageManagerModal({
  isOpen,
  onClose,
  onOpenTranslationEditor,
}: LanguageManagerModalProps) {
  const { availableLanguages, currentLanguage, setLanguage, fetchLanguages } = useLanguageStore();

  const [isAdding, setIsAdding] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newEnglishName, setNewEnglishName] = useState('');
  const [newDirection, setNewDirection] = useState<'ltr' | 'rtl'>('ltr');
  const [newFlag, setNewFlag] = useState('🌐');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCreateLanguage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newName) {
      setErrorMsg('Code and Native Name are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const createdCode = newCode.toLowerCase().trim();
      await languagesApi.createLanguage({
        code: createdCode,
        name: newName.trim(),
        english_name: newEnglishName.trim() || newName.trim(),
        direction: newDirection,
        flag_emoji: newFlag.trim() || '🌐',
        is_default: false,
        is_enabled: true,
      });

      await fetchLanguages();
      await useLanguageStore.getState().fetchTranslationsForLanguage(createdCode);
      setIsAdding(false);
      setNewCode('');
      setNewName('');
      setNewEnglishName('');
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail || err.message || 'Failed to create language');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleEnable = async (lang: Language) => {
    try {
      await languagesApi.updateLanguage(lang.code, { is_enabled: !lang.is_enabled });
      await fetchLanguages();
    } catch (err: any) {
      alert(err?.response?.data?.detail || err.message || 'Failed to update language');
    }
  };

  const handleSetDefault = async (lang: Language) => {
    try {
      await languagesApi.updateLanguage(lang.code, { is_default: true, is_enabled: true });
      await fetchLanguages();
    } catch (err: any) {
      alert(err?.response?.data?.detail || err.message || 'Failed to set default language');
    }
  };

  const handleDeleteLanguage = async (code: string) => {
    if (!confirm(`Are you sure you want to delete language '${code}' and all its translations?`)) {
      return;
    }
    try {
      await languagesApi.deleteLanguage(code);
      if (currentLanguage === code) {
        setLanguage('en');
      }
      await fetchLanguages();
    } catch (err: any) {
      alert(err?.response?.data?.detail || err.message || 'Failed to delete language');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Language & Localization Configuration"
      description="Manage supported system languages, text direction, default fallback, and dictionary keys."
      className="max-w-3xl"
    >
      <div className="space-y-6">
        {/* Header Action */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <Globe className="w-4 h-4 text-brand-400" />
            <span>{availableLanguages.length} Languages Installed</span>
          </div>

          <Button
            size="sm"
            onClick={() => setIsAdding(!isAdding)}
            variant={isAdding ? 'secondary' : 'primary'}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAdding ? 'Cancel Adding' : 'Add New Language'}</span>
          </Button>
        </div>

        {/* Add Language Form */}
        {isAdding && (
          <form
            onSubmit={handleCreateLanguage}
            className="p-4 rounded-2xl bg-slate-900 border border-brand-500/30 space-y-4 animate-in fade-in duration-150"
          >
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Register New Language
            </h4>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Language Code (e.g. it, pt, ru) *
                </label>
                <Input
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="e.g. it"
                  maxLength={10}
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Native Name *
                </label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Italiano"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  English Name
                </label>
                <Input
                  value={newEnglishName}
                  onChange={(e) => setNewEnglishName(e.target.value)}
                  placeholder="e.g. Italian"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Text Direction
                </label>
                <Select
                  value={newDirection}
                  onChange={(e) => setNewDirection(e.target.value as 'ltr' | 'rtl')}
                  options={[
                    { value: 'ltr', label: 'Left to Right (LTR)' },
                    { value: 'rtl', label: 'Right to Left (RTL)' },
                  ]}
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Flag Emoji
                </label>
                <Input
                  value={newFlag}
                  onChange={(e) => setNewFlag(e.target.value)}
                  placeholder="e.g. 🇮🇹"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={isSubmitting}>
                Save Language
              </Button>
            </div>
          </form>
        )}

        {/* Languages Table / List */}
        <div className="space-y-3">
          {availableLanguages.map((lang) => {
            const isCurrent = lang.code === currentLanguage;
            return (
              <div
                key={lang.code}
                className={`p-4 rounded-2xl bg-slate-900/90 border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${isCurrent ? 'border-brand-500/60 shadow-lg shadow-brand-500/5' : 'border-slate-800'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{lang.flag_emoji || '🌐'}</span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-white">{lang.name}</h4>
                      <span className="text-xs text-slate-400 font-mono">({lang.code})</span>
                      {lang.is_default && (
                        <Badge variant="purple" className="flex items-center gap-1">
                          <Shield className="w-3 h-3 text-brand-400" /> Default Fallback
                        </Badge>
                      )}
                      {lang.direction === 'rtl' && (
                        <Badge variant="info">RTL</Badge>
                      )}
                      {isCurrent && (
                        <Badge variant="success" className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">{lang.english_name}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {onOpenTranslationEditor && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        onClose();
                        onOpenTranslationEditor(lang.code);
                      }}
                    >
                      Translations
                    </Button>
                  )}

                  {!lang.is_default && (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleSetDefault(lang)}
                        title="Set this language as system default fallback"
                      >
                        Set Default
                      </Button>

                      <Button
                        size="sm"
                        variant={lang.is_enabled ? 'ghost' : 'outline'}
                        onClick={() => handleToggleEnable(lang)}
                        className={lang.is_enabled ? 'text-amber-400 hover:text-amber-300' : 'text-emerald-400 hover:text-emerald-300'}
                      >
                        {lang.is_enabled ? 'Disable' : 'Enable'}
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteLanguage(lang.code)}
                        className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 p-2"
                        title="Delete language"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-800">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
