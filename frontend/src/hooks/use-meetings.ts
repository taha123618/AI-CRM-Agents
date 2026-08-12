import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { Meeting } from '@/types/crm.types';

export function useMeetings(skip = 0, limit = 100) {
  return useQuery({
    queryKey: ['meetings', skip, limit],
    queryFn: () => api.getMeetings(skip, limit),
    staleTime: 10000,
  });
}

export function useUpdateMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, meeting }: { id: string; meeting: Partial<Meeting> }) =>
      api.updateMeeting(id, meeting),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    },
  });
}

export function useDeleteMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (meetingId: string) => api.deleteMeeting(meetingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    },
  });
}
