'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { formatPriceETB } from '@/lib/format-price';
import type { Property, PropertyStatus } from '@/types/property';

interface PropertiesResponse {
  data: Property[];
  total: number;
}

const STATUS_CLASSES: Record<PropertyStatus, string> = {
  published: 'bg-emerald-500/15 text-emerald-300',
  draft: 'bg-amber-500/15 text-amber-300',
  archived: 'bg-slate-500/15 text-slate-400',
};

function StatusBadge({ status }: { status: PropertyStatus }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_CLASSES[status] ?? STATUS_CLASSES.draft}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {label}
    </span>
  );
}

export default function OwnerPropertiesPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<PropertiesResponse>({
    queryKey: ['owner-properties'],
    queryFn: () =>
      api.get<PropertiesResponse>('/properties?ownerId=me&limit=50').then((r) => r.data),
  });

  const publishMutation = useMutation<Property, Error, string>({
    mutationFn: (id) => api.post<Property>(`/properties/${id}/publish`).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['owner-properties'] }),
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: (id) => api.delete(`/properties/${id}`).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['owner-properties'] }),
  });

  function confirmDelete(id: string, title: string) {
    if (window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  }

  const properties = data?.data ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-100">My properties</h1>
          <p className="mt-2 text-sm text-slate-400">Manage your listings</p>
        </div>
        <Link href="/dashboard/owner/properties/new" className="proplist-btn-primary">
          + New property
        </Link>
      </div>

      {isLoading && (
        <p className="py-12 text-center text-sm text-slate-400">Loading your properties…</p>
      )}

      {isError && <div className="proplist-alert-error">Failed to load properties. Please try again.</div>}

      {!isLoading && !isError && properties.length === 0 && (
        <div className="proplist-card py-16 text-center">
          <p className="text-lg font-semibold text-slate-200">No properties yet</p>
          <p className="mt-2 text-sm text-slate-400">
            Click <strong className="text-slate-300">+ New property</strong> to create your first
            listing.
          </p>
        </div>
      )}

      {properties.length > 0 && (
        <div className="proplist-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-[color:var(--color-border)] bg-white/[0.02]">
                  {['Title', 'Location', 'Price', 'Status', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {properties.map((p) => (
                  <tr
                    key={p._id}
                    className="border-b border-[color:var(--color-border)] last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3.5 font-semibold text-slate-100 max-w-[240px]">
                      <span className="block truncate">{p.title}</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400">{p.location}</td>
                    <td className="px-4 py-3.5 font-bold text-indigo-300">
                      {formatPriceETB(p.price)}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/dashboard/owner/properties/${p._id}/edit`}
                          className="proplist-btn-ghost !py-1.5 !px-3 text-xs"
                        >
                          Edit
                        </Link>
                        {p.status === 'draft' && (
                          <button
                            type="button"
                            onClick={() => publishMutation.mutate(p._id)}
                            disabled={publishMutation.isPending}
                            className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 transition disabled:opacity-50"
                          >
                            Publish
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => confirmDelete(p._id, p.title)}
                          disabled={deleteMutation.isPending}
                          className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-red-500/15 text-red-300 hover:bg-red-500/25 transition disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
