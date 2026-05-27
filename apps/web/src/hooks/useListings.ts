import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, authPost, authPatch, authDelete } from '@/lib/api';

export type Listing = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  category: string;
  location: string;
  price: number;
  imageUrl: string | null;
  createdAt: string;
};

export type ListingWithSeller = Listing & {
  seller: {
    userId: string;
    bio: string | null;
    avatarUrl: string | null;
    phone: string | null;
    socialLinks: string[];
  } | null;
};

export type ListingsFilters = {
  q?: string;
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  userId?: string;
  page?: number;
  limit?: number;
};

function toQS(filters: ListingsFilters): string {
  const p = new URLSearchParams();
  if (filters.q) p.set('q', filters.q);
  if (filters.category) p.set('category', filters.category);
  if (filters.location) p.set('location', filters.location);
  if (filters.minPrice !== undefined) p.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice !== undefined) p.set('maxPrice', String(filters.maxPrice));
  if (filters.userId) p.set('userId', filters.userId);
  if (filters.page) p.set('page', String(filters.page));
  if (filters.limit) p.set('limit', String(filters.limit));
  return p.toString();
}

export function useListings(filters: ListingsFilters = {}) {
  return useQuery<{ data: Listing[]; total: number; page: number }>({
    queryKey: ['listings', filters],
    queryFn: () => get(`/listings?${toQS(filters)}`),
  });
}

export function useListing(id: string) {
  return useQuery<{ data: ListingWithSeller }>({
    queryKey: ['listing', id],
    queryFn: () => get(`/listings/${id}`),
    enabled: !!id,
  });
}

export type CreateListingInput = {
  title: string;
  description?: string;
  category: string;
  location: string;
  price: number;
  imageUrl?: string | null;
};

export function useCreateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateListingInput) => authPost<{ data: Listing }>('/listings', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['listings'] }),
  });
}

export function useUpdateListing(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CreateListingInput>) => authPatch<{ data: Listing }>(`/listings/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['listings'] });
      qc.invalidateQueries({ queryKey: ['listing', id] });
    },
  });
}

export function useDeleteListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => authDelete(`/listings/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['listings'] }),
  });
}
