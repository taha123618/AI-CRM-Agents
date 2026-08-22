import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customAgentsApi } from '../api/customAgentsApi';
import { CustomAgentCreate, CustomAgentUpdate } from '../types/customAgent.types';

export const CUSTOM_AGENTS_QUERY_KEY = ['custom-agents'];
export const TOOLS_QUERY_KEY = ['custom-agents', 'tools'];
export const EXECUTIONS_QUERY_KEY = ['custom-agents', 'executions'];

export function useCustomAgents(activeOnly = false) {
  return useQuery({
    queryKey: [...CUSTOM_AGENTS_QUERY_KEY, { activeOnly }],
    queryFn: () => customAgentsApi.getCustomAgents(activeOnly),
    staleTime: 1000 * 30, // 30s
  });
}

export function useAvailableTools() {
  return useQuery({
    queryKey: TOOLS_QUERY_KEY,
    queryFn: () => customAgentsApi.getAvailableTools(),
    staleTime: 1000 * 60 * 5, // 5 min
  });
}

export function useAgentExecutions(agentId: string | null) {
  return useQuery({
    queryKey: [...EXECUTIONS_QUERY_KEY, agentId],
    queryFn: () => (agentId ? customAgentsApi.getAgentExecutions(agentId) : []),
    enabled: Boolean(agentId),
    staleTime: 1000 * 10,
  });
}

export function useCreateCustomAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CustomAgentCreate) => customAgentsApi.createCustomAgent(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOM_AGENTS_QUERY_KEY });
    },
  });
}

export function useUpdateCustomAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CustomAgentUpdate }) =>
      customAgentsApi.updateCustomAgent(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOM_AGENTS_QUERY_KEY });
    },
  });
}

export function useDeleteCustomAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customAgentsApi.deleteCustomAgent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOM_AGENTS_QUERY_KEY });
    },
  });
}

export function useExecuteCustomAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input_payload,
      trigger_event,
    }: {
      id: string;
      input_payload: Record<string, any>;
      trigger_event?: string;
    }) => customAgentsApi.executeCustomAgent(id, { input_payload, trigger_event }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CUSTOM_AGENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...EXECUTIONS_QUERY_KEY, variables.id] });
    },
  });
}
