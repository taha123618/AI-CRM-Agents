import { create } from 'zustand';
import { UserProfile, UserRole } from '../types';

export const ROLE_DEFAULT_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['*'],
  sales: [
    'leads:read',
    'leads:write',
    'deals:read',
    'deals:write',
    'emails:read',
    'emails:write',
    'meetings:read',
    'meetings:write',
    'sequences:read',
    'sequences:write',
    'voice:read',
    'voice:write',
    'war_room:read',
    'war_room:write',
    'analytics:read',
  ],
  support: [
    'customers:read',
    'customers:write',
    'journey:read',
    'journey:write',
    'whatsapp:read',
    'whatsapp:write',
    'emails:read',
    'emails:write',
    'meetings:read',
    'meetings:write',
  ],
  auditor: [
    'leads:read',
    'deals:read',
    'customers:read',
    'emails:read',
    'meetings:read',
    'voice:read',
    'whatsapp:read',
    'sequences:read',
    'journey:read',
    'war_room:read',
    'analytics:read',
    'forecasting:read',
    'audits:read',
    'tasks:read',
  ],
};

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  getEffectivePermissions: () => string[];
  logoutState: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  hasRole: (roles) => {
    const currentUser = get().user;
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(currentUser.role);
  },

  getEffectivePermissions: () => {
    const currentUser = get().user;
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return ['*'];
    const roleDefaults = ROLE_DEFAULT_PERMISSIONS[currentUser.role] || [];
    const explicitPerms = currentUser.permissions || [];
    return Array.from(new Set([...roleDefaults, ...explicitPerms]));
  },

  hasPermission: (permission) => {
    const currentUser = get().user;
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;

    const effective = get().getEffectivePermissions();
    if (effective.includes('*') || effective.includes(permission)) return true;

    const ns = permission.split(':')[0];
    if (effective.includes(`${ns}:*`)) return true;

    return false;
  },

  hasAnyPermission: (permissions) => {
    return permissions.some((p) => get().hasPermission(p));
  },

  hasAllPermissions: (permissions) => {
    return permissions.every((p) => get().hasPermission(p));
  },

  logoutState: () => {
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
}));
