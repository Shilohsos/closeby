import { Link } from 'wouter';
import { useListings } from '@/hooks/useListings';
import { useStats } from '@/hooks/useStats';
import { usePageTitle } from '@/hooks/usePageTitle';
import { SEOHead } from '@/components/SEOHead';
import { ListingCard, ListingCardSkeleton } from '@/components/ListingCard';
import { Button } from '@/components/ui/button';
import { usePageTitle } from '@/hooks/usePageTitle';
import { SEOHead } from '@/components/SEOHead';

const CATEGORIES = [
  { slug: 'housing', label: 'Housing', icon: '🏠' },
  { slug: 'jobs', label: 'Jobs', icon: '💼' },
  { slug: 'services', label: 'Services', icon: '⚡' },
  { slug: 'food_restaurants', label: 'Food & Restaurants', icon: '🍔' },
  { slug: 'electronics', label: 'Electronics', icon: '💻' },
  { slug: 'fashion', label: 'Fashion', icon: '👗' },
  { slug: 'events', label: 'Events', icon: '🎉' },
];

export default function Home() {
  usePageTitle('Campus Marketplace');
  const { data: featured, isLoading, isError, refetch } = useListings({ limit: 6 });
  const { data: stats, isError: statsError } = useStats();

  return (
    <div className="max-w-7xl mx-auto px-4">
      <SEOHead title="Campus Marketplace" description="Nigeria's campus marketplace — buy, sell, and connect with students near you." />
      {/* Hero */}
      <section className="text-center py-20">
        <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
          Welcome to <span className="text-primary">Close By</span>
        </h1>
        <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
          Nigeria's campus marketplace — buy, sell, and connect with students near you.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/browse">
            <Button size="lg">Browse Listings</Button>
          </Link>
          <Link href="/create">
            <Button size="lg" variant="outline">Post an Item</Button>
          </Link>
        </div>

        {statsError ? (
          <p className="text-sm text-muted-foreground mt-8">Could not load stats.</p>
        ) : stats && (
          <div className="flex gap-12 justify-center mt-12">
            {[
              { value: stats.totalListings, label: 'Listings' },
              { value: stats.activeSellers, label: 'Sellers' },
              { value: stats.supportedLocations, label: 'Universities' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-bold text-primary">{value}</div>
                <div className="text-sm text-muted-foreground mt-1">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent listings */}
        <section className="py-8 md:py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Listings</h2>
            <Link href="/browse" className="text-primary hover:underline text-sm font-medium">
              View all →
            </Link>
          </div>
        ) : isError ? (
          <div className="text-center py-16 space-y-3">
            <p className="text-muted-foreground">Could not load listings.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : !featured?.data.length ? (
          <div className="text-center py-16 text-muted-foreground">
            <div className="text-5xl mb-4">📦</div>
            <p className="font-medium">No listings yet — be the first to post!</p>
            <Link href="/create"><Button className="mt-4">Post a Listing</Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.data.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}
      </section>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <ListingCardSkeleton key={i} />)}
            </div>
          ) : isError ? (
            <div className="text-center py-12 space-y-3">
              <p className="text-muted-foreground">Could not load listings.</p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
            </div>
          ) : !featured?.data.length ? (
            <div className="text-center py-16 text-muted-foreground">
              <div className="text-5xl mb-4">📦</div>
              <p className="font-medium">No listings yet — be the first to post!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.data.map((l) => <ListingCard key={l.id} listing={l} />)}
            </div>
          )}
        </section>

        {/* Hush CTA */}
        <section className="py-8 pb-20">
          <div className="bg-gradient-to-r from-primary/20 to-accent/10 border border-primary/30 rounded-2xl p-8 md:p-10 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Host a Campus Event with <span className="text-accent">Hush</span>
            </h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Sell tickets to your event, get paid, and let Close By handle the rest.
            </p>
            <Link href="/hush">
              <Button size="lg" className="bg-accent text-gray-900 hover:bg-amber-400">
                Explore Hush →
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
