import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '../use-ui-store';

describe('useUIStore (Zustand)', () => {
  beforeEach(() => {
    useUIStore.setState({
      activePage: 'dashboard',
      sidebarOpen: true,
      theme: 'dark',
      searchQuery: '',
      isLeadModalOpen: false,
      isDealModalOpen: false,
      isEmailModalOpen: false,
      isMeetingModalOpen: false,
    });
  });

  it('initializes with default dashboard state', () => {
    const state = useUIStore.getState();
    expect(state.activePage).toBe('dashboard');
    expect(state.sidebarOpen).toBe(true);
    expect(state.theme).toBe('dark');
  });

  it('updates activePage on setActivePage call', () => {
    useUIStore.getState().setActivePage('voice-ai');
    expect(useUIStore.getState().activePage).toBe('voice-ai');

    useUIStore.getState().setActivePage('whatsapp');
    expect(useUIStore.getState().activePage).toBe('whatsapp');

    useUIStore.getState().setActivePage('forecasting');
    expect(useUIStore.getState().activePage).toBe('forecasting');
  });

  it('toggles sidebar state', () => {
    expect(useUIStore.getState().sidebarOpen).toBe(true);
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebarOpen).toBe(false);
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebarOpen).toBe(true);
  });

  it('updates search query state', () => {
    useUIStore.getState().setSearchQuery('Marcus');
    expect(useUIStore.getState().searchQuery).toBe('Marcus');
  });

  it('toggles modal states independently', () => {
    useUIStore.getState().setLeadModalOpen(true);
    expect(useUIStore.getState().isLeadModalOpen).toBe(true);
    expect(useUIStore.getState().isDealModalOpen).toBe(false);

    useUIStore.getState().setDealModalOpen(true);
    expect(useUIStore.getState().isDealModalOpen).toBe(true);
  });
});
