import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useStorefront } from '@/hooks/useStorefront';
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const [, navigate] = useLocation();
  const role = profile?.role;

  const { data: sfData } = useStorefront(user?.id ?? '');
  const avatarUrl = sfData?.data?.avatarUrl;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/90 backdrop-blur border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-primary">
          Close By
        </Link>

        <div className="flex items-center gap-6 text-sm text-gray-300">
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
      </div>
    </nav>
  );
}
