import { apiClient } from '@/lib/api/client';
import {
  SDRSequence,
  CreateSequencePayload,
  GenerateStepCopyPayload,
  GeneratedStepCopyResponse,
} from '../types/sequence.types';

export interface Prospect {
  id: string;
  name: string;
  email: string;
  company: string;
  title: string;
  score: number;
}

export interface ExecuteStepPayload {
  contact_id?: string;
  step_number: number;
  channel: string;
  custom_note?: string;
}

export interface ExecuteStepResponse {
  status: string;
  sequence_id: string;
  channel: string;
  step_number: number;
  executed_by: string;
  result: string;
  timestamp: string;
}

export const sequenceApi = {
  getSequences: async (): Promise<SDRSequence[]> => {
    const res = await apiClient.get<SDRSequence[]>('/api/sequences');
    return res.data;
  },

  getAvailableProspects: async (): Promise<Prospect[]> => {
    const res = await apiClient.get<Prospect[]>('/api/sequences/prospects/available');
    return res.data;
  },

  getSequence: async (id: string): Promise<SDRSequence> => {
    const res = await apiClient.get<SDRSequence>(`/api/sequences/${id}`);
    return res.data;
  },

  createSequence: async (payload: CreateSequencePayload): Promise<SDRSequence> => {
    const res = await apiClient.post<SDRSequence>('/api/sequences', payload);
    return res.data;
  },

  updateSequence: async (sequenceId: string, payload: Partial<CreateSequencePayload>): Promise<SDRSequence> => {
    const res = await apiClient.put<SDRSequence>(`/api/sequences/${sequenceId}`, payload);
    return res.data;
  },

  toggleSequence: async (sequenceId: string): Promise<{ status: string; sequence_id: string; new_status: string }> => {
    const res = await apiClient.post<{ status: string; sequence_id: string; new_status: string }>(
      `/api/sequences/${sequenceId}/toggle`
    );
    return res.data;
  },

  enrollContacts: async (
    sequenceId: string,
    contactIds: string[]
  ): Promise<{ status: string; sequence_id: string; enrolled_count: number; message: string }> => {
    const res = await apiClient.post<{
      status: string;
      sequence_id: string;
      enrolled_count: number;
      message: string;
    }>(`/api/sequences/${sequenceId}/enroll`, { contact_ids: contactIds });
    return res.data;
  },

  generateStepCopy: async (
    sequenceId: string,
    payload: GenerateStepCopyPayload
  ): Promise<GeneratedStepCopyResponse> => {
    const res = await apiClient.post<GeneratedStepCopyResponse>(
      `/api/sequences/${sequenceId}/generate-copy`,
      payload
    );
    return res.data;
  },

  executeStep: async (
    sequenceId: string,
    payload: ExecuteStepPayload
  ): Promise<ExecuteStepResponse> => {
    const res = await apiClient.post<ExecuteStepResponse>(
      `/api/sequences/${sequenceId}/execute-step`,
      payload
    );
    return res.data;
  },

  deleteSequence: async (sequenceId: string): Promise<{ status: string; deleted_sequence_id: string }> => {
    const res = await apiClient.delete<{ status: string; deleted_sequence_id: string }>(
      `/api/sequences/${sequenceId}`
    );
    return res.data;
  },
};
