'use client';

import React from 'react';
import { useAuth } from '@/hooks/use-auth';

interface RoleGateProps {
  children: React.ReactNode;
  requiredRole: 'admin' | 'owner' | 'user';
}

export default function RoleGate({ children, requiredRole }: RoleGateProps) {
  const { user } = useAuth();

  if (!user || user.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
