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
  { value: 'Discovery Call', label: 'Discovery Call' },
  { value: 'Technical Review', label: 'Technical Review' },
  { value: 'Executive Demo', label: 'Executive Demo' },
  { value: 'Renewal Discussion', label: 'Renewal Discussion' },
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Meeting Subject / Title"
        placeholder="Product Architecture Review & Security Q&A"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Meeting Type"
          options={MEETING_TYPE_OPTIONS}
          value={meetingType}
          onChange={(e) => setMeetingType(e.target.value)}
        />
        <Input
          label="Duration (Minutes)"
          type="number"
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(e.target.value)}
        />
      </div>

      <Input
        label="Attendee Email"
        type="email"
        placeholder="cto@prospectcompany.com"
        value={attendeeEmail}
        onChange={(e) => setAttendeeEmail(e.target.value)}
        required
      />

      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-300">Meeting Focus Notes (Optional)</label>
        <textarea
          rows={3}
          className="w-full rounded-xl bg-slate-900 border border-slate-800 p-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
          placeholder="e.g. Focus on SOC2 compliance, PostgreSQL encryption, and API integrations"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={triggerMeetingMutation.isPending}>
          Generate AI Meeting Prep
        </Button>
      </div>
    </form>
  );
}
