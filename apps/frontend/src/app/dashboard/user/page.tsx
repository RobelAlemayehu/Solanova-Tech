import React from 'react';
import Link from 'next/link';

export default function UserDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-100">User Dashboard</h1>
      <p className="mt-2 text-sm text-slate-400">
        Browse published properties, save favorites, and contact owners.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link href="/properties" className="proplist-btn-primary">
          Browse Properties
        </Link>
        <Link href="/dashboard/user/favorites" className="proplist-btn-ghost">
          My Favorites
        </Link>
      </div>
    </div>
  );
}
