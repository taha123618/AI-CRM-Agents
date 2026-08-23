/**
 * Deals & Health Intelligence Store
 */

import { create } from 'zustand';
import { Deal, DealStage, CustomFieldDefinition } from '@/types';
import { api } from '@/services/api';

interface DealsState {
  deals: Deal[];
  customFields: CustomFieldDefinition[];
  selectedDeal: Deal | null;
  isLoading: boolean;
  filterStage: DealStage | 'all';
  searchQuery: string;
  fetchDeals: () => Promise<void>;
  fetchCustomFields: (entityType?: string) => Promise<void>;
  updateDealStage: (dealId: string, stage: DealStage) => Promise<void>;
  updateDealCustomFields: (dealId: string, values: Record<string, any>) => Promise<void>;
  setSelectedDeal: (deal: Deal | null) => void;
  setFilterStage: (stage: DealStage | 'all') => void;
  setSearchQuery: (query: string) => void;
}

export const useDealsStore = create<DealsState>((set, get) => ({
  deals: [],
  customFields: [],
  selectedDeal: null,
  isLoading: false,
  filterStage: 'all',
  searchQuery: '',

  fetchDeals: async () => {
    set({ isLoading: true });
    try {
      const deals = await api.getDeals();
      set({ deals, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
    }
  },

  fetchCustomFields: async (entityType = 'deal') => {
    try {
      const fields = await api.getCustomFields(entityType);
      set({ customFields: fields });
    } catch (e) {}
  },

  updateDealStage: async (dealId, stage) => {
    try {
      const updated = await api.updateDealStage(dealId, stage);
      set((state) => ({
        deals: state.deals.map((d) => (d.id === dealId ? { ...d, stage } : d)),
        selectedDeal: state.selectedDeal?.id === dealId ? { ...state.selectedDeal, stage } : state.selectedDeal,
      }));
    } catch (e) {
      console.warn('[DealsStore] Update stage failed', e);
    }
  },

  updateDealCustomFields: async (dealId, values) => {
    try {
      await api.saveCustomFieldValues('deal', dealId, values);
      set((state) => ({
        deals: state.deals.map((d) =>
          d.id === dealId ? { ...d, custom_fields: { ...(d.custom_fields || {}), ...values } } : d
        ),
        selectedDeal:
          state.selectedDeal?.id === dealId
            ? { ...state.selectedDeal, custom_fields: { ...(state.selectedDeal.custom_fields || {}), ...values } }
            : state.selectedDeal,
      }));
    } catch (e) {
      console.warn('[DealsStore] Save custom fields failed', e);
    }
  },

  setSelectedDeal: (deal) => set({ selectedDeal: deal }),
  setFilterStage: (stage) => set({ filterStage: stage }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
