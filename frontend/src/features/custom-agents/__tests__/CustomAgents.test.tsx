import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AgentExecutionsModal } from '../components/AgentExecutionsModal';
import { CustomAgent } from '../types/customAgent.types';

const mockCustomAgent: CustomAgent = {
  id: 'agent-contract-renewal-1',
  name: 'Contract Renewal Sentinel',
  description: 'Monitors expiring annual agreements and drafts proactive renewal terms.',
  icon: 'bot',
  system_prompt: 'You are an autonomous renewal strategist.',
  model_provider: 'openai',
  model_name: 'gpt-4o',
  temperature: 0.2,
  trigger_type: 'event',
  trigger_config: { event: 'contract.expiring_in_60_days' },
  tools_enabled: ['crm_db', 'email_dispatch'],
  is_active: true,
  execution_count: 12,
  created_at: '2026-08-01T12:00:00Z',
  updated_at: '2026-08-15T12:00:00Z',
};

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('Custom Agent Studio Feature Suite', () => {
  it('renders nothing when agent is null', () => {
    renderWithQuery(<AgentExecutionsModal isOpen={true} onClose={vi.fn()} agent={null} />);
    expect(screen.queryByText(/CONTRACT RENEWAL SENTINEL/i)).not.toBeInTheDocument();
  });

  it('renders telemetry modal with agent name and telemetry description', () => {
    renderWithQuery(<AgentExecutionsModal isOpen={true} onClose={vi.fn()} agent={mockCustomAgent} />);
    expect(screen.getByText(/CONTRACT RENEWAL SENTINEL/i)).toBeInTheDocument();
    expect(screen.getByText(/TELEMETRY & RUN HISTORY/i)).toBeInTheDocument();
  });

  it('triggers onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    renderWithQuery(<AgentExecutionsModal isOpen={true} onClose={handleClose} agent={mockCustomAgent} />);
    const closeBtn = screen.getByRole('button', { name: '' });
    if (closeBtn) {
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalled();
    }
  });
});
