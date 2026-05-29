import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Menu, X, Home, Search, Zap, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useStorefront } from '@/hooks/useStorefront';
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

function MobileSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, profile, signOut } = useAuth();
  const [, navigate] = useLocation();
  const role = profile?.role;

  function go(path: string) {
    navigate(path);
    onClose();
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <DialogPrimitive.Content className="fixed left-0 top-0 z-50 h-full w-72 bg-gray-950 border-r border-gray-800 p-6 flex flex-col gap-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left duration-200">
          <DialogPrimitive.Title className="sr-only">Navigation menu</DialogPrimitive.Title>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-primary">Close By</span>
            <DialogPrimitive.Close className="text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </DialogPrimitive.Close>
          </div>

          <nav className="flex flex-col gap-1">
            <button onClick={() => go('/')} className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-colors text-left">
              <Home className="w-5 h-5" /> Home
            </button>
            <button onClick={() => go('/browse')} className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-colors text-left">
              <Search className="w-5 h-5" /> Browse
            </button>
            <button onClick={() => go('/hush')} className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-colors text-left">
              <Zap className="w-5 h-5" /> Hush
            </button>
            {user && (
              <button onClick={() => go('/profile')} className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-colors text-left">
                <User className="w-5 h-5" /> Profile
              </button>
            )}
          </nav>

          <div className="flex flex-col gap-2 mt-auto">
            {!user && (
              <>
                <button onClick={() => go('/signin')} className="w-full py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-gray-800 transition-colors">Sign In</button>
                <button onClick={() => go('/signup')} className="w-full py-2.5 rounded-lg bg-primary hover:bg-green-700 text-white text-sm font-medium transition-colors">Sign Up</button>
              </>
            )}
            {user && role === 'seller' && (
              <button onClick={() => go('/create')} className="w-full py-2.5 rounded-lg bg-primary hover:bg-green-700 text-white text-sm font-medium transition-colors">Post Listing</button>
            )}
            {user && role === 'organizer' && (
              <button onClick={() => go('/hush/post')} className="w-full py-2.5 rounded-lg bg-primary hover:bg-green-700 text-white text-sm font-medium transition-colors">Post Event</button>
            )}
            {user && (
              <button onClick={() => { signOut(); onClose(); }} className="w-full py-2.5 rounded-lg border border-destructive/50 text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors">Sign Out</button>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const [, navigate] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const role = profile?.role;
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: sfData } = useStorefront(user?.id ?? '');
  const avatarUrl = sfData?.data?.avatarUrl;

  function closeMobile() {
    setMobileOpen(false);
  }

  const navLinks = (
    <>
      <Link href="/browse" onClick={closeMobile} className={`hover:text-accent transition ${location === '/browse' ? 'text-accent' : ''}`}>Browse</Link>
      <Link href="/hush" onClick={closeMobile} className={`hover:text-accent transition ${location.startsWith('/hush') ? 'text-accent' : ''}`}>Hush</Link>
      {!user && (
        <Link href="/signin" onClick={closeMobile} className="hover:text-accent transition">Sign In</Link>
      )}
      {user && role === 'seller' && (
        <Link href="/create" onClick={closeMobile} className="bg-primary hover:bg-green-700 px-4 py-2 rounded-lg transition text-white font-medium text-sm">
          Post Listing
        </Link>
      )}
      {user && role === 'organizer' && (
        <Link href="/hush/post" onClick={closeMobile} className="bg-primary hover:bg-green-700 px-4 py-2 rounded-lg transition text-white font-medium text-sm">
          Post Event
        </Link>
      )}
    </>
  );

  return (
    <>
      <MobileSheet open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <nav className="fixed top-0 left-0 right-0 z-40 bg-gray-950/90 backdrop-blur border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-800 transition-colors text-gray-300"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link href="/" className="text-xl font-bold text-primary">
              Close By
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-300">
            <Link href="/browse" className="hover:text-accent transition">Browse</Link>
            <Link href="/hush" className="hover:text-accent transition">Hush</Link>

            {!user && (
              <Link href="/signin" className="hover:text-accent transition">Sign In</Link>
            )}

            {user && role === 'seller' && (
              <Link href="/create" className="bg-primary hover:bg-green-700 px-4 py-2 rounded-lg transition text-white font-medium">
                Post Listing
              </Link>
            )}

            {user && role === 'organizer' && (
              <Link href="/hush/post" className="bg-primary hover:bg-green-700 px-4 py-2 rounded-lg transition text-white font-medium">
                Post Event
              </Link>
            )}

            {user && (
              <DropdownMenu
                align="right"
                trigger={
                  <div className="w-9 h-9 rounded-full bg-secondary border border-border overflow-hidden flex items-center justify-center text-base hover:ring-2 hover:ring-primary transition-all">
                    {avatarUrl
                      ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                      : <span className="text-muted-foreground select-none">
                          {profile?.email?.[0]?.toUpperCase() ?? '👤'}
                        </span>
                    }
                  </div>
                }
              >
                <div className="px-4 py-2 border-b border-border">
                  <p className="text-xs font-medium truncate text-foreground">{profile?.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">{role}</p>
                </div>
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  Profile
                </DropdownMenuItem>
                {role === 'seller' && (
                  <DropdownMenuItem onClick={() => navigate(`/store/${user.id}`)}>
                    My Storefront
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive hover:text-destructive"
                  onClick={() => signOut()}
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile right side — avatar or sign in */}
          <div className="flex md:hidden items-center gap-2">
            {!user && (
              <Link href="/signin" className="text-sm text-gray-300 hover:text-white px-3 py-2">Sign In</Link>
            )}
            {user && (
              <button onClick={() => navigate('/profile')} className="w-9 h-9 rounded-full bg-secondary border border-border overflow-hidden flex items-center justify-center">
                {avatarUrl
                  ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                  : <span className="text-muted-foreground text-sm select-none">
                      {profile?.email?.[0]?.toUpperCase() ?? '👤'}
                    </span>
                }
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-gray-950/95 backdrop-blur border-t border-gray-800 flex">
        <Link href="/" className="flex-1 flex flex-col items-center justify-center py-3 gap-1 text-gray-400 hover:text-primary transition-colors min-h-[56px]">
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link href="/browse" className="flex-1 flex flex-col items-center justify-center py-3 gap-1 text-gray-400 hover:text-primary transition-colors min-h-[56px]">
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-medium">Browse</span>
        </Link>
        <Link href="/hush" className="flex-1 flex flex-col items-center justify-center py-3 gap-1 text-gray-400 hover:text-primary transition-colors min-h-[56px]">
          <Zap className="w-5 h-5" />
          <span className="text-[10px] font-medium">Hush</span>
        </Link>
        <Link href={user ? '/profile' : '/signin'} className="flex-1 flex flex-col items-center justify-center py-3 gap-1 text-gray-400 hover:text-primary transition-colors min-h-[56px]">
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium">{user ? 'Profile' : 'Sign In'}</span>
        </Link>
      </div>
    </>
  );
}
