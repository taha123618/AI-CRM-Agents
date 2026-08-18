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
    mutationFn: ({
      id,
      replyText,
      toEmail,
      subject,
    }: {
      id: string;
      replyText: string;
      toEmail?: string;
      subject?: string;
    }) => api.sendEmailResponse(id, replyText, toEmail, subject),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
  });
}

export function useComposeEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      to_email: string;
      subject: string;
      body: string;
      recipient_name?: string;
      contact_id?: string;
    }) => api.composeEmail(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
  });
}
