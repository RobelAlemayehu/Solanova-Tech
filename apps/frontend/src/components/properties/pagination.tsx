import Link from 'next/link';

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  searchParams: Record<string, string | string[] | undefined>;
}

function buildPageUrl(
  page: number,
  searchParams: Record<string, string | string[] | undefined>,
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (key === 'page') continue;
    const v = Array.isArray(value) ? value[0] : value;
    if (v) params.set(key, v);
  }

  params.set('page', String(page));
  return `/properties?${params.toString()}`;
}

export default function Pagination({ page, limit, total, searchParams }: PaginationProps) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;

  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;

  const linkStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '2.5rem',
    padding: '0.5rem 0.875rem',
    borderRadius: '0.625rem',
    border: '1px solid rgba(99,102,241,0.25)',
    background: 'rgba(255,255,255,0.04)',
    color: 'var(--color-text, #e2e8f0)',
    fontSize: '0.875rem',
    fontWeight: 600,
    textDecoration: 'none',
    transition: 'border-color 0.15s ease',
  };

  const disabledStyle: React.CSSProperties = {
    ...linkStyle,
    opacity: 0.4,
    pointerEvents: 'none' as const,
    cursor: 'not-allowed',
  };

  return (
    <nav
      aria-label="Pagination"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        marginTop: '2.5rem',
      }}
    >
      {prevPage ? (
        <Link href={buildPageUrl(prevPage, searchParams)} style={linkStyle}>
          ← Prev
        </Link>
      ) : (
        <span style={disabledStyle}>← Prev</span>
      )}

      <span
        style={{
          padding: '0.5rem 1rem',
          fontSize: '0.875rem',
          color: 'var(--color-muted, #94a3b8)',
        }}
      >
        Page {page} of {totalPages}
      </span>

      {nextPage ? (
        <Link href={buildPageUrl(nextPage, searchParams)} style={linkStyle}>
          Next →
        </Link>
      ) : (
        <span style={disabledStyle}>Next →</span>
      )}
    </nav>
  );
}
