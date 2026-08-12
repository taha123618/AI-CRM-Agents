import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { Deal, DealCreate, DealStage } from '@/types/crm.types';

export function useDeals(skip = 0, limit = 100, stage?: string) {
  return useQuery({
    queryKey: ['deals', skip, limit, stage],
    queryFn: () => api.getDeals(skip, limit, stage),
    staleTime: 10000,
  });
}

export function useDeal(id: string) {
  return useQuery({
    queryKey: ['deal', id],
    queryFn: () => api.getDeal(id),
    enabled: Boolean(id),
  });
}

export function useCreateDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (deal: DealCreate) => api.createDeal(deal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['pipeline-metrics'] });
    },
  });
}

export function useUpdateDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Deal> }) =>
      api.updateDeal(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['pipeline-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
  });
}

export function useDeleteDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteDeal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['pipeline-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
  });
}

export function useUpdateDealStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: DealStage }) =>
      api.updateDealStage(id, stage),
    onMutate: async ({ id, stage }) => {
      // Cancel any outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: ['deals'] });

      // Snapshot previous queries data
      const previousDealsQueries = queryClient.getQueriesData<Deal[]>({ queryKey: ['deals'] });

      // Optimistically update cache across all deal list queries
      queryClient.setQueriesData<Deal[]>({ queryKey: ['deals'] }, (oldDeals) => {
        if (!oldDeals) return [];
        return oldDeals.map((d) => (d.id === id ? { ...d, stage } : d));
      });

      return { previousDealsQueries };
    },
    onError: (_err, _variables, context) => {
      // Rollback to snapshot on failure
      if (context?.previousDealsQueries) {
        context.previousDealsQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Re-synchronize data with backend
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['pipeline-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
  });
}
