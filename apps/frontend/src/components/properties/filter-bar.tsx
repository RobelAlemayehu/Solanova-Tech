'use client';

import React, { useRef, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PLACEHOLDERS } from '@/lib/placeholders';

// ─── Styles ───────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.625rem 0.875rem',
  borderRadius: '0.625rem',
  border: '1px solid rgba(99,102,241,0.25)',
  background: 'rgba(255,255,255,0.04)',
  color: 'var(--color-text, #e2e8f0)',
  fontSize: '0.875rem',
  outline: 'none',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '0.375rem',
  fontSize: '0.75rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--color-muted, #94a3b8)',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function FilterBar() {
  const router = useRouter();
  const currentParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Controlled refs — pre-populate from current URL search params.
  const locationRef = useRef<HTMLInputElement>(null);
  const minPriceRef = useRef<HTMLInputElement>(null);
  const maxPriceRef = useRef<HTMLInputElement>(null);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();

    const location = locationRef.current?.value.trim();
    const minPrice = minPriceRef.current?.value.trim();
    const maxPrice = maxPriceRef.current?.value.trim();

    if (location)  params.set('location', location);
    if (minPrice)  params.set('minPrice', minPrice);
    if (maxPrice)  params.set('maxPrice', maxPrice);

    // Always reset to page 1 on a new search.
    params.set('page', '1');

    startTransition(() => {
      router.push(`/properties?${params.toString()}`);
    });
  }

  function handleReset() {
    if (locationRef.current)  locationRef.current.value  = '';
    if (minPriceRef.current)  minPriceRef.current.value  = '';
    if (maxPriceRef.current)  maxPriceRef.current.value  = '';
    startTransition(() => router.push('/properties'));
  }

  const hasActiveFilters =
    currentParams.has('location') ||
    currentParams.has('minPrice') ||
    currentParams.has('maxPrice');

  return (
    <form
      onSubmit={handleSearch}
      role="search"
      aria-label="Filter properties"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '0.875rem',
        alignItems: 'flex-end',
        padding: '1.25rem 1.5rem',
        borderRadius: '1rem',
        background: 'var(--card-bg, rgba(22,33,62,0.85))',
        border: '1px solid rgba(99,102,241,0.15)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 32px rgba(0,0,0,0.2)',
      }}
    >
      {/* Location */}
      <div>
        <label htmlFor="filter-location" style={labelStyle}>
          Location
        </label>
        <input
          id="filter-location"
          ref={locationRef}
          type="text"
          placeholder={PLACEHOLDERS.locationFilter}
          defaultValue={currentParams.get('location') ?? ''}
          style={inputStyle}
          onFocus={(e) => {
            e.target.style.borderColor = '#6366f1';
            e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(99,102,241,0.25)';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Min Price */}
      <div>
        <label htmlFor="filter-min-price" style={labelStyle}>
          Min price
        </label>
        <input
          id="filter-min-price"
          ref={minPriceRef}
          type="number"
          min={0}
          placeholder={PLACEHOLDERS.minPrice}
          defaultValue={currentParams.get('minPrice') ?? ''}
          style={inputStyle}
          onFocus={(e) => {
            e.target.style.borderColor = '#6366f1';
            e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(99,102,241,0.25)';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Max Price */}
      <div>
        <label htmlFor="filter-max-price" style={labelStyle}>
          Max price
        </label>
        <input
          id="filter-max-price"
          ref={maxPriceRef}
          type="number"
          min={0}
          placeholder={PLACEHOLDERS.maxPrice}
          defaultValue={currentParams.get('maxPrice') ?? ''}
          style={inputStyle}
          onFocus={(e) => {
            e.target.style.borderColor = '#6366f1';
            e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(99,102,241,0.25)';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          type="submit"
          disabled={isPending}
          aria-busy={isPending}
          style={{
            flex: 1,
            padding: '0.625rem 1rem',
            borderRadius: '0.625rem',
            border: 'none',
            background: isPending
              ? 'rgba(99,102,241,0.5)'
              : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: isPending ? 'not-allowed' : 'pointer',
            transition: 'opacity 0.15s ease, transform 0.1s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
          }}
        >
          {isPending ? (
            <>
              <span
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  animation: 'proplist-spin 0.6s linear infinite',
                  display: 'inline-block',
                }}
              />
              Searching…
            </>
          ) : (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Search
            </>
          )}
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            title="Clear filters"
            style={{
              padding: '0.625rem 0.875rem',
              borderRadius: '0.625rem',
              border: '1px solid rgba(99,102,241,0.25)',
              background: 'transparent',
              color: 'var(--color-muted, #94a3b8)',
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        )}
      </div>
    </form>
  );
}
