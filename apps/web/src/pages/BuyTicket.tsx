import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { authGet, authPost } from '@/lib/api';
import { formatPrice } from '@/components/ListingCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useToast } from '@/providers/ToastProvider';

type HushEvent = {
  id: string;
  title: string;
  eventDate: string;
  location: string;
  ticketPrice: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  capacity: number;
  soldTickets: number;
};

export default function BuyTicket() {
  usePageTitle('Buy Ticket');
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [event, setEvent] = useState<HushEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    authGet<{ data: HushEvent }>(`/hush/events/${id}`)
      .then((r) => {
        setEvent(r.data);
        setBuyerName(profile?.email?.split('@')[0] ?? '');
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (profile?.email && !buyerName) {
      setBuyerName(profile.email.split('@')[0]);
    }
  }, [profile]);

  async function handleConfirm() {
    if (!event || !buyerName.trim()) return;
    setError(null);
    setSubmitting(true);
    try {
      const { referenceCode } = await authPost<{ referenceCode: string }>('/hush/tickets', {
        eventId: event.id,
        buyerName: buyerName.trim(),
      });
      toast({ title: 'Ticket issued!', description: 'Your ticket is ready.', variant: 'success' });
      navigate(`/hush/ticket/${referenceCode}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center text-muted-foreground">
        <p className="text-5xl mb-4">🕳️</p>
        <p className="font-medium">This event doesn't exist</p>
        <Link href="/hush"><Button variant="outline" className="mt-4">Browse Events</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{event.title}</h1>
        <p className="text-muted-foreground mt-1">
          {new Date(event.eventDate).toLocaleDateString('en-NG', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
          })} · {event.location}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Payment Instructions
          </div>
          <p className="text-sm text-muted-foreground">
            Transfer the ticket price to the account below. Your ticket reference is issued immediately after confirmation.
          </p>
          <div className="bg-secondary rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-bold text-accent">{formatPrice(event.ticketPrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Bank</span>
              <span className="font-medium">{event.bankName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Account Number</span>
              <span className="font-mono font-medium">{event.accountNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Account Name</span>
              <span className="font-medium">{event.accountName}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Use your name as the transfer description for easy identification.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Your Name</label>
        <Input
          placeholder="Enter your full name"
          value={buyerName}
          onChange={(e) => setBuyerName(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">This name will appear on your ticket.</p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        className="w-full"
        size="lg"
        disabled={submitting || !buyerName.trim()}
        onClick={handleConfirm}
      >
        {submitting ? 'Issuing Ticket…' : 'Confirm & Get Ticket'}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        By confirming, you acknowledge you have made the transfer. Tickets are non-refundable.
      </p>
    </div>
  );
}