import { create } from 'zustand';
import { UserProfile, UserRole } from '../types';
import { safeStorage } from '@/lib/storage';

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

const getStoredUser = (): UserProfile | null => {
  try {
    const raw = safeStorage.getItem('crm_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const getStoredToken = (): string | null => {
  return safeStorage.getItem('crm_access_token');
};

const initialUser = getStoredUser();
const initialToken = getStoredToken();

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initialUser,
  isAuthenticated: Boolean(initialUser || initialToken),
  isLoading: Boolean(initialToken && !initialUser),

  setUser: (user) => {
    try {
      if (user) {
        safeStorage.setItem('crm_user', JSON.stringify(user));
      } else {
        safeStorage.removeItem('crm_user');
      }
    } catch {
      // safe fallback
    }
    set({
      user,
      isAuthenticated: Boolean(user),
      isLoading: false,
    });
  },

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
    try {
      safeStorage.removeItem('crm_user');
      safeStorage.removeItem('crm_access_token');
    } catch (error) {
      console.error('Error removing user or token from storage.', (error as Error).message);
    }
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
}));
