import React from 'react';
import ProtectedRoute from '@/components/auth/protected-route';
import Sidebar from '@/components/layout/sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8 text-black">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
