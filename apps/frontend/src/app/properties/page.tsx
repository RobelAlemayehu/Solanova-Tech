import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import type { Property } from '@/types/property';
import PropertyCard from '@/components/properties/property-card';
import FilterBar from '@/components/properties/filter-bar';
import Pagination from '@/components/properties/pagination';

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Browse Properties | PropList',
  description:
    'Discover rental and sale properties across top locations. Filter by price, location, and more.',
};

// ─── SSR Fetch ────────────────────────────────────────────────────────────────

interface FetchResult {
  data: Property[];
  total: number;
  page: number;
  limit: number;
}

async function fetchProperties(
  searchParams: Record<string, string | string[] | undefined>
): Promise<FetchResult> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

  // Build query string — only append defined, non-empty values.
  const params = new URLSearchParams();

  const pick = (key: string) => {
    const val = searchParams[key];
    return Array.isArray(val) ? val[0] : val;
  };

  const page     = pick('page')     ?? '1';
  const location = pick('location') ?? '';
  const minPrice = pick('minPrice') ?? '';
  const maxPrice = pick('maxPrice') ?? '';

  params.set('page', page);
  params.set('limit', '12');
  if (location) params.set('location', location);
  if (minPrice) params.set('minPrice', minPrice);
  if (maxPrice) params.set('maxPrice', maxPrice);

  // Native fetch — cached per request in RSC, revalidates with Next.js ISR rules.
  const res = await fetch(`${apiBase}/properties?${params.toString()}`, {
    // No-store so filters always reflect live data; swap to `revalidate: 60`
    // if you add ISR caching later.
    cache: 'no-store',
  });

  if (!res.ok) {
    // Log server-side; return empty so the page still renders gracefully.
    console.error(`[properties/page] fetch failed: ${res.status} ${res.statusText}`);
    return { data: [], total: 0, page: 1, limit: 12 };
  }

  return res.json() as Promise<FetchResult>;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div
      style={{
        gridColumn: '1 / -1',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        padding: '4rem 2rem',
        color: 'var(--color-muted, #94a3b8)',
        textAlign: 'center',
      }}
    >
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity={0.4}
        aria-hidden="true"
      >
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
        <path d="M9 21V12h6v9" />
      </svg>
      <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>
        No properties found
      </p>
      <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.7 }}>
        Try adjusting your filters or check back later.
      </p>
    </div>
  );
}

function ResultCount({ total, page, limit }: { total: number; page: number; limit: number }) {
  if (total === 0) return null;
  const start = (page - 1) * limit + 1;
  const end   = Math.min(page * limit, total);
  return (
    <p
      style={{
        margin: 0,
        fontSize: '0.825rem',
        color: 'var(--color-muted, #94a3b8)',
      }}
    >
      Showing <strong style={{ color: 'var(--color-text, #e2e8f0)' }}>{start}–{end}</strong> of{' '}
      <strong style={{ color: 'var(--color-text, #e2e8f0)' }}>{total}</strong> properties
    </p>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function PropertiesPage({ searchParams }: PageProps) {
  const { data: properties, total, page, limit } = await fetchProperties(searchParams);

  return (
    <main className="text-slate-200">
      {/* ── Hero Header ── */}
      <header
        style={{
          padding: '3rem 1.5rem 2rem',
          maxWidth: '72rem',
          margin: '0 auto',
        }}
      >
        <h1
          style={{
            margin: '0 0 0.375rem',
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #e2e8f0, #6366f1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.03em',
          }}
        >
          Browse Properties
        </h1>
        <p
          style={{
            margin: 0,
            color: 'var(--color-muted, #94a3b8)',
            fontSize: '1rem',
          }}
        >
          Find your next home, office, or investment.
        </p>
      </header>

      {/* ── Filter Bar — client island ── */}
      <section
        aria-label="Property filters"
        style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem 2rem' }}
      >
        {/*
          FilterBar uses useSearchParams() which requires Suspense in Next.js 14.
          Wrap it so the rest of the page (SSR) is not blocked.
        */}
        <Suspense fallback={<div style={{ height: 80 }} />}>
          <FilterBar />
        </Suspense>
      </section>

      {/* ── Results ── */}
      <section
        aria-label="Property listings"
        style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem 4rem' }}
      >
        {/* Count line */}
        <div style={{ marginBottom: '1.25rem' }}>
          <ResultCount total={total} page={page} limit={limit} />
        </div>

        {/* Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
            gap: '1.5rem',
          }}
        >
          {properties.length === 0 ? (
            <EmptyState />
          ) : (
            properties.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))
          )}
        </div>

        <Pagination page={page} limit={limit} total={total} searchParams={searchParams} />
      </section>
    </main>
  );
}
