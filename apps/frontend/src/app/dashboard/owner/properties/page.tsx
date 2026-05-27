'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { Property, PropertyStatus } from '@/types/property';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PropertiesResponse {
  data: Property[];
  total: number;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<PropertyStatus, { bg: string; color: string; label: string }> = {
  published: { bg: '#dcfce7', color: '#15803d', label: 'Published' },
  draft:     { bg: '#fef9c3', color: '#a16207', label: 'Draft'      },
  archived:  { bg: '#f3f4f6', color: '#6b7280', label: 'Archived'   },
};

function StatusBadge({ status }: { status: PropertyStatus }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.draft;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 10px', borderRadius: 999,
      fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
      textTransform: 'uppercase', background: s.bg, color: s.color,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.color }} />
      {s.label}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function OwnerPropertiesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<PropertiesResponse>({
    queryKey: ['owner-properties'],
    queryFn: () =>
      api.get<PropertiesResponse>('/properties?ownerId=me&limit=50').then(r => r.data),
  });

  const publishMutation = useMutation<Property, Error, string>({
    mutationFn: (id) => api.post<Property>(`/properties/${id}/publish`).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['owner-properties'] }),
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: (id) => api.delete(`/properties/${id}`).then(r => r.data),
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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#111' }}>
            My Properties
          </h1>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 14 }}>
            Manage your listings
          </p>
        </div>
        <Link
          href="/dashboard/owner/properties/new"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '9px 20px', borderRadius: 10,
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none',
          }}
        >
          + New Property
        </Link>
      </div>

      {/* States */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
          Loading your properties…
        </div>
      )}

      {isError && (
        <div style={{ padding: '1rem', background: '#fee2e2', borderRadius: 8, color: '#b91c1c', fontSize: 14 }}>
          Failed to load properties. Please try again.
        </div>
      )}

      {!isLoading && !isError && properties.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>No properties yet</p>
          <p style={{ fontSize: 14 }}>Click <strong>+ New Property</strong> to create your first listing.</p>
        </div>
      )}

      {/* Table */}
      {properties.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['Title', 'Location', 'Price', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left', fontWeight: 700,
                    fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em',
                    color: '#6b7280',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {properties.map((p, i) => (
                <tr
                  key={p._id}
                  style={{
                    borderBottom: i < properties.length - 1 ? '1px solid #f3f4f6' : 'none',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: '#111', maxWidth: 240 }}>
                    <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.title}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#6b7280' }}>{p.location}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#6366f1' }}>
                    ${p.price.toLocaleString()}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <StatusBadge status={p.status} />
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {/* Edit */}
                      <Link
                        href={`/dashboard/owner/properties/${p._id}/edit`}
                        style={{
                          padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600,
                          border: '1px solid #e5e7eb', color: '#374151', textDecoration: 'none',
                          background: '#fff',
                        }}
                      >
                        Edit
                      </Link>

                      {/* Publish — only for drafts */}
                      {p.status === 'draft' && (
                        <button
                          onClick={() => publishMutation.mutate(p._id)}
                          disabled={publishMutation.isPending}
                          style={{
                            padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600,
                            border: 'none', background: '#dcfce7', color: '#15803d', cursor: 'pointer',
                          }}
                        >
                          Publish
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        onClick={() => confirmDelete(p._id, p.title)}
                        disabled={deleteMutation.isPending}
                        style={{
                          padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600,
                          border: 'none', background: '#fee2e2', color: '#b91c1c', cursor: 'pointer',
                        }}
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
      )}
    </div>
  );
}
