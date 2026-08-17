import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, UserPlus, CheckCircle2, User, AlertCircle, LogOut, Key, Building, Search, Filter, RotateCcw } from 'lucide-react';
import { settingsApi } from '../api';
import { SystemUser } from '../types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { TablePagination } from './TablePagination';

export function UserManagementTab() {
  const queryClient = useQueryClient();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'sales' | 'support' | 'auditor'>('sales');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Pagination State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const { data: users = [], isLoading, error } = useQuery<SystemUser[]>({
    queryKey: ['system-users'],
    queryFn: settingsApi.getUsers,
  });

  const { data: ssoData } = useQuery({
    queryKey: ['sso-providers'],
    queryFn: settingsApi.getSsoProviders,
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, newRole }: { userId: string; newRole: string }) =>
      settingsApi.updateUserRole(userId, newRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-users'] });
      setFeedback('User role updated successfully.');
      setTimeout(() => setFeedback(null), 3000);
    },
  });

  const registerMutation = useMutation({
    mutationFn: settingsApi.registerUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-users'] });
      setIsInviteOpen(false);
      setFullName('');
      setEmail('');
      setPassword('');
      setFeedback('New user provisioned successfully with HTTP-only session cookies.');
      setTimeout(() => setFeedback(null), 3000);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: settingsApi.logout,
    onSuccess: () => {
      localStorage.removeItem('crm_access_token');
      setFeedback('Session cookies cleared and user logged out.');
      setTimeout(() => setFeedback(null), 3000);
    },
  });

  const ssoLoginMutation = useMutation({
    mutationFn: ({ provider, emailHint, nameHint }: { provider: string; emailHint: string; nameHint: string }) =>
      settingsApi.loginSso(provider, `token_${Date.now()}`, emailHint, nameHint),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['system-users'] });
      setFeedback(`SSO authentication successful for ${data.user.email} (${data.user.role.toUpperCase()}).`);
      setTimeout(() => setFeedback(null), 4000);
    },
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) return;
    registerMutation.mutate({ email, password, full_name: fullName, role });
  };

  const getRoleBadgeVariant = (userRole: string): 'danger' | 'info' | 'warning' | 'purple' | 'default' => {
    switch (userRole) {
      case 'admin':
        return 'danger';
      case 'sales':
        return 'purple';
      case 'support':
        return 'warning';
      case 'auditor':
        return 'info';
      default:
        return 'default';
    }
  };

  // Filtered & Paginated Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        !searchQuery.trim() ||
        u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && u.is_active) ||
        (statusFilter === 'suspended' && !u.is_active);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, page, pageSize]);

  const hasActiveFilters = searchQuery !== '' || roleFilter !== 'all' || statusFilter !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setRoleFilter('all');
    setStatusFilter('all');
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-brand-400" />
            User Access & Role-Based Control (RBAC)
          </h2>
          <p className="text-sm text-slate-400">
            Manage administrative privileges, sales representatives, support tiers, and compliance auditors with HTTP-only cookies.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="flex items-center gap-1.5 text-xs text-slate-300 border-slate-700 hover:bg-slate-800"
          >
            <LogOut className="w-3.5 h-3.5" />
            Clear Session Cookies
          </Button>
          <Button
            onClick={() => setIsInviteOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white shadow-lg shadow-brand-500/20"
          >
            <UserPlus className="w-4 h-4" />
            Add User
          </Button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          {feedback}
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-950/60 border border-rose-500/30 rounded-xl text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          Failed to load users: {(error as Error).message}
        </div>
      )}

      {/* Social SSO Identity Federation Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <Key className="w-4 h-4 text-brand-400" />
          Enterprise Social Single Sign-On (SSO) Providers
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(ssoData?.providers || [
            { id: 'google', name: 'Google Workspace', enabled: true, protocol: 'OpenID Connect / OAuth2' },
            { id: 'microsoft', name: 'Microsoft Entra ID (Azure AD)', enabled: true, protocol: 'OAuth 2.0 / SAML 2.0' },
          ]).map((prov) => (
            <Card key={prov.id} className="glass-card border border-slate-800/80 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                    <Building className="w-4 h-4 text-brand-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">{prov.name}</div>
                    <div className="text-[11px] text-slate-400">{prov.protocol}</div>
                  </div>
                </div>
                <Badge variant="success">Active</Badge>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                <span className="text-xs text-slate-400">OAuth 2.0 Verified</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    ssoLoginMutation.mutate({
                      provider: prov.id,
                      emailHint: prov.id === 'google' ? 'google.lead@workspace-domain.com' : 'entra.lead@azure-domain.com',
                      nameHint: prov.id === 'google' ? 'Google Workspace User' : 'Microsoft Entra User',
                    })
                  }
                  disabled={ssoLoginMutation.isPending}
                  className="text-xs border-slate-700 hover:bg-slate-800 text-slate-200"
                >
                  Test {prov.name.split(' ')[0]} SSO
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="glass-card border border-slate-800/80 p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search user name or email..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Role Filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-500"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="sales">Sales</option>
                <option value="support">Support</option>
                <option value="auditor">Auditor</option>
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <Button
                size="sm"
                variant="ghost"
                onClick={resetFilters}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </Button>
            )}
          </div>

          <div className="text-xs text-slate-400 font-mono self-end sm:self-center">
            {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} matched
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="glass-card border border-slate-800/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/60 text-slate-400 text-xs uppercase font-semibold border-b border-slate-800/80">
              <tr>
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Role Permissions</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-semibold">
                        <User className="w-4 h-4 text-brand-400" />
                      </div>
                      <div>
                        <div className="font-medium text-white">{user.full_name}</div>
                        <div className="text-xs text-slate-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {user.is_active ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    {user.role === 'admin' && 'Full System Control, User RBAC & Audits'}
                    {user.role === 'sales' && 'Pipeline Deals, Contacts, Voice & AI SDR'}
                    {user.role === 'support' && 'Customer Success, WhatsApp & Journey'}
                    {user.role === 'auditor' && 'Read-Only Compliance & Forensics'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        updateRoleMutation.mutate({ userId: user.id, newRole: e.target.value })
                      }
                      className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-500"
                    >
                      <option value="sales">Sales</option>
                      <option value="support">Support</option>
                      <option value="auditor">Auditor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
              {paginatedUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    {hasActiveFilters
                      ? 'No users match the selected filters.'
                      : 'No users found. Register the first administrator above.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <TablePagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={filteredUsers.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
          pageSizeOptions={[5, 10, 25, 50]}
        />
      </Card>

      {/* Invite Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-brand-400" />
                Provision System User
              </h3>
              <button
                onClick={() => setIsInviteOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Jordan Vance"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jordan.vance@company.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Role Assignment</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
                >
                  <option value="sales">Sales (Pipeline & Outbound AI)</option>
                  <option value="support">Support (WhatsApp & Journey)</option>
                  <option value="auditor">Auditor (Compliance & Forensics)</option>
                  <option value="admin">Admin (Full System Privilege)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <Button variant="ghost" type="button" onClick={() => setIsInviteOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={registerMutation.isPending}>
                  {registerMutation.isPending ? 'Provisioning...' : 'Provision User'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
