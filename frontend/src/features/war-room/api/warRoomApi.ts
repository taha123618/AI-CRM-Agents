import { apiClient } from '@/lib/api/client';
import {
  WarRoomDeal,
  DealStrategyMatrix,
  GenerateProposalPayload,
  GeneratedProposal,
  AutomationRule,
} from '../types/warRoom.types';

export const warRoomApi = {
  getDeals: async (): Promise<WarRoomDeal[]> => {
    const res = await apiClient.get<WarRoomDeal[]>('/api/war-room/deals');
    return res.data;
  },

  getStrategyMatrix: async (dealId: string): Promise<DealStrategyMatrix> => {
    const res = await apiClient.get<DealStrategyMatrix>(`/api/war-room/deals/${dealId}/strategy`);
    return res.data;
  },

  generateProposal: async (payload: GenerateProposalPayload): Promise<GeneratedProposal> => {
    const res = await apiClient.post<GeneratedProposal>('/api/war-room/proposals/generate', payload);
    return res.data;
  },

  getAutomations: async (): Promise<AutomationRule[]> => {
    const res = await apiClient.get<AutomationRule[]>('/api/war-room/automations');
    return res.data;
  },

  createAutomation: async (
    rule: Omit<AutomationRule, 'id' | 'status' | 'executions_count'>
  ): Promise<AutomationRule> => {
    const res = await apiClient.post<AutomationRule>('/api/war-room/automations', rule);
    return res.data;
  },

  updateAutomation: async (
    ruleId: string,
    rule: Omit<AutomationRule, 'id' | 'status' | 'executions_count'>
  ): Promise<AutomationRule> => {
    const res = await apiClient.put<AutomationRule>(`/api/war-room/automations/${ruleId}`, rule);
    return res.data;
  },

  executeAutomation: async (ruleId: string): Promise<any> => {
    const res = await apiClient.post<any>(`/api/war-room/automations/${ruleId}/execute`);
    return res.data;
  },

  toggleAutomation: async (ruleId: string): Promise<{ status: string; rule: AutomationRule }> => {
    const res = await apiClient.post<{ status: string; rule: AutomationRule }>(
      `/api/war-room/automations/${ruleId}/toggle`
    );
    return res.data;
  },

  deleteAutomation: async (ruleId: string): Promise<{ status: string; deleted_rule_id: string }> => {
    const res = await apiClient.delete<{ status: string; deleted_rule_id: string }>(
      `/api/war-room/automations/${ruleId}`
    );
    return res.data;
  },
};
