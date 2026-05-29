'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { Property } from '@/types/property';

interface PropertiesResponse {
  data: Property[];
  total: number;
}

export default function OwnerDashboardPage() {
  const { data, isLoading, isError } = useQuery<PropertiesResponse>({
    queryKey: ['owner-properties-summary'],
    queryFn: () => api.get<PropertiesResponse>('/properties?ownerId=me&limit=50').then((r) => r.data),
  });

  const properties = data?.data ?? [];
  const draftCount = properties.filter((p) => p.status === 'draft').length;
  const publishedCount = properties.filter((p) => p.status === 'published').length;
  const archivedCount = properties.filter((p) => p.status === 'archived').length;

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-100">Owner Dashboard</h1>
      <p className="mt-2 text-sm text-slate-400">
        Create drafts, upload images, publish listings, and manage your portfolio.
      </p>

      {isLoading && (
        <p className="mt-6 text-sm text-slate-400">Loading your properties…</p>
      )}

      {isError && (
        <div className="proplist-alert-error mt-6">
          Failed to load your properties. Please try again.
        </div>
      )}

      {!isLoading && !isError && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Drafts', value: draftCount, color: 'text-yellow-300' },
              { label: 'Published', value: publishedCount, color: 'text-emerald-300' },
              { label: 'Archived', value: archivedCount, color: 'text-slate-300' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-[color:var(--color-border)] bg-[rgba(10,16,34,0.45)] p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {stat.label}
                </p>
                <p className={`mt-2 text-3xl font-black ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Link href="/dashboard/owner/properties/new" className="proplist-btn-primary">
              Create New Property
            </Link>
            <Link href="/dashboard/owner/properties" className="proplist-btn-ghost">
              Manage Properties
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
