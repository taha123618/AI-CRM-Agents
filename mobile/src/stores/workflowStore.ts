/**
 * Workflows & Multi-Agent Execution Store
 * Directly synchronizes dynamic workflow triggers with the FastAPI War Room backend.
 */

import { create } from 'zustand';
import { WorkflowTrigger } from '@/types';
import { api } from '@/services/api';

interface WorkflowState {
  workflows: WorkflowTrigger[];
  isLoading: boolean;
  isExecutingId: string | null;
  lastExecutionResult: any | null;
  fetchWorkflows: () => Promise<void>;
  testTrigger: (id: string) => Promise<any>;
  toggleWorkflowActive: (id: string) => Promise<void>;
  createWorkflow: (trigger: {
    name: string;
    trigger_event: string;
    action_agent: string;
    action_type: string;
    is_active?: boolean;
    conditions?: Record<string, any>;
  }) => Promise<void>;
  deleteWorkflow: (id: string) => Promise<void>;
}

export const useWorkflowStore = create<WorkflowState>((set) => ({
  workflows: [],
  isLoading: false,
  isExecutingId: null,
  lastExecutionResult: null,

  fetchWorkflows: async () => {
    set({ isLoading: true });
    try {
      const workflows = await api.getWorkflows();
      set({ workflows, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
    }
  },

  testTrigger: async (id: string) => {
    set({ isExecutingId: id });
    try {
      const result = await api.testWorkflowTrigger(id);
      set((state) => ({
        isExecutingId: null,
        lastExecutionResult: result,
        workflows: state.workflows.map((w) =>
          w.id === id
            ? {
                ...w,
                execution_count: (w.execution_count || 0) + 1,
                last_triggered_at: 'Just now',
              }
            : w
        ),
      }));
      return result;
    } catch (e) {
      set({ isExecutingId: null });
      throw e;
    }
  },

  toggleWorkflowActive: async (id: string) => {
    // Optimistic toggle
    set((state) => ({
      workflows: state.workflows.map((w) =>
        w.id === id ? { ...w, is_active: !w.is_active } : w
      ),
    }));
    try {
      await api.toggleWorkflowTrigger(id);
    } catch (e) {
      console.warn('[WorkflowStore] Failed to toggle trigger on server', e);
    }
  },

  createWorkflow: async (newWf) => {
    set({ isLoading: true });
    try {
      const created = await api.createWorkflowTrigger(newWf);
      set((state) => ({
        workflows: [created, ...state.workflows],
        isLoading: false,
      }));
    } catch (e) {
      // Offline fallback
      const fallback: WorkflowTrigger = {
        id: `wf_${Date.now()}`,
        ...newWf,
        is_active: true,
        execution_count: 0,
        last_triggered_at: 'Just now',
      };
      set((state) => ({
        workflows: [fallback, ...state.workflows],
        isLoading: false,
      }));
    }
  },

  deleteWorkflow: async (id: string) => {
    set((state) => ({
      workflows: state.workflows.filter((w) => w.id !== id),
    }));
    try {
      await api.deleteWorkflowTrigger(id);
    } catch (e) {
      console.warn('[WorkflowStore] Failed to delete trigger on server', e);
    }
  },
}));
