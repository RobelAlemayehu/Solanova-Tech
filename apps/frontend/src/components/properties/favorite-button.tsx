'use client';

import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useAuth } from '@/hooks/use-auth';
import { normalizePropertyId } from '@/lib/favorite-utils';

interface FavoriteItem {
  _id: string;
  userId: string;
  propertyId: string | { _id: string };
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

function useFavorites() {
  const { user } = useAuth();
  return useQuery<FavoritesResponse>({
    queryKey: ['favorites'],
    queryFn: () => api.get<FavoritesResponse>('/favorites?limit=100').then((r) => r.data),
    enabled: !!user,
    staleTime: 30_000,
  });
}

interface FavoriteButtonProps {
  propertyId: string;
  size?: number;
}

export default function FavoriteButton({ propertyId, size = 40 }: FavoriteButtonProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: favoritesData, isLoading: isFavLoading } = useFavorites();

  const isFavorited =
    favoritesData?.data.some(
      (fav) => normalizePropertyId(fav.propertyId) === propertyId,
    ) ?? false;

  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === 'proplist_favorites_updated') {
        queryClient.invalidateQueries({ queryKey: ['favorites'] });
      }
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [queryClient]);

  const { mutate: toggle, isPending } = useMutation<
    ToggleResponse,
    Error,
    void,
    { previousFavorites: FavoritesResponse | undefined }
  >({
    mutationFn: () =>
      api.post<ToggleResponse>(`/favorites/${propertyId}/toggle`).then((r) => r.data),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['favorites'] });
      const previousFavorites = queryClient.getQueryData<FavoritesResponse>(['favorites']);

      queryClient.setQueryData<FavoritesResponse>(['favorites'], (old) => {
        if (!old) return old;
        const exists = old.data.some(
          (fav) => normalizePropertyId(fav.propertyId) === propertyId,
        );

        if (exists) {
          return {
            ...old,
            data: old.data.filter(
              (fav) => normalizePropertyId(fav.propertyId) !== propertyId,
            ),
          };
        }

        return {
          ...old,
          data: [
            ...old.data,
            { _id: `temp-${Date.now()}`, userId: user?._id || '', propertyId },
          ],
        };
      });

      return { previousFavorites };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(['favorites'], context.previousFavorites);
      }
    },
    onSuccess: () => {
      localStorage.setItem('proplist_favorites_updated', Date.now().toString());
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const isDisabled = !user || isFavLoading || isPending;
  const title = !user
    ? 'Sign in to save this property'
    : isFavorited
      ? 'Remove from favorites'
      : 'Save to favorites';

  return (
    <button
      type="button"
      aria-label={title}
      aria-pressed={isFavorited}
      title={title}
      disabled={isDisabled}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
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
        background: isFavorited ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.2s ease, transform 0.15s ease',
        outline: 'none',
        flexShrink: 0,
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
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
