import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/stores/use-ui-store';
import { useTriggerMeetingScheduler } from '@/hooks/use-agents';
import { Sparkles } from 'lucide-react';

const meetingSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  meeting_type: z.string().min(1, 'Meeting type is required'),
  attendee_email: z.string().email('Invalid attendee email'),
  notes: z.string().optional(),
});

type MeetingFormData = z.infer<typeof meetingSchema>;

const TYPE_OPTIONS = [
  { value: 'Executive Demo', label: 'Executive Demo' },
  { value: 'Discovery Call', label: 'Discovery Call' },
  { value: 'Technical Review', label: 'Technical Review' },
  { value: 'Renewal Discussion', label: 'Renewal Discussion' },
];

export function MeetingSchedulerModal() {
  const { isMeetingModalOpen, setMeetingModalOpen } = useUIStore();
  const scheduleMeetingMutation = useTriggerMeetingScheduler();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MeetingFormData>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      title: 'Product Architecture Review & Security Q&A',
      meeting_type: 'Technical Review',
      attendee_email: 'cto@enterprise.org',
      notes: 'Focus on SOC2 compliance and PostgreSQL connection security',
    },
  });

  const onSubmit = async (data: MeetingFormData) => {
    try {
      await scheduleMeetingMutation.mutateAsync(data);
      reset();
      setMeetingModalOpen(false);
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <Modal
      isOpen={isMeetingModalOpen}
      onClose={() => setMeetingModalOpen(false)}
      title="AI Meeting Scheduler"
      description="Meeting Scheduler Agent will analyze calendar availability, draft meeting prep, and assign follow-ups."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Meeting Title"
          placeholder="Executive Product Demo"
          required
          {...register('title')}
          error={errors.title?.message}
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Meeting Type"
            options={TYPE_OPTIONS}
            required
            {...register('meeting_type')}
          />
          <Input
            label="Attendee Email"
            placeholder="prospect@company.com"
            required
            {...register('attendee_email')}
            error={errors.attendee_email?.message}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-300">Context / Notes</label>
          <textarea
            rows={3}
            className="w-full bg-slate-900 text-slate-100 border border-slate-700/80 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            {...register('notes')}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="outline" onClick={() => setMeetingModalOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" isLoading={scheduleMeetingMutation.isPending}>
            <Sparkles className="w-4 h-4" />
            <span>Smart Schedule</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
