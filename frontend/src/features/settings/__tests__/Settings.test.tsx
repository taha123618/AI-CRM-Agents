import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SettingsFeature } from '../SettingsFeature';
import { UserManagementTab } from '../components/UserManagementTab';
import { ImportExportStudioTab } from '../components/ImportExportStudioTab';
import { TablePagination } from '../components/TablePagination';
import { useAuthStore } from '@/features/auth/hooks/useAuthStore';

const mockUsers = [
  {
    id: 'admin-1',
    email: 'admin@company.com',
    full_name: 'Super Admin User',
    role: 'admin' as const,
    is_active: true,
    permissions: ['leads:read', 'deals:read'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'sales-1',
    email: 'sales@company.com',
    full_name: 'Sales Rep',
    role: 'sales' as const,
    is_active: true,
    permissions: ['leads:read'],
    created_at: new Date().toISOString(),
  },
];

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  queryClient.setQueryData(['system-users'], mockUsers);
  queryClient.setQueryData(['sso-providers'], { providers: [] });
  queryClient.setQueryData(['background-tasks'], []);
  queryClient.setQueryData(['compliance-audit-logs'], []);

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('Settings & Governance Studio Feature', () => {
  it('renders all navigation tabs and header title', () => {
    useAuthStore.setState({
      user: {
        id: 'admin-1',
        email: 'admin@company.com',
        full_name: 'Admin User',
        role: 'admin',
        is_active: true,
      },
      isAuthenticated: true,
    });

    const { getByText } = renderWithClient(<SettingsFeature />);

    expect(getByText(/Platform Governance, Integrations & Security/i)).toBeInTheDocument();
    expect(getByText(/Access Control & RBAC/i)).toBeInTheDocument();
    expect(getByText(/Webhooks & APIs/i)).toBeInTheDocument();
    expect(getByText(/Bulk Import \/ Export/i)).toBeInTheDocument();
    expect(getByText(/Task Queue & Workers/i)).toBeInTheDocument();
    expect(getByText(/Compliance Audit Trail/i)).toBeInTheDocument();
  });

  it('renders UserManagementTab with Super Admin controls', () => {
    useAuthStore.setState({
      user: {
        id: 'admin-1',
        email: 'admin@company.com',
        full_name: 'Super Admin User',
        role: 'admin',
        is_active: true,
      },
      isAuthenticated: true,
    });

    const { getByText, getByPlaceholderText, getByRole } = renderWithClient(<UserManagementTab />);

    expect(getByText(/Role-Based Access Control \(RBAC\)/i)).toBeInTheDocument();
    expect(getByRole('button', { name: /Provision New User/i })).toBeInTheDocument();
    expect(getByPlaceholderText(/Search by full name or email address.../i)).toBeInTheDocument();
  });

  it('renders UserManagementTab in Read-Only mode for Auditor/Sales/Support', () => {
    useAuthStore.setState({
      user: {
        id: 'auditor-1',
        email: 'auditor@company.com',
        full_name: 'Auditor User',
        role: 'auditor',
        is_active: true,
      },
      isAuthenticated: true,
    });

    const { getByText, queryByRole } = renderWithClient(<UserManagementTab />);

    expect(getByText(/Read-Only Mode/i)).toBeInTheDocument();
    expect(getByText(/Auditing Access/i)).toBeInTheDocument();
    expect(queryByRole('button', { name: /Provision New User/i })).not.toBeInTheDocument();
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
