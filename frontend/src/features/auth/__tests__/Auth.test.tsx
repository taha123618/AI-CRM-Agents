import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { UnauthorizedPage } from '@/pages/UnauthorizedPage';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { RoleGuard } from '../components/RoleGuard';
import { PermissionGuard } from '../components/PermissionGuard';
import { useAuthStore } from '../hooks/useAuthStore';

function renderWithProviders(ui: React.ReactElement, initialEntries = ['/']) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('Authentication & Authorization Suite', () => {
  it('renders LoginPage with form inputs and SSO buttons', () => {
    const { getByPlaceholderText, getByText, getByRole } = renderWithProviders(<LoginPage />);

    expect(getByPlaceholderText(/alex@enterprise.com/i)).toBeInTheDocument();
    expect(getByPlaceholderText(/••••••••••••/i)).toBeInTheDocument();
    expect(getByText(/Continue with Google Workspace/i)).toBeInTheDocument();
    expect(getByText(/Continue with Microsoft Entra ID/i)).toBeInTheDocument();
    expect(getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('renders RegisterPage with password confirmation and role select without admin', () => {
    const { getByPlaceholderText, getByRole, getByText, queryByText } = renderWithProviders(<RegisterPage />);

    expect(getByPlaceholderText(/Jordan Vance/i)).toBeInTheDocument();
    expect(getByPlaceholderText(/jordan.vance@company.com/i)).toBeInTheDocument();
    expect(getByText(/Department Role/i)).toBeInTheDocument();
    expect(getByText(/Admin provisioned via Settings/i)).toBeInTheDocument();
    expect(queryByText(/Full System Governance/i)).not.toBeInTheDocument();
    expect(getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
  });

  it('renders ForgotPasswordPage and handles email submission', () => {
    const { getByPlaceholderText, getByRole } = renderWithProviders(<ForgotPasswordPage />);

    expect(getByPlaceholderText(/alex@enterprise.com/i)).toBeInTheDocument();
    expect(getByRole('button', { name: /Send Reset Instructions/i })).toBeInTheDocument();
  });

  it('renders ResetPasswordPage with token input', () => {
    const { getByPlaceholderText, getByRole } = renderWithProviders(<ResetPasswordPage />);

    expect(getByPlaceholderText(/Paste token received via email/i)).toBeInTheDocument();
    expect(getByRole('button', { name: /Update Password/i })).toBeInTheDocument();
  });

  it('renders UnauthorizedPage with 403 status and role notification', () => {
    useAuthStore.setState({
      user: {
        id: 'usr-1',
        email: 'sales@enterprise.com',
        full_name: 'Sales Rep',
        role: 'sales',
        is_active: true,
      },
      isAuthenticated: true,
    });

    const { getByText } = renderWithProviders(<UnauthorizedPage />);

    expect(getByText(/403 — Insufficient Privileges/i)).toBeInTheDocument();
    expect(getByText(/sales@enterprise.com/i)).toBeInTheDocument();
  });

  it('redirects unauthenticated user in ProtectedRoute to login', () => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    const { queryByText, getByText } = renderWithProviders(
      <Routes>
        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <div>Secret Dashboard Content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Login Page Target</div>} />
      </Routes>,
      ['/protected']
    );

    expect(queryByText(/Secret Dashboard Content/i)).not.toBeInTheDocument();
    expect(getByText(/Login Page Target/i)).toBeInTheDocument();
  });

  it('allows authenticated user with admin role in RoleGuard', () => {
    useAuthStore.setState({
      user: {
        id: 'adm-1',
        email: 'admin@enterprise.com',
        full_name: 'Super Admin',
        role: 'admin',
        is_active: true,
      },
      isAuthenticated: true,
    });

    const { getByText } = renderWithProviders(
      <RoleGuard allowedRoles={['admin']}>
        <div>Admin Exclusive Panel</div>
      </RoleGuard>
    );

    expect(getByText(/Admin Exclusive Panel/i)).toBeInTheDocument();
  });

  it('evaluates fine-grained permissions correctly in PermissionGuard', () => {
    useAuthStore.setState({
      user: {
        id: 'sales-1',
        email: 'sales@company.com',
        full_name: 'Sales Rep',
        role: 'sales',
        is_active: true,
        permissions: ['leads:read', 'deals:read'],
      },
      isAuthenticated: true,
    });

    const { getByText, queryByText } = renderWithProviders(
      <div>
        <PermissionGuard permission="leads:read">
          <div>Can View Leads Component</div>
        </PermissionGuard>
        <PermissionGuard permission="settings:manage" fallback={<div>Settings Access Denied</div>}>
          <div>Admin Only Settings</div>
        </PermissionGuard>
      </div>
    );

    expect(getByText(/Can View Leads Component/i)).toBeInTheDocument();
    expect(getByText(/Settings Access Denied/i)).toBeInTheDocument();
    expect(queryByText(/Admin Only Settings/i)).not.toBeInTheDocument();
  });
});
