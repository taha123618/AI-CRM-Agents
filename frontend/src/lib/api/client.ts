import axios, { AxiosError } from 'axios';
import {
  Lead,
  LeadCreate,
  Deal,
  DealCreate,
  Customer,
  CustomerHealth,
  EmailMessage,
  Meeting,
  DashboardMetrics,
  PipelineMetrics,
  AgentTriggerResponse,
  AnalyticsInsight,
} from '@/types/crm.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: string }>) => {
    const message =
      error.response?.data?.detail ||
      error.message ||
      'An unexpected network error occurred';
    return Promise.reject(new Error(message));
  }
);

// ── API Services ─────────────────────────────────────────────────────────────

export const api = {
  // System Health
  getHealth: async () => {
    const { data } = await apiClient.get('/health');
    return data;
  },

  // Leads
  getLeads: async (skip = 0, limit = 100): Promise<Lead[]> => {
    const { data } = await apiClient.get('/api/leads', { params: { skip, limit } });
    return data;
  },
  getLead: async (id: string): Promise<Lead> => {
    const { data } = await apiClient.get(`/api/leads/${id}`);
    return data;
  },
  createLead: async (lead: LeadCreate): Promise<Lead> => {
    const { data } = await apiClient.post('/api/leads', lead);
    return data;
  },
  deleteLead: async (id: string): Promise<{ status: string }> => {
    const { data } = await apiClient.delete(`/api/leads/${id}`);
    return data;
  },
  updateLead: async (id: string, lead: Partial<Lead>): Promise<Lead> => {
    const { data } = await apiClient.put(`/api/leads/${id}`, lead);
    return data;
  },

  // Deals
  getDeals: async (skip = 0, limit = 100, stage?: string): Promise<Deal[]> => {
    const { data } = await apiClient.get('/api/deals', { params: { skip, limit, stage } });
    return data;
  },
  getDeal: async (id: string): Promise<Deal> => {
    const { data } = await apiClient.get(`/api/deals/${id}`);
    return data;
  },
  createDeal: async (deal: DealCreate): Promise<Deal> => {
    const { data } = await apiClient.post('/api/deals', deal);
    return data;
  },
  updateDeal: async (id: string, deal: Partial<Deal>): Promise<Deal> => {
    const { data } = await apiClient.put(`/api/deals/${id}`, deal);
    return data;
  },
  updateDealStage: async (id: string, stage: string): Promise<{ status: string; stage: string }> => {
    const { data } = await apiClient.patch(`/api/deals/${id}/stage`, null, { params: { stage } });
    return data;
  },
  deleteDeal: async (id: string): Promise<{ status: string; deal_id: string }> => {
    const { data } = await apiClient.delete(`/api/deals/${id}`);
    return data;
  },

  // Customers
  getCustomers: async (skip = 0, limit = 100): Promise<Customer[]> => {
    const { data } = await apiClient.get('/api/customers', { params: { skip, limit } });
    return data;
  },
  getCustomer: async (id: string): Promise<Customer> => {
    const { data } = await apiClient.get(`/api/customers/${id}`);
    return data;
  },
  getCustomerHealth: async (id: string): Promise<CustomerHealth> => {
    const { data } = await apiClient.get(`/api/customers/${id}/health`);
    return data;
  },
  updateCustomer: async (id: string, payload: Partial<Customer>): Promise<Customer> => {
    const { data } = await apiClient.put(`/api/customers/${id}`, payload);
    return data;
  },

  // Emails
  getEmails: async (skip = 0, limit = 100, priority?: string): Promise<EmailMessage[]> => {
    const { data } = await apiClient.get('/api/emails', { params: { skip, limit, priority } });
    return data;
  },
  sendEmailResponse: async (
    id: string,
    replyText: string
  ): Promise<{ status: string; email_id: string; reply_text: string }> => {
    const { data } = await apiClient.post(`/api/emails/${id}/send`, { reply_text: replyText });
    return data;
  },

  // Meetings
  getMeetings: async (skip = 0, limit = 100): Promise<Meeting[]> => {
    const { data } = await apiClient.get('/api/meetings', { params: { skip, limit } });
    return data;
  },
  updateMeeting: async (id: string, meeting: Partial<Meeting>): Promise<Meeting> => {
    const { data } = await apiClient.put(`/api/meetings/${id}`, meeting);
    return data;
  },
  deleteMeeting: async (id: string): Promise<{ status: string; meeting_id: string }> => {
    const { data } = await apiClient.delete(`/api/meetings/${id}`);
    return data;
  },

  // Analytics
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    const { data } = await apiClient.get('/api/analytics/dashboard');
    return data;
  },
  getPipelineMetrics: async (): Promise<PipelineMetrics> => {
    const { data } = await apiClient.get('/api/analytics/pipeline');
    return data;
  },
  getAnalyticsInsights: async (): Promise<AnalyticsInsight> => {
    const { data } = await apiClient.get('/api/analytics/insights');
    return data;
  },

  // Agent Triggers
  qualifyLead: async (leadData: Record<string, any>): Promise<AgentTriggerResponse> => {
    const { data } = await apiClient.post('/api/agents/qualify-lead', leadData);
    return data;
  },
  analyzeEmail: async (emailData: Record<string, any>): Promise<AgentTriggerResponse> => {
    const { data } = await apiClient.post('/api/agents/analyze-email', emailData);
    return data;
  },
  analyzeDeal: async (dealId: string): Promise<AgentTriggerResponse> => {
    const { data } = await apiClient.post(`/api/agents/analyze-deal/${dealId}`);
    return data;
  },
  monitorCustomer: async (customerId: string): Promise<AgentTriggerResponse> => {
    const { data } = await apiClient.post(`/api/agents/monitor-customer/${customerId}`);
    return data;
  },
  scheduleMeeting: async (meetingRequest: Record<string, any>): Promise<AgentTriggerResponse> => {
    const { data } = await apiClient.post('/api/agents/schedule-meeting', meetingRequest);
    return data;
  },
  generateDashboard: async (category = 'all'): Promise<Record<string, any>> => {
    const { data } = await apiClient.post('/api/agents/generate-dashboard', null, {
      params: { category },
    });
    return data;
  },
};
