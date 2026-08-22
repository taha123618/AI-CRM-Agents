import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ForecastingFeature } from '../ForecastingFeature';

// Mock Recharts ResponsiveContainer to avoid jsdom zero-dimension render issues
vi.mock('recharts', async () => {
  const actual = await vi.importActual<any>('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: '100%', height: '300px' }}>{children}</div>
    ),
  };
});

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('Forecasting & Monte Carlo Feature Suite', () => {
  it('renders ForecastingFeature with KPI cards (Pipeline Total, P10, P50, P90)', () => {
    renderWithQuery(<ForecastingFeature />);

    expect(screen.getByText(/PIPELINE TOTAL/i)).toBeInTheDocument();
    expect(screen.getByText(/P10 CONSERVATIVE/i)).toBeInTheDocument();
    expect(screen.getByText(/P50 EXPECTED/i)).toBeInTheDocument();
    expect(screen.getByText(/P90 OPTIMISTIC/i)).toBeInTheDocument();
  });

  it('renders simulation control buttons (SAVE SCENARIO and RE-RUN)', () => {
    renderWithQuery(<ForecastingFeature />);

    expect(screen.getByText(/SAVE SCENARIO/i)).toBeInTheDocument();
    expect(screen.getByText(/RE-RUN/i)).toBeInTheDocument();
  });
});
