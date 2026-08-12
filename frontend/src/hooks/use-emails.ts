import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export function useEmails(skip = 0, limit = 100, priority?: string) {
  return useQuery({
    queryKey: ['emails', skip, limit, priority],
    queryFn: () => api.getEmails(skip, limit, priority),
    staleTime: 10000,
  });
}

export function useSendEmailResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, replyText }: { id: string; replyText: string }) =>
      api.sendEmailResponse(id, replyText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
  });
}
