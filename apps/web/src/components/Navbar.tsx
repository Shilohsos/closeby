import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useStorefront } from '@/hooks/useStorefront';
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const [location, navigate] = useLocation();
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/90 backdrop-blur border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-primary flex-shrink-0">
          Close By
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-300">
          {navLinks}
          {user && (
            <DropdownMenu
              align="right"
              trigger={
                <div className="w-9 h-9 rounded-full bg-secondary border border-border overflow-hidden flex items-center justify-center text-base hover:ring-2 hover:ring-primary transition-all cursor-pointer">
                  {avatarUrl
                    ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                    : <span className="text-muted-foreground select-none">{profile?.email?.[0]?.toUpperCase() ?? '👤'}</span>
                  }
                </div>
              }
            >
              <div className="px-4 py-2 border-b border-border">
                <p className="text-xs font-medium truncate text-foreground">{profile?.email}</p>
                <p className="text-xs text-muted-foreground capitalize">{role}</p>
              </div>
              <DropdownMenuItem onClick={() => navigate('/profile')}>Profile</DropdownMenuItem>
              {role === 'seller' && (
                <DropdownMenuItem onClick={() => navigate(`/store/${user.id}`)}>My Storefront</DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive hover:text-destructive" onClick={() => signOut()}>
                Sign Out
              </DropdownMenuItem>
            </DropdownMenu>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-gray-300 hover:text-white transition"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile dropdown panel */}
      {mobileOpen && (
        <div className="md:hidden bg-gray-950 border-b border-gray-800 px-4 py-4 flex flex-col gap-4 text-sm text-gray-300">
          {navLinks}
          {user && (
            <>
              <div className="border-t border-gray-800 pt-3 space-y-3">
                <div className="text-xs text-muted-foreground">{profile?.email}</div>
                <Link href="/profile" onClick={closeMobile} className="block hover:text-accent transition">Profile</Link>
                {role === 'seller' && (
                  <Link href={`/store/${user.id}`} onClick={closeMobile} className="block hover:text-accent transition">My Storefront</Link>
                )}
                <button onClick={() => { signOut(); closeMobile(); }} className="block text-destructive text-sm hover:text-destructive/80 transition">
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
