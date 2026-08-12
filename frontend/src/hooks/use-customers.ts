import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export function useCustomers(skip = 0, limit = 100) {
  return useQuery({
    queryKey: ['customers', skip, limit],
    queryFn: () => api.getCustomers(skip, limit),
    staleTime: 10000,
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => api.getCustomer(id),
    enabled: Boolean(id),
  });
}

export function useCustomerHealth(id: string) {
  return useQuery({
    queryKey: ['customer-health', id],
    queryFn: () => api.getCustomerHealth(id),
    enabled: Boolean(id),
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, any> }) =>
      api.updateCustomer(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}
