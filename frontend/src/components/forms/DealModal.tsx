import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/stores/use-ui-store';
import { useCreateDeal } from '@/hooks/use-deals';
import { DealStage } from '@/types/crm.types';
import { Briefcase } from 'lucide-react';

const dealSchema = z.object({
  name: z.string().min(2, 'Deal name is required'),
  value: z.number().min(0, 'Value must be positive'),
  stage: z.enum(['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost']),
});

type DealFormData = z.infer<typeof dealSchema>;

const STAGE_OPTIONS = [
  { value: 'prospecting', label: 'Prospecting' },
  { value: 'qualification', label: 'Qualification' },
  { value: 'proposal', label: 'Proposal Sent' },
  { value: 'negotiation', label: 'In Negotiation' },
  { value: 'closed_won', label: 'Closed Won' },
  { value: 'closed_lost', label: 'Closed Lost' },
];

export function DealModal() {
  const { isDealModalOpen, setDealModalOpen } = useUIStore();
  const createDealMutation = useCreateDeal();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DealFormData>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      name: '',
      value: 25000,
      stage: 'qualification',
    },
  });

  const onSubmit = async (data: DealFormData) => {
    try {
      await createDealMutation.mutateAsync({
        ...data,
        stage: data.stage as DealStage,
      });
      reset();
      setDealModalOpen(false);
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <Modal
      isOpen={isDealModalOpen}
      onClose={() => setDealModalOpen(false)}
      title="Create New Deal"
      description="Add a new deal opportunity to the sales pipeline."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Deal Name"
          placeholder="Acme Corp - Enterprise Renewal"
          required
          {...register('name')}
          error={errors.name?.message}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Deal Value ($)"
            type="number"
            step="1000"
            required
            {...register('value', { valueAsNumber: true })}
            error={errors.value?.message}
          />

          <Select
            label="Pipeline Stage"
            options={STAGE_OPTIONS}
            required
            {...register('stage')}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="outline" onClick={() => setDealModalOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" isLoading={createDealMutation.isPending}>
            <Briefcase className="w-4 h-4" />
            <span>Create Opportunity</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
