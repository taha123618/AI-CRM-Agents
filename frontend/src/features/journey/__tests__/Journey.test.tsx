import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InterventionModal } from '../components/InterventionModal';
import { JourneyCustomer } from '../types/journey.types';

const mockCustomer: JourneyCustomer = {
  id: 'cust-1',
  name: 'Acme Mega Corp',
  health_score: 42,
  mrr: 6000,
  arr: 72000,
  churn_risk_pct: 58,
  status: 'at_risk',
};

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('Customer Journey Studio Components', () => {
  it('renders InterventionModal with churn warning and launch button', () => {
    const { getByText, getByRole } = renderWithClient(
      <InterventionModal customer={mockCustomer} onClose={() => {}} />
    );
    expect(getByText(/Autonomous Churn Rescue Intervention/i)).toBeInTheDocument();
    expect(getByText(/Target: Acme Mega Corp/i)).toBeInTheDocument();
    expect(getByRole('button', { name: /Launch AI Rescue Play/i })).toBeInTheDocument();
  });
});
