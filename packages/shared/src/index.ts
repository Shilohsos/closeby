// Shared types for Close By
// Orval-generated API types go in ./api/generated.ts

export type Role = 'buyer' | 'seller' | 'organizer';

export type ListingCategory =
  | 'housing'
  | 'jobs'
  | 'services'
  | 'food_restaurants'
  | 'electronics'
  | 'fashion'
  | 'events';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
}
