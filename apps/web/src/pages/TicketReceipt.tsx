import { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import QRCode from 'qrcode';
import { get } from '@/lib/api';
import { formatPrice } from '@/components/ListingCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { usePageTitle } from '@/hooks/usePageTitle';
import { SEOHead } from '@/components/SEOHead';

type TicketData = {
  ticket: {
    id: string;
    buyerName: string;
    referenceCode: string;
    createdAt: string;
  };
  event: {
    id: string;
    title: string;
    eventDate: string;
    location: string;
    ticketPrice: number;
    flyerUrl: string | null;
  };
};

export default function TicketReceipt() {
  usePageTitle('Ticket Receipt');
  const { referenceCode } = useParams<{ referenceCode: string }>();
  const [data, setData] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    get<{ data: TicketData }>(`/hush/tickets/${referenceCode}`)
      .then((r) => {
        setData(r.data);
        return QRCode.toDataURL(r.data.ticket.referenceCode, { width: 200, margin: 2 });
      })
      .then((url) => setQrDataUrl(url))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [referenceCode]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-48 w-48 mx-auto rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-4 w-1/2 mx-auto" />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center text-muted-foreground">
        <p className="text-5xl mb-4">🕳️</p>
        <p className="font-medium">Ticket not found</p>
        <Link href="/hush"><Button variant="outline" className="mt-4">Browse Events</Button></Link>
      </div>
    );
  }

  const { ticket, event } = data;

  return (
    <>
      <SEOHead title="Ticket Receipt" description={`Ticket for ${event.title}`} image={event.flyerUrl ?? undefined} />
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .no-print { display: none !important; }
          .ticket-card { border: 2px solid #000 !important; box-shadow: none !important; background: white !important; }
        }
      `}</style>

      <div className="max-w-md mx-auto px-4 py-8 space-y-6">
        <div className="no-print text-center">
          <div className="text-3xl mb-2">🎟️</div>
          <h1 className="text-2xl font-bold">Your Ticket</h1>
          <p className="text-muted-foreground text-sm mt-1">Screenshot or print this page to save your ticket.</p>
        </div>

        <div className="ticket-card bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
          {event.flyerUrl && (
            <div className="h-32 overflow-hidden">
              <img src={event.flyerUrl} alt={event.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="p-6 space-y-4">
            <div>
              <h2 className="text-xl font-bold">{event.title}</h2>
              <p className="text-muted-foreground text-sm mt-1">
                {new Date(event.eventDate).toLocaleDateString('en-NG', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
              <p className="text-muted-foreground text-sm">
                {new Date(event.eventDate).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-muted-foreground text-sm">{event.location}</p>
            </div>

            <div className="border-t border-dashed border-border pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ticket holder</span>
                <span className="font-medium">{ticket.buyerName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Price</span>
                <span className="font-medium">{formatPrice(event.ticketPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Issued</span>
                <span className="font-medium">
                  {new Date(ticket.createdAt).toLocaleDateString('en-NG')}
                </span>
              </div>
            </div>

            <div className="border-t border-dashed border-border pt-4 flex flex-col items-center gap-3">
              {qrDataUrl && (
                <img src={qrDataUrl} alt="QR Code" className="w-36 h-36 rounded-lg" />
              )}
              <div className="text-center">
                <p className="font-mono text-2xl font-bold tracking-widest text-primary">
                  {ticket.referenceCode}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Reference Code — show at the gate</p>
              </div>
            </div>
          </div>
        </div>

        <div className="no-print flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => window.print()}>
            Print Ticket
          </Button>
          <Link href="/hush" className="flex-1">
            <Button variant="ghost" className="w-full">Browse More Events</Button>
          </Link>
        </div>
      </div>
    </>
  );
}
