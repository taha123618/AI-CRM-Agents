import { create } from 'zustand';

export type ActivePage =
  | 'dashboard'
  | 'leads'
  | 'deals'
  | 'customers'
  | 'emails'
  | 'meetings'
  | 'analytics'
  | 'reports'
  | 'forecasting'
  | 'war-room'
  | 'journey'
  | 'sequences'
  | 'voice-ai'
  | 'whatsapp'
  | 'agents'
  | 'custom-agents'
  | 'languages';

interface UIState {
  activePage: ActivePage;
  sidebarOpen: boolean;
  theme: 'dark' | 'light';
  searchQuery: string;
  isLeadModalOpen: boolean;
  isDealModalOpen: boolean;
  isEmailModalOpen: boolean;
  isMeetingModalOpen: boolean;
  setActivePage: (page: ActivePage) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleTheme: () => void;
  setSearchQuery: (query: string) => void;
  setLeadModalOpen: (open: boolean) => void;
  setDealModalOpen: (open: boolean) => void;
  setEmailModalOpen: (open: boolean) => void;
  setMeetingModalOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activePage: 'dashboard',
  sidebarOpen: true,
  theme: 'dark',
  searchQuery: '',
  isLeadModalOpen: false,
  isDealModalOpen: false,
  isEmailModalOpen: false,
  isMeetingModalOpen: false,
  setActivePage: (page) => set({ activePage: page }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setLeadModalOpen: (open) => set({ isLeadModalOpen: open }),
  setDealModalOpen: (open) => set({ isDealModalOpen: open }),
  setEmailModalOpen: (open) => set({ isEmailModalOpen: open }),
  setMeetingModalOpen: (open) => set({ isMeetingModalOpen: open }),
}));
