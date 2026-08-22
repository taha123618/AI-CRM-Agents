import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EmailsFeature } from '../EmailsFeature';

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('Emails Feature & Delivery Suite', () => {
  it('renders Autonomous Email Intelligence header and action buttons', () => {
    const { getByText, getByRole } = renderWithClient(<EmailsFeature />);
    expect(getByText(/Autonomous Email Intelligence/i)).toBeInTheDocument();
    expect(getByRole('button', { name: /Compose Email/i })).toBeInTheDocument();
  });

  it('renders priority filter controls', () => {
    const { getByText } = renderWithClient(<EmailsFeature />);
    expect(getByText('ALL')).toBeInTheDocument();
    expect(getByText('HIGH')).toBeInTheDocument();
    expect(getByText('MEDIUM')).toBeInTheDocument();
    expect(getByText('LOW')).toBeInTheDocument();
  });
});
