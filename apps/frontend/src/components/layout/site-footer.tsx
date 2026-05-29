'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { getDashboardPath, getProfilePath } from '@/lib/auth-redirect';

export default function SiteFooter() {
  const year = new Date().getFullYear();
  const { user, isLoading } = useAuth();

  return (
    <footer className="mt-auto border-t border-[color:var(--color-border)] bg-gradient-to-b from-[rgba(10,16,34,0.5)] to-[rgba(8,12,24,0.95)]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-lg font-black bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">
              PropList
            </p>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed max-w-sm">
              Discover homes and spaces across Ethiopia. All listing prices are shown in{' '}
              <strong className="text-slate-300">ETB</strong>.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Explore</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <Link href="/properties" className="hover:text-white transition">
                  Browse listings
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Your account</h3>
            <ul className="space-y-2 text-sm">
              {!isLoading && !user && (
                <>
                  <li>
                    <Link href="/login" className="text-slate-300 hover:text-white transition">
                      Sign in
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="text-slate-300 hover:text-white transition">
                      Create account
                    </Link>
                  </li>
                </>
              )}
              {!isLoading && user && (
                <>
                  {user.role === 'user' && (
                    <>
                      <li>
                        <Link href="/dashboard/user/favorites" className="text-slate-300 hover:text-white transition">
                          My favorites
                        </Link>
                      </li>
                      <li>
                        <Link href="/dashboard/user" className="text-slate-300 hover:text-white transition">
                          Dashboard
                        </Link>
                      </li>
                    </>
                  )}
                  {user.role === 'owner' && (
                    <>
                      <li>
                        <Link href={getDashboardPath('owner')} className="text-slate-300 hover:text-white transition">
                          Owner dashboard
                        </Link>
                      </li>
                      <li>
                        <Link href="/dashboard/owner/properties/new" className="text-slate-300 hover:text-white transition">
                          List a property
                        </Link>
                      </li>
                    </>
                  )}
                  {user.role === 'admin' && (
                    <li>
                      <Link href="/dashboard/admin" className="text-slate-300 hover:text-white transition">
                        Admin dashboard
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link href={getProfilePath(user.role)} className="text-slate-300 hover:text-white transition">
                      Profile settings
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-[color:var(--color-border)] pt-6 text-center">
          <p className="text-xs text-slate-500">© {year} PropList · Prices in ETB</p>
        </div>
      </div>
    </footer>
  );
}
