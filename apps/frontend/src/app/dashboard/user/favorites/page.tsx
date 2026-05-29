'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import FavoriteButton from '@/components/properties/favorite-button';

type PropertyStatus = 'draft' | 'published' | 'archived';

interface FavoriteProperty {
  _id: string;
  title: string;
  location: string;
  price: number;
  images: string[];
  status: PropertyStatus;
}

interface FavoriteItemPopulated {
  _id: string;
  propertyId: FavoriteProperty | null;
}

interface FavoritesResponsePopulated {
  data: FavoriteItemPopulated[];
  total: number;
  page: number;
  limit: number;
}

export default function UserFavoritesPage() {
  const { data, isLoading, isError } = useQuery<FavoritesResponsePopulated>({
    queryKey: ['favorites'],
    queryFn: () => api.get<FavoritesResponsePopulated>('/favorites?limit=50').then((r) => r.data),
  });

  const favorites = (data?.data ?? []).filter((f) => f.propertyId);

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-100">My Favorites</h1>
        <p className="mt-1 text-sm text-slate-400">
          Saved properties are synced across tabs and devices.
        </p>
      </div>

      {isLoading && (
        <div className="proplist-card px-6 py-10 text-center text-slate-300">
          Loading favorites…
        </div>
      )}

      {isError && (
        <div className="proplist-alert-error">
          Failed to load favorites. Please refresh and try again.
        </div>
      )}

      {!isLoading && !isError && favorites.length === 0 && (
        <div className="proplist-card px-6 py-10 text-center">
          <p className="m-0 text-base font-semibold text-slate-100">No favorites yet</p>
          <p className="mt-2 text-sm text-slate-400">
            Browse properties and tap the heart icon to save listings.
          </p>
          <div className="mt-5">
            <Link href="/properties" className="proplist-btn-primary">
              Browse Properties
            </Link>
          </div>
        </div>
      )}

      {favorites.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {favorites.map((fav) => {
            const p = fav.propertyId!;
            return (
              <div key={fav._id} className="proplist-card p-5 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <Link
                    href={`/properties/${p._id}`}
                    className="block text-base font-bold text-slate-100 hover:text-white truncate"
                    title={p.title}
                  >
                    {p.title}
                  </Link>
                  <p className="mt-1 text-sm text-slate-400 truncate">{p.location}</p>
                  <p className="mt-3 text-lg font-extrabold text-indigo-300">
                    ${p.price.toLocaleString()}
                    <span className="ml-1 text-xs font-medium text-slate-400">/ mo</span>
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <FavoriteButton propertyId={p._id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

