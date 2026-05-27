'use client';

import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { User } from '@/contexts/auth-context';

// ─── Types ───────────────────────────────────────────────────────────────────

interface RoleGateProps {
  children: React.ReactNode;
  /**
   * The role required to render children.
   * Supports a single role or an array for multiple allowed roles.
   *
   * @example
   * // Single role
   * <RoleGate requiredRole="admin">...</RoleGate>
   *
   * // Multiple allowed roles
   * <RoleGate requiredRole={['admin', 'owner']}>...</RoleGate>
   */
  requiredRole: User['role'] | User['role'][];
  /**
   * Optional fallback to render when the user does not have the required role.
   * Defaults to null (renders nothing).
   */
  fallback?: React.ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * RoleGate — conditionally renders children based on the authenticated user's
 * role. Does NOT redirect; use <ProtectedRoute> for redirect-based guards.
 *
 * Returns `fallback` (default: null) when:
 *  • Auth is still loading
 *  • No user is authenticated
 *  • User's role does not satisfy `requiredRole`
 */
export default function RoleGate({
  children,
  requiredRole,
  fallback = null,
}: RoleGateProps) {
  const { user, isLoading } = useAuth();

  // While loading or unauthenticated, never reveal gated content.
  if (isLoading || !user) return <>{fallback}</>;

  const allowed = Array.isArray(requiredRole)
    ? requiredRole.includes(user.role)
    : user.role === requiredRole;

  if (!allowed) return <>{fallback}</>;

  return <>{children}</>;
}
