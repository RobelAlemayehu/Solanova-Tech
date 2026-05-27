'use client';

import React, { useEffect } from 'react';
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

  // Cross-tab sync: listen for storage events from other tabs
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === 'proplist_favorites_updated') {
        queryClient.invalidateQueries({ queryKey: ['favorites'] });
      }
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [queryClient]);

  const { mutate: toggle } = useMutation<
    ToggleResponse,
    Error,
    void,
    { previousFavorites: FavoritesResponse | undefined }
  >({
    mutationFn: () =>
      api
        .post<ToggleResponse>(`/favorites/${propertyId}/toggle`)
        .then((r) => r.data),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['favorites'] });

      const previousFavorites = queryClient.getQueryData<FavoritesResponse>(['favorites']);

      queryClient.setQueryData<FavoritesResponse>(['favorites'], (old) => {
        if (!old) return old;
        const exists = old.data.some((fav) => fav.propertyId === propertyId);
        
        if (exists) {
          return {
            ...old,
            data: old.data.filter((fav) => fav.propertyId !== propertyId),
          };
        } else {
          return {
            ...old,
            data: [
              ...old.data,
              { _id: `temp-${Date.now()}`, userId: user?.id || 'me', propertyId },
            ],
          };
        }
      });

      return { previousFavorites };
    },
    onError: (err, variables, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(['favorites'], context.previousFavorites);
      }
    },
    onSuccess: () => {
      // Trigger the storage event in other tabs
      window.localStorage.setItem('proplist_favorites_updated', Date.now().toString());
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  // Unauthenticated users see a disabled heart with a tooltip.
  const isDisabled = !user || isFavLoading;
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
      <HeartIcon
        size={size * 0.48}
        filled={isFavorited}
        color={isFavorited ? '#ef4444' : 'rgba(255,255,255,0.55)'}
      />
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
