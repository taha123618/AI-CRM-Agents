import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreateSequenceModal } from '../components/CreateSequenceModal';
import { EnrollLeadsModal } from '../components/EnrollLeadsModal';
import { SDRSequence } from '../types/sequence.types';

const mockSequence: SDRSequence = {
  id: 'seq-test-1',
  name: 'RevOps High Velocity Cadence',
  status: 'active',
  channel: 'multichannel',
  target_persona: 'VP of Sales',
  enrolled_count: 12,
  replied_count: 5,
  conversion_rate_pct: 41.6,
  steps: [
    {
      step_number: 1,
      channel: 'email',
      delay_days: 0,
      subject: 'Quick Intro',
      template: 'Hi {{first_name}}',
    },
  ],
  created_at: new Date().toISOString(),
};

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('AI SDR Sequences Components', () => {
  it('renders CreateSequenceModal with cadence configuration inputs', () => {
    const { getByText, getByRole, getByPlaceholderText } = renderWithClient(
      <CreateSequenceModal onClose={() => {}} />
    );
    expect(getByText(/Create AI SDR Outreach Cadence/i)).toBeInTheDocument();
    expect(getByPlaceholderText(/Enterprise RevOps High-Conversion Sequence/i)).toBeInTheDocument();
    expect(getByRole('button', { name: /Launch Sequence/i })).toBeInTheDocument();
  });

  it('renders EnrollLeadsModal with candidate selection search and buttons', () => {
    const { getByText, getByPlaceholderText } = renderWithClient(
      <EnrollLeadsModal sequence={mockSequence} onClose={() => {}} />
    );
    expect(getByText(/Enroll CRM Contacts in Cadence/i)).toBeInTheDocument();
    expect(getByPlaceholderText(/Search by name, company, or email/i)).toBeInTheDocument();
  });
});
