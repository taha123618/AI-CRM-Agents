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
      // Automatically trigger LeadQualificationAgent
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
      title="Create New Lead"
      description="Add a new lead to the CRM. Lead Qualification Agent will automatically enrich and score it."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First Name"
            placeholder="Alice"
            required
            {...register('first_name')}
            error={errors.first_name?.message}
          />
          <Input
            label="Last Name"
            placeholder="Smith"
            required
            {...register('last_name')}
            error={errors.last_name?.message}
          />
        </div>

        <Input
          label="Email Address"
          type="email"
          placeholder="alice@acme.com"
          required
          {...register('email')}
          error={errors.email?.message}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Company"
            placeholder="Acme Corp"
            {...register('company_name')}
          />
          <Input
            label="Job Title"
            placeholder="VP of Engineering"
            {...register('job_title')}
          />
        </div>

        <Input
          label="Lead Source"
          placeholder="Website Form / Inbound / Demo"
          {...register('lead_source')}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="outline" onClick={() => setLeadModalOpen(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={createLeadMutation.isPending || qualifyLeadMutation.isPending}
          >
            <Sparkles className="w-4 h-4" />
            <span>Create & Qualify Lead</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
