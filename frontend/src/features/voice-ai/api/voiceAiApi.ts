import { apiClient } from '@/lib/api/client';
import { VoiceCall, VoiceTurnAnalysis } from '../types/voiceAi.types';

export const voiceAiApi = {
  getCalls: async (limit = 50): Promise<VoiceCall[]> => {
    const { data } = await apiClient.get<VoiceCall[]>('/api/voice-calls', {
      params: { limit },
    });
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

  analyzeTurn: async (payload: {
    speaker: string;
    text: string;
    call_context?: Record<string, any>;
  }): Promise<VoiceTurnAnalysis> => {
    const { data } = await apiClient.post<VoiceTurnAnalysis>('/api/voice-calls/analyze-turn', payload);
    return data;
  },
};
