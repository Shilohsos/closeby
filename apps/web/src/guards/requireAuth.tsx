import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';

export function requireAuth(Component: React.ComponentType, allowedRoles?: string[]) {
  return function Guarded(props: Record<string, unknown>) {
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
