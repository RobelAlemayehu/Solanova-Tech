import Link from 'next/link';
import RoleGate from '@/components/auth/role-gate';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-xl text-center">
        <h1 className="text-6xl sm:text-7xl font-black tracking-tight bg-gradient-to-r from-teal-400 via-cyan-500 to-indigo-400 bg-clip-text text-transparent">
          PropList
        </h1>

        <p className="mt-4 text-slate-300 text-lg font-medium">
          A mini multi-tenant property platform with roles, publishing workflow, and favorites.
        </p>
        <p className="mt-2 text-slate-400 text-sm">
          Browse published listings, save favorites, and manage properties as an owner or admin.
        </p>

        <div className="mt-10 grid gap-3">
          <Link href="/properties" className="proplist-btn-primary w-full">
            Browse Properties
          </Link>

          <Link href="/login" className="proplist-btn-ghost w-full">
            Login / Register
          </Link>

          <RoleGate requiredRole="user">
            <Link href="/dashboard/user" className="proplist-btn-ghost w-full">
              Go to User Dashboard
            </Link>
          </RoleGate>

          <RoleGate requiredRole="owner">
            <Link href="/dashboard/owner/properties" className="proplist-btn-ghost w-full">
              Go to Owner Dashboard
            </Link>
          </RoleGate>

          <RoleGate requiredRole="admin">
            <Link href="/dashboard/admin" className="proplist-btn-ghost w-full">
              Go to Admin Dashboard
            </Link>
          </RoleGate>
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-xs text-slate-500">
          <span className="inline-block h-1 w-12 rounded-full bg-gradient-to-r from-teal-500 to-indigo-500 opacity-60" />
          <span>Built with Next.js + NestJS</span>
          <span className="inline-block h-1 w-12 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 opacity-60" />
        </div>
      </div>
    </main>
  );
}
