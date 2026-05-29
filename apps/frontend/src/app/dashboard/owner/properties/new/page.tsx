'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
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
    title: '',
    description: '',
    location: '',
    price: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState('');

  const { mutate, isPending } = useMutation<Property>({
    mutationFn: () =>
      api
        .post<Property>('/properties', {
          title: form.title.trim(),
          description: form.description.trim(),
          location: form.location.trim(),
          price: parseFloat(form.price),
        })
        .then((r) => r.data),
    onSuccess: (property) => {
      router.push(`/dashboard/owner/properties/${property._id}/edit`);
    },
    onError: (err: unknown) => {
      const message =
        typeof err === 'object' && err !== null && 'response' in err
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ((err as any).response?.data?.message as string | undefined)
          : undefined;
      setServerError(message ?? 'Something went wrong. Please try again.');
    },
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    setServerError('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    mutate();
  }

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-100">New property</h1>
        <p className="mt-2 text-sm text-slate-400">
          Fill in the details. You can upload images on the next step.
        </p>
      </div>

      {serverError && <div className="proplist-alert-error mb-6">{serverError}</div>}

      <form onSubmit={handleSubmit} noValidate className="proplist-card p-6 sm:p-8 space-y-1">
        <PropertyFormField label="Title *" error={errors.title}>
          <input
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            placeholder={PLACEHOLDERS.title}
            className={propertyInputClass(!!errors.title)}
          />
        </PropertyFormField>

        <PropertyFormField label="Description *" error={errors.description}>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={5}
            placeholder={PLACEHOLDERS.description}
            className={`${propertyInputClass(!!errors.description)} min-h-[100px] resize-y`}
          />
        </PropertyFormField>

        <PropertyFormField label="Location *" error={errors.location}>
          <input
            name="location"
            type="text"
            value={form.location}
            onChange={handleChange}
            placeholder={PLACEHOLDERS.location}
            className={propertyInputClass(!!errors.location)}
          />
        </PropertyFormField>

        <PropertyFormField label="Monthly price (ETB) *" error={errors.price}>
          <input
            name="price"
            type="number"
            min="0"
            step="1"
            value={form.price}
            onChange={handleChange}
            placeholder={PLACEHOLDERS.price}
            className={propertyInputClass(!!errors.price)}
          />
        </PropertyFormField>

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={isPending} className="proplist-btn-primary flex-1">
            {isPending ? 'Creating…' : 'Create property'}
          </button>
          <button type="button" onClick={() => router.back()} className="proplist-btn-ghost">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
