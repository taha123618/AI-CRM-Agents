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
  { value: 'Executive Demo', label: 'EXECUTIVE DEMO' },
  { value: 'Discovery Call', label: 'DISCOVERY CALL' },
  { value: 'Technical Review', label: 'TECHNICAL REVIEW' },
  { value: 'Renewal Discussion', label: 'RENEWAL DISCUSSION' },
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
      title="AI MEETING SCHEDULER"
      description="MEETINGSCHEDULERAGENT WILL ANALYZE CALENDAR AVAILABILITY AND DRAFT MEETING PREP."
      className="font-mono"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 font-mono">
        <Input
          label="MEETING TITLE"
          placeholder="EXECUTIVE PRODUCT DEMO"
          required
          {...register('title')}
          error={errors.title?.message}
        />

        <div className="grid grid-cols-2 gap-2">
          <Select
            label="MEETING TYPE"
            options={TYPE_OPTIONS}
            required
            {...register('meeting_type')}
          />
          <Input
            label="ATTENDEE EMAIL"
            placeholder="prospect@company.com"
            required
            {...register('attendee_email')}
            error={errors.attendee_email?.message}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300">CONTEXT / NOTES</label>
          <textarea
            rows={3}
            className="w-full bg-[#0B0C10] text-slate-100 border border-[#3A4552] rounded-none p-2.5 text-xs font-mono focus:outline-none focus:border-[#FFB800]"
            {...register('notes')}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#3A4552]">
          <Button type="button" variant="outline" onClick={() => setMeetingModalOpen(false)} className="text-xs">
            CANCEL
          </Button>
          <Button type="submit" variant="primary" isLoading={scheduleMeetingMutation.isPending} className="text-xs">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            <span>SMART SCHEDULE</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
