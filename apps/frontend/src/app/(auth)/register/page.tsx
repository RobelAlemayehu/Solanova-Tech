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

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['user', 'owner']),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { refetch } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'user',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setError(null);
    setLoading(true);
    try {
      await api.post('/auth/register', data);
      const loginResponse = await api.post<{ access_token: string }>('/auth/login', {
        email: data.email,
        password: data.password,
      });
      localStorage.setItem('proplist_token', loginResponse.data.access_token);
      const user = await refetch();
      router.push(user ? getPostLoginPath(user.role) : '/login');
    } catch (err) {
      let message = 'Registration failed. Please try again.';
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
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-100">Create an account</h2>
        <p className="mt-2 text-sm text-slate-400">
          Choose a role to start browsing or listing properties.
        </p>
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
              autoComplete="new-password"
              className="mt-2"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Role
            </label>
            <select
              {...register('role')}
              className="proplist-input mt-2"
            >
              <option value="user">User (looking for properties)</option>
              <option value="owner">Owner (listing properties)</option>
            </select>
            {errors.role && (
              <p className="mt-1 text-xs text-red-500">{errors.role.message}</p>
            )}
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="proplist-btn-primary w-full"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </div>
      </form>
      <div className="mt-4 text-center">
        <span className="text-sm text-slate-400">Already have an account? </span>
        <button
          onClick={() => router.push('/login')}
          className="text-sm font-semibold text-indigo-300 hover:text-indigo-200"
        >
          Sign in
        </button>
      </div>
    </div>
  );
}
