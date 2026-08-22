import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProposalStudioModal } from '../components/ProposalStudioModal';
import { AutomationRulesModal } from '../components/AutomationRulesModal';
import { WarRoomDeal } from '../types/warRoom.types';

const mockDeal: WarRoomDeal = {
  id: 'deal-101',
  title: 'Global Cloud AI Transformation',
  company: 'Apex Innovations Corp',
  value: 120000,
  stage: 'proposal',
  probability: 80,
  health_score: 88,
  closing_date: '2026-09-30',
  win_probability_pct: 85,
};

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('AI Deal War Room Components', () => {
  it('renders ProposalStudioModal with target company and controls', () => {
    const { getByText, getByRole } = renderWithClient(
      <ProposalStudioModal deal={mockDeal} onClose={() => {}} />
    );
    expect(getByText(/1-CLICK SMART PROPOSAL STUDIO/i)).toBeInTheDocument();
    expect(getByText('Apex Innovations Corp')).toBeInTheDocument();
    expect(getByRole('button', { name: /GENERATE PROPOSAL/i })).toBeInTheDocument();
  });

  it('renders AutomationRulesModal with autonomous triggers header', () => {
    const { getByText, getByRole } = renderWithClient(
      <AutomationRulesModal onClose={() => {}} />
    );
    expect(getByText(/WORKFLOW AUTOMATION TRIGGERS/i)).toBeInTheDocument();
    expect(getByRole('button', { name: /NEW AUTOMATION/i })).toBeInTheDocument();
  });
});
