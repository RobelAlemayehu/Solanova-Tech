'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
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
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
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

interface FormErrors {
  title?: string;
  description?: string;
  location?: string;
  price?: string;
}

function validate(f: FormState): FormErrors {
  const errs: FormErrors = {};
  if (f.title.trim().length < 3) errs.title = 'Title must be at least 3 characters';
  if (!f.description.trim()) errs.description = 'Description is required';
  if (!f.location.trim()) errs.location = 'Location is required';
  const p = parseFloat(f.price);
  if (isNaN(p) || p <= 0) errs.price = 'Price must be a positive number';
  return errs;
}

export default function NewPropertyPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    title: '', description: '', location: '', price: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState('');

  const { mutate, isPending } = useMutation<Property>({
    mutationFn: () =>
      api.post<Property>('/properties', {
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        price: parseFloat(form.price),
      }).then(r => r.data),
    onSuccess: (property) => {
      // Redirect to edit page where images can be uploaded
      router.push(`/dashboard/owner/properties/${property._id}/edit`);
    },
    onError: (err: any) => {
      setServerError(err?.response?.data?.message ?? 'Something went wrong. Please try again.');
    },
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: undefined }));
    setServerError('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    mutate();
  }

  return (
    <div style={{ maxWidth: 640 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#111' }}>
          New Property
        </h1>
        <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 14 }}>
          Fill in the details. You can upload images on the next step.
        </p>
      </div>

      {/* Server error */}
      {serverError && (
        <div style={{
          marginBottom: 20, padding: '10px 14px', borderRadius: 8,
          background: '#fee2e2', color: '#b91c1c', fontSize: 13,
        }}>
          {serverError}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        style={{
          background: '#fff', borderRadius: 12,
          border: '1px solid #e5e7eb', padding: 28,
        }}
      >
        <Field label="Title *" error={errors.title}>
          <input
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Modern Studio in Downtown"
            style={{ ...fieldStyle, borderColor: errors.title ? '#f87171' : '#d1d5db' }}
            onFocus={e => (e.target.style.borderColor = '#6366f1')}
            onBlur={e => (e.target.style.borderColor = errors.title ? '#f87171' : '#d1d5db')}
          />
        </Field>

        <Field label="Description *" error={errors.description}>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={5}
            placeholder="Describe the property…"
            style={{
              ...fieldStyle,
              resize: 'vertical', minHeight: 100,
              borderColor: errors.description ? '#f87171' : '#d1d5db',
            }}
            onFocus={e => (e.target.style.borderColor = '#6366f1')}
            onBlur={e => (e.target.style.borderColor = errors.description ? '#f87171' : '#d1d5db')}
          />
        </Field>

        <Field label="Location *" error={errors.location}>
          <input
            name="location"
            type="text"
            value={form.location}
            onChange={handleChange}
            placeholder="e.g. New York, NY"
            style={{ ...fieldStyle, borderColor: errors.location ? '#f87171' : '#d1d5db' }}
            onFocus={e => (e.target.style.borderColor = '#6366f1')}
            onBlur={e => (e.target.style.borderColor = errors.location ? '#f87171' : '#d1d5db')}
          />
        </Field>

        <Field label="Monthly Price (USD) *" error={errors.price}>
          <input
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={handleChange}
            placeholder="e.g. 1500"
            style={{ ...fieldStyle, borderColor: errors.price ? '#f87171' : '#d1d5db' }}
            onFocus={e => (e.target.style.borderColor = '#6366f1')}
            onBlur={e => (e.target.style.borderColor = errors.price ? '#f87171' : '#d1d5db')}
          />
        </Field>

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button
            type="submit"
            disabled={isPending}
            style={{
              flex: 1, padding: '11px 0', borderRadius: 9, border: 'none',
              background: isPending ? '#a5b4fc' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              color: '#fff', fontWeight: 700, fontSize: 14, cursor: isPending ? 'not-allowed' : 'pointer',
            }}
          >
            {isPending ? 'Creating…' : 'Create Property'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              padding: '11px 20px', borderRadius: 9, border: '1px solid #d1d5db',
              background: '#fff', color: '#374151', fontWeight: 600, fontSize: 14, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
