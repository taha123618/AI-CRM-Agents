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
    <form onSubmit={handleSubmit} className="space-y-3 font-mono">
      <Input
        label="SENDER EMAIL ADDRESS"
        type="email"
        placeholder="prospect@company.com"
        value={fromEmail}
        onChange={(e) => setFromEmail(e.target.value)}
        required
      />

      <Input
        label="EMAIL SUBJECT"
        placeholder="URGENT: CLARIFICATION ON SECURITY & CONTRACT PRICING"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        required
      />

      <div className="space-y-1 font-mono">
        <label className="text-[10px] font-bold uppercase text-foreground/80">EMAIL BODY TEXT</label>
        <textarea
          rows={4}
          className="w-full rounded-none bg-background border border-border p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary font-mono"
          placeholder="PASTE INCOMING CUSTOMER EMAIL CONTENTS HERE FOR AI SENTIMENT & AUTO-DRAFTING..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="text-xs uppercase">
            CANCEL
          </Button>
        )}
        <Button type="submit" variant="primary" isLoading={triggerEmailMutation.isPending} className="text-xs uppercase">
          ANALYZE &amp; GENERATE DRAFT
        </Button>
      </div>
    </form>
  );
}
