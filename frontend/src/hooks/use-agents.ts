import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { useAgentStore } from '@/stores/use-agent-store';

export function useTriggerLeadQualification() {
  const queryClient = useQueryClient();
  const addEvent = useAgentStore((state) => state.addEvent);

  return useMutation({
    mutationFn: (leadData: Record<string, any>) => api.qualifyLead(leadData),
    onSuccess: (data, variables) => {
      addEvent({
        id: `trig-${Date.now()}`,
        timestamp: new Date().toISOString(),
        agent: 'LeadQualificationAgent',
        type: 'agent_triggered',
        data: { message: data.message, target: variables.email || variables.name },
      });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
  });
}

export function useTriggerEmailIntelligence() {
  const queryClient = useQueryClient();
  const addEvent = useAgentStore((state) => state.addEvent);

  return useMutation({
    mutationFn: (emailData: Record<string, any>) => api.analyzeEmail(emailData),
    onSuccess: (data, variables) => {
      addEvent({
        id: `trig-${Date.now()}`,
        timestamp: new Date().toISOString(),
        agent: 'EmailIntelligenceAgent',
        type: 'agent_triggered',
        data: { message: data.message, subject: variables.subject },
      });
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
  });
}

export function useTriggerSalesPipeline() {
  const queryClient = useQueryClient();
  const addEvent = useAgentStore((state) => state.addEvent);

  return useMutation({
    mutationFn: (dealId: string) => api.analyzeDeal(dealId),
    onSuccess: (data, dealId) => {
      addEvent({
        id: `trig-${Date.now()}`,
        timestamp: new Date().toISOString(),
        agent: 'SalesPipelineAgent',
        type: 'agent_triggered',
        data: { message: data.message, dealId },
      });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });
}

export function useTriggerCustomerSuccess() {
  const queryClient = useQueryClient();
  const addEvent = useAgentStore((state) => state.addEvent);

  return useMutation({
    mutationFn: (customerId: string) => api.monitorCustomer(customerId),
    onSuccess: (data, customerId) => {
      addEvent({
        id: `trig-${Date.now()}`,
        timestamp: new Date().toISOString(),
        agent: 'CustomerSuccessAgent',
        type: 'agent_triggered',
        data: { message: data.message, customerId },
      });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useTriggerMeetingScheduler() {
  const queryClient = useQueryClient();
  const addEvent = useAgentStore((state) => state.addEvent);

  return useMutation({
    mutationFn: (request: Record<string, any>) => api.scheduleMeeting(request),
    onSuccess: (data, variables) => {
      addEvent({
        id: `trig-${Date.now()}`,
        timestamp: new Date().toISOString(),
        agent: 'MeetingSchedulerAgent',
        type: 'agent_triggered',
        data: { message: data.message, title: variables.title },
      });
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    },
  });
}

export function useTriggerAnalyticsAgent() {
  const addEvent = useAgentStore((state) => state.addEvent);

  return useMutation({
    mutationFn: (category?: string) => api.generateDashboard(category),
    onSuccess: (data) => {
      addEvent({
        id: `trig-${Date.now()}`,
        timestamp: new Date().toISOString(),
        agent: 'AnalyticsAgent',
        type: 'agent_completed',
        data: { message: 'Analytics dashboard generated synchronously', metrics: data },
      });
    },
  });
}
