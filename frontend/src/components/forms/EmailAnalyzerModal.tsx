import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/stores/use-ui-store';
import { useTriggerEmailIntelligence } from '@/hooks/use-agents';
import { Sparkles } from 'lucide-react';

const emailSchema = z.object({
  subject: z.string().min(2, 'Subject is required'),
  sender: z.string().email('Invalid email address'),
  body: z.string().min(5, 'Email body is required'),
});

type EmailFormData = z.infer<typeof emailSchema>;

export function EmailAnalyzerModal() {
  const { isEmailModalOpen, setEmailModalOpen } = useUIStore();
  const analyzeEmailMutation = useTriggerEmailIntelligence();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      subject: 'Inquiry regarding Enterprise plan pricing & SLA',
      sender: 'john.doe@techcorp.io',
      body: 'Hi Team, We are looking to migrate 200 seats to your CRM next month. Can you share security compliance docs and custom pricing?',
    },
  });

  const onSubmit = async (data: EmailFormData) => {
    try {
      await analyzeEmailMutation.mutateAsync(data);
      reset();
      setEmailModalOpen(false);
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <Modal
      isOpen={isEmailModalOpen}
      onClose={() => setEmailModalOpen(false)}
      title="Analyze Email Sentiment & Draft Response"
      description="Email Intelligence Agent will evaluate sentiment, assign priority, and generate an AI draft reply."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Sender Email"
          placeholder="john.doe@techcorp.io"
          required
          {...register('sender')}
          error={errors.sender?.message}
        />

        <Input
          label="Email Subject"
          placeholder="Pricing Inquiry"
          required
          {...register('subject')}
          error={errors.subject?.message}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-300">
            Email Content / Body <span className="text-rose-400 ml-0.5">*</span>
          </label>
          <textarea
            rows={4}
            className="w-full bg-slate-900 text-slate-100 border border-slate-700/80 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            {...register('body')}
          />
          {errors.body && <p className="text-xs text-rose-400">{errors.body.message}</p>}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="outline" onClick={() => setEmailModalOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" isLoading={analyzeEmailMutation.isPending}>
            <Sparkles className="w-4 h-4" />
            <span>Analyze & Draft Reply</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
