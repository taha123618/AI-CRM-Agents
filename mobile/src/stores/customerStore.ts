/**
 * Customer 360 & Churn Prevention Store
 */

import { create } from 'zustand';
import { Customer } from '@/types';
import { api } from '@/services/api';

interface CustomerState {
  customers: Customer[];
  isLoading: boolean;
  isTriggeringPlaybookId: string | null;
  searchQuery: string;
  fetchCustomers: () => Promise<void>;
  triggerRetentionPlaybook: (customerId: string) => Promise<any>;
  setSearchQuery: (q: string) => void;
}

export const useCustomerStore = create<CustomerState>((set) => ({
  customers: [],
  isLoading: false,
  isTriggeringPlaybookId: null,
  searchQuery: '',

  fetchCustomers: async () => {
    set({ isLoading: true });
    try {
      const customers = await api.getCustomers();
      set({ customers, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
    }
  },

  triggerRetentionPlaybook: async (customerId) => {
    set({ isTriggeringPlaybookId: customerId });
    try {
      // Simulate/trigger CS retention intervention
      await new Promise((resolve) => setTimeout(resolve, 1000));
      set((state) => ({
        isTriggeringPlaybookId: null,
        customers: state.customers.map((c) =>
          c.id === customerId
            ? {
                ...c,
                churn_risk: 'low',
                churn_probability: Math.max(5, (c.churn_probability || 30) - 25),
                recommended_actions: ['Executive retention meeting scheduled with CustomerSuccessAgent'],
              }
            : c
        ),
      }));
    } catch (e) {
      set({ isTriggeringPlaybookId: null });
    }
  },

  setSearchQuery: (q) => set({ searchQuery: q }),
}));
