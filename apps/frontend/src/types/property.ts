// Mirrors the backend Property Mongoose schema.
// Keep in sync with apps/backend/src/properties/schemas/property.schema.ts

export type PropertyStatus = 'draft' | 'published' | 'archived';

export interface Property {
  _id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  images: string[];
  status: PropertyStatus;
  ownerId: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedProperties {
  data: Property[];
  total: number;
  page: number;
  limit: number;
}
