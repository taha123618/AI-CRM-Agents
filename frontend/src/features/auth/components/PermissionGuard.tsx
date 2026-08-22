import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: string;
  anyPermissions?: string[];
  allPermissions?: string[];
  role?: UserRole | UserRole[];
  fallback?: React.ReactNode;
}

export function PermissionGuard({
  children,
  permission,
  anyPermissions,
  allPermissions,
  role,
  fallback = null,
}: PermissionGuardProps) {
  const { hasRole, hasPermission, hasAnyPermission, hasAllPermissions, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  if (role && !hasRole(role)) {
    return <>{fallback}</>;
  }

  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  if (anyPermissions && anyPermissions.length > 0 && !hasAnyPermission(anyPermissions)) {
    return <>{fallback}</>;
  }

  if (allPermissions && allPermissions.length > 0 && !hasAllPermissions(allPermissions)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
