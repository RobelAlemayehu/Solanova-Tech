'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import type { User } from '@/contexts/auth-context';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** When provided, only users whose role matches exactly may proceed. */
  requiredRole?: User['role'];
}

// ─── Inline Toast ─────────────────────────────────────────────────────────────
// A minimal self-contained toast so we don't need an external library.

const toastStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: '1.5rem',
  right: '1.5rem',
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
  gap: '0.625rem',
  padding: '0.75rem 1.25rem',
  borderRadius: '0.625rem',
  background: '#1e1e2e',
  color: '#f38ba8',
  fontSize: '0.875rem',
  fontWeight: 500,
  boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
  animation: 'proplist-toast-in 0.25s ease',
  border: '1px solid rgba(243, 139, 168, 0.3)',
};

const keyframes = `
@keyframes proplist-toast-in {
  from { opacity: 0; transform: translateY(12px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0)   scale(1);    }
}
`;

function AccessDeniedToast({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <>
      <style>{keyframes}</style>
      <div role="alert" aria-live="assertive" style={toastStyle}>
        {/* Lock icon */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        Access denied
      </div>
    </>
  );
}

// ─── Full-Screen Spinner ──────────────────────────────────────────────────────

function FullScreenSpinner() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-background, #fff)',
        zIndex: 9998,
      }}
      aria-label="Loading"
      role="status"
    >
      <style>{`
        @keyframes proplist-spin {
          to { transform: rotate(360deg); }
        }
        .proplist-spinner {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 3px solid rgba(99,102,241,0.15);
          border-top-color: #6366f1;
          animation: proplist-spin 0.75s linear infinite;
        }
      `}</style>
      <span className="proplist-spinner" />
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Controls visibility of the "Access denied" toast before redirect.
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (requiredRole && user.role !== requiredRole) {
      setShowToast(true);
      // Give the toast a moment to be seen before navigating away.
      const timer = setTimeout(() => {
        router.push('/');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user, isLoading, requiredRole, router]);

  // 1. Still resolving auth state — show spinner.
  if (isLoading) return <FullScreenSpinner />;

  // 2. Not authenticated — redirect is in-flight; render nothing.
  if (!user) return null;

  // 3. Authenticated but wrong role — show toast, then redirect.
  if (requiredRole && user.role !== requiredRole) {
    return <AccessDeniedToast visible={showToast} />;
  }

  // 4. All checks passed — render children.
  return <>{children}</>;
}
