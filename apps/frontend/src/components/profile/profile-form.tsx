'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import PasswordInput from '@/components/ui/password-input';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import api from '@/lib/axios';
import { useAuth } from '@/hooks/use-auth';
import type { User } from '@/contexts/auth-context';

const profileSchema = z
  .object({
    displayName: z.string().min(1, 'Name is required').max(80),
    email: z.string().email('Invalid email'),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => !data.newPassword || data.newPassword.length >= 8,
    { message: 'New password must be at least 8 characters', path: ['newPassword'] },
  )
  .refine(
    (data) => {
      if (data.newPassword && data.newPassword !== data.confirmPassword) return false;
      return true;
    },
    { message: 'Passwords do not match', path: ['confirmPassword'] },
  )
  .refine(
    (data) => {
      if (data.newPassword && !data.currentPassword) return false;
      return true;
    },
    { message: 'Enter your current password', path: ['currentPassword'] },
  );

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileForm() {
  const { user, refetch } = useAuth();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (user) {
      reset({
        displayName: user.displayName || '',
        email: user.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormValues) => {
    setMessage(null);
    try {
      const payload: Record<string, string> = {
        displayName: data.displayName.trim(),
        email: data.email,
      };
      if (data.newPassword) {
        payload.currentPassword = data.currentPassword!;
        payload.newPassword = data.newPassword;
      }

      await api.patch<User>('/auth/profile', payload);
      await refetch();
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
      reset({
        ...data,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      let text = 'Failed to update profile.';
      if (axios.isAxiosError(err)) {
        text = err.response?.data?.message || text;
      }
      setMessage({ type: 'error', text });
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-100">Profile settings</h1>
      <p className="mt-2 text-sm text-slate-400">
        Update your display name, email, or password.
      </p>

      {message && (
        <div className={`mt-6 ${message.type === 'success' ? 'proplist-alert-success' : 'proplist-alert-error'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Display name
          </label>
          <input {...register('displayName')} className="proplist-input" />
          {errors.displayName && (
            <p className="mt-1 text-xs text-red-400">{errors.displayName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Email
          </label>
          <input {...register('email')} type="email" className="proplist-input" />
          {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
        </div>

        <div className="pt-4 border-t border-[color:var(--color-border)]">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
            Change password
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-slate-500 mb-2">Current password</label>
              <PasswordInput {...register('currentPassword')} autoComplete="current-password" />
              {errors.currentPassword && (
                <p className="mt-1 text-xs text-red-400">{errors.currentPassword.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-2">New password</label>
              <PasswordInput {...register('newPassword')} autoComplete="new-password" />
              {errors.newPassword && (
                <p className="mt-1 text-xs text-red-400">{errors.newPassword.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-2">Confirm new password</label>
              <PasswordInput {...register('confirmPassword')} autoComplete="new-password" />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-400">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>
        </div>

        <button type="submit" disabled={isSubmitting} className="proplist-btn-primary">
          {isSubmitting ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
