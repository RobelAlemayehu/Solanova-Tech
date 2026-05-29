'use client';

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-[color:var(--color-border)] bg-gradient-to-b from-[rgba(10,16,34,0.5)] to-[rgba(8,12,24,0.95)]">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 text-center">
        <p className="text-xs text-slate-500">© {year} PropList</p>
      </div>
    </footer>
  );
}
