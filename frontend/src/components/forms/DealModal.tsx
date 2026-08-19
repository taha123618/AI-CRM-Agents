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
  { value: 'prospecting', label: 'PROSPECTING' },
  { value: 'qualification', label: 'QUALIFICATION' },
  { value: 'proposal', label: 'PROPOSAL SENT' },
  { value: 'negotiation', label: 'IN NEGOTIATION' },
  { value: 'closed_won', label: 'CLOSED WON' },
  { value: 'closed_lost', label: 'CLOSED LOST' },
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
      title="CREATE NEW DEAL OPPORTUNITY"
      description="ADD A NEW REVENUE OPPORTUNITY TO THE SALES PIPELINE."
      className="font-mono"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 font-mono">
        <Input
          label="DEAL NAME"
          placeholder="ACME CORP - ENTERPRISE LICENSE"
          required
          {...register('name')}
          error={errors.name?.message}
        />

        <div className="grid grid-cols-2 gap-2">
          <Input
            label="DEAL VALUE ($)"
            type="number"
            step="1000"
            required
            {...register('value', { valueAsNumber: true })}
            error={errors.value?.message}
          />

          <Select
            label="PIPELINE STAGE"
            options={STAGE_OPTIONS}
            required
            {...register('stage')}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#3A4552]">
          <Button type="button" variant="outline" onClick={() => setDealModalOpen(false)} className="text-xs">
            CANCEL
          </Button>
          <Button type="submit" variant="primary" isLoading={createDealMutation.isPending} className="text-xs">
            <Briefcase className="w-3.5 h-3.5 mr-1" />
            <span>CREATE DEAL</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
