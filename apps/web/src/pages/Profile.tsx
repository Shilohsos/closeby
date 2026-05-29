import { useState } from 'react';
import { Link } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useListings, useDeleteListing } from '@/hooks/useListings';
import { useStorefront, useUpdateStorefront } from '@/hooks/useStorefront';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useToast } from '@/providers/ToastProvider';
import { formatPrice, CATEGORY_LABELS } from '@/components/ListingCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const sfSchema = z.object({
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  phone: z.string().optional(),
});
type SFValues = z.infer<typeof sfSchema>;

export default function Profile() {
  usePageTitle('My Profile');
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const userId = user?.id ?? '';

  const { data: listingsData, isLoading: listingsLoading, isError: listingsError, refetch: refetchListings } = useListings({ userId, limit: 50 });
  const { data: storefrontData, isLoading: sfLoading } = useStorefront(userId);
  const deleteMutation = useDeleteListing();
  const updateSf = useUpdateStorefront();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const form = useForm<SFValues>({
    resolver: zodResolver(sfSchema),
    values: {
      bio: storefrontData?.data?.bio ?? '',
      avatarUrl: storefrontData?.data?.avatarUrl ?? '',
      phone: storefrontData?.data?.phone ?? '',
    },
  });

  async function handleDelete(id: string) {
    if (!confirm('Delete this listing?')) return;
    setDeleteId(id);
    await deleteMutation.mutateAsync(id);
    setDeleteId(null);
    toast({ title: 'Listing deleted', variant: 'default' });
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-full bg-secondary overflow-hidden flex items-center justify-center text-2xl flex-shrink-0">
          {storefrontData?.data?.avatarUrl
            ? <img src={storefrontData.data.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            : '👤'
          }
        </div>
        <div>
          <h1 className="text-xl font-bold">{profile?.email}</h1>
          <p className="text-muted-foreground text-sm capitalize">{profile?.role}</p>
        </div>
      </div>

      <Tabs defaultValue="listings">
        <TabsList className="mb-6">
          <TabsTrigger value="listings">My Listings</TabsTrigger>
          <TabsTrigger value="storefront">Edit Storefront</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="listings">
          {listingsLoading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : listingsError ? (
            <div className="text-center py-12 space-y-3">
              <p className="text-muted-foreground">Could not load your listings.</p>
              <Button variant="outline" size="sm" onClick={() => refetchListings()}>Retry</Button>
            </div>
          ) : !listingsData?.data.length ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="mb-3">No listings yet.</p>
              <Link href="/create"><Button>Post your first listing</Button></Link>
            </div>
          ) : (
            <div className="space-y-3">
              {listingsData.data.map((l) => (
                <Card key={l.id}>
                  <CardContent className="py-4 flex items-center gap-4">
                    <div className="w-16 h-12 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                      {l.imageUrl
                        ? <img src={l.imageUrl} alt={l.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{l.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">{CATEGORY_LABELS[l.category]}</Badge>
                        <span className="text-primary font-semibold text-sm">{formatPrice(l.price)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Link href={`/create?edit=${l.id}`}><Button size="sm" variant="outline">Edit</Button></Link>
                      <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10"
                        disabled={deleteId === l.id} onClick={() => handleDelete(l.id)}>
                        {deleteId === l.id ? '…' : 'Delete'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="storefront">
          {sfLoading ? (
            <div className="space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-24 w-full" /><Skeleton className="h-10 w-full" /></div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(async (v) => {
                  await updateSf.mutateAsync({ ...v, avatarUrl: v.avatarUrl || null });
                  toast({ title: 'Storefront saved', variant: 'success' });
                })}
                className="space-y-5 max-w-lg"
              >
                <FormField control={form.control} name="avatarUrl" render={({ field }) => (
                  <FormItem><FormLabel>Avatar URL</FormLabel><FormControl><Input type="url" placeholder="https://…" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="bio" render={({ field }) => (
                  <FormItem><FormLabel>Bio</FormLabel><FormControl><Textarea placeholder="Tell buyers about yourself…" rows={4} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem><FormLabel>Phone <span className="text-muted-foreground text-xs">(contact relay only)</span></FormLabel><FormControl><Input placeholder="080XXXXXXXX" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                {updateSf.isError && <p className="text-sm text-destructive">{(updateSf.error as Error).message}</p>}
                <Button type="submit" disabled={updateSf.isPending}>{updateSf.isPending ? 'Saving…' : 'Save Storefront'}</Button>
              </form>
            </Form>
          )}
        </TabsContent>

        <TabsContent value="stats">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card><CardContent className="pt-6 text-center">
              <div className="text-4xl font-bold text-primary">{listingsData?.total ?? 0}</div>
              <div className="text-muted-foreground text-sm mt-1">Total Listings</div>
            </CardContent></Card>
            <Card><CardContent className="pt-6 text-center">
              <div className="text-4xl font-bold text-primary capitalize">{profile?.role}</div>
              <div className="text-muted-foreground text-sm mt-1">Account Type</div>
            </CardContent></Card>
            <Card><CardContent className="pt-6 text-center">
              <div className="text-4xl font-bold text-accent">{profile?.email?.split('@')[0]}</div>
              <div className="text-muted-foreground text-sm mt-1">Username</div>
            </CardContent></Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
