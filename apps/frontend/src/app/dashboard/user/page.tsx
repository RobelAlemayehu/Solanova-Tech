import React from 'react';
import Link from 'next/link';

export default function UserDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-100">Your account</h1>
      <p className="mt-2 text-sm text-slate-400">
        Save properties you like and manage your profile.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 max-w-md">
        <Link href="/dashboard/user/favorites" className="proplist-btn-primary">
          My Favorites
        </Link>
        <Link href="/dashboard/user/profile" className="proplist-btn-ghost">
          Profile settings
        </Link>
      </div>
    </div>
  );
}
