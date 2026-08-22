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
      { id: 'custom_agents:write', label: 'Deploy Custom Agents', description: 'Publish custom AI agent bots' },
    ],
  },
  {
    category: 'Administration & System Forensics',
    icon: '⚙️',
    items: [
      { id: 'settings:read', label: 'View System Settings', description: 'Access system health and custom fields' },
      { id: 'settings:write', label: 'Modify Infrastructure', description: 'Update webhooks, ETL, and integrations' },
      { id: 'users:manage', label: 'User & RBAC Management', description: 'Provision accounts and assign permissions' },
      { id: 'audit_logs:read', label: 'View Compliance Logs', description: 'Inspect forensic audit trails and security' },
    ],
  },
];

export function UserManagementTab() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<SystemUser | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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
  const [editRole, setEditRole] = useState<'admin' | 'sales' | 'support' | 'auditor'>('sales');
  const [editActive, setEditActive] = useState(true);
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [editPassword, setEditPassword] = useState('');

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Queries
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
    <div className="space-y-4 font-mono">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-none bg-card border border-border">
        <div>
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
            <Shield className="w-4 h-4 text-primary" />
            ROLE-BASED ACCESS CONTROL (RBAC) &amp; USER PERMISSIONS
          </h2>
          <p className="text-[10px] text-muted-foreground mt-0.5 uppercase">
            DEFINE FINE-GRAINED OPERATIONAL PERMISSIONS, ADMINISTRATIVE DELEGATIONS, AND SECURITY POLICIES.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => logoutMutation.mutate()}
            className="text-xs h-7 uppercase"
          >
            <LogOut className="w-3 h-3 mr-1 text-muted-foreground" />
            CLEAR SESSION
          </Button>

          {isAdmin ? (
            <Button
              onClick={() => setIsCreateOpen(true)}
              variant="primary"
              size="sm"
              className="text-xs h-7 uppercase font-bold"
            >
              <UserPlus className="w-3.5 h-3.5 mr-1 text-primary-foreground" />
              PROVISION USER
            </Button>
          ) : (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-none bg-background border border-border text-muted-foreground text-[10px] uppercase font-mono">
              <Lock className="w-3 h-3 text-primary" />
              <span>READ-ONLY MODE</span>
            </div>
          )}
        </div>
      </div>

      {/* RBAC Role Notice for Non-Admins */}
      {!isAdmin && (
        <div className="p-3 rounded-none bg-background border border-amber-500/40 text-amber-300 text-xs flex items-center justify-between gap-3 font-mono uppercase">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-primary shrink-0" />
            <span>
              SIGNED IN AS <strong className="font-mono text-primary">{(currentUser?.role || 'User').toUpperCase()}</strong>. FULL USER CRUD &amp; PERMISSION DELEGATION IS RESTRICTED TO <strong>SUPER ADMIN</strong>.
            </span>
          </div>
          <Badge variant="warning" className="text-[9px] uppercase font-mono">
            AUDITING ACCESS
          </Badge>
        </div>
      )}

      {/* Notifications */}
      {feedback && (
        <div
          className={`p-3 rounded-none border text-xs flex items-center justify-between gap-2 uppercase font-mono animate-in fade-in ${feedback.type === 'error'
              ? 'bg-background border-destructive text-destructive'
              : 'bg-background border-primary text-primary'
            }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-muted-foreground hover:text-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Search, Filter & Quick Stats Toolbar */}
      <Card className="p-3 border-border bg-card font-mono">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground/60 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="SEARCH BY FULL NAME OR EMAIL..."
              className="w-full bg-background border border-border rounded-none pl-8 pr-3 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary uppercase font-mono"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap font-mono">
            <div className="flex items-center gap-1 bg-background border border-border rounded-none px-2 py-1">
              <Filter className="w-3 h-3 text-muted-foreground/60" />
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent text-xs text-foreground/80 focus:outline-none cursor-pointer uppercase font-mono"
              >
                <option value="all" className="bg-background">ALL ROLES ({users.length})</option>
                <option value="admin" className="bg-background">ADMIN ({users.filter((u) => u.role === 'admin').length})</option>
                <option value="sales" className="bg-background">SALES ({users.filter((u) => u.role === 'sales').length})</option>
                <option value="support" className="bg-background">SUPPORT ({users.filter((u) => u.role === 'support').length})</option>
                <option value="auditor" className="bg-background">AUDITOR ({users.filter((u) => u.role === 'auditor').length})</option>
              </select>
            </div>

            <div className="flex items-center gap-1 bg-background border border-border rounded-none px-2 py-1">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent text-xs text-foreground/80 focus:outline-none cursor-pointer uppercase font-mono"
              >
                <option value="all" className="bg-background">ALL STATUSES</option>
                <option value="active" className="bg-background">ACTIVE ({users.filter((u) => u.is_active).length})</option>
                <option value="suspended" className="bg-background">SUSPENDED ({users.filter((u) => !u.is_active).length})</option>
              </select>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-xs text-muted-foreground hover:text-foreground h-7 px-2 uppercase"
                title="Reset Filters"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                RESET
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Users & RBAC Permissions Table */}
      <Card className="border-border overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-border bg-background text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">USER</th>
                <th className="py-2.5 px-3">EMAIL</th>
                <th className="py-2.5 px-3">ROLE</th>
                <th className="py-2.5 px-3">STATUS</th>
                <th className="py-2.5 px-3">SCOPES</th>
                <th className="py-2.5 px-3">CREATED</th>
                <th className="py-2.5 px-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground/60 uppercase">
                    <User className="w-6 h-6 mx-auto mb-1 text-muted-foreground/60" />
                    NO USERS MATCHING THE ACTIVE SEARCH OR FILTER CRITERIA.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-background transition-none group">
                    {/* Full Name & Avatar */}
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-none bg-background border border-border flex items-center justify-center text-primary font-bold text-xs shrink-0 font-mono">
                          {u.full_name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <span className="font-bold text-foreground block uppercase text-[11px]">{u.full_name}</span>
                          {currentUser?.id === u.id && (
                            <span className="text-[9px] text-primary font-mono">(YOUR SESSION)</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-2 px-3 text-muted-foreground font-mono text-[11px]">{u.email}</td>

                    {/* Role Dropdown / Badge */}
                    <td className="py-2 px-3">
                      {isAdmin ? (
                        <select
                          value={u.role}
                          onChange={(e) =>
                            updateRoleMutation.mutate({ userId: u.id, newRole: e.target.value })
                          }
                          disabled={updateRoleMutation.isPending}
                          className="bg-background border border-border rounded-none px-2 py-0.5 text-xs text-foreground focus:outline-none focus:border-primary cursor-pointer font-mono uppercase"
                        >
                          <option value="admin">ADMIN (SUPERUSER)</option>
                          <option value="sales">SALES (PIPELINE &amp; SDR)</option>
                          <option value="support">SUPPORT (SUCCESS &amp; CS)</option>
                          <option value="auditor">AUDITOR (COMPLIANCE)</option>
                        </select>
                      ) : (
                        <Badge variant={getRoleBadgeVariant(u.role)} className="uppercase text-[9px] font-mono">
                          {u.role}
                        </Badge>
                      )}
                    </td>

                    {/* Status Toggle / Badge */}
                    <td className="py-2 px-3">
                      {isAdmin ? (
                        <button
                          onClick={() => toggleStatusMutation.mutate({ userId: u.id, isActive: !u.is_active })}
                          disabled={currentUser?.id === u.id || toggleStatusMutation.isPending}
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none text-[10px] font-bold uppercase border transition-none font-mono ${u.is_active
                              ? 'bg-background border-primary text-primary hover:border-destructive hover:text-destructive'
                              : 'bg-background border-destructive text-destructive hover:border-primary hover:text-primary'
                            } ${currentUser?.id === u.id ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                          title={currentUser?.id === u.id ? 'Cannot suspend self' : 'Click to toggle status'}
                        >
                          {u.is_active ? 'ACTIVE' : 'SUSPENDED'}
                        </button>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-none text-[10px] font-bold uppercase border font-mono ${u.is_active
                              ? 'bg-background border-primary text-primary'
                              : 'bg-background border-destructive text-destructive'
                            }`}
                        >
                          {u.is_active ? 'ACTIVE' : 'SUSPENDED'}
                        </span>
                      )}
                    </td>

                    {/* Permissions summary badge */}
                    <td className="py-2 px-3">
                      {u.role === 'admin' ? (
                        <Badge variant="purple" className="text-[9px] font-mono uppercase">
                          * ALL (SUPERADMIN)
                        </Badge>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono bg-background px-1.5 py-0.5 rounded-none border border-border text-primary">
                            {(u.permissions && u.permissions.length > 0 ? u.permissions.length : (ROLE_DEFAULT_PERMISSIONS[u.role] || []).length)} SCOPES
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Created Date */}
                    <td className="py-2 px-3 text-muted-foreground/60 text-[10px]">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>

                    {/* Actions Column */}
                    <td className="py-2 px-3 text-right">
                      {isAdmin ? (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(u)}
                            className="p-1 text-muted-foreground hover:text-foreground h-6 w-6"
                            title="Edit Permissions & User Profile"
                          >
                            <Edit2 className="w-3 h-3 text-primary" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingUser(u)}
                            disabled={currentUser?.id === u.id}
                            className={`p-1 h-6 w-6 ${currentUser?.id === u.id
                                ? 'text-muted-foreground/60 cursor-not-allowed'
                                : 'text-muted-foreground hover:text-destructive'
                              }`}
                            title={currentUser?.id === u.id ? 'Cannot delete self' : 'Delete User'}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/60 text-[10px] uppercase">READ-ONLY</span>
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
      <Card className="p-4 border-border bg-card space-y-3 font-mono">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
              <Building className="w-3.5 h-3.5 text-primary" />
              ENTERPRISE SINGLE SIGN-ON (SSO / SAML 2.0 / OIDC)
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5 uppercase">
              ACTIVE IDENTITY FEDERATION DIRECTORY INTEGRATIONS CONFIGURED FOR WORKSPACE DOMAIN AUTHENTICATION.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {(ssoData?.providers || []).map((provider) => (
            <div
              key={provider.id}
              className="p-3 rounded-none bg-background border border-border flex items-center justify-between"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-foreground uppercase">{provider.name}</span>
                  <Badge variant="success" className="text-[8px] uppercase">
                    ENABLED
                  </Badge>
                </div>
                <div className="text-[10px] text-muted-foreground/60 uppercase">{provider.protocol}</div>
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
                  className="text-xs h-7 uppercase border-border"
                >
                  TEST HANDSHAKE
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Modal: Provision New User (Admin Only) */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-sm animate-in fade-in font-mono">
          <div className="border border-border rounded-none w-full max-w-2xl p-5 bg-card shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
                <UserPlus className="w-4 h-4 text-primary" />
                PROVISION NEW CRM USER &amp; ASSIGN RBAC SCOPES
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-foreground/80 mb-1 uppercase tracking-wider">
                    FULL NAME
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-muted-foreground/60 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={createName}
                      onChange={(e) => setCreateName(e.target.value)}
                      placeholder="MORGAN LEE"
                      className="w-full bg-background border border-border rounded-none pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary uppercase font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-foreground/80 mb-1 uppercase tracking-wider">
                    WORK EMAIL ADDRESS
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground/60 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={createEmail}
                      onChange={(e) => setCreateEmail(e.target.value)}
                      placeholder="MORGAN.LEE@COMPANY.COM"
                      className="w-full bg-background border border-border rounded-none pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary uppercase font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-foreground/80 mb-1 uppercase tracking-wider">
                    INITIAL PASSWORD
                  </label>
                  <div className="relative">
                    <Key className="w-3.5 h-3.5 text-muted-foreground/60 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={createPassword}
                      onChange={(e) => setCreatePassword(e.target.value)}
                      placeholder="MIN 6 CHARS"
                      className="w-full bg-background border border-border rounded-none pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-foreground/80 mb-1 uppercase tracking-wider">
                    DEPARTMENT ROLE
                  </label>
                  <select
                    value={createRole}
                    onChange={(e) => applyRolePreset(e.target.value as any, false)}
                    className="w-full bg-background border border-border rounded-none px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary cursor-pointer uppercase font-mono"
                  >
                    <option value="sales">SALES (PIPELINE &amp; SDR)</option>
                    <option value="support">SUPPORT (SUCCESS &amp; CS)</option>
                    <option value="auditor">AUDITOR (COMPLIANCE)</option>
                    <option value="admin">ADMIN (FULL SYSTEM)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-foreground/80 mb-1 uppercase tracking-wider">
                    INITIAL STATUS
                  </label>
                  <select
                    value={createActive ? 'active' : 'suspended'}
                    onChange={(e) => setCreateActive(e.target.value === 'active')}
                    className="w-full bg-background border border-border rounded-none px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary cursor-pointer uppercase font-mono"
                  >
                    <option value="active">ACTIVE &amp; VERIFIED</option>
                    <option value="suspended">SUSPENDED</option>
                  </select>
                </div>
              </div>

              {/* Fine-grained Permissions Grid */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase">
                    <Layers className="w-3.5 h-3.5 text-primary" />
                    GRANULAR PERMISSION SCOPES ({createPermissions.length} SELECTED)
                  </label>
                  <div className="flex items-center gap-2 text-[10px] uppercase font-mono">
                    <button
                      type="button"
                      onClick={() => applyRolePreset(createRole, false)}
                      className="text-primary font-bold flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      ROLE PRESET
                    </button>
                    <span className="text-muted-foreground/60">|</span>
                    <button
                      type="button"
                      onClick={() => setCreatePermissions(PERMISSION_TAXONOMY.flatMap((c) => c.items.map((i) => i.id)))}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      ALL
                    </button>
                    <span className="text-muted-foreground/60">|</span>
                    <button
                      type="button"
                      onClick={() => setCreatePermissions([])}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      NONE
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {PERMISSION_TAXONOMY.map((group) => (
                    <div key={group.category} className="bg-background p-2.5 rounded-none border border-border space-y-1.5">
                      <div className="text-[10px] font-bold text-foreground flex items-center gap-1.5 border-b border-border pb-1 uppercase">
                        <span>{group.icon}</span>
                        <span>{group.category}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {group.items.map((item) => (
                          <label key={item.id} className="flex items-start gap-1.5 text-xs text-foreground/80 cursor-pointer">
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
                              className="rounded-none border-border bg-card text-primary accent-primary mt-0.5 shrink-0"
                            />
                            <div className="leading-tight">
                              <span className="font-bold text-foreground block uppercase text-[10px]">{item.label}</span>
                              <span className="text-[8px] text-muted-foreground/60 font-mono">{item.id}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateOpen(false)}
                  className="text-xs uppercase"
                >
                  CANCEL
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={createMutation.isPending}
                  className="text-xs uppercase font-bold"
                >
                  {createMutation.isPending ? 'PROVISIONING...' : 'PROVISION USER & SCOPES'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit User & RBAC Permissions (Admin Only) */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-sm animate-in fade-in font-mono">
          <div className="border border-border rounded-none w-full max-w-2xl p-5 bg-card shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
                <Edit2 className="w-4 h-4 text-primary" />
                EDIT RBAC SCOPES: {editingUser.email}
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-muted-foreground hover:text-foreground transition-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-foreground/80 mb-1 uppercase tracking-wider">
                    FULL NAME
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-background border border-border rounded-none px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-foreground/80 mb-1 uppercase tracking-wider">
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-background border border-border rounded-none px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary uppercase font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-foreground/80 mb-1 uppercase tracking-wider">
                    RESET PASSWORD
                  </label>
                  <input
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="OPTIONAL NEW PASSWORD"
                    className="w-full bg-background border border-border rounded-none px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-foreground/80 mb-1 uppercase tracking-wider">
                    DEPARTMENT ROLE
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => applyRolePreset(e.target.value as any, true)}
                    className="w-full bg-background border border-border rounded-none px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary cursor-pointer uppercase font-mono"
                  >
                    <option value="admin">ADMIN (SUPERUSER)</option>
                    <option value="sales">SALES (PIPELINE &amp; SDR)</option>
                    <option value="support">SUPPORT (SUCCESS &amp; CS)</option>
                    <option value="auditor">AUDITOR (COMPLIANCE)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-foreground/80 mb-1 uppercase tracking-wider">
                    STATUS
                  </label>
                  <select
                    value={editActive ? 'active' : 'suspended'}
                    onChange={(e) => setEditActive(e.target.value === 'active')}
                    disabled={currentUser?.id === editingUser.id}
                    className="w-full bg-background border border-border rounded-none px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary cursor-pointer uppercase font-mono disabled:opacity-60"
                  >
                    <option value="active">ACTIVE</option>
                    <option value="suspended">SUSPENDED</option>
                  </select>
                </div>
              </div>

              {/* Fine-grained Permissions Grid */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase">
                    <Layers className="w-3.5 h-3.5 text-primary" />
                    GRANULAR PERMISSION SCOPES ({editPermissions.length} SELECTED)
                  </label>
                  <div className="flex items-center gap-2 text-[10px] uppercase font-mono">
                    <button
                      type="button"
                      onClick={() => applyRolePreset(editRole, true)}
                      className="text-primary font-bold flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      ROLE PRESET
                    </button>
                    <span className="text-muted-foreground/60">|</span>
                    <button
                      type="button"
                      onClick={() => setEditPermissions(PERMISSION_TAXONOMY.flatMap((c) => c.items.map((i) => i.id)))}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      ALL
                    </button>
                    <span className="text-muted-foreground/60">|</span>
                    <button
                      type="button"
                      onClick={() => setEditPermissions([])}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      NONE
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {PERMISSION_TAXONOMY.map((group) => (
                    <div key={group.category} className="bg-background p-2.5 rounded-none border border-border space-y-1.5">
                      <div className="text-[10px] font-bold text-foreground flex items-center gap-1.5 border-b border-border pb-1 uppercase">
                        <span>{group.icon}</span>
                        <span>{group.category}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {group.items.map((item) => (
                          <label key={item.id} className="flex items-start gap-1.5 text-xs text-foreground/80 cursor-pointer">
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
                              className="rounded-none border-border bg-card text-primary accent-primary mt-0.5 shrink-0"
                            />
                            <div className="leading-tight">
                              <span className="font-bold text-foreground block uppercase text-[10px]">{item.label}</span>
                              <span className="text-[8px] text-muted-foreground/60 font-mono">{item.id}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingUser(null)}
                  className="text-xs uppercase"
                >
                  CANCEL
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={updateMutation.isPending}
                  className="text-xs uppercase font-bold"
                >
                  {updateMutation.isPending ? 'SAVING...' : 'SAVE CHANGES & SCOPES'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation (Admin Only) */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-sm animate-in fade-in font-mono">
          <div className="border border-destructive rounded-none w-full max-w-md p-5 bg-card shadow-2xl space-y-3">
            <div className="w-10 h-10 rounded-none bg-background border border-destructive flex items-center justify-center text-destructive">
              <Trash2 className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">PERMANENTLY DELETE USER?</h3>
              <p className="text-[10px] text-muted-foreground uppercase leading-relaxed">
                ARE YOU SURE YOU WANT TO REMOVE <strong className="text-foreground">{deletingUser.email}</strong>? THIS WILL REVOKE ALL SESSION TOKENS AND REMOVE ROLE ASSIGNMENTS. THIS ACTION CANNOT BE UNDONE.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeletingUser(null)}
                className="text-xs uppercase"
              >
                CANCEL
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => deleteMutation.mutate(deletingUser.id)}
                disabled={deleteMutation.isPending}
                className="text-xs uppercase font-bold"
              >
                {deleteMutation.isPending ? 'DELETING...' : 'CONFIRM DELETE'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
