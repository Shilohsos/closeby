import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, authPut } from '@/lib/api';
import type { Listing } from './useListings';

export type Storefront = {
  userId: string;
  bio: string | null;
  avatarUrl: string | null;
  phone: string | null;
  socialLinks: string[];
};

export function useStorefront(userId: string) {
  return useQuery<{ data: Storefront | null; listings: Listing[] }>({
    queryKey: ['storefront', userId],
    queryFn: () => get(`/storefronts/${userId}`),
    enabled: !!userId,
  });
}

export type UpdateStorefrontInput = {
  bio?: string;
  avatarUrl?: string | null;
  phone?: string;
  socialLinks?: string[];
};

export function useUpdateStorefront() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateStorefrontInput) => authPut<{ data: Storefront }>('/storefronts/me', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['storefront'] }),
  });
}
