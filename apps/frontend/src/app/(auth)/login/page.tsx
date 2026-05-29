'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import api from '@/lib/axios';
import { getPostLoginPath } from '@/lib/auth-redirect';
import { useAuth } from '@/hooks/use-auth';
import PasswordInput from '@/components/ui/password-input';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { refetch } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    setLoading(true);
    try {
      const response = await api.post<{ access_token: string }>('/auth/login', data);
      localStorage.setItem('proplist_token', response.data.access_token);
      const user = await refetch();
      router.push(user ? getPostLoginPath(user.role) : '/properties');
    } catch (err) {
      let message = 'Login failed. Please check your credentials.';
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message || message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-100">Welcome back</h2>
        <p className="mt-2 text-sm text-slate-400">Sign in to manage properties and favorites.</p>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {error && (
          <div className="proplist-alert-error">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Email address
            </label>
            <input
              {...register('email')}
              type="email"
              className="proplist-input mt-2"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Password
            </label>
            <PasswordInput
              {...register('password')}
              autoComplete="current-password"
              className="mt-2"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="proplist-btn-primary w-full"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </form>
      <div className="mt-4 text-center">
        <span className="text-sm text-slate-400">Don't have an account? </span>
        <button
          onClick={() => router.push('/register')}
          className="text-sm font-semibold text-indigo-300 hover:text-indigo-200"
        >
          Register
        </button>
      </div>
    </div>
  );
}
