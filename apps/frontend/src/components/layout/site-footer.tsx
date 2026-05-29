import Link from 'next/link';

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-[color:var(--color-border)] bg-[rgba(10,16,34,0.45)]">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-center sm:flex-row sm:text-left">
        <p className="text-xs text-slate-500">
          © {year} PropList · Find and list properties with confidence
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-400">
          <Link href="/properties" className="hover:text-slate-200 transition">
            Listings
          </Link>
          <Link href="/login" className="hover:text-slate-200 transition">
            Sign in
          </Link>
          <Link href="/register" className="hover:text-slate-200 transition">
            Create account
          </Link>
        </div>
      </div>
    </footer>
  );
}
