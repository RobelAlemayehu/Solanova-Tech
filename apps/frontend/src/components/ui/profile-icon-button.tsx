import Link from 'next/link';

function ProfileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

interface ProfileIconButtonProps {
  href: string;
  active?: boolean;
  className?: string;
}

export default function ProfileIconButton({ href, active, className = '' }: ProfileIconButtonProps) {
  return (
    <Link
      href={href}
      aria-label="Profile settings"
      title="Profile settings"
      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition ${
        active
          ? 'border-indigo-400/40 bg-indigo-500/15 text-indigo-200'
          : 'border-[color:var(--color-border)] text-slate-200 hover:bg-white/5 hover:text-white'
      } ${className}`}
    >
      <ProfileIcon />
    </Link>
  );
}
