import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/stores/use-ui-store';
import { useCreateLead } from '@/hooks/use-leads';
import { useTriggerLeadQualification } from '@/hooks/use-agents';
import { Sparkles } from 'lucide-react';

const leadSchema = z.object({
  email: z.string().email('Invalid email address'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  company_name: z.string().optional(),
  job_title: z.string().optional(),
  lead_source: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

export function LeadModal() {
  const { isLeadModalOpen, setLeadModalOpen } = useUIStore();
  const createLeadMutation = useCreateLead();
  const qualifyLeadMutation = useTriggerLeadQualification();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      email: '',
      first_name: '',
      last_name: '',
      company_name: '',
      job_title: '',
      lead_source: 'Website Form',
    },
  });

  const onSubmit = async (data: LeadFormData) => {
    try {
      await createLeadMutation.mutateAsync(data);
      await qualifyLeadMutation.mutateAsync(data);
      reset();
      setLeadModalOpen(false);
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <Modal
      isOpen={isLeadModalOpen}
      onClose={() => setLeadModalOpen(false)}
      title="CREATE NEW LEAD RECORD"
      description="ADD A LEAD. LEAD QUALIFICATION AGENT WILL ENRICH AND SCORE AUTOMATICALLY."
      className="font-mono"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 font-mono">
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="FIRST NAME"
            placeholder="ALICE"
            required
            {...register('first_name')}
            error={errors.first_name?.message}
          />
          <Input
            label="LAST NAME"
            placeholder="SMITH"
            required
            {...register('last_name')}
            error={errors.last_name?.message}
          />
        </div>

        <Input
          label="EMAIL ADDRESS"
          type="email"
          placeholder="ALICE@ACME.COM"
          required
          {...register('email')}
          error={errors.email?.message}
        />

        <div className="grid grid-cols-2 gap-2">
          <Input
            label="COMPANY"
            placeholder="ACME CORP"
            {...register('company_name')}
          />
          <Input
            label="JOB TITLE"
            placeholder="VP OF ENGINEERING"
            {...register('job_title')}
          />
        </div>

        <Input
          label="LEAD SOURCE"
          placeholder="WEBSITE FORM / INBOUND"
          {...register('lead_source')}
        />

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Button type="button" variant="outline" onClick={() => setLeadModalOpen(false)} className="text-xs">
            CANCEL
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={createLeadMutation.isPending || qualifyLeadMutation.isPending}
            className="text-xs"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            <span>CREATE &amp; QUALIFY</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
