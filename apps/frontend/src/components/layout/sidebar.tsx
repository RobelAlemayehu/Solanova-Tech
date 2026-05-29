'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { getProfilePath } from '@/lib/auth-redirect';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const navLink = (href: string) => {
    const active = pathname === href || pathname.startsWith(href + '/');
    return `block rounded-lg px-3 py-2 text-sm font-semibold transition ${
      active
        ? 'bg-indigo-500/15 text-indigo-200'
        : 'text-slate-200/90 hover:bg-white/5 hover:text-white'
    }`;
  };

  const profilePath = getProfilePath(user.role);

  return (
    <aside className="w-72 min-h-screen flex flex-col justify-between border-r border-[color:var(--color-border)] bg-[rgba(10,16,34,0.65)] backdrop-blur-xl">
      <div className="p-6">
        <div className="mb-8">
          <Link href="/properties" className="inline-flex items-center gap-2 text-lg font-black tracking-tight">
            <span className="bg-gradient-to-r from-teal-400 via-cyan-500 to-indigo-400 bg-clip-text text-transparent">
              PropList
            </span>
          </Link>
          <p className="mt-2 text-sm font-medium text-slate-200 truncate">
            {user.displayName || 'Your account'}
          </p>
          <span className="inline-flex mt-3 items-center gap-2 rounded-full border border-[rgba(99,102,241,0.25)] bg-[rgba(99,102,241,0.08)] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-indigo-200">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-300" aria-hidden="true" />
            {user.role}
          </span>
        </div>

        <nav className="space-y-1">
          {user.role === 'user' && (
            <>
              <Link href="/properties" className={navLink('/properties')}>
                Browse listings
              </Link>
              <Link href="/dashboard/user/favorites" className={navLink('/dashboard/user/favorites')}>
                My Favorites
              </Link>
              <Link href={profilePath} className={navLink(profilePath)}>
                Profile
              </Link>
            </>
          )}

          {user.role === 'owner' && (
            <>
              <Link href="/dashboard/owner" className={navLink('/dashboard/owner')}>
                Dashboard
              </Link>
              <Link href="/properties" className={navLink('/properties')}>
                Browse listings
              </Link>
              <Link href="/dashboard/owner/properties" className={navLink('/dashboard/owner/properties')}>
                My Properties
              </Link>
              <Link href="/dashboard/owner/properties/new" className={navLink('/dashboard/owner/properties/new')}>
                New Property
              </Link>
              <Link href={profilePath} className={navLink(profilePath)}>
                Profile
              </Link>
            </>
          )}

          {user.role === 'admin' && (
            <>
              <Link href="/dashboard/admin" className={navLink('/dashboard/admin')}>
                Admin Dashboard
              </Link>
              <Link href={profilePath} className={navLink(profilePath)}>
                Profile
              </Link>
            </>
          )}
        </nav>
      </div>

      <div className="p-6 border-t border-[color:var(--color-border)]">
        <button
          onClick={logout}
          className="proplist-btn-ghost w-full justify-start text-red-200 border-[rgba(239,68,68,0.25)] hover:bg-[rgba(239,68,68,0.08)]"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
