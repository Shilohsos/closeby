import { Link } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Listing } from '@/hooks/useListings';

export const CATEGORY_LABELS: Record<string, string> = {
  housing: 'Housing',
  jobs: 'Jobs',
  services: 'Services',
  food_restaurants: 'Food & Restaurants',
  electronics: 'Electronics',
  fashion: 'Fashion',
  events: 'Events',
};

export function formatPrice(kobo: number): string {
  return '₦' + (kobo / 100).toLocaleString('en-NG', { maximumFractionDigits: 0 });
}

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link href={`/listing/${listing.id}`} className="block group">
      <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors h-full">
        <div className="aspect-video bg-secondary relative overflow-hidden">
          {listing.imageUrl ? (
            <img
              src={listing.imageUrl}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-muted-foreground">
              📦
            </div>
          )}
        </div>
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {listing.title}
          </h3>
          <p className="text-xl font-bold text-primary">{formatPrice(listing.price)}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              {CATEGORY_LABELS[listing.category] ?? listing.category}
            </Badge>
            <span className="text-xs text-muted-foreground truncate">{listing.location}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ListingCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-6 w-1/3" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-28" />
        </div>
      </div>
    </div>
  );
}
