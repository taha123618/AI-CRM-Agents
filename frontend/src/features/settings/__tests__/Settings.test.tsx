import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SettingsFeature } from '../SettingsFeature';
import { ImportExportStudioTab } from '../components/ImportExportStudioTab';
import { TablePagination } from '../components/TablePagination';

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('Settings & Governance Studio Feature', () => {
  it('renders all navigation tabs and header title', () => {
    const { getByText } = renderWithClient(<SettingsFeature />);

    expect(getByText(/Platform Governance, Integrations & Security/i)).toBeInTheDocument();
    expect(getByText(/Access Control & RBAC/i)).toBeInTheDocument();
    expect(getByText(/Webhooks & APIs/i)).toBeInTheDocument();
    expect(getByText(/Bulk Import \/ Export/i)).toBeInTheDocument();
    expect(getByText(/Task Queue & Workers/i)).toBeInTheDocument();
    expect(getByText(/Compliance Audit Trail/i)).toBeInTheDocument();
  });

  it('switches to Bulk Import / Export tab when clicked', () => {
    const { getByText } = renderWithClient(<SettingsFeature />);

    const importTabBtn = getByText(/Bulk Import \/ Export/i);
    fireEvent.click(importTabBtn);

    expect(getByText(/1-Click Data Exporters/i)).toBeInTheDocument();
    expect(getByText(/Bulk CSV Ingestion Studio/i)).toBeInTheDocument();
    expect(getByText(/Download Leads CSV/i)).toBeInTheDocument();
  });

  it('renders 1-Click Exporter cards and CSV paste area in ImportExportStudioTab', () => {
    const { getByText, getAllByText, getByRole } = renderWithClient(<ImportExportStudioTab />);

    expect(getByText(/All Contacts & Leads/i)).toBeInTheDocument();
    expect(getByText(/Active Deals Pipeline/i)).toBeInTheDocument();
    expect(getAllByText(/Compliance Audit Trail/i).length).toBeGreaterThanOrEqual(1);
    expect(getByRole('button', { name: /Run Bulk Import/i })).toBeInTheDocument();
  });

  it('renders TablePagination with page count and triggers navigation events', () => {
    const onPageChange = vi.fn();
    const onPageSizeChange = vi.fn();

    const { getByText, getByTitle } = render(
      <TablePagination
        currentPage={1}
        totalPages={4}
        totalItems={38}
        pageSize={10}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    );

    expect(getByText(/Showing/i)).toBeInTheDocument();
    expect(getByText(/38/i)).toBeInTheDocument();
    expect(getByText(/Page 1 of 4/i)).toBeInTheDocument();

    // Click Next
    const nextBtn = getByTitle('Next Page');
    fireEvent.click(nextBtn);
    expect(onPageChange).toHaveBeenCalledWith(2);

    // Click Last
    const lastBtn = getByTitle('Last Page');
    fireEvent.click(lastBtn);
    expect(onPageChange).toHaveBeenCalledWith(4);
  });
});
