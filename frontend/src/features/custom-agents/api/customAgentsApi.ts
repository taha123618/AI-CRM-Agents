import { apiClient } from '@/lib/api/client';
import {
  CustomAgent,
  CustomAgentCreate,
  CustomAgentUpdate,
  CustomAgentExecution,
  CRMToolCapability,
  ExecutionResult,
} from '../types/customAgent.types';

export const customAgentsApi = {
  // Fetch custom agents
  getCustomAgents: async (activeOnly = false): Promise<CustomAgent[]> => {
    const { data } = await apiClient.get<CustomAgent[]>('/api/custom-agents', {
      params: { active_only: activeOnly },
    });
    return data;
  },

  // Get single custom agent
  getCustomAgent: async (id: string): Promise<CustomAgent> => {
    const { data } = await apiClient.get<CustomAgent>(`/api/custom-agents/${id}`);
    return data;
  },

  // Create custom agent
  createCustomAgent: async (payload: CustomAgentCreate): Promise<{ status: string; agent: CustomAgent }> => {
    const { data } = await apiClient.post('/api/custom-agents', payload);
    return data;
  },

  // Update custom agent
  updateCustomAgent: async (
    id: string,
    payload: CustomAgentUpdate
  ): Promise<{ status: string; agent: CustomAgent }> => {
    const { data } = await apiClient.put(`/api/custom-agents/${id}`, payload);
    return data;
  },

  // Delete custom agent
  deleteCustomAgent: async (id: string): Promise<{ status: string; message: string }> => {
    const { data } = await apiClient.delete(`/api/custom-agents/${id}`);
    return data;
  },

  // Fetch available capability tools
  getAvailableTools: async (): Promise<CRMToolCapability[]> => {
    const { data } = await apiClient.get<CRMToolCapability[]>('/api/custom-agents/tools');
    return data;
  },

  // Execute or test custom agent
  executeCustomAgent: async (
    id: string,
    payload: { input_payload: Record<string, any>; trigger_event?: string }
  ): Promise<ExecutionResult> => {
    const { data } = await apiClient.post<ExecutionResult>(`/api/custom-agents/${id}/execute`, payload);
    return data;
  },

  // Fetch execution history for agent
  getAgentExecutions: async (id: string, limit = 30): Promise<CustomAgentExecution[]> => {
    const { data } = await apiClient.get<CustomAgentExecution[]>(`/api/custom-agents/${id}/executions`, {
      params: { limit },
    });
    return data;
  },

  // Fetch global execution history
  getGlobalExecutions: async (limit = 50): Promise<CustomAgentExecution[]> => {
    const { data } = await apiClient.get<CustomAgentExecution[]>('/api/custom-agents/executions', {
      params: { limit },
    });
    return data;
  },
};
