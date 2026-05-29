'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { getDashboardPath, getLogoHref, getProfilePath } from '@/lib/auth-redirect';

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      {open ? (
        <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
      ) : (
        <>
          <path strokeLinecap="round" d="M4 7h16" />
          <path strokeLinecap="round" d="M4 12h16" />
          <path strokeLinecap="round" d="M4 17h16" />
        </>
      )}
    </svg>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const onBrowseSection = pathname === '/properties' || pathname.startsWith('/properties/');

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const navLinkClass = (href: string) =>
    `block rounded-xl px-4 py-3 text-sm font-semibold transition ${
      pathname === href || pathname.startsWith(href + '/')
        ? 'bg-indigo-500/15 text-indigo-200'
        : 'text-slate-200 hover:bg-white/5'
    }`;

  type NavItem = { href: string; label: string };

  const buildAuthLinks = (): NavItem[] => {
    if (!user) return [];

    const links: NavItem[] = [];

    if (!onBrowseSection) {
      links.push({ href: '/properties', label: 'Browse listings' });
    }

    if (user.role === 'user') {
      links.push({ href: '/dashboard/user/favorites', label: 'My favorites' });
      links.push({ href: '/dashboard/user', label: 'Dashboard' });
    } else if (user.role === 'owner') {
      links.push({ href: getDashboardPath(user.role), label: 'Dashboard' });
      links.push({ href: '/dashboard/owner/properties', label: 'My properties' });
    } else {
      links.push({ href: getDashboardPath(user.role), label: 'Dashboard' });
    }

    links.push({ href: getProfilePath(user.role), label: 'Profile' });

    return links;
  };

  const guestLinks: NavItem[] = [
    { href: '/properties', label: 'Browse listings' },
    { href: '/login', label: 'Sign in' },
    { href: '/register', label: 'Create account' },
  ];

  const authLinks = buildAuthLinks();
  const links = user ? authLinks : guestLinks;

  const logoHref = getLogoHref(user?.role);

  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--color-border)] bg-[rgba(8,12,28,0.92)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href={logoHref} className="flex items-center gap-2 text-lg font-black tracking-tight shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/20 to-indigo-500/30 border border-indigo-500/20 text-sm text-indigo-300">
            P
          </span>
          <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
            PropList
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-2">
          {!isLoading &&
            links.map((item) => (
              <Link key={item.href} href={item.href} className="proplist-btn-ghost !py-2 !px-3 text-sm">
                {item.label}
              </Link>
            ))}
          {!isLoading && user && (
            <button
              type="button"
              onClick={logout}
              className="proplist-btn-ghost !py-2 !px-3 text-sm text-red-200 border-[rgba(239,68,68,0.25)]"
            >
              Log out
            </button>
          )}
        </nav>

        <button
          type="button"
          className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-[color:var(--color-border)] text-slate-200 hover:bg-white/5 transition"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <MenuIcon open={menuOpen} />
        </button>
      </div>

      {menuOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <nav
            className="fixed top-16 right-0 z-50 h-[calc(100vh-4rem)] w-[min(100%,20rem)] border-l border-[color:var(--color-border)] bg-[rgba(10,16,34,0.98)] p-4 md:hidden overflow-y-auto"
            aria-label="Mobile navigation"
          >
            {!isLoading && (
              <>
                {user && (
                  <div className="mb-4 rounded-xl border border-[color:var(--color-border)] bg-white/[0.03] p-4">
                    <p className="text-sm font-semibold text-slate-100 truncate">
                      {user.displayName || 'Your account'}
                    </p>
                    <span className="inline-flex mt-2 rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                      {user.role}
                    </span>
                  </div>
                )}

                <div className="space-y-1">
                  {links.map((item) => (
                    <Link key={item.href} href={item.href} className={navLinkClass(item.href)}>
                      {item.label}
                    </Link>
                  ))}
                </div>

                {user ? (
                  <button
                    type="button"
                    onClick={logout}
                    className="mt-4 w-full proplist-btn-ghost text-red-200 border-[rgba(239,68,68,0.25)]"
                  >
                    Log out
                  </button>
                ) : (
                  <Link href="/register" className="mt-4 block proplist-btn-primary w-full text-center">
                    Get started
                  </Link>
                )}
              </>
            )}
          </nav>
        </>
      )}
    </header>
  );
}
