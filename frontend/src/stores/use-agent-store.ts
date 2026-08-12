import { create } from 'zustand';
import { AgentEventLog, AgentStatus } from '@/types/crm.types';

interface AgentState {
  events: AgentEventLog[];
  agentStatuses: Record<string, AgentStatus>;
  connectionStatus: 'CONNECTING' | 'OPEN' | 'CLOSED' | 'ERROR';
  addEvent: (event: AgentEventLog) => void;
  clearEvents: () => void;
  setConnectionStatus: (status: 'CONNECTING' | 'OPEN' | 'CLOSED' | 'ERROR') => void;
  updateAgentStatus: (agentName: string, status: AgentStatus) => void;
}

const DEFAULT_AGENTS: Record<string, AgentStatus> = {
  LeadQualificationAgent: { name: 'LeadQualificationAgent', status: 'idle', model: 'GPT-4' },
  EmailIntelligenceAgent: { name: 'EmailIntelligenceAgent', status: 'idle', model: 'Claude-3' },
  SalesPipelineAgent: { name: 'SalesPipelineAgent', status: 'idle', model: 'GPT-4' },
  CustomerSuccessAgent: { name: 'CustomerSuccessAgent', status: 'idle', model: 'Claude-3' },
  MeetingSchedulerAgent: { name: 'MeetingSchedulerAgent', status: 'idle', model: 'GPT-4' },
  AnalyticsAgent: { name: 'AnalyticsAgent', status: 'idle', model: 'GPT-4' },
};

export const useAgentStore = create<AgentState>((set) => ({
  events: [
    {
      id: 'init-1',
      timestamp: new Date().toISOString(),
      agent: 'LeadQualificationAgent',
      type: 'agent_ready',
      data: { message: 'Autonomous Lead Scoring Agent initialized and listening for events' },
    },
    {
      id: 'init-2',
      timestamp: new Date().toISOString(),
      agent: 'EmailIntelligenceAgent',
      type: 'agent_ready',
      data: { message: 'Email Sentiment & Auto-Responder active' },
    },
  ],
  agentStatuses: DEFAULT_AGENTS,
  connectionStatus: 'CLOSED',
  addEvent: (event) =>
    set((state) => ({
      events: [event, ...state.events.slice(0, 99)], // keep last 100 events
    })),
  clearEvents: () => set({ events: [] }),
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  updateAgentStatus: (agentName, status) =>
    set((state) => ({
      agentStatuses: {
        ...state.agentStatuses,
        [agentName]: status,
      },
    })),
}));
