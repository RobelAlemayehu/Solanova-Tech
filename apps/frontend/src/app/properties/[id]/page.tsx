import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import type { Property, PropertyStatus } from '@/types/property';
import FavoriteButton from '@/components/properties/favorite-button';

// ─── Extended type: ownerId is populated by the backend ──────────────────────

interface PopulatedOwner {
  _id: string;
  email: string;
}

interface PropertyDetail extends Omit<Property, 'ownerId'> {
  ownerId: PopulatedOwner;
}

// ─── SSR Fetch ────────────────────────────────────────────────────────────────

async function fetchProperty(id: string): Promise<PropertyDetail | null> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

  const res = await fetch(`${apiBase}/properties/${id}`, {
    cache: 'no-store',
  });

  if (res.status === 404 || res.status === 403) return null;

  if (!res.ok) {
    console.error(`[properties/[id]/page] fetch failed: ${res.status}`);
    return null;
  }

  return res.json() as Promise<PropertyDetail>;
}

// ─── Dynamic Metadata ─────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const property = await fetchProperty(params.id);
  if (!property) return { title: 'Property Not Found | PropList' };
  return {
    title: `${property.title} | PropList`,
    description: property.description.slice(0, 155),
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  PropertyStatus,
  { label: string; bg: string; color: string }
> = {
  published: { label: 'Published', bg: 'rgba(34,197,94,0.12)',   color: '#16a34a' },
  draft:     { label: 'Draft',     bg: 'rgba(234,179,8,0.12)',   color: '#ca8a04' },
  archived:  { label: 'Archived',  bg: 'rgba(107,114,128,0.12)', color: '#6b7280' },
};

function StatusBadge({ status }: { status: PropertyStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '0.25rem 0.75rem',
        borderRadius: '999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        background: cfg.bg,
        color: cfg.color,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color }} />
      {cfg.label}
    </span>
  );
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
}

// ─── Image Gallery (horizontal scroll) ───────────────────────────────────────

function ImageGallery({ images, title }: { images: string[]; title: string }) {
  const PLACEHOLDER =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='480' viewBox='0 0 800 480'%3E%3Crect width='800' height='480' fill='%231e1e2e'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18' fill='%236366f1' opacity='0.5'%3ENo Image%3C/text%3E%3C/svg%3E";

  const srcs = images.length > 0 ? images : [PLACEHOLDER];

  return (
    <div
      role="region"
      aria-label="Property image gallery"
      style={{
        display: 'flex',
        gap: '0.875rem',
        overflowX: 'auto',
        scrollSnapType: 'x mandatory',
        WebkitOverflowScrolling: 'touch',
        paddingBottom: '0.5rem',
        /* Hide scrollbar on most browsers while keeping functionality */
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(99,102,241,0.3) transparent',
      }}
    >
      {srcs.map((src, idx) => (
        <div
          key={idx}
          style={{
            position: 'relative',
            flexShrink: 0,
            width: srcs.length === 1 ? '100%' : 'min(75vw, 640px)',
            aspectRatio: '16/9',
            borderRadius: '0.875rem',
            overflow: 'hidden',
            scrollSnapAlign: 'start',
            background: '#1e1e2e',
          }}
        >
          <Image
            src={src}
            alt={`${title} — image ${idx + 1}`}
            fill
            priority={idx === 0}
            sizes="(max-width: 640px) 90vw, 640px"
            style={{ objectFit: 'cover' }}
            unoptimized={src.startsWith('data:')}
          />
          {srcs.length > 1 && (
            <span
              style={{
                position: 'absolute',
                bottom: '0.625rem',
                right: '0.75rem',
                background: 'rgba(0,0,0,0.55)',
                color: '#fff',
                fontSize: '0.72rem',
                fontWeight: 600,
                padding: '0.2rem 0.5rem',
                borderRadius: '999px',
                backdropFilter: 'blur(4px)',
              }}
            >
              {idx + 1} / {srcs.length}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  params: { id: string };
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const property = await fetchProperty(params.id);

  if (!property) notFound();

  const {
    _id,
    title,
    description,
    location,
    price,
    images,
    status,
    ownerId,
  } = property;

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--color-background, #0f0f1a)',
        color: 'var(--color-text, #e2e8f0)',
        fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
      }}
    >
      <div style={{ maxWidth: '56rem', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>

        {/* ── Back link ── */}
        <Link
          href="/properties"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            color: 'var(--color-muted, #94a3b8)',
            fontSize: '0.875rem',
            textDecoration: 'none',
            marginBottom: '1.5rem',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to listings
        </Link>

        {/* ── Gallery ── */}
        <ImageGallery images={images} title={title} />

        {/* ── Header row ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem',
            marginTop: '1.75rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1
              style={{
                margin: '0 0 0.5rem',
                fontSize: 'clamp(1.4rem, 3.5vw, 2rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                lineHeight: 1.25,
                color: 'var(--color-text, #e2e8f0)',
              }}
            >
              {title}
            </h1>

            {/* Location */}
            <p
              style={{
                margin: '0 0 0.75rem',
                fontSize: '0.9rem',
                color: 'var(--color-muted, #94a3b8)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              {location}
            </p>

            <StatusBadge status={status} />
          </div>

          {/* Price + Favorite */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flexShrink: 0 }}>
            <div style={{ textAlign: 'right' }}>
              <p
                style={{
                  margin: 0,
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  color: '#6366f1',
                  letterSpacing: '-0.03em',
                }}
              >
                {formatPrice(price)}
              </p>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-muted, #94a3b8)' }}>
                per month
              </span>
            </div>

            {/* FavoriteButton is a client island; Suspense handles hydration */}
            <Suspense fallback={<div style={{ width: 40, height: 40 }} />}>
              <FavoriteButton propertyId={_id} />
            </Suspense>
          </div>
        </div>

        {/* ── Divider ── */}
        <hr
          style={{
            margin: '1.75rem 0',
            border: 'none',
            borderTop: '1px solid rgba(99,102,241,0.12)',
          }}
        />

        {/* ── Description ── */}
        <section aria-labelledby="description-heading">
          <h2
            id="description-heading"
            style={{
              margin: '0 0 0.75rem',
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--color-text, #e2e8f0)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Description
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: '0.9375rem',
              lineHeight: 1.75,
              color: 'var(--color-muted, #94a3b8)',
              whiteSpace: 'pre-wrap',
            }}
          >
            {description}
          </p>
        </section>

        {/* ── Owner Info ── */}
        <section
          aria-labelledby="owner-heading"
          style={{
            marginTop: '2rem',
            padding: '1.125rem 1.375rem',
            borderRadius: '0.875rem',
            background: 'rgba(99,102,241,0.06)',
            border: '1px solid rgba(99,102,241,0.14)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.875rem',
          }}
        >
          {/* Avatar placeholder */}
          <div
            aria-hidden="true"
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
              fontWeight: 700,
              color: '#fff',
              flexShrink: 0,
            }}
          >
            {ownerId.email[0].toUpperCase()}
          </div>

          <div>
            <p
              id="owner-heading"
              style={{
                margin: '0 0 0.1rem',
                fontSize: '0.7rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--color-muted, #94a3b8)',
              }}
            >
              Listed by
            </p>
            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>
              {ownerId.email}
            </p>
          </div>
        </section>

      </div>
    </main>
  );
}
