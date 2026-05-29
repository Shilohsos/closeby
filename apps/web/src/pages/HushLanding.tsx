import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api';
import { SEOHead } from '@/components/SEOHead';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/components/ListingCard';
import { usePageTitle } from '@/hooks/usePageTitle';
import { SEOHead } from '@/components/SEOHead';

type HushEvent = {
  id: string;
  title: string;
  flyerUrl: string | null;
  eventDate: string;
  location: string;
  ticketPrice: number;
};

export default function HushLanding() {
  usePageTitle('Hush — Campus Events');
  const { data, isLoading, isError, refetch } = useQuery<{ data: HushEvent[] }>({
    queryKey: ['hush-events'],
    queryFn: () => get('/hush/events'),
  });

  const events = data?.data ?? [];

  return (
    <>
    <SEOHead title="Hush — Campus Events" description="Campus events, parties, and experiences. Get your ticket." />
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <SEOHead title="Hush — Campus Events" description="Campus events, parties, and experiences. Get your ticket." />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center py-16">
          <h1 className="text-6xl md:text-7xl font-extrabold mb-4 tracking-tight">
            <span className="text-accent">Hush</span>
          </h1>
          <p className="text-gray-400 text-xl">Campus events, parties, and experiences. Get your ticket.</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-video w-full rounded-xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-16 space-y-3">
            <p className="text-muted-foreground">Failed to load events.</p>
            <Button variant="outline" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <div className="text-5xl mb-4">🎵</div>
            <p className="font-medium text-lg">No upcoming events yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Link key={event.id} href={`/hush/event/${event.id}`}>
                <div className="bg-card rounded-xl overflow-hidden border border-border hover:border-accent/50 transition-all hover:shadow-lg hover:shadow-accent/5 cursor-pointer group">
                  <div className="aspect-video bg-secondary overflow-hidden">
                    {event.flyerUrl
                      ? <img src={event.flyerUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <div className="w-full h-full flex items-center justify-center text-5xl">🎵</div>
                    }
                  </div>
                  <div className="p-4 space-y-1">
                    <h3 className="font-bold text-lg line-clamp-1">{event.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.eventDate).toLocaleDateString('en-NG', {
                        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">{event.location}</p>
                    <p className="text-accent font-bold text-base">{formatPrice(event.ticketPrice)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
