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
