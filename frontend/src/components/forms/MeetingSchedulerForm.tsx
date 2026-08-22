import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useTriggerMeetingScheduler } from '@/hooks/use-agents';

interface MeetingSchedulerFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const MEETING_TYPE_OPTIONS = [
  { value: 'Discovery Call', label: 'DISCOVERY CALL' },
  { value: 'Technical Review', label: 'TECHNICAL REVIEW' },
  { value: 'Executive Demo', label: 'EXECUTIVE DEMO' },
  { value: 'Renewal Discussion', label: 'RENEWAL DISCUSSION' },
];

export function MeetingSchedulerForm({ onSuccess, onCancel }: MeetingSchedulerFormProps) {
  const triggerMeetingMutation = useTriggerMeetingScheduler();

  const [title, setTitle] = useState('');
  const [meetingType, setMeetingType] = useState('Technical Review');
  const [attendeeEmail, setAttendeeEmail] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('30');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !attendeeEmail) return;

    try {
      await triggerMeetingMutation.mutateAsync({
        title,
        meeting_type: meetingType,
        attendee_email: attendeeEmail,
        duration: parseInt(durationMinutes, 10) || 30,
        notes,
      });
      onSuccess?.();
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 font-mono">
      <Input
        label="MEETING SUBJECT / TITLE"
        placeholder="PRODUCT ARCHITECTURE REVIEW & SECURITY Q&A"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <div className="grid grid-cols-2 gap-3">
        <Select
          label="MEETING TYPE"
          options={MEETING_TYPE_OPTIONS}
          value={meetingType}
          onChange={(e) => setMeetingType(e.target.value)}
        />
        <Input
          label="DURATION (MINUTES)"
          type="number"
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(e.target.value)}
        />
      </div>

      <Input
        label="ATTENDEE EMAIL"
        type="email"
        placeholder="cto@prospectcompany.com"
        value={attendeeEmail}
        onChange={(e) => setAttendeeEmail(e.target.value)}
        required
      />

      <div className="space-y-1">
        <label className="text-[10px] font-bold uppercase text-foreground">MEETING FOCUS NOTES (OPTIONAL)</label>
        <textarea
          rows={3}
          className="w-full rounded-none bg-background border border-border p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary font-mono"
          placeholder="E.G. FOCUS ON SOC2 COMPLIANCE, POSTGRESQL ENCRYPTION, AND API INTEGRATIONS"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="text-xs uppercase">
            CANCEL
          </Button>
        )}
        <Button type="submit" variant="primary" isLoading={triggerMeetingMutation.isPending} className="text-xs uppercase">
          GENERATE AI PREP
        </Button>
      </div>
    </form>
  );
}
