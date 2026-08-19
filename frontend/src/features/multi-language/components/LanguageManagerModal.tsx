import { useState } from 'react';
import { Globe, Plus, Trash2 } from 'lucide-react';
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

  const handleDelete = async (code: string) => {
    if (code === 'en') {
      alert('Cannot delete English (system primary language).');
      return;
    }
    if (!confirm(`Are you sure you want to remove locale "${code}"?`)) return;

    try {
      await languagesApi.deleteLanguage(code);
      await fetchLanguages();
    } catch (err: any) {
      alert(err?.response?.data?.detail || err.message || 'Failed to delete language');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="MULTI-LANGUAGE (I18N) REGISTRY"
      description="MANAGE PLATFORM LOCALES, ENABLE RTL LAYOUT TRANSFORMS, AND REGISTER NEW LANGUAGES."
      className="max-w-4xl font-mono"
    >
      <div className="space-y-3 font-mono">
        {errorMsg && (
          <div className="p-2.5 rounded-none bg-background border border-destructive text-xs text-destructive uppercase font-mono">
            {errorMsg}
          </div>
        )}

        {/* Action Bar */}
        <div className="flex items-center justify-between p-3 bg-background border border-border rounded-none">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              CONFIGURED LOCALES ({availableLanguages.length})
            </span>
          </div>

          {!isAdding && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAdding(true)}
              className="text-xs h-7 uppercase flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>REGISTER LOCALE</span>
            </Button>
          )}
        </div>

        {/* Add Language Form */}
        {isAdding && (
          <form
            onSubmit={handleCreateLanguage}
            className="p-4 rounded-none bg-background border border-border space-y-3 animate-in fade-in"
          >
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-xs font-bold text-white uppercase">ADD NEW LOCALE</span>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-muted-foreground hover:text-white text-xs"
              >
                CANCEL
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <Input
                label="ISO 639-1 CODE"
                placeholder="E.G. ES, FR, DE, JA"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                required
              />
              <Input
                label="NATIVE DISPLAY NAME"
                placeholder="E.G. ESPAÑOL"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
              <Input
                label="ENGLISH NAME"
                placeholder="E.G. SPANISH"
                value={newEnglishName}
                onChange={(e) => setNewEnglishName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Select
                label="TEXT DIRECTION"
                options={[
                  { value: 'ltr', label: 'LEFT-TO-RIGHT (LTR)' },
                  { value: 'rtl', label: 'RIGHT-TO-LEFT (RTL)' },
                ]}
                value={newDirection}
                onChange={(e) => setNewDirection(e.target.value as 'ltr' | 'rtl')}
              />
              <Input
                label="FLAG EMOJI"
                placeholder="E.G. 🇪🇸"
                value={newFlag}
                onChange={(e) => setNewFlag(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAdding(false)} className="text-xs uppercase">
                CANCEL
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting} className="text-xs uppercase">
                SAVE LOCALE
              </Button>
            </div>
          </form>
        )}

        {/* Languages Table */}
        <div className="border border-border rounded-none overflow-hidden max-h-[440px] overflow-y-auto">
          <table className="w-full text-left border-collapse font-mono">
            <thead>
              <tr className="border-b border-border bg-background text-[10px] uppercase font-bold text-muted-foreground">
                <th className="py-2.5 px-3">LOCALE</th>
                <th className="py-2.5 px-3">DIRECTION</th>
                <th className="py-2.5 px-3">STATUS</th>
                <th className="py-2.5 px-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3A4552] text-xs">
              {availableLanguages.map((lang) => {
                const isCurrent = lang.code === currentLanguage;
                return (
                  <tr key={lang.code} className="hover:bg-background transition-none">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{lang.flag_emoji}</span>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5 uppercase">
                            <span>{lang.name}</span>
                            <span className="text-[10px] text-muted-foreground/60 font-mono">({lang.code})</span>
                            {lang.is_default && (
                              <Badge variant="success" className="text-[8px] uppercase font-mono">
                                PRIMARY
                              </Badge>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground uppercase font-mono">{lang.english_name}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <Badge variant={lang.direction === 'rtl' ? 'purple' : 'default'} className="text-[9px] uppercase font-mono">
                        {lang.direction.toUpperCase()}
                      </Badge>
                    </td>

                    <td className="py-2.5 px-3">
                      <button
                        type="button"
                        onClick={() => handleToggleEnable(lang)}
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-none border transition-none ${lang.is_enabled
                            ? 'bg-background text-primary border-primary'
                            : 'bg-background text-muted-foreground/60 border-border'
                          }`}
                      >
                        {lang.is_enabled ? 'ENABLED' : 'DISABLED'}
                      </button>
                    </td>

                    <td className="py-2.5 px-3 text-right space-x-1.5">
                      {!isCurrent && (
                        <button
                          type="button"
                          onClick={() => setLanguage(lang.code)}
                          className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-none bg-card text-foreground/80 hover:text-white border border-border hover:border-primary transition-none"
                        >
                          SWITCH
                        </button>
                      )}

                      {onOpenTranslationEditor && (
                        <button
                          type="button"
                          onClick={() => onOpenTranslationEditor(lang.code)}
                          className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-none bg-card text-cyan-400 hover:text-cyan-300 border border-border hover:border-cyan-400 transition-none"
                        >
                          DICTIONARY
                        </button>
                      )}

                      {!lang.is_default && (
                        <button
                          type="button"
                          onClick={() => handleSetDefault(lang)}
                          className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-none bg-card text-primary border border-border hover:border-primary transition-none"
                          title="Set as System Default"
                        >
                          DEFAULT
                        </button>
                      )}

                      {lang.code !== 'en' && (
                        <button
                          type="button"
                          onClick={() => handleDelete(lang.code)}
                          className="p-1 rounded-none text-muted-foreground/60 hover:text-destructive transition-none"
                          title="Delete Locale"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-[10px] text-muted-foreground/60 uppercase font-mono">
            RTL LOCALES AUTOMATICALLY MIRROR THE ENTIRE APPLICATION DOM TREE
          </span>
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs uppercase">
            CLOSE
          </Button>
        </div>
      </div>
    </Modal>
  );
}
