import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function requireAuth(Component: React.ComponentType<any>, allowedRoles?: string[]) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function Guarded(props: any) {
    const { user, profile, loading } = useAuth();
    const [, setLocation] = useLocation();

    useEffect(() => {
      if (loading) return;
      if (!user) {
        setLocation('/signin');
        return;
      }
      if (allowedRoles && !allowedRoles.includes(profile?.role ?? 'buyer')) {
        setLocation('/');
      }
    }, [user, profile, loading, setLocation]);

    if (loading) {
      return (
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="text-muted-foreground text-sm">Loading…</div>
        </div>
      );
    }

    if (!user) return null;
    if (allowedRoles && !allowedRoles.includes(profile?.role ?? 'buyer')) return null;

    return <Component {...props} />;
  };
}
