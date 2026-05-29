'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import api from '@/lib/axios';
import { PLACEHOLDERS } from '@/lib/placeholders';
import {
  PropertyFormField,
  propertyInputClass,
} from '@/components/owner/property-form-field';
import type { Property } from '@/types/property';

interface FormState {
  title: string;
  description: string;
  location: string;
  price: string;
}

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const propertyId = typeof params.id === 'string' ? params.id : '';

  const [form, setForm] = useState<FormState>({
    title: '',
    description: '',
    location: '',
    price: '',
  });
  const [msg, setMsg] = useState<{ type: 'success' | 'error' | ''; text: string }>({
    type: '',
    text: '',
  });
  const [uploading, setUploading] = useState(false);

  const {
    data: property,
    isLoading: loadingProp,
    isError: fetchErr,
  } = useQuery<Property>({
    queryKey: ['property', propertyId],
    queryFn: () => api.get<Property>(`/properties/${propertyId}`).then((r) => r.data),
  });

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

  const { mutate: update, isPending: updating } = useMutation<Property>({
    mutationFn: () =>
      api
        .patch<Property>(`/properties/${propertyId}`, {
          title: form.title.trim(),
          description: form.description.trim(),
          location: form.location.trim(),
          price: parseFloat(form.price),
        })
        .then((r) => r.data),
    onSuccess: (updatedProperty) => {
      queryClient.setQueryData(['property', propertyId], updatedProperty);
      setMsg({ type: 'success', text: 'Property updated successfully.' });
    },
    onError: (err: unknown) => {
      const message =
        typeof err === 'object' && err !== null && 'response' in err
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ((err as any).response?.data?.message as string | undefined)
          : undefined;
      setMsg({ type: 'error', text: message ?? 'Failed to update.' });
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    if (!form.title || !form.description || !form.location || !form.price) {
      setMsg({ type: 'error', text: 'All fields are required.' });
      return;
    }
    update();
  }

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
    } catch (err: unknown) {
      const message =
        typeof err === 'object' && err !== null && 'response' in err
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ((err as any).response?.data?.message as string | undefined)
          : undefined;
      setMsg({ type: 'error', text: message ?? 'Upload failed.' });
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  }

  if (!propertyId) {
    return <p className="text-sm text-red-400">Invalid property ID.</p>;
  }

  if (loadingProp) {
    return <p className="py-12 text-sm text-slate-400">Loading property details…</p>;
  }
  if (fetchErr || !property) {
    return <p className="text-sm text-red-400">Failed to load property.</p>;
  }

  const isPublished = property.status === 'published';

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-100">Edit property</h1>
          <p className="mt-2 text-sm text-slate-400">
            {isPublished
              ? 'This property is published. Basic details cannot be edited.'
              : 'Update your listing details or upload images.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/dashboard/owner/properties')}
          className="proplist-btn-ghost text-sm"
        >
          Back to list
        </button>
      </div>

      {msg.text && (
        <div
          className={`mb-6 ${msg.type === 'error' ? 'proplist-alert-error' : 'proplist-alert-success'}`}
        >
          {msg.text}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_280px] items-start">
        <form onSubmit={handleSubmit} className="proplist-card p-6 sm:p-8">
          <PropertyFormField label="Title" disabled={isPublished}>
            <input
              name="title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              disabled={isPublished}
              placeholder={PLACEHOLDERS.title}
              className={propertyInputClass()}
            />
          </PropertyFormField>

          <PropertyFormField label="Description" disabled={isPublished}>
            <textarea
              name="description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              disabled={isPublished}
              rows={4}
              placeholder={PLACEHOLDERS.description}
              className={`${propertyInputClass()} min-h-[80px] resize-y`}
            />
          </PropertyFormField>

          <div className="grid gap-0 sm:grid-cols-2 sm:gap-x-4">
            <PropertyFormField label="Location" disabled={isPublished}>
              <input
                name="location"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                disabled={isPublished}
                placeholder={PLACEHOLDERS.location}
                className={propertyInputClass()}
              />
            </PropertyFormField>

            <PropertyFormField label="Price (ETB)" disabled={isPublished}>
              <input
                name="price"
                type="number"
                min="0"
                step="1"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                disabled={isPublished}
                placeholder={PLACEHOLDERS.price}
                className={propertyInputClass()}
              />
            </PropertyFormField>
          </div>

          {!isPublished && (
            <button type="submit" disabled={updating} className="proplist-btn-primary w-full mt-2">
              {updating ? 'Saving…' : 'Save changes'}
            </button>
          )}
        </form>

        <div className="proplist-card p-6">
          <h2 className="text-base font-bold text-slate-100 mb-4">Gallery</h2>

          <div className="flex flex-col gap-3 mb-5">
            {property.images.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No images uploaded yet.</p>
            ) : (
              property.images.map((src, i) => (
                <div
                  key={i}
                  className="relative w-full aspect-video rounded-lg overflow-hidden bg-white/5"
                >
                  <Image
                    src={src}
                    alt={`Image ${i + 1}`}
                    fill
                    className="object-cover"
                    unoptimized={src.startsWith('data:')}
                  />
                </div>
              ))
            )}
          </div>

          <div className="relative">
            <input
              type="file"
              accept="image/jpeg, image/png, image/webp"
              onChange={handleFileUpload}
              disabled={uploading || isPublished}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              title={isPublished ? 'Cannot add images to a published property' : 'Upload an image'}
            />
            <div
              className={`py-3 px-4 rounded-lg border border-dashed border-indigo-500/40 bg-indigo-500/10 text-indigo-300 text-sm font-semibold text-center pointer-events-none ${
                uploading || isPublished ? 'opacity-60' : ''
              }`}
            >
              {uploading ? 'Uploading…' : isPublished ? 'Gallery locked' : '+ Add image'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
