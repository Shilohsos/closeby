import { useParams, Link } from 'wouter';
import { useStorefront } from '@/hooks/useStorefront';
import { ListingCard, ListingCardSkeleton } from '@/components/ListingCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function Storefront() {
  usePageTitle('Storefront');
  const { userId } = useParams<{ userId: string }>();
  const { data, isLoading, isError } = useStorefront(userId);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton className="w-20 h-20 rounded-full" />
          <div className="space-y-2"><Skeleton className="h-6 w-40" /><Skeleton className="h-4 w-64" /></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => <ListingCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-muted-foreground">
        <p className="text-5xl mb-4">🕳️</p>
        <p className="font-medium">This seller doesn't exist</p>
        <Link href="/browse"><Button variant="outline" className="mt-4">Browse Listings</Button></Link>
      </div>
    );
  }

  const storefront = data?.data;
  const sellerListings = data?.listings ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-start gap-6">
        {storefront?.avatarUrl
          ? <img src={storefront.avatarUrl} alt="seller" className="w-20 h-20 rounded-full object-cover flex-shrink-0" />
          : <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center text-3xl flex-shrink-0">👤</div>
        }
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{storefront?.bio ? storefront.bio.split('\n')[0] : 'Campus Seller'}</h1>
          {storefront?.bio && <p className="text-muted-foreground mt-1 whitespace-pre-wrap">{storefront.bio}</p>}
          {!storefront?.bio && <p className="text-muted-foreground mt-1">No bio yet.</p>}
          {storefront?.socialLinks && storefront.socialLinks.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {(storefront.socialLinks as string[]).map((link, i) => (
                <span key={i} className="text-xs bg-secondary px-2 py-1 rounded-full text-muted-foreground">{link}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">
          Listings <span className="text-muted-foreground font-normal text-base">({sellerListings.length})</span>
        </h2>
        {sellerListings.length === 0 ? (
          <p className="text-center py-12 text-muted-foreground">No listings yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sellerListings.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}
      </div>
    </div>
  );
}
