import { useState, useEffect } from 'react';
import { useSearch, useLocation } from 'wouter';
import { useListings } from '@/hooks/useListings';
import { useDebounce } from '@/hooks/useDebounce';
import { ListingCard, ListingCardSkeleton, CATEGORY_LABELS } from '@/components/ListingCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { usePageTitle } from '@/hooks/usePageTitle';

const LOCATIONS = [
  'University of Lagos',
  'Obafemi Awolowo University',
  'University of Nigeria Nsukka',
  'University of Ibadan',
  'University of Benin',
  'Ahmadu Bello University',
  'University of Calabar',
  'Lagos State University',
];

export default function Browse() {
  usePageTitle('Browse Listings');
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);

  const [searchInput, setSearchInput] = useState(params.get('q') || '');
  const debouncedQ = useDebounce(searchInput, 300);

  const category = params.get('category') || '';
  const loc = params.get('location') || '';
  const page = parseInt(params.get('page') || '1', 10);

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('page');
    setLocation(`/browse?${next.toString()}`, { replace: true } as never);
  }

  useEffect(() => { setParam('q', debouncedQ); }, [debouncedQ]);

  const { data, isLoading, isError, refetch } = useListings({
    q: params.get('q') || undefined,
    category: category || undefined,
    location: loc || undefined,
    page,
    limit: 12,
  });

  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 12);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Browse Listings</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="space-y-6 lg:col-span-1">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Search</label>
            <Input placeholder="What are you looking for?" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Category</label>
            <div className="space-y-1">
              <button onClick={() => setParam('category', '')} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!category ? 'bg-primary text-white' : 'hover:bg-secondary text-muted-foreground'}`}>
                All Categories
              </button>
              {Object.entries(CATEGORY_LABELS).map(([slug, label]) => (
                <button key={slug} onClick={() => setParam('category', slug)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${category === slug ? 'bg-primary text-white' : 'hover:bg-secondary text-muted-foreground'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Location</label>
            <select value={loc} onChange={(e) => setParam('location', e.target.value)} className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">All Locations</option>
              {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          {(category || loc || params.get('q')) && (
            <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={() => { setSearchInput(''); setLocation('/browse'); }}>
              Clear filters
            </Button>
          )}
        </aside>

        {/* Results */}
        <div className="lg:col-span-3 space-y-6">
          <div className="text-sm text-muted-foreground">
            {isLoading ? 'Searching…' : `${total} listing${total !== 1 ? 's' : ''} found`}
          </div>

          {isError ? (
            <div className="text-center py-16 space-y-3">
              <p className="text-muted-foreground">Something went wrong.</p>
              <Button variant="outline" onClick={() => refetch()}>Retry</Button>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <ListingCardSkeleton key={i} />)}
            </div>
          ) : !data?.data.length ? (
            <div className="text-center py-16 text-muted-foreground">
              <div className="text-5xl mb-4">🔍</div>
              <p className="font-medium">No listings found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {data.data.map((l) => <ListingCard key={l.id} listing={l} />)}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setParam('page', String(page - 1))}>Previous</Button>
              <span className="text-sm text-muted-foreground px-2">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setParam('page', String(page + 1))}>Next</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}