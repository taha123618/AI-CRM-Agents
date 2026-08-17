import { apiClient } from '@/lib/api/client';
import {
  SystemUser,
  WebhookEndpoint,
  WebhookDelivery,
  BackgroundTask,
  AuditLogEntry,
} from './types';

export const settingsApi = {
  // Users & RBAC
  getUsers: async (): Promise<SystemUser[]> => {
    const { data } = await apiClient.get('/api/auth/users');
    return data;
  },

  createUser: async (payload: {
    email: string;
    password: string;
    full_name: string;
    role?: string;
    is_active?: boolean;
    permissions?: string[];
  }): Promise<SystemUser> => {
    const { data } = await apiClient.post('/api/auth/users', payload);
    return data;
  },

  updateUser: async (
    userId: string,
    payload: {
      full_name?: string;
      email?: string;
      role?: string;
      is_active?: boolean;
      permissions?: string[];
      password?: string;
    }
  ): Promise<SystemUser> => {
    const { data } = await apiClient.put(`/api/auth/users/${userId}`, payload);
    return data;
  },

  updateUserRole: async (userId: string, role: string): Promise<SystemUser> => {
    const { data } = await apiClient.put(`/api/auth/users/${userId}/role`, { role });
    return data;
  },

  toggleUserStatus: async (userId: string, is_active: boolean): Promise<SystemUser> => {
    const { data } = await apiClient.put(`/api/auth/users/${userId}/status`, { is_active });
    return data;
  },

  deleteUser: async (userId: string): Promise<{ status: string; message: string }> => {
    const { data } = await apiClient.delete(`/api/auth/users/${userId}`);
    return data;
  },

  registerUser: async (payload: { email: string; password: string; full_name: string; role?: string }) => {
    const { data } = await apiClient.post('/api/auth/register', payload);
    return data;
  },

  getSsoProviders: async (): Promise<{ providers: Array<{ id: string; name: string; enabled: boolean; protocol: string; auth_url: string }> }> => {
    const { data } = await apiClient.get('/api/auth/sso/providers');
    return data;
  },

  loginSso: async (provider: string, token: string, emailHint?: string, nameHint?: string) => {
    const { data } = await apiClient.post(`/api/auth/sso/${provider}`, {
      token,
      email_hint: emailHint,
      name_hint: nameHint,
    });
    return data;
  },

  logout: async (): Promise<{ status: string; message: string }> => {
    const { data } = await apiClient.post('/api/auth/logout');
    return data;
  },

  // Webhooks
  getWebhooks: async (): Promise<WebhookEndpoint[]> => {
    const { data } = await apiClient.get('/api/webhooks/');
    return data;
  },

  createWebhook: async (payload: { url: string; description?: string; events?: string[] }): Promise<WebhookEndpoint> => {
    const { data } = await apiClient.post('/api/webhooks/', payload);
    return data;
  },

  deleteWebhook: async (webhookId: string): Promise<{ status: string }> => {
    const { data } = await apiClient.delete(`/api/webhooks/${webhookId}`);
    return data;
  },

  testWebhook: async (webhookId: string): Promise<{ status: string; results: unknown[] }> => {
    const { data } = await apiClient.post(`/api/webhooks/${webhookId}/test`);
    return data;
  },

  getDeliveries: async (): Promise<WebhookDelivery[]> => {
    const { data } = await apiClient.get('/api/webhooks/deliveries');
    return data;
  },

  // Bulk Import & Export
  importLeadsCsv: async (csvData: string): Promise<{ success: boolean; created_count: number; updated_count?: number; errors?: string[] }> => {
    const { data } = await apiClient.post('/api/leads/bulk-import', { csv_data: csvData });
    return data;
  },

  importDealsCsv: async (csvData: string): Promise<{ success: boolean; created_count: number; updated_count?: number; errors?: string[] }> => {
    const { data } = await apiClient.post('/api/deals/bulk-import', { csv_data: csvData });
    return data;
  },

  // Background Tasks Queue
  getTasks: async (): Promise<BackgroundTask[]> => {
    const { data } = await apiClient.get('/api/tasks/');
    return data;
  },

  triggerMonteCarloTask: async (numSimulations = 500): Promise<{ task_id: string; status: string }> => {
    const { data } = await apiClient.post('/api/tasks/monte-carlo', { num_simulations: numSimulations });
    return data;
  },

  triggerBulkEnrichmentTask: async (): Promise<{ task_id: string; status: string }> => {
    const { data } = await apiClient.post('/api/tasks/bulk-enrichment', {
      enrichment_sources: ['clearbit', 'linkedin', 'hunter'],
    });
    return data;
  },

  triggerAudioSynthesisTask: async (callId: string, transcript: string): Promise<{ task_id: string; status: string }> => {
    const { data } = await apiClient.post('/api/tasks/audio-synthesis', {
      call_id: callId,
      transcript,
    });
    return data;
  },

  cancelTask: async (taskId: string): Promise<BackgroundTask> => {
    const { data } = await apiClient.post(`/api/tasks/${taskId}/cancel`);
    return data;
  },

  clearCompletedTasks: async (): Promise<{ status: string; cleared_tasks_count?: number; count?: number }> => {
    const { data } = await apiClient.delete('/api/tasks/completed');
    return data;
  },

  // Audit Logs
  getAuditLogs: async (): Promise<AuditLogEntry[]> => {
    const { data } = await apiClient.get('/api/audit-logs?limit=100');
    return data;
  },
};
