import { useParams, Link } from 'wouter';
import { useListing } from '@/hooks/useListings';
import { formatPrice, CATEGORY_LABELS } from '@/components/ListingCard';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePageTitle } from '@/hooks/usePageTitle';
import { SEOHead } from '@/components/SEOHead';

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useListing(id);
  const title = data?.data?.title;
  usePageTitle(title ? `Listing: ${title}` : 'Listing');

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="w-full aspect-video rounded-xl" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-muted-foreground">
        <p className="text-5xl mb-4">🕳️</p>
        <p className="font-medium text-lg">This listing doesn't exist</p>
        <Link href="/browse"><Button variant="outline" className="mt-4">Back to Browse</Button></Link>
      </div>
    );
  }

  const listing = data.data;
  const seller = listing.seller;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <SEOHead title={`Listing: ${listing.title}`} description={listing.description ?? undefined} image={listing.imageUrl ?? undefined} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-video bg-secondary rounded-xl overflow-hidden">
            {listing.imageUrl
              ? <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-6xl text-muted-foreground">📦</div>
            }
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary">{CATEGORY_LABELS[listing.category] ?? listing.category}</Badge>
              <span className="text-sm text-muted-foreground">{listing.location}</span>
            </div>
            <h1 className="text-3xl font-bold">{listing.title}</h1>
            <p className="text-3xl font-bold text-primary">{formatPrice(listing.price)}</p>
            {listing.description && (
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{listing.description}</p>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Seller</div>
              <div className="flex items-center gap-3">
                {seller?.avatarUrl
                  ? <img src={seller.avatarUrl} alt="seller" className="w-12 h-12 rounded-full object-cover" />
                  : <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-xl">👤</div>
                }
                <div>
                  <p className="font-medium text-sm line-clamp-1">{seller?.bio || 'Close By Seller'}</p>
                  <Link href={`/store/${listing.userId}`} className="text-xs text-primary hover:underline">
                    View storefront →
                  </Link>
                </div>
              </div>
              <Button className="w-full" asChild>
                <a href={`mailto:?subject=Enquiry: ${encodeURIComponent(listing.title)}&body=Hi, I found your listing on Close By and I'm interested.`}>
                  Contact Seller
                </a>
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                All contact goes through Close By
              </p>
            </CardContent>
          </Card>
          <p className="text-xs text-muted-foreground text-center">
            Posted {new Date(listing.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </aside>
      </div>
    </div>
  );
}