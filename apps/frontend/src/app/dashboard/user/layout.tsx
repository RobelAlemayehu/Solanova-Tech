import React from 'react';
import ProtectedRoute from '@/components/auth/protected-route';
import Sidebar from '@/components/layout/sidebar';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="user">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
