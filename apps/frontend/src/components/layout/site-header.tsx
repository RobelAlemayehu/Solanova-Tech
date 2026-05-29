'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { getDashboardPath } from '@/lib/auth-redirect';

export default function SiteHeader() {
  const { user, isLoading, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--color-border)] bg-[rgba(10,16,34,0.85)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href={user ? getDashboardPath(user.role) : '/'} className="text-lg font-black tracking-tight">
          <span className="bg-gradient-to-r from-teal-400 via-cyan-500 to-indigo-400 bg-clip-text text-transparent">
            PropList
          </span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          {!isLoading && user && (
            <>
              <Link href="/properties" className="proplist-btn-ghost !py-2 !px-3 text-xs sm:text-sm">
                Browse
              </Link>
              <Link href={getDashboardPath(user.role)} className="proplist-btn-ghost !py-2 !px-3 text-xs sm:text-sm">
                Dashboard
              </Link>
              <span className="hidden sm:inline text-xs text-slate-400 truncate max-w-[140px]">
                {user.displayName || user.email}
              </span>
              <button
                type="button"
                onClick={logout}
                className="proplist-btn-ghost !py-2 !px-3 text-xs sm:text-sm text-red-200 border-[rgba(239,68,68,0.25)]"
              >
                Log out
              </button>
            </>
          )}

          {!isLoading && !user && (
            <>
              <Link href="/login" className="proplist-btn-ghost !py-2 !px-3 text-xs sm:text-sm">
                Sign in
              </Link>
              <Link href="/register" className="proplist-btn-primary !py-2 !px-3 text-xs sm:text-sm">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
