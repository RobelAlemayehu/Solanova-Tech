'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import api from '@/lib/axios';
import type { Property } from '@/types/property';

// ─── Shared form field styles ──────────────────────────────────────────────────

const fieldStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 8,
  border: '1px solid #d1d5db',
  fontSize: 14,
  color: '#111',
  outline: 'none',
  background: '#fff',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: 6,
  fontSize: 13,
  fontWeight: 600,
  color: '#374151',
};

function Field({
  label,
  error,
  disabled,
  children,
}: {
  label: string;
  error?: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 20, opacity: disabled ? 0.7 : 1 }}>
      <label style={labelStyle}>{label}</label>
      {children}
      {error && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#b91c1c' }}>{error}</p>}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface FormState {
  title: string;
  description: string;
  location: string;
  price: string;
}

export default function EditPropertyPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const propertyId = params.id;

  const [form, setForm] = useState<FormState>({ title: '', description: '', location: '', price: '' });
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [uploading, setUploading] = useState(false);

  // Fetch initial data
  const { data: property, isLoading: loadingProp, isError: fetchErr } = useQuery<Property>({
    queryKey: ['property', propertyId],
    queryFn: () => api.get<Property>(`/properties/${propertyId}`).then(r => r.data),
  });

  // Populate form on load
  useEffect(() => {
    if (property) {
      setForm({
        title: property.title,
        description: property.description,
        location: property.location,
        price: property.price.toString(),
      });
    }
  }, [property]);

  // Update mutation
  const { mutate: update, isPending: updating } = useMutation<Property>({
    mutationFn: () =>
      api.patch<Property>(`/properties/${propertyId}`, {
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        price: parseFloat(form.price),
      }).then(r => r.data),
    onSuccess: (updatedProperty) => {
      queryClient.setQueryData(['property', propertyId], updatedProperty);
      setMsg({ type: 'success', text: 'Property updated successfully.' });
    },
    onError: (err: any) => {
      setMsg({ type: 'error', text: err?.response?.data?.message ?? 'Failed to update.' });
    },
  });

  // Handle form edit (if draft)
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    if (!form.title || !form.description || !form.location || !form.price) {
      setMsg({ type: 'error', text: 'All fields are required.' });
      return;
    }
    update();
  }

  // Handle image upload (single file via FileInterceptor in backend)
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMsg({ type: '', text: '' });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post<Property>(`/properties/${propertyId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      queryClient.setQueryData(['property', propertyId], res.data);
      setMsg({ type: 'success', text: 'Image uploaded successfully.' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.response?.data?.message ?? 'Upload failed.' });
    } finally {
      setUploading(false);
      // Reset input
      if (e.target) e.target.value = '';
    }
  }

  if (loadingProp) return <div style={{ padding: '3rem', color: '#6b7280' }}>Loading property details…</div>;
  if (fetchErr || !property) return <div style={{ color: '#b91c1c' }}>Failed to load property.</div>;

  const isPublished = property.status === 'published';

  return (
    <div style={{ maxWidth: 800 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#111' }}>
            Edit Property
          </h1>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 14 }}>
            {isPublished 
              ? 'This property is published. Basic details cannot be edited.' 
              : 'Update your listing details or upload images.'}
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/owner/properties')}
          style={{
            padding: '8px 16px', borderRadius: 8, border: '1px solid #d1d5db',
            background: '#fff', color: '#374151', fontWeight: 600, fontSize: 13, cursor: 'pointer',
          }}
        >
          Back to List
        </button>
      </div>

      {msg.text && (
        <div style={{
          marginBottom: 20, padding: '12px 16px', borderRadius: 8, fontSize: 14, fontWeight: 500,
          background: msg.type === 'error' ? '#fee2e2' : '#dcfce7',
          color: msg.type === 'error' ? '#b91c1c' : '#15803d',
        }}>
          {msg.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
        
        {/* Left Col: Form */}
        <form
          onSubmit={handleSubmit}
          style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 24 }}
        >
          <Field label="Title" disabled={isPublished}>
            <input
              name="title"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              disabled={isPublished}
              style={fieldStyle}
            />
          </Field>

          <Field label="Description" disabled={isPublished}>
            <textarea
              name="description"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              disabled={isPublished}
              rows={4}
              style={{ ...fieldStyle, resize: 'vertical', minHeight: 80 }}
            />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Location" disabled={isPublished}>
              <input
                name="location"
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                disabled={isPublished}
                style={fieldStyle}
              />
            </Field>

            <Field label="Price (USD)" disabled={isPublished}>
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                disabled={isPublished}
                style={fieldStyle}
              />
            </Field>
          </div>

          {!isPublished && (
            <button
              type="submit"
              disabled={updating}
              style={{
                width: '100%', padding: '11px 0', borderRadius: 8, border: 'none', marginTop: 8,
                background: updating ? '#a5b4fc' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                color: '#fff', fontWeight: 700, fontSize: 14, cursor: updating ? 'not-allowed' : 'pointer',
              }}
            >
              {updating ? 'Saving…' : 'Save Changes'}
            </button>
          )}
        </form>

        {/* Right Col: Images */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 24 }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#111' }}>Gallery</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            {property.images.length === 0 ? (
              <p style={{ margin: 0, fontSize: 13, color: '#9ca3af', fontStyle: 'italic' }}>
                No images uploaded yet.
              </p>
            ) : (
              property.images.map((src, i) => (
                <div key={i} style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: 8, overflow: 'hidden', background: '#f3f4f6' }}>
                  <Image src={src} alt={`Image ${i + 1}`} fill style={{ objectFit: 'cover' }} unoptimized={src.startsWith('data:')} />
                </div>
              ))
            )}
          </div>

          <div style={{ position: 'relative' }}>
            <input
              type="file"
              accept="image/jpeg, image/png, image/webp"
              onChange={handleFileUpload}
              disabled={uploading || isPublished}
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                opacity: 0, cursor: (uploading || isPublished) ? 'not-allowed' : 'pointer',
              }}
              title={isPublished ? "Cannot add images to a published property" : "Upload an image"}
            />
            <div style={{
              padding: '12px', borderRadius: 8, border: '1px dashed #a5b4fc',
              background: '#eef2ff', color: '#4f46e5', fontSize: 13, fontWeight: 600,
              textAlign: 'center', pointerEvents: 'none',
              opacity: (uploading || isPublished) ? 0.6 : 1,
            }}>
              {uploading ? 'Uploading…' : isPublished ? 'Gallery locked' : '+ Add Image'}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
