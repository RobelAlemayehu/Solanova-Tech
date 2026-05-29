import type { User } from '@/contexts/auth-context';

export function getDashboardPath(role: User['role']): string {
  switch (role) {
    case 'admin':
      return '/dashboard/admin';
    case 'owner':
      return '/dashboard/owner';
    default:
      return '/dashboard/user';
  }
}

/** Account home for role (profile page for users). */
export function getAccountPath(role: User['role']): string {
  if (role === 'user') {
    return '/dashboard/user/profile';
  }
  return getProfilePath(role);
}

export function getProfilePath(role: User['role']): string {
  switch (role) {
    case 'admin':
      return '/dashboard/admin/profile';
    case 'owner':
      return '/dashboard/owner/profile';
    default:
      return '/dashboard/user/profile';
  }
}

/** Where to send users immediately after login or register. */
export function getPostLoginPath(role: User['role']): string {
  if (role === 'user') {
    return '/properties';
  }
  return getDashboardPath(role);
}

/** Logo target on public / browse pages. */
export function getLogoHref(role: User['role'] | undefined): string {
  if (!role) return '/';
  if (role === 'user' || role === 'owner') {
    return '/properties';
  }
  return getDashboardPath(role);
}
