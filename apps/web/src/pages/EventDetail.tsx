import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { authGet } from '@/lib/api';
import { formatPrice } from '@/components/ListingCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { usePageTitle } from '@/hooks/usePageTitle';
import { SEOHead } from '@/components/SEOHead';

type HushEvent = {
  id: string;
  organizerId: string;
  title: string;
  description: string | null;
  flyerUrl: string | null;
  bankName: string;
  accountNumber: string;
  accountName: string;
  ticketPrice: number;
  eventDate: string;
  location: string;
  status: 'pending' | 'approved';
  capacity: number;
  soldTickets: number;
};

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const [event, setEvent] = useState<HushEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  usePageTitle(event ? event.title : 'Event');


  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    authGet<{ data: HushEvent }>(`/hush/events/${id}`)
      .then((r) => setEvent(r.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="w-full aspect-video rounded-xl" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-muted-foreground">
        <p className="text-5xl mb-4">🕳️</p>
        <p className="font-medium text-lg">This event doesn't exist</p>
        <Link href="/hush"><Button variant="outline" className="mt-4">Browse Events</Button></Link>
      </div>
    );
  }

  const isOrganizer = user?.id === event.organizerId;
  const spotsLeft = event.capacity - event.soldTickets;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <SEOHead title={event.title} description={event.description ?? undefined} image={event.flyerUrl ?? undefined} />
      {isOrganizer && event.status === 'pending' && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3 flex items-center gap-2">
          <span>⏳</span>
          <span className="text-yellow-400 text-sm font-medium">
            Under Review — your event is awaiting admin approval before it goes public.
          </span>
        </div>
      )}

      <div className="w-full rounded-xl overflow-hidden bg-secondary">
        {event.flyerUrl
          ? <img src={event.flyerUrl} alt={event.title} className="w-full max-h-96 object-cover" />
          : <div className="w-full aspect-video flex items-center justify-center text-6xl">🎵</div>
        }
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary">
            {new Date(event.eventDate).toLocaleDateString('en-NG', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}
          </Badge>
          <Badge variant="secondary">
            {new Date(event.eventDate).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
          </Badge>
          <Badge variant="secondary">{event.location}</Badge>
          {spotsLeft > 0
            ? <Badge variant="secondary">{spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left</Badge>
            : <Badge className="bg-destructive/10 text-destructive">Sold Out</Badge>
          }
        </div>

        <h1 className="text-3xl font-bold">{event.title}</h1>
        <p className="text-3xl font-bold text-accent">{formatPrice(event.ticketPrice)}</p>

        {event.description && (
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{event.description}</p>
        )}
      </div>

      {event.status === 'approved' && spotsLeft > 0 && (
        <Button size="lg" className="w-full sm:w-auto text-base px-8" onClick={() => navigate(`/hush/event/${event.id}/buy`)}>
          Buy Ticket
        </Button>
      )}
      {event.status === 'approved' && spotsLeft === 0 && (
        <Button size="lg" disabled className="w-full sm:w-auto">Sold Out</Button>
      )}
    </div>
  );
}