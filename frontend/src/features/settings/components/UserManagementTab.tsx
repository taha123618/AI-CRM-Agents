import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Shield,
  UserPlus,
  CheckCircle2,
  User,
  AlertCircle,
  LogOut,
  Building,
  Search,
  Filter,
  RotateCcw,
  Edit2,
  Trash2,
  Lock,
  ShieldAlert,
  X,
  Mail,
  Key,
  Layers,
  Sparkles,
} from 'lucide-react';
import { settingsApi } from '../api';
import { SystemUser } from '../types';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ROLE_DEFAULT_PERMISSIONS } from '@/features/auth/hooks/useAuthStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { TablePagination } from './TablePagination';

interface PermissionCategory {
  category: string;
  icon: string;
  items: { id: string; label: string; description: string }[];
}

const PERMISSION_TAXONOMY: PermissionCategory[] = [
  {
    category: 'Sales Pipeline & SDR',
    icon: '💼',
    items: [
      { id: 'leads:read', label: 'View Leads & Contacts', description: 'Access contact records and qualification scores' },
      { id: 'leads:write', label: 'Create & Update Leads', description: 'Modify pipeline contacts and enrichment' },
      { id: 'leads:delete', label: 'Delete Leads', description: 'Remove prospect records' },
      { id: 'deals:read', label: 'View Deals Pipeline', description: 'Inspect stage progression and probability' },
      { id: 'deals:write', label: 'Update Stage & Deals', description: 'Advance deal stages and modify values' },
      { id: 'deals:delete', label: 'Delete Deals', description: 'Archive or purge deal records' },
      { id: 'meetings:read', label: 'View Calendar Meetings', description: 'Inspect scheduled briefings and prep' },
      { id: 'meetings:write', label: 'Schedule & Edit Meetings', description: 'Create and update sales calendar events' },
    ],
  },
  {
    category: 'Customer Success & Omnichannel',
    icon: '🎧',
    items: [
      { id: 'customers:read', label: 'View Customer Accounts', description: 'Monitor ARR, health scores, and CSAT' },
      { id: 'customers:write', label: 'Edit Health & Playbooks', description: 'Update retention playbooks and notes' },
      { id: 'customers:delete', label: 'Delete Customer Records', description: 'Purge customer entity data' },
      { id: 'journey:read', label: 'View Customer Journeys', description: 'Inspect lifecycle telemetry and risk radar' },
      { id: 'journey:write', label: 'Trigger Churn Interventions', description: 'Launch retention workflows via CS Agent' },
      { id: 'whatsapp:read', label: 'View WhatsApp Hub', description: 'Access omnichannel chat logs and history' },
      { id: 'whatsapp:write', label: 'Send WhatsApp & Auto-Pilot', description: 'Dispatch messages and toggle AI auto-pilot' },
    ],
  },
  {
    category: 'AI Agents, Voice & Strategy',
    icon: '🤖',
    items: [
      { id: 'emails:read', label: 'View Email Intelligence', description: 'Inspect incoming email analysis and drafts' },
      { id: 'emails:write', label: 'Send & Draft AI Emails', description: 'Dispatch intelligent automated replies' },
      { id: 'voice:read', label: 'View Voice AI Studio', description: 'Inspect call recordings and buyer intent' },
      { id: 'voice:write', label: 'Execute Voice AI Calls', description: 'Trigger real-time speech turn analytics' },
      { id: 'sequences:read', label: 'View Outreach Cadences', description: 'Inspect multi-touch sequence stages' },
      { id: 'sequences:write', label: 'Manage & Execute Sequences', description: 'Enroll cohorts and dispatch steps' },
      { id: 'war_room:read', label: 'View Deal War Room', description: 'Inspect competitor battle-cards & SWOT' },
      { id: 'war_room:write', label: 'Generate Smart Proposals', description: 'Build e-sign proposals & automation rules' },
      { id: 'custom_agents:read', label: 'View Custom Agents', description: 'Inspect visual prompt toolkits' },
      { id: 'custom_agents:write', label: 'Build & Execute Agents', description: 'Create and test custom agent instances' },
    ],
  },
  {
    category: 'Analytics, Governance & System',
    icon: '🛡️',
    items: [
      { id: 'analytics:read', label: 'View Revenue & Agent Analytics', description: 'Access executive dashboards and charts' },
      { id: 'analytics:export', label: 'Export Data CSV Reports', description: 'Execute 1-click bulk CSV extractions' },
      { id: 'forecasting:read', label: 'View Monte Carlo Simulations', description: 'Inspect P10/P50/P90 ARR projections' },
      { id: 'forecasting:write', label: 'Execute Forecast Runs', description: 'Run stochastic Monte Carlo simulations' },
      { id: 'webhooks:read', label: 'View Webhook Endpoints', description: 'Inspect webhook delivery logs' },
      { id: 'webhooks:write', label: 'Manage Webhook Endpoints', description: 'Create, test, and delete webhooks' },
      { id: 'tasks:read', label: 'View Background Task Monitor', description: 'Inspect task queue workers and states' },
      { id: 'tasks:write', label: 'Manage & Cancel Tasks', description: 'Trigger long-running queue jobs' },
      { id: 'audits:read', label: 'View Compliance Audit Trail', description: 'Inspect SOC2 / GDPR forensic access logs' },
      { id: 'settings:manage', label: 'Manage RBAC & System Settings', description: 'Full administrative governance control' },
    ],
  },
];

export function UserManagementTab() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<SystemUser | null>(null);

  // Create Form State
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createRole, setCreateRole] = useState<'admin' | 'sales' | 'support' | 'auditor'>('sales');
  const [createActive, setCreateActive] = useState(true);
  const [createPermissions, setCreatePermissions] = useState<string[]>(ROLE_DEFAULT_PERMISSIONS.sales);

  // Edit Form State
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<'admin' | 'sales' | 'support' | 'auditor'>('sales');
  const [editActive, setEditActive] = useState(true);
  const [editPermissions, setEditPermissions] = useState<string[]>([]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Pagination State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Feedback State
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const { data: users = [], isLoading } = useQuery<SystemUser[]>({
    queryKey: ['system-users'],
    queryFn: settingsApi.getUsers,
  });

  const { data: ssoData } = useQuery({
    queryKey: ['sso-providers'],
    queryFn: settingsApi.getSsoProviders,
  });

  // Create User Mutation
  const createMutation = useMutation({
    mutationFn: settingsApi.createUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['system-users'] });
      setIsCreateOpen(false);
      setCreateName('');
      setCreateEmail('');
      setCreatePassword('');
      setCreateRole('sales');
      setCreateActive(true);
      setCreatePermissions(ROLE_DEFAULT_PERMISSIONS.sales);
      showNotification(`User ${data.email} provisioned successfully with role ${data.role.toUpperCase()}.`);
    },
    onError: (err: any) => {
      showNotification(err.response?.data?.detail || err.message || 'Failed to create user', 'error');
    },
  });

  // Update User Mutation
  const updateMutation = useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: any }) =>
      settingsApi.updateUser(userId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['system-users'] });
      setEditingUser(null);
      showNotification(`User ${data.email} updated successfully.`);
    },
    onError: (err: any) => {
      showNotification(err.response?.data?.detail || err.message || 'Failed to update user', 'error');
    },
  });

  // Quick Role Update Mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, newRole }: { userId: string; newRole: string }) =>
      settingsApi.updateUserRole(userId, newRole),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['system-users'] });
      showNotification(`Role updated to ${data.role.toUpperCase()} for ${data.email}.`);
    },
    onError: (err: any) => {
      showNotification(err.response?.data?.detail || err.message || 'Failed to change role', 'error');
    },
  });

  // Toggle User Status Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      settingsApi.toggleUserStatus(userId, isActive),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['system-users'] });
      showNotification(`User ${data.email} is now ${data.is_active ? 'ACTIVE' : 'SUSPENDED'}.`);
    },
    onError: (err: any) => {
      showNotification(err.response?.data?.detail || err.message || 'Failed to toggle status', 'error');
    },
  });

  // Delete User Mutation
  const deleteMutation = useMutation({
    mutationFn: (userId: string) => settingsApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-users'] });
      setDeletingUser(null);
      showNotification('User permanently deleted from system.');
    },
    onError: (err: any) => {
      showNotification(err.response?.data?.detail || err.message || 'Failed to delete user', 'error');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: settingsApi.logout,
    onSuccess: () => {
      localStorage.removeItem('crm_access_token');
      showNotification('Session cookies cleared and user logged out.');
    },
  });

  const ssoLoginMutation = useMutation({
    mutationFn: ({ provider, emailHint, nameHint }: { provider: string; emailHint: string; nameHint: string }) =>
      settingsApi.loginSso(provider, `token_${Date.now()}`, emailHint, nameHint),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['system-users'] });
      showNotification(`SSO authentication successful for ${data.user.email} (${data.user.role.toUpperCase()}).`);
    },
  });

  const handleOpenEdit = (targetUser: SystemUser) => {
    setEditingUser(targetUser);
    setEditName(targetUser.full_name);
    setEditEmail(targetUser.email);
    setEditRole(targetUser.role);
    setEditActive(targetUser.is_active);
    setEditPermissions(targetUser.permissions && targetUser.permissions.length > 0 ? targetUser.permissions : ROLE_DEFAULT_PERMISSIONS[targetUser.role] || []);
    setEditPassword('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const payload: any = {
      full_name: editName,
      email: editEmail,
      role: editRole,
      is_active: editActive,
      permissions: editPermissions,
    };
    if (editPassword.trim()) {
      payload.password = editPassword.trim();
    }
    updateMutation.mutate({ userId: editingUser.id, payload });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createEmail || !createPassword || !createName) return;
    createMutation.mutate({
      full_name: createName,
      email: createEmail,
      password: createPassword,
      role: createRole,
      is_active: createActive,
      permissions: createPermissions,
    });
  };

  const applyRolePreset = (targetRole: 'admin' | 'sales' | 'support' | 'auditor', isEditing = false) => {
    const defaults = ROLE_DEFAULT_PERMISSIONS[targetRole] || [];
    if (isEditing) {
      setEditRole(targetRole);
      setEditPermissions(defaults);
    } else {
      setCreateRole(targetRole);
      setCreatePermissions(defaults);
    }
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
            Enterprise Role-Based Access Control (RBAC) & Permissions
          </h2>
          <p className="text-sm text-slate-400">
            Define fine-grained operational permissions, administrative delegations, and security policies across departments.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => logoutMutation.mutate()}
            className="text-xs border-slate-700 hover:bg-slate-800"
          >
            <LogOut className="w-3.5 h-3.5 mr-1 text-slate-400" />
            Clear Session
          </Button>

          {isAdmin ? (
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="bg-brand-500 hover:bg-brand-600 text-white text-xs shadow-lg shadow-brand-500/20"
            >
              <UserPlus className="w-3.5 h-3.5 mr-1" />
              Provision New User
            </Button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 text-xs">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Read-Only Mode</span>
            </div>
          )}
        </div>
      </div>

      {/* RBAC Role Notice for Non-Admins */}
      {!isAdmin && (
        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Signed in as <strong className="uppercase font-mono text-amber-300">{(currentUser?.role || 'User')}</strong>. Full user CRUD & permission delegation is restricted exclusively to <strong>Super Admin</strong>.
            </span>
          </div>
          <Badge variant="warning" className="text-[10px] uppercase font-mono">
            Auditing Access
          </Badge>
        </div>
      )}

      {/* Notifications */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-2 animate-in fade-in ${
            feedback.type === 'error'
              ? 'bg-rose-950/70 border-rose-500/40 text-rose-300'
              : 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Search, Filter & Quick Stats Toolbar */}
      <Card className="p-4 border-slate-800 bg-slate-900/60">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by full name or email address..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="all">All Roles ({users.length})</option>
                <option value="admin">Admin ({users.filter((u) => u.role === 'admin').length})</option>
                <option value="sales">Sales ({users.filter((u) => u.role === 'sales').length})</option>
                <option value="support">Support ({users.filter((u) => u.role === 'support').length})</option>
                <option value="auditor">Auditor ({users.filter((u) => u.role === 'auditor').length})</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only ({users.filter((u) => u.is_active).length})</option>
                <option value="suspended">Suspended Only ({users.filter((u) => !u.is_active).length})</option>
              </select>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-xs text-slate-400 hover:text-white h-8 px-2"
                title="Reset Filters"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Users & RBAC Permissions Table */}
      <Card className="border-slate-800 overflow-hidden bg-slate-900/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Department Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Granted Permissions</th>
                <th className="py-3.5 px-4">Created Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    <User className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    No users matching the active search or filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors group">
                    {/* Full Name & Avatar */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-brand-400 font-bold text-xs shrink-0">
                          {u.full_name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-200 block">{u.full_name}</span>
                          {currentUser?.id === u.id && (
                            <span className="text-[10px] text-brand-400 font-mono">(Your Session)</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-4 text-slate-400 font-mono">{u.email}</td>

                    {/* Role Dropdown / Badge */}
                    <td className="py-3.5 px-4">
                      {isAdmin ? (
                        <select
                          value={u.role}
                          onChange={(e) =>
                            updateRoleMutation.mutate({ userId: u.id, newRole: e.target.value })
                          }
                          disabled={updateRoleMutation.isPending}
                          className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-brand-500 cursor-pointer"
                        >
                          <option value="admin">Admin (Superuser)</option>
                          <option value="sales">Sales (Pipeline & SDR)</option>
                          <option value="support">Support (Success & CS)</option>
                          <option value="auditor">Auditor (Compliance)</option>
                        </select>
                      ) : (
                        <Badge variant={getRoleBadgeVariant(u.role)} className="uppercase text-[10px] font-mono">
                          {u.role}
                        </Badge>
                      )}
                    </td>

                    {/* Status Toggle / Badge */}
                    <td className="py-3.5 px-4">
                      {isAdmin ? (
                        <button
                          onClick={() => toggleStatusMutation.mutate({ userId: u.id, isActive: !u.is_active })}
                          disabled={currentUser?.id === u.id || toggleStatusMutation.isPending}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                            u.is_active
                              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-rose-950/40 hover:border-rose-500/40 hover:text-rose-300'
                              : 'bg-rose-950/60 border-rose-500/40 text-rose-300 hover:bg-emerald-950/40 hover:border-emerald-500/40 hover:text-emerald-300'
                          } ${currentUser?.id === u.id ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                          title={currentUser?.id === u.id ? 'Cannot suspend self' : 'Click to toggle status'}
                        >
                          {u.is_active ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              Active
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                              Suspended
                            </>
                          )}
                        </button>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                            u.is_active
                              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                              : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                          {u.is_active ? 'Active' : 'Suspended'}
                        </span>
                      )}
                    </td>

                    {/* Permissions summary badge */}
                    <td className="py-3.5 px-4">
                      {u.role === 'admin' ? (
                        <Badge variant="purple" className="text-[10px] font-mono">
                          * ALL (SUPERADMIN)
                        </Badge>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                            {(u.permissions && u.permissions.length > 0 ? u.permissions.length : (ROLE_DEFAULT_PERMISSIONS[u.role] || []).length)} Scopes
                          </span>
                          <span className="text-[10px] text-slate-500 truncate max-w-[140px]" title={(u.permissions || ROLE_DEFAULT_PERMISSIONS[u.role] || []).join(', ')}>
                            {(u.permissions || ROLE_DEFAULT_PERMISSIONS[u.role] || []).slice(0, 2).join(', ')}...
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Created Date */}
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>

                    {/* Actions Column */}
                    <td className="py-3.5 px-4 text-right">
                      {isAdmin ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800"
                            title="Edit Permissions & User Profile"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-brand-400" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingUser(u)}
                            disabled={currentUser?.id === u.id}
                            className={`p-1.5 ${
                              currentUser?.id === u.id
                                ? 'text-slate-600 cursor-not-allowed'
                                : 'text-slate-400 hover:text-rose-400 hover:bg-rose-950/40'
                            }`}
                            title={currentUser?.id === u.id ? 'Cannot delete self' : 'Delete User'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px] italic">Read-Only</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <TablePagination
          currentPage={page}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filteredUsers.length}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
        />
      </Card>

      {/* Enterprise SSO Identity Providers Section */}
      <Card className="p-6 border-slate-800 bg-slate-900/60 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-brand-400" />
              Enterprise Single Sign-On (SSO / SAML 2.0 / OIDC)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Active identity federation directory integrations configured for workspace domain authentication.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {(ssoData?.providers || []).map((provider) => (
            <div
              key={provider.id}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-200">{provider.name}</span>
                  <Badge variant="success" className="text-[10px]">
                    Enabled
                  </Badge>
                </div>
                <div className="text-xs text-slate-500">{provider.protocol}</div>
              </div>

              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    ssoLoginMutation.mutate({
                      provider: provider.id,
                      emailHint:
                        provider.id === 'google'
                          ? 'alex.admin@google-workspace.com'
                          : 'sam.audit@microsoft-entra.com',
                      nameHint: provider.id === 'google' ? 'Google Workspace Admin' : 'Microsoft Entra Auditor',
                    })
                  }
                  disabled={ssoLoginMutation.isPending}
                  className="text-xs border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300"
                >
                  Test Handshake
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Modal: Provision New User (Admin Only) */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card border border-slate-800 rounded-2xl w-full max-w-2xl p-6 bg-slate-900/95 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-brand-400" />
                Provision New CRM User & Assign RBAC Scopes
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={createName}
                      onChange={(e) => setCreateName(e.target.value)}
                      placeholder="Morgan Lee"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Work Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={createEmail}
                      onChange={(e) => setCreateEmail(e.target.value)}
                      placeholder="morgan.lee@company.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Initial Password
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={createPassword}
                      onChange={(e) => setCreatePassword(e.target.value)}
                      placeholder="Min 6 chars"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Department Role
                  </label>
                  <select
                    value={createRole}
                    onChange={(e) => applyRolePreset(e.target.value as any, false)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500 cursor-pointer"
                  >
                    <option value="sales">Sales (Pipeline & SDR)</option>
                    <option value="support">Support (Success & CS)</option>
                    <option value="auditor">Auditor (Compliance)</option>
                    <option value="admin">Admin (Full System)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Initial Status
                  </label>
                  <select
                    value={createActive ? 'active' : 'suspended'}
                    onChange={(e) => setCreateActive(e.target.value === 'active')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500 cursor-pointer"
                  >
                    <option value="active">Active & Verified</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {/* Fine-grained Permissions Grid */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-brand-400" />
                    Granular Permission Scopes ({createPermissions.length} selected)
                  </label>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => applyRolePreset(createRole, false)}
                      className="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      Apply Role Preset
                    </button>
                    <span className="text-slate-600">|</span>
                    <button
                      type="button"
                      onClick={() => setCreatePermissions(PERMISSION_TAXONOMY.flatMap((c) => c.items.map((i) => i.id)))}
                      className="text-slate-400 hover:text-white"
                    >
                      All
                    </button>
                    <span className="text-slate-600">|</span>
                    <button
                      type="button"
                      onClick={() => setCreatePermissions([])}
                      className="text-slate-400 hover:text-white"
                    >
                      None
                    </button>
                  </div>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {PERMISSION_TAXONOMY.map((group) => (
                    <div key={group.category} className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 space-y-2">
                      <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                        <span>{group.icon}</span>
                        <span>{group.category}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {group.items.map((item) => (
                          <label key={item.id} className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer group/item">
                            <input
                              type="checkbox"
                              checked={createPermissions.includes(item.id) || createPermissions.includes('*')}
                              disabled={createPermissions.includes('*')}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setCreatePermissions([...createPermissions, item.id]);
                                } else {
                                  setCreatePermissions(createPermissions.filter((p) => p !== item.id));
                                }
                              }}
                              className="rounded border-slate-700 bg-slate-900 text-brand-500 mt-0.5 shrink-0"
                            />
                            <div className="leading-tight">
                              <span className="font-semibold text-slate-200 group-hover/item:text-brand-300 transition-colors block">{item.label}</span>
                              <span className="text-[10px] text-slate-500 font-mono">{item.id}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                  className="text-xs border-slate-700 hover:bg-slate-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-brand-500 hover:bg-brand-600 text-white text-xs shadow-lg shadow-brand-500/20"
                >
                  {createMutation.isPending ? 'Provisioning...' : 'Provision User & Scopes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit User & RBAC Permissions (Admin Only) */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card border border-slate-800 rounded-2xl w-full max-w-2xl p-6 bg-slate-900/95 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-brand-400" />
                Edit RBAC Scopes: {editingUser.email}
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Reset Password
                  </label>
                  <input
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Optional new password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Department Role
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => applyRolePreset(e.target.value as any, true)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500 cursor-pointer"
                  >
                    <option value="admin">Admin (Superuser)</option>
                    <option value="sales">Sales (Pipeline & SDR)</option>
                    <option value="support">Support (Success & CS)</option>
                    <option value="auditor">Auditor (Compliance)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Status
                  </label>
                  <select
                    value={editActive ? 'active' : 'suspended'}
                    onChange={(e) => setEditActive(e.target.value === 'active')}
                    disabled={currentUser?.id === editingUser.id}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500 cursor-pointer disabled:opacity-60"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {/* Fine-grained Permissions Grid */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-brand-400" />
                    Granular Permission Scopes ({editPermissions.length} selected)
                  </label>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => applyRolePreset(editRole, true)}
                      className="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      Apply Role Preset
                    </button>
                    <span className="text-slate-600">|</span>
                    <button
                      type="button"
                      onClick={() => setEditPermissions(PERMISSION_TAXONOMY.flatMap((c) => c.items.map((i) => i.id)))}
                      className="text-slate-400 hover:text-white"
                    >
                      All
                    </button>
                    <span className="text-slate-600">|</span>
                    <button
                      type="button"
                      onClick={() => setEditPermissions([])}
                      className="text-slate-400 hover:text-white"
                    >
                      None
                    </button>
                  </div>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {PERMISSION_TAXONOMY.map((group) => (
                    <div key={group.category} className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 space-y-2">
                      <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                        <span>{group.icon}</span>
                        <span>{group.category}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {group.items.map((item) => (
                          <label key={item.id} className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer group/item">
                            <input
                              type="checkbox"
                              checked={editPermissions.includes(item.id) || editPermissions.includes('*')}
                              disabled={editPermissions.includes('*')}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setEditPermissions([...editPermissions, item.id]);
                                } else {
                                  setEditPermissions(editPermissions.filter((p) => p !== item.id));
                                }
                              }}
                              className="rounded border-slate-700 bg-slate-900 text-brand-500 mt-0.5 shrink-0"
                            />
                            <div className="leading-tight">
                              <span className="font-semibold text-slate-200 group-hover/item:text-brand-300 transition-colors block">{item.label}</span>
                              <span className="text-[10px] text-slate-500 font-mono">{item.id}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingUser(null)}
                  className="text-xs border-slate-700 hover:bg-slate-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="bg-brand-500 hover:bg-brand-600 text-white text-xs shadow-lg shadow-brand-500/20"
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes & Scopes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation (Admin Only) */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card border border-rose-500/40 rounded-2xl w-full max-w-md p-6 bg-slate-900/95 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-950 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Permanently Delete User?</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to remove <strong className="text-slate-200">{deletingUser.email}</strong>? This will revoke all session tokens and remove role assignments. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Button
                variant="outline"
                onClick={() => setDeletingUser(null)}
                className="text-xs border-slate-700 hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                onClick={() => deleteMutation.mutate(deletingUser.id)}
                disabled={deleteMutation.isPending}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
