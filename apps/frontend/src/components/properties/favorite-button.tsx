'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useAuth } from '@/hooks/use-auth';

// ─── API Types ────────────────────────────────────────────────────────────────

interface FavoriteItem {
  _id: string;
  userId: string;
  /** propertyId is the raw ObjectId string (not populated on this endpoint) */
  propertyId: string;
}

interface FavoritesResponse {
  data: FavoriteItem[];
  total: number;
  page: number;
  limit: number;
}

interface ToggleResponse {
  favorited: boolean;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useFavorites() {
  const { user } = useAuth();
  return useQuery<FavoritesResponse>({
    queryKey: ['favorites'],
    queryFn: () => api.get<FavoritesResponse>('/favorites').then((r) => r.data),
    // Only fetch when the user is authenticated; /favorites requires JWT.
    enabled: !!user,
    staleTime: 30_000,
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

interface FavoriteButtonProps {
  propertyId: string;
  /** Optional: size of the button in px (default 40) */
  size?: number;
}

export default function FavoriteButton({
  propertyId,
  size = 40,
}: FavoriteButtonProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: favoritesData, isLoading: isFavLoading } = useFavorites();

  // Derive current state from the fetched list.
  const isFavorited = favoritesData?.data.some(
    (fav) => fav.propertyId === propertyId
  ) ?? false;

  const { mutate: toggle, isPending } = useMutation<ToggleResponse>({
    mutationFn: () =>
      api
        .post<ToggleResponse>(`/favorites/${propertyId}/toggle`)
        .then((r) => r.data),
    onSuccess: () => {
      // Refetch favorites to reflect the true server state.
      // Optimistic update will be added in commit 36.
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  // Unauthenticated users see a disabled heart with a tooltip.
  const isDisabled = !user || isPending || isFavLoading;
  const title = !user
    ? 'Sign in to save this property'
    : isFavorited
    ? 'Remove from favorites'
    : 'Save to favorites';

  return (
    <button
      type="button"
      aria-label={title}
      title={title}
      disabled={isDisabled}
      onClick={() => {
        if (user) toggle();
      }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: '50%',
        border: '1px solid rgba(255,255,255,0.12)',
        background: isFavorited
          ? 'rgba(239,68,68,0.15)'
          : 'rgba(255,255,255,0.06)',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.2s ease, transform 0.15s ease',
        outline: 'none',
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        if (!isDisabled)
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.12)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
      }}
    >
      {isPending ? (
        // Small spinner while mutation is in-flight
        <span
          style={{
            width: size * 0.4,
            height: size * 0.4,
            borderRadius: '50%',
            border: '2px solid rgba(239,68,68,0.3)',
            borderTopColor: '#ef4444',
            display: 'inline-block',
            animation: 'proplist-spin 0.6s linear infinite',
          }}
        />
      ) : (
        <HeartIcon
          size={size * 0.48}
          filled={isFavorited}
          color={isFavorited ? '#ef4444' : 'rgba(255,255,255,0.55)'}
        />
      )}
    </button>
  );
}

// ─── Heart Icon ───────────────────────────────────────────────────────────────

function HeartIcon({
  size,
  filled,
  color,
}: {
  size: number;
  filled: boolean;
  color: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? color : 'none'}
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ transition: 'fill 0.2s ease, stroke 0.2s ease' }}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
