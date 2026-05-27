'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { Property, PropertyStatus } from '@/types/property';

// ─── API Types ────────────────────────────────────────────────────────────────

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

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();

  // Fetch all properties (limit 1000 for admin demo purposes)
  const { data, isLoading, isError } = useQuery<PropertiesResponse>({
    queryKey: ['admin-properties'],
    queryFn: () => api.get<PropertiesResponse>('/properties?limit=1000').then((r) => r.data),
  });

  // Mutation for disabling a property
  const disableMutation = useMutation<void, Error, string>({
    mutationFn: (id) => api.patch(`/properties/${id}/disable`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
    },
  });

  const properties = data?.data ?? [];

  // Compute metrics
  const totalProperties = properties.length;
  const totalPublished = properties.filter((p) => p.status === 'published').length;
  const totalArchived = properties.filter((p) => p.status === 'archived').length;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#111' }}>
          Admin Dashboard
        </h1>
        <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 14 }}>
          System overview and property management
        </p>
      </div>

      {/* Metrics Cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total Properties', value: totalProperties, color: '#6366f1' },
          { label: 'Published', value: totalPublished, color: '#15803d' },
          { label: 'Archived', value: totalArchived, color: '#6b7280' },
        ].map((metric) => (
          <div
            key={metric.label}
            style={{
              flex: 1,
              background: '#fff',
              borderRadius: 12,
              padding: '20px 24px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {metric.label}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: metric.color, marginTop: 4 }}>
              {isLoading ? '...' : metric.value}
            </div>
          </div>
        ))}
      </div>

      {/* States */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
          Loading system data…
        </div>
      )}

      {isError && (
        <div style={{ padding: '1rem', background: '#fee2e2', borderRadius: 8, color: '#b91c1c', fontSize: 14 }}>
          Failed to load properties. Ensure you have admin privileges.
        </div>
      )}

      {/* Data Table */}
      {!isLoading && !isError && properties.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['Title', 'Owner Email', 'Status', 'Created Date', 'Actions'].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '12px 16px', textAlign: 'left', fontWeight: 700,
                      fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em',
                      color: '#6b7280',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {properties.map((p, i) => {
                // Extract email if populated, else fallback to raw ID
                const ownerEmail = typeof p.ownerId === 'object' && p.ownerId !== null 
                  ? (p.ownerId as any).email 
                  : p.ownerId;

                const isArchived = p.status === 'archived';

                return (
                  <tr
                    key={p._id}
                    style={{
                      borderBottom: i < properties.length - 1 ? '1px solid #f3f4f6' : 'none',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                  >
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#111', maxWidth: 240 }}>
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.title}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#4b5563' }}>
                      {ownerEmail || 'Unknown'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <StatusBadge status={p.status} />
                    </td>
                    <td style={{ padding: '14px 16px', color: '#6b7280' }}>
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to disable "${p.title}"?`)) {
                            disableMutation.mutate(p._id);
                          }
                        }}
                        disabled={isArchived || disableMutation.isPending}
                        style={{
                          padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600,
                          border: 'none', background: isArchived ? '#f3f4f6' : '#fee2e2',
                          color: isArchived ? '#9ca3af' : '#b91c1c',
                          cursor: isArchived || disableMutation.isPending ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {disableMutation.isPending && disableMutation.variables === p._id ? 'Disabling...' : 'Disable'}
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
        <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>
          <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>No properties found</p>
        </div>
      )}
    </div>
  );
}
