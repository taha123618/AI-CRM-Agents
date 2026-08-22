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
      title="ANALYZE EMAIL SENTIMENT &amp; DRAFT"
      description="EMAILINTELLIGENCEAGENT WILL EVALUATE SENTIMENT, ASSIGN PRIORITY, AND GENERATE A DRAFT."
      className="font-mono"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 font-mono">
        <Input
          label="SENDER EMAIL"
          placeholder="john.doe@techcorp.io"
          required
          {...register('sender')}
          error={errors.sender?.message}
        />

        <Input
          label="EMAIL SUBJECT"
          placeholder="PRICING INQUIRY"
          required
          {...register('subject')}
          error={errors.subject?.message}
        />

        <div className="space-y-1">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground">
            EMAIL CONTENT / BODY <span className="text-destructive ml-0.5">*</span>
          </label>
          <textarea
            rows={4}
            className="w-full bg-background text-foreground border border-border rounded-none p-2.5 text-xs font-mono focus:outline-none focus:border-primary"
            {...register('body')}
          />
          {errors.body && <p className="text-xs text-destructive font-mono">{errors.body.message}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Button type="button" variant="outline" onClick={() => setEmailModalOpen(false)} className="text-xs">
            CANCEL
          </Button>
          <Button type="submit" variant="primary" isLoading={analyzeEmailMutation.isPending} className="text-xs">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            <span>ANALYZE &amp; DRAFT</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
