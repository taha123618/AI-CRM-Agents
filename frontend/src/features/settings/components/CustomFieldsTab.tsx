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
        return <Hash className="w-3.5 h-3.5 text-cyan-400" />;
      case 'select':
        return <ListFilter className="w-3.5 h-3.5 text-purple-400" />;
      case 'boolean':
        return <ToggleLeft className="w-3.5 h-3.5 text-[#39FF14]" />;
      case 'date':
        return <Calendar className="w-3.5 h-3.5 text-[#FFB800]" />;
      case 'currency':
        return <DollarSign className="w-3.5 h-3.5 text-[#39FF14]" />;
      default:
        return <Type className="w-3.5 h-3.5 text-[#39FF14]" />;
    }
  };

  return (
    <div className="space-y-4 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-none bg-[#1F2833] border border-[#3A4552]">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#39FF14]" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">DYNAMIC CUSTOM FIELDS &amp; METADATA SCHEMA</h2>
            <Badge variant="purple" className="text-[9px] uppercase font-mono">
              NO-CODE ETL
            </Badge>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5 uppercase">
            EXTEND CONTACTS, DEALS, CUSTOMERS, AND COMPANIES WITH CUSTOM ATTRIBUTES WITHOUT DOWNTIME.
          </p>
        </div>

        <Button size="sm" variant="primary" onClick={() => setIsModalOpen(true)} className="text-xs h-7 uppercase flex items-center gap-1.5 font-bold">
          <Plus className="w-3.5 h-3.5 text-[#0B0C10]" />
          <span>ADD CUSTOM FIELD</span>
        </Button>
      </div>

      {/* Entity Tabs */}
      <div className="flex items-center gap-1.5 border-b border-[#3A4552] pb-2 font-mono">
        {[
          { id: 'contact', label: 'CONTACTS & LEADS' },
          { id: 'deal', label: 'DEALS & PIPELINE' },
          { id: 'customer', label: 'CUSTOMERS' },
          { id: 'company', label: 'COMPANIES' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveEntity(tab.id)}
            className={`px-3 py-1 rounded-none text-xs font-bold uppercase transition-none ${
              activeEntity === tab.id
                ? 'bg-[#39FF14] text-[#0B0C10] border border-[#39FF14]'
                : 'bg-[#1F2833] text-slate-400 border border-[#3A4552] hover:text-white'
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 font-mono">
          {fields.map((f: CustomFieldDefinition) => (
            <div
              key={f.id}
              className="p-3.5 rounded-none bg-[#1F2833] border border-[#3A4552] hover:border-[#39FF14] transition-none flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-none bg-[#0B0C10] border border-[#3A4552] text-[10px] font-mono text-slate-300 uppercase">
                    {getFieldTypeIcon(f.field_type)}
                    <span>{f.field_type}</span>
                  </div>

                  {f.is_required && (
                    <Badge variant="danger" className="text-[8px] font-mono py-0 uppercase">
                      REQUIRED
                    </Badge>
                  )}
                </div>

                <h3 className="text-xs font-bold text-white uppercase">{f.name}</h3>
                <p className="text-[10px] font-mono text-[#39FF14] mt-0.5">KEY: {f.field_key}</p>

                {f.options && f.options.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {f.options.map((opt, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 rounded-none bg-[#0B0C10] text-[9px] text-slate-300 border border-[#3A4552] uppercase font-mono"
                      >
                        {opt}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#3A4552] flex items-center justify-between">
                <span className="text-[9px] text-slate-500 font-mono uppercase">ENTITY: {f.entity_type}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteMutation.mutate(f.id)}
                  disabled={deleteMutation.isPending}
                  className="h-6 px-1.5 text-slate-400 hover:text-[#FF2A54]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 rounded-none bg-[#1F2833]/50 border border-[#3A4552] p-6 space-y-2 font-mono">
          <Tag className="w-8 h-8 mx-auto text-slate-600 mb-1" />
          <p className="text-xs font-bold text-slate-300 uppercase">NO CUSTOM FIELDS FOR {activeEntity.toUpperCase()}S YET</p>
          <p className="text-[10px] text-slate-500 max-w-sm mx-auto uppercase">
            CLICK &quot;ADD CUSTOM FIELD&quot; TO DEFINE CUSTOM PROPERTIES AND START CAPTURING DYNAMIC ATTRIBUTES.
          </p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0B0C10]/85 backdrop-blur-sm flex items-center justify-center p-4 font-mono">
          <div className="w-full max-w-md bg-[#1F2833] border border-[#3A4552] rounded-none p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#3A4552] pb-2.5">
              <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                <SlidersHorizontal className="w-4 h-4 text-[#39FF14]" />
                ADD DYNAMIC CUSTOM FIELD
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-xs">
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-2.5 bg-[#0B0C10] border border-[#FF2A54] text-[#FF2A54] text-xs rounded-none uppercase font-mono">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 font-mono">
              <div>
                <label className="block text-[10px] font-bold text-slate-300 mb-1 uppercase tracking-wider">TARGET ENTITY</label>
                <select
                  value={activeEntity}
                  onChange={(e) => setActiveEntity(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-none bg-[#0B0C10] border border-[#3A4552] text-xs text-white focus:outline-none focus:border-[#39FF14] uppercase font-mono"
                >
                  <option value="contact">CONTACTS &amp; LEADS</option>
                  <option value="deal">DEALS &amp; OPPORTUNITIES</option>
                  <option value="customer">CUSTOMERS</option>
                  <option value="company">COMPANIES</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-300 mb-1 uppercase tracking-wider">FIELD LABEL *</label>
                <input
                  type="text"
                  required
                  placeholder="E.G. SECURITY CLEARANCE TIER"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-none bg-[#0B0C10] border border-[#3A4552] text-xs text-white focus:outline-none focus:border-[#39FF14] uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-300 mb-1 uppercase tracking-wider">FIELD KEY (OPTIONAL SNAKE_CASE)</label>
                <input
                  type="text"
                  placeholder="E.G. SECURITY_CLEARANCE_TIER"
                  value={fieldKey}
                  onChange={(e) => setFieldKey(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-none bg-[#0B0C10] border border-[#3A4552] text-xs text-white focus:outline-none focus:border-[#39FF14] font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-300 mb-1 uppercase tracking-wider">DATA TYPE</label>
                <select
                  value={fieldType}
                  onChange={(e) => setFieldType(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-none bg-[#0B0C10] border border-[#3A4552] text-xs text-white focus:outline-none focus:border-[#39FF14] uppercase font-mono"
                >
                  <option value="text">TEXT (STRING)</option>
                  <option value="number">NUMBER (INTEGER / DECIMAL)</option>
                  <option value="select">DROPDOWN SELECT (OPTIONS)</option>
                  <option value="boolean">BOOLEAN (YES / NO TOGGLE)</option>
                  <option value="date">DATE PICKER</option>
                  <option value="currency">CURRENCY ($ USD)</option>
                </select>
              </div>

              {fieldType === 'select' && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider">DROPDOWN OPTIONS *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="ADD AN OPTION (E.G. SOC-2 TYPE II)"
                      value={optionInput}
                      onChange={(e) => setOptionInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddOption();
                        }
                      }}
                      className="flex-1 px-3 py-1.5 rounded-none bg-[#0B0C10] border border-[#3A4552] text-xs text-white focus:outline-none focus:border-[#39FF14] uppercase font-mono"
                    />
                    <Button type="button" size="sm" variant="secondary" onClick={handleAddOption} className="text-xs uppercase">
                      ADD
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {options.map((opt) => (
                      <span
                        key={opt}
                        className="px-2 py-0.5 rounded-none bg-[#0B0C10] border border-[#3A4552] text-xs text-slate-300 flex items-center gap-1.5 uppercase font-mono"
                      >
                        <span>{opt}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(opt)}
                          className="text-slate-500 hover:text-[#FF2A54] text-xs"
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
                  className="rounded-none bg-[#0B0C10] border-[#3A4552] text-[#39FF14] accent-[#39FF14]"
                />
                <label htmlFor="is_required" className="text-xs font-bold text-slate-300 cursor-pointer uppercase">
                  MANDATORY REQUIRED FIELD
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#3A4552]">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)} className="text-xs uppercase">
                  CANCEL
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={createMutation.isPending} className="text-xs uppercase font-bold">
                  {createMutation.isPending ? 'SAVING...' : 'SAVE FIELD'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
