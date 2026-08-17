import { apiClient } from '@/lib/api/client';
import {
  WhatsAppConversation,
  WhatsAppMessage,
  WhatsAppStats,
  BroadcastPayload,
} from '../types/whatsapp.types';

export const whatsappApi = {
  getStats: async (): Promise<WhatsAppStats> => {
    const { data } = await apiClient.get<WhatsAppStats>('/api/whatsapp/stats');
    return data;
  },

  getConversations: async (params?: {
    limit?: number;
    status?: string;
  }): Promise<WhatsAppConversation[]> => {
    const { data } = await apiClient.get<WhatsAppConversation[]>(
      '/api/whatsapp/conversations',
      { params }
    );
    return data;
  },

  searchConversations: async (q: string): Promise<WhatsAppConversation[]> => {
    const { data } = await apiClient.get<WhatsAppConversation[]>(
      '/api/whatsapp/conversations/search',
      { params: { q } }
    );
    return data;
  },

  getMessages: async (conversationId: string): Promise<WhatsAppMessage[]> => {
    const { data } = await apiClient.get<WhatsAppMessage[]>(
      `/api/whatsapp/conversations/${conversationId}/messages`
    );
    return data;
  },

  sendMessage: async (payload: {
    phone_number: string;
    contact_name?: string;
    text: string;
    sender_type?: 'agent' | 'bot' | 'prospect';
  }): Promise<{ status: string; message_id: string; conversation_id: string }> => {
    const { data } = await apiClient.post('/api/whatsapp/send', payload);
    return data;
  },

  sendInboundWebhook: async (payload: {
    phone_number: string;
    contact_name: string;
    text: string;
  }): Promise<{ status: string; ai_replied: boolean; agent_reply?: string }> => {
    const { data } = await apiClient.post('/api/whatsapp/webhook/inbound', payload);
    return data;
  },

  sendBroadcast: async (
    payload: BroadcastPayload
  ): Promise<{ status: string; recipients: number }> => {
    const { data } = await apiClient.post('/api/whatsapp/broadcast', payload);
    return data;
  },

  toggleAutoPilot: async (
    conversationId: string,
    ai_auto_pilot: boolean
  ): Promise<{ status: string; ai_auto_pilot: boolean }> => {
    const { data } = await apiClient.put(
      `/api/whatsapp/conversations/${conversationId}/auto-pilot`,
      { ai_auto_pilot }
    );
    return data;
  },

  updateTags: async (
    conversationId: string,
    tags: string[]
  ): Promise<{ status: string; tags: string[] }> => {
    const { data } = await apiClient.put(
      `/api/whatsapp/conversations/${conversationId}/tags`,
      { tags }
    );
    return data;
  },

  archiveConversation: async (
    conversationId: string
  ): Promise<{ status: string; new_status: string }> => {
    const { data } = await apiClient.put(
      `/api/whatsapp/conversations/${conversationId}/archive`
    );
    return data;
  },
};
