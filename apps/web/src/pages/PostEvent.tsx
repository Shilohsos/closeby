import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { authPost } from '@/lib/api';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useToast } from '@/providers/ToastProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const schema = z.object({
  title: z.string().min(3, 'Event name must be at least 3 characters').max(200),
  description: z.string().optional(),
  eventDate: z.string().min(1, 'Date is required'),
  location: z.string().min(1, 'Venue is required'),
  capacity: z.coerce.number().int().positive('Capacity must be a positive number'),
  ticketPrice: z.coerce.number().positive('Price must be greater than 0'),
  bankName: z.string().min(1, 'Bank name is required'),
  accountNumber: z.string().min(1, 'Account number is required'),
  accountName: z.string().min(1, 'Account name is required'),
  flyerUrl: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  paymentProofUrl: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
});

type FormValues = z.infer<typeof schema>;

export default function PostEvent() {
  usePageTitle('Post an Event');
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '', description: '', eventDate: '', location: '',
      capacity: undefined, ticketPrice: undefined,
      bankName: '', accountNumber: '', accountName: '',
      flyerUrl: '', paymentProofUrl: '',
    },
  });

  const createEvent = useMutation({
    mutationFn: (values: FormValues) =>
      authPost('/hush/events', {
        ...values,
        ticketPrice: Math.round(values.ticketPrice * 100),
        eventDate: new Date(values.eventDate).toISOString(),
        flyerUrl: values.flyerUrl || undefined,
        paymentProofUrl: values.paymentProofUrl || undefined,
      }),
    onSuccess: () => {
      toast({ title: 'Event submitted for review!', variant: 'success' });
      navigate('/hush');
    },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Post an Event</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3 mb-6">
            <p className="text-yellow-400 text-sm">
              <strong>Listing fee: ₦10,000.</strong> Transfer to Fidelity Bank account{' '}
              <strong className="font-mono">6312425396</strong> (Hush) and upload proof of payment below.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => createEvent.mutate(v))} className="space-y-5">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>Event Name</FormLabel><FormControl>
                  <Input placeholder="e.g. Nite of a Thousand Laughs" {...field} />
                </FormControl><FormMessage /></FormItem>
              )} />

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Description <span className="text-muted-foreground">(optional)</span></FormLabel><FormControl>
                  <Textarea placeholder="What's the vibe? Lineup, dress code, special guests…" rows={4} {...field} />
                </FormControl><FormMessage /></FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="eventDate" render={({ field }) => (
                  <FormItem><FormLabel>Date & Time</FormLabel><FormControl>
                    <Input type="datetime-local" {...field} className="text-foreground" />
                  </FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="capacity" render={({ field }) => (
                  <FormItem><FormLabel>Capacity</FormLabel><FormControl>
                    <Input type="number" min={1} placeholder="200" {...field} />
                  </FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem><FormLabel>Venue</FormLabel><FormControl>
                    <Input placeholder="e.g. Faculty of Arts Hall" {...field} />
                  </FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="ticketPrice" render={({ field }) => (
                  <FormItem><FormLabel>Ticket Price (₦)</FormLabel><FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
                      <Input type="number" min={1} step={100} placeholder="2000" className="pl-7" {...field} />
                    </div>
                  </FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <div className="border border-border rounded-lg p-4 space-y-4">
                <p className="text-sm font-medium text-muted-foreground">Your Bank Details (buyers will transfer to this account)</p>
                <FormField control={form.control} name="bankName" render={({ field }) => (
                  <FormItem><FormLabel>Bank Name</FormLabel><FormControl>
                    <Input placeholder="e.g. GTBank" {...field} />
                  </FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="accountNumber" render={({ field }) => (
                    <FormItem><FormLabel>Account Number</FormLabel><FormControl>
                      <Input placeholder="0123456789" {...field} />
                    </FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="accountName" render={({ field }) => (
                    <FormItem><FormLabel>Account Name</FormLabel><FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              </div>

              <FormField control={form.control} name="flyerUrl" render={({ field }) => (
                <FormItem><FormLabel>Flyer Image URL <span className="text-muted-foreground">(optional)</span></FormLabel><FormControl>
                  <Input type="url" placeholder="https://…" {...field} />
                </FormControl><FormMessage /></FormItem>
              )} />

              <FormField control={form.control} name="paymentProofUrl" render={({ field }) => (
                <FormItem><FormLabel>Payment Proof URL</FormLabel><FormControl>
                  <Input type="url" placeholder="https://… (screenshot of ₦10k transfer)" {...field} />
                </FormControl><FormMessage /></FormItem>
              )} />

              {createEvent.isError && (
                <p className="text-sm text-destructive">{(createEvent.error as Error).message}</p>
              )}

              <Button type="submit" className="w-full" disabled={createEvent.isPending}>
                {createEvent.isPending ? 'Submitting…' : 'Submit Event for Review'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
