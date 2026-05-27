'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Property, PropertyStatus } from '@/types/property';

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  PropertyStatus,
  { label: string; bg: string; color: string }
> = {
  published: { label: 'Published',  bg: 'rgba(34,197,94,0.12)',  color: '#16a34a' },
  draft:     { label: 'Draft',      bg: 'rgba(234,179,8,0.12)',  color: '#ca8a04' },
  archived:  { label: 'Archived',   bg: 'rgba(107,114,128,0.12)', color: '#6b7280' },
};

function StatusBadge({ status }: { status: PropertyStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '0.2rem 0.65rem',
        borderRadius: '999px',
        fontSize: '0.72rem',
        fontWeight: 600,
        letterSpacing: '0.03em',
        textTransform: 'uppercase',
        background: cfg.bg,
        color: cfg.color,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: cfg.color,
          display: 'inline-block',
        }}
      />
      {cfg.label}
    </span>
  );
}

// ─── Price Formatter ──────────────────────────────────────────────────────────

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
}

// ─── Placeholder Image ────────────────────────────────────────────────────────
// Pre-encoded SVG — avoids Buffer (Node-only) in this 'use client' component.

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='240' viewBox='0 0 400 240'%3E%3Crect width='400' height='240' fill='%231e1e2e'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%236366f1' opacity='0.6'%3ENo Image%3C/text%3E%3C/svg%3E";

// ─── Component ────────────────────────────────────────────────────────────────

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const { _id, title, location, price, images, status } = property;
  const coverImage = images?.[0] ?? null;

  return (
    <Link
      href={`/properties/${_id}`}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
      aria-label={`View details for ${title}`}
    >
      <article
        style={{
          borderRadius: '1rem',
          overflow: 'hidden',
          background: 'var(--card-bg, #16213e)',
          border: '1px solid rgba(99,102,241,0.12)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
          (e.currentTarget as HTMLElement).style.boxShadow =
            '0 12px 40px rgba(99,102,241,0.2)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
          (e.currentTarget as HTMLElement).style.boxShadow =
            '0 4px 24px rgba(0,0,0,0.18)';
        }}
      >
        {/* Image */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
          <Image
            src={coverImage ?? PLACEHOLDER}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
            unoptimized={!coverImage} // skip optimization for SVG placeholder
          />
          {/* Status badge overlay */}
          <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem' }}>
            <StatusBadge status={status} />
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '1rem 1.25rem 1.25rem' }}>
          {/* Title */}
          <h2
            style={{
              margin: 0,
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--color-text, #e2e8f0)',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.4,
            }}
          >
            {title}
          </h2>

          {/* Location */}
          <p
            style={{
              margin: '0.4rem 0 0.75rem',
              fontSize: '0.82rem',
              color: 'var(--color-muted, #94a3b8)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            {location}
          </p>

          {/* Price */}
          <p
            style={{
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#6366f1',
              letterSpacing: '-0.02em',
            }}
          >
            {formatPrice(price)}
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 400,
                color: 'var(--color-muted, #94a3b8)',
                marginLeft: '0.25rem',
              }}
            >
              / mo
            </span>
          </p>
        </div>
      </article>
    </Link>
  );
}
