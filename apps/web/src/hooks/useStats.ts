import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api';

type Stats = {
  totalListings: number;
  activeSellers: number;
  supportedLocations: number;
};

export function useStats() {
  return useQuery<Stats>({
    queryKey: ['stats'],
    queryFn: () => get('/stats'),
    staleTime: 5 * 60 * 1000,
  });
}
