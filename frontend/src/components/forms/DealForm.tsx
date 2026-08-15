import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useCreateDeal } from '@/hooks/use-deals';
import { DealStage } from '@/types/crm.types';

interface DealFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const STAGE_OPTIONS = [
  { value: 'prospecting', label: 'Prospecting' },
  { value: 'qualification', label: 'Qualification' },
  { value: 'proposal', label: 'Proposal Sent' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'closed_won', label: 'Closed Won' },
  { value: 'closed_lost', label: 'Closed Lost' },
];

export function DealForm({ onSuccess, onCancel }: DealFormProps) {
  const createDealMutation = useCreateDeal();

  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [stage, setStage] = useState<DealStage>('prospecting');
  const [contactId, setContactId] = useState('');
  const [probability, setProbability] = useState('50');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !value) return;

    try {
      await createDealMutation.mutateAsync({
        name,
        value: parseFloat(value) || 0,
        stage,
        contact_id: contactId || undefined,
      });
      onSuccess?.();
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Deal / Opportunity Name"
        placeholder="Enterprise License Renewal"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Value ($ USD)"
          type="number"
          placeholder="50000"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
        />
        <Select
          label="Pipeline Stage"
          options={STAGE_OPTIONS}
          value={stage}
          onChange={(e) => setStage(e.target.value as DealStage)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Win Probability (%)"
          type="number"
          min="0"
          max="100"
          value={probability}
          onChange={(e) => setProbability(e.target.value)}
        />
        <Input
          label="Contact ID (Optional)"
          placeholder="UUID or leave empty"
          value={contactId}
          onChange={(e) => setContactId(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={createDealMutation.isPending}>
          Create Opportunity
        </Button>
      </div>
    </form>
  );
}
