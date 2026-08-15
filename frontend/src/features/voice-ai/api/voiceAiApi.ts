import { apiClient } from '@/lib/api/client';
import { VoiceCall, VoiceTurnAnalysis, VoiceCallStats } from '../types/voiceAi.types';

export const voiceAiApi = {
  getCalls: async (params?: {
    limit?: number;
    direction?: string;
    sentiment?: string;
    search?: string;
  }): Promise<VoiceCall[]> => {
    const { data } = await apiClient.get<VoiceCall[]>('/api/voice-calls', { params });
    return data;
  },

  getCallStats: async (): Promise<VoiceCallStats> => {
    const { data } = await apiClient.get<VoiceCallStats>('/api/voice-calls/stats');
    return data;
  },

  getCall: async (id: string): Promise<VoiceCall> => {
    const { data } = await apiClient.get<VoiceCall>(`/api/voice-calls/${id}`);
    return data;
  },

  createCall: async (payload: Partial<VoiceCall>): Promise<{ status: string; id: string }> => {
    const { data } = await apiClient.post('/api/voice-calls', payload);
    return data;
  },

  deleteCall: async (id: string): Promise<{ status: string; id: string }> => {
    const { data } = await apiClient.delete(`/api/voice-calls/${id}`);
    return data;
  },

  analyzeTurn: async (payload: {
    speaker: string;
    text: string;
    call_context?: Record<string, unknown>;
  }): Promise<VoiceTurnAnalysis> => {
    const { data } = await apiClient.post<VoiceTurnAnalysis>(
      '/api/voice-calls/analyze-turn',
      payload
    );
    return data;
  },
};
