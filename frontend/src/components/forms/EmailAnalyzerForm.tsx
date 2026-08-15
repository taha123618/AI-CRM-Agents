import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTriggerEmailIntelligence } from '@/hooks/use-agents';

interface EmailAnalyzerFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EmailAnalyzerForm({ onSuccess, onCancel }: EmailAnalyzerFormProps) {
  const triggerEmailMutation = useTriggerEmailIntelligence();

  const [fromEmail, setFromEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromEmail || !subject || !body) return;

    try {
      await triggerEmailMutation.mutateAsync({
        from: fromEmail,
        subject,
        body,
      });
      onSuccess?.();
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Sender Email Address"
        type="email"
        placeholder="prospect@company.com"
        value={fromEmail}
        onChange={(e) => setFromEmail(e.target.value)}
        required
      />

      <Input
        label="Email Subject"
        placeholder="Urgent: Clarification on security & contract pricing"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        required
      />

      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-300">Email Body Text</label>
        <textarea
          rows={4}
          className="w-full rounded-xl bg-slate-900 border border-slate-800 p-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
          placeholder="Paste incoming customer email contents here for AI sentiment & auto-drafting analysis..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={triggerEmailMutation.isPending}>
          Analyze Sentiment & Generate Draft
        </Button>
      </div>
    </form>
  );
}
