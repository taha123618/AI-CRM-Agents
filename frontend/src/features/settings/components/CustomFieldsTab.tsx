import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  SlidersHorizontal,
  Plus,
  Trash2,
  Tag,
  Hash,
  ListFilter,
  ToggleLeft,
  Calendar,
  DollarSign,
  Type,
} from 'lucide-react';
import { settingsApi } from '../api';
import { CustomFieldDefinition } from '../types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export function CustomFieldsTab() {
  const queryClient = useQueryClient();
  const [activeEntity, setActiveEntity] = useState<string>('contact');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [fieldKey, setFieldKey] = useState('');
  const [fieldType, setFieldType] = useState<'text' | 'number' | 'select' | 'boolean' | 'date' | 'currency'>('text');
  const [isRequired, setIsRequired] = useState(false);
  const [optionInput, setOptionInput] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: fields, isLoading } = useQuery({
    queryKey: ['custom-fields-list', activeEntity],
    queryFn: () => settingsApi.getCustomFields(activeEntity),
  });

  const createMutation = useMutation({
    mutationFn: settingsApi.createCustomField,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-fields-list', activeEntity] });
      setIsModalOpen(false);
      setName('');
      setFieldKey('');
      setFieldType('text');
      setOptions([]);
      setIsRequired(false);
      setFormError(null);
    },
    onError: (err: any) => {
      setFormError(err?.response?.data?.detail || err?.message || 'Failed to create field.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: settingsApi.deleteCustomField,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-fields-list', activeEntity] });
    },
  });

  const handleAddOption = () => {
    if (optionInput.trim() && !options.includes(optionInput.trim())) {
      setOptions([...options, optionInput.trim()]);
      setOptionInput('');
    }
  };

  const handleRemoveOption = (opt: string) => {
    setOptions(options.filter((o) => o !== opt));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Field display name is required.');
      return;
    }
    if (fieldType === 'select' && options.length === 0) {
      setFormError('Select fields must have at least one dropdown option.');
      return;
    }
    createMutation.mutate({
      entity_type: activeEntity,
      name: name.trim(),
      field_key: fieldKey.trim() || undefined,
      field_type: fieldType,
      options: fieldType === 'select' ? options : [],
      is_required: isRequired,
    });
  };

  const getFieldTypeIcon = (type: string) => {
    switch (type) {
      case 'number':
        return <Hash className="w-3.5 h-3.5 text-blue-400" />;
      case 'select':
        return <ListFilter className="w-3.5 h-3.5 text-purple-400" />;
      case 'boolean':
        return <ToggleLeft className="w-3.5 h-3.5 text-emerald-400" />;
      case 'date':
        return <Calendar className="w-3.5 h-3.5 text-amber-400" />;
      case 'currency':
        return <DollarSign className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Type className="w-3.5 h-3.5 text-brand-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-brand-400" />
            <h2 className="text-lg font-bold text-white">Dynamic Custom Fields &amp; Metadata Schema</h2>
            <Badge variant="purple" className="text-[10px]">
              No-Code ETL
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Extend Contacts, Deals, Customers, and Companies with custom attributes without manual PostgreSQL migrations.
          </p>
        </div>

        <Button size="sm" variant="orange" onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5">
          <Plus className="w-4 h-4" />
          <span>Add Custom Field</span>
        </Button>
      </div>

      {/* Entity Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
        {[
          { id: 'contact', label: 'Contacts & Leads' },
          { id: 'deal', label: 'Deals & Opportunities' },
          { id: 'customer', label: 'Customers' },
          { id: 'company', label: 'Companies' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveEntity(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeEntity === tab.id
                ? 'bg-slate-800 text-white border border-brand-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Fields List */}
      {isLoading ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : fields && fields.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fields.map((f: CustomFieldDefinition) => (
            <div
              key={f.id}
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300">
                    {getFieldTypeIcon(f.field_type)}
                    <span className="capitalize">{f.field_type}</span>
                  </div>

                  {f.is_required && (
                    <Badge variant="danger" className="text-[9px] font-mono py-0">
                      Required
                    </Badge>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white">{f.name}</h3>
                <p className="text-[11px] font-mono text-brand-400/80 mt-0.5">key: {f.field_key}</p>

                {f.options && f.options.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {f.options.map((opt, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-950 text-[10px] text-slate-400 border border-slate-800"
                      >
                        {opt}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">Entity: {f.entity_type}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteMutation.mutate(f.id)}
                  disabled={deleteMutation.isPending}
                  className="h-7 px-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 rounded-2xl bg-slate-900/40 border border-slate-800/60 p-6 space-y-2">
          <Tag className="w-8 h-8 mx-auto text-slate-600 mb-1" />
          <p className="text-sm font-semibold text-slate-300">No custom fields for {activeEntity}s yet</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click &quot;Add Custom Field&quot; to define custom properties and start capturing dynamic attributes.
          </p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-brand-400" />
                Add Dynamic Custom Field
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Entity</label>
                <select
                  value={activeEntity}
                  onChange={(e) => setActiveEntity(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500 capitalize"
                >
                  <option value="contact">Contacts &amp; Leads</option>
                  <option value="deal">Deals &amp; Opportunities</option>
                  <option value="customer">Customers</option>
                  <option value="company">Companies</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Field Label *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Security Clearance Tier"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Field Key (Optional snake_case)</label>
                <input
                  type="text"
                  placeholder="e.g. security_clearance_tier"
                  value={fieldKey}
                  onChange={(e) => setFieldKey(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Data Type</label>
                <select
                  value={fieldType}
                  onChange={(e) => setFieldType(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="text">Text (String)</option>
                  <option value="number">Number (Integer / Decimal)</option>
                  <option value="select">Dropdown Select (Predefined Options)</option>
                  <option value="boolean">Boolean (Yes / No Toggle)</option>
                  <option value="date">Date Picker</option>
                  <option value="currency">Currency ($ USD)</option>
                </select>
              </div>

              {fieldType === 'select' && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">Dropdown Options *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add an option (e.g. SOC-2 Type II)"
                      value={optionInput}
                      onChange={(e) => setOptionInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddOption();
                        }
                      }}
                      className="flex-1 px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
                    />
                    <Button type="button" size="sm" variant="secondary" onClick={handleAddOption}>
                      Add
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {options.map((opt) => (
                      <span
                        key={opt}
                        className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center gap-1.5"
                      >
                        <span>{opt}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(opt)}
                          className="text-slate-500 hover:text-rose-400 text-xs"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_required"
                  checked={isRequired}
                  onChange={(e) => setIsRequired(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-brand-500 focus:ring-0"
                />
                <label htmlFor="is_required" className="text-xs text-slate-300 cursor-pointer">
                  Mandatory Required Field
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="orange" size="sm" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Saving...' : 'Save Field'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
