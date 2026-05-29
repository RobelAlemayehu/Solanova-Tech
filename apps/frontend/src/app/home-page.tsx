'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { getPostLoginPath } from '@/lib/auth-redirect';

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(getPostLoginPath(user.role));
    }
  }, [user, isLoading, router]);

  if (isLoading || user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <span className="proplist-spinner h-12 w-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-400" />
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-16">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(600px 400px at 50% 0%, rgba(99,102,241,0.25), transparent 70%)',
        }}
      />

      <div className="relative w-full max-w-lg text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300/90">
          Property listings made simple
        </p>

        <h1 className="mt-4 text-5xl sm:text-6xl font-black tracking-tight bg-gradient-to-r from-teal-300 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
          PropList
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed">
          Sign in to explore rentals, save favorites, or publish your own listings as a property owner.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/login" className="proplist-btn-primary px-8">
            Sign in
          </Link>
          <Link href="/register" className="proplist-btn-ghost px-8">
            Create account
          </Link>
        </div>

        <p className="mt-8 text-sm text-slate-500">
          New here? Choose <strong className="text-slate-400">User</strong> to browse, or{' '}
          <strong className="text-slate-400">Owner</strong> to list properties.
        </p>
      </div>
    </main>
  );
}
