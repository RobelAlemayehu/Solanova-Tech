'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { Property, PropertyStatus } from '@/types/property';

type OwnerIdValue = string | { email?: string } | null;

function ownerEmailFromOwnerId(ownerId: OwnerIdValue): string {
  if (!ownerId) return 'Unknown';
  if (typeof ownerId === 'string') return ownerId;
  return ownerId.email ?? 'Unknown';
}

interface PropertiesResponse {
  data: Property[];
  total: number;
  page: number;
  limit: number;
}

interface MetricsResponse {
  totalProperties: number;
  totalPublished: number;
  totalDraft: number;
  totalArchived: number;
  totalUsers: number;
  totalOwners: number;
}

const STATUS_STYLES: Record<PropertyStatus, { bg: string; color: string; label: string }> = {
  published: { bg: 'rgba(34,197,94,0.12)', color: '#16a34a', label: 'Published' },
  draft:     { bg: 'rgba(234,179,8,0.12)', color: '#ca8a04', label: 'Draft'      },
  archived:  { bg: 'rgba(107,114,128,0.12)', color: '#6b7280', label: 'Archived'   },
};

function StatusBadge({ status }: { status: PropertyStatus }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.draft;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider" style={{ background: s.bg, color: s.color }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
      {s.label}
    </span>
  );
}

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: metrics, isLoading: metricsLoading } = useQuery<MetricsResponse>({
    queryKey: ['admin-metrics'],
    queryFn: () => api.get<MetricsResponse>('/admin/metrics').then((r) => r.data),
  });

  const { data, isLoading, isError } = useQuery<PropertiesResponse>({
    queryKey: ['admin-properties', page],
    queryFn: () =>
      api.get<PropertiesResponse>(`/properties?page=${page}&limit=${limit}`).then((r) => r.data),
  });

  const disableMutation = useMutation<void, Error, string>({
    mutationFn: (id) => api.patch(`/properties/${id}/disable`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
    },
  });

  const properties = data?.data ?? [];
  const totalPages = data ? Math.ceil(data.total / limit) : 1;

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-100">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-slate-400">System overview and property management</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: 'Total Properties', value: metrics?.totalProperties, color: 'text-indigo-300' },
          { label: 'Published', value: metrics?.totalPublished, color: 'text-emerald-300' },
          { label: 'Drafts', value: metrics?.totalDraft, color: 'text-yellow-300' },
          { label: 'Archived', value: metrics?.totalArchived, color: 'text-slate-300' },
          { label: 'Users', value: metrics?.totalUsers, color: 'text-cyan-300' },
          { label: 'Owners', value: metrics?.totalOwners, color: 'text-violet-300' },
        ].map((metric) => (
          <div
            key={metric.label}
            className="rounded-xl border border-[color:var(--color-border)] bg-[rgba(10,16,34,0.45)] p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{metric.label}</p>
            <p className={`mt-2 text-3xl font-black ${metric.color}`}>
              {metricsLoading ? '…' : (metric.value ?? 0)}
            </p>
          </div>
        ))}
      </div>

      {isLoading && (
        <p className="text-center py-12 text-slate-400">Loading properties…</p>
      )}

      {isError && (
        <div className="proplist-alert-error">
          Failed to load properties. Ensure you have admin privileges.
        </div>
      )}

      {!isLoading && !isError && properties.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-[color:var(--color-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[color:var(--color-border)] bg-[rgba(10,16,34,0.65)]">
                {['Title', 'Owner', 'Status', 'Created', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => {
                const ownerEmail = ownerEmailFromOwnerId(p.ownerId as unknown as OwnerIdValue);
                const isArchived = p.status === 'archived';

                return (
                  <tr key={p._id} className="border-b border-[color:var(--color-border)] last:border-0 hover:bg-white/[0.02]">
                    <td className="max-w-[240px] truncate px-4 py-3.5 font-semibold text-slate-100">{p.title}</td>
                    <td className="px-4 py-3.5 text-slate-300">{ownerEmail}</td>
                    <td className="px-4 py-3.5"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3.5 text-slate-400">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => {
                          if (window.confirm(`Disable "${p.title}"?`)) {
                            disableMutation.mutate(p._id);
                          }
                        }}
                        disabled={isArchived || disableMutation.isPending}
                        className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {disableMutation.isPending && disableMutation.variables === p._id ? 'Disabling…' : 'Disable'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && !isError && properties.length === 0 && (
        <p className="py-12 text-center text-slate-400">No properties found.</p>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="proplist-btn-ghost disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="text-sm text-slate-400">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="proplist-btn-ghost disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
