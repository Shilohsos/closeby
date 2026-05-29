import { useEffect } from 'react';
import { useLocation, useSearch } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateListing, useListing, useUpdateListing } from '@/hooks/useListings';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useToast } from '@/providers/ToastProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const CATEGORIES = [
  { value: 'housing', label: 'Housing' },
  { value: 'jobs', label: 'Jobs' },
  { value: 'services', label: 'Services' },
  { value: 'food_restaurants', label: 'Food & Restaurants' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'events', label: 'Events' },
] as const;

const LOCATIONS = [
  'University of Lagos', 'Obafemi Awolowo University', 'University of Nigeria Nsukka',
  'University of Ibadan', 'University of Benin', 'Ahmadu Bello University',
  'University of Calabar', 'Lagos State University',
];

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  category: z.enum(['housing', 'jobs', 'services', 'food_restaurants', 'electronics', 'fashion', 'events']),
  location: z.string().min(1, 'Location is required'),
  price: z.coerce.number().min(0, 'Price must be 0 or more'),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

export default function CreateListing() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const editId = new URLSearchParams(search).get('edit');
  const isEdit = !!editId;
  usePageTitle(isEdit ? 'Edit Listing' : 'Post a Listing');

  const { toast } = useToast();
  const { data: existingData, isLoading: editLoading } = useListing(editId ?? '');
  const createMutation = useCreateListing();
  const updateMutation = useUpdateListing(editId ?? '');

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '', category: 'electronics', location: '', price: 0, imageUrl: '' },
  });

  useEffect(() => {
    if (existingData?.data && isEdit) {
      const l = existingData.data;
      form.reset({
        title: l.title,
        description: l.description ?? '',
        category: l.category as FormValues['category'],
        location: l.location,
        price: l.price / 100,
        imageUrl: l.imageUrl ?? '',
      });
    }
  }, [existingData, isEdit]);

  async function onSubmit(values: FormValues) {
    const payload = { ...values, price: Math.round(values.price * 100), imageUrl: values.imageUrl || null };
    if (isEdit) {
      const res = await updateMutation.mutateAsync(payload);
      toast({ title: 'Listing updated!', variant: 'success' });
      setLocation(`/listing/${res.data.id}`);
    } else {
      const res = await createMutation.mutateAsync(payload);
      toast({ title: 'Listing posted!', variant: 'success' });
      setLocation(`/listing/${res.data.id}`);
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  if (isEdit && editLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader><Skeleton className="h-7 w-40" /></CardHeader>
          <CardContent className="space-y-5">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Card>
        <CardHeader><CardTitle>{isEdit ? 'Edit Listing' : 'Create Listing'}</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="What are you selling?" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Description <span className="text-muted-foreground">(optional)</span></FormLabel><FormControl><Textarea placeholder="Describe your item…" rows={4} {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem><FormLabel>Category</FormLabel><FormControl>
                    <select {...field} className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring h-10">
                      {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem><FormLabel>Location</FormLabel><FormControl>
                    <select {...field} className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring h-10">
                      <option value="">Select university</option>
                      {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem><FormLabel>Price (₦)</FormLabel><FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
                    <Input type="number" min={0} step={100} placeholder="0" className="pl-7" {...field} />
                  </div>
                </FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="imageUrl" render={({ field }) => (
                <FormItem><FormLabel>Image URL <span className="text-muted-foreground">(optional)</span></FormLabel><FormControl><Input type="url" placeholder="https://…" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              {error && <p className="text-sm text-destructive">{(error as Error).message}</p>}
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (isEdit ? 'Saving…' : 'Posting…') : (isEdit ? 'Save Changes' : 'Post Listing')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
