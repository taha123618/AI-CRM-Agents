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
  { value: 'prospecting', label: 'PROSPECTING' },
  { value: 'qualification', label: 'QUALIFICATION' },
  { value: 'proposal', label: 'PROPOSAL SENT' },
  { value: 'negotiation', label: 'NEGOTIATION' },
  { value: 'closed_won', label: 'CLOSED WON' },
  { value: 'closed_lost', label: 'CLOSED LOST' },
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
    <form onSubmit={handleSubmit} className="space-y-3 font-mono">
      <Input
        label="DEAL / OPPORTUNITY NAME"
        placeholder="ENTERPRISE LICENSE EXPANSION"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="VALUE ($ USD)"
          type="number"
          placeholder="50000"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
        />
        <Select
          label="PIPELINE STAGE"
          options={STAGE_OPTIONS}
          value={stage}
          onChange={(e) => setStage(e.target.value as DealStage)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="WIN PROBABILITY (%)"
          type="number"
          min="0"
          max="100"
          value={probability}
          onChange={(e) => setProbability(e.target.value)}
        />
        <Input
          label="CONTACT ID (OPTIONAL)"
          placeholder="UUID OR LEAVE EMPTY"
          value={contactId}
          onChange={(e) => setContactId(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#3A4552]">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="text-xs uppercase">
            CANCEL
          </Button>
        )}
        <Button type="submit" variant="primary" isLoading={createDealMutation.isPending} className="text-xs uppercase">
          CREATE OPPORTUNITY
        </Button>
      </div>
    </form>
  );
}
