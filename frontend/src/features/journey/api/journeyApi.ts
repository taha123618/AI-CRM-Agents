import { apiClient } from '@/lib/api/client';
import {
  JourneyStagesResponse,
  CustomerJourneyDetails,
  JourneyIntervention,
  TriggerInterventionPayload,
} from '../types/journey.types';

export const journeyApi = {
  getStages: async (): Promise<JourneyStagesResponse> => {
    const res = await apiClient.get<JourneyStagesResponse>('/api/journey/stages');
    return res.data;
  },

  getCustomerJourney: async (customerId: string): Promise<CustomerJourneyDetails> => {
    const res = await apiClient.get<CustomerJourneyDetails>(`/api/journey/customers/${customerId}`);
    return res.data;
  },

  triggerIntervention: async (
    payload: TriggerInterventionPayload
  ): Promise<{ status: string; intervention: JourneyIntervention; message: string; ai_full_playbook: string }> => {
    const res = await apiClient.post<{
      status: string;
      intervention: JourneyIntervention;
      message: string;
      ai_full_playbook: string;
    }>('/api/journey/interventions/trigger', payload);
    return res.data;
  },

  getInterventions: async (): Promise<JourneyIntervention[]> => {
    const res = await apiClient.get<JourneyIntervention[]>('/api/journey/interventions');
    return res.data;
  },

  resolveIntervention: async (interventionId: string): Promise<{ status: string; intervention: JourneyIntervention }> => {
    const res = await apiClient.post<{ status: string; intervention: JourneyIntervention }>(
      `/api/journey/interventions/${interventionId}/resolve`
    );
    return res.data;
  },
};
