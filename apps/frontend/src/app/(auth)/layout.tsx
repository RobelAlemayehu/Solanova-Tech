import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="proplist-card p-8">
          {children}
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">
          PropList — Multi-tenant property listing platform
        </p>
      </div>
    </div>
  );
}
