// Route guard: require auth + optional role
// Usage: requireAuth(Component, ['seller'])
// Returns a component that redirects to /signin if not authenticated

import { useEffect } from 'react';
import { useLocation } from 'wouter';

export function requireAuth(Component: React.ComponentType, allowedRoles?: string[]) {
  return function Guarded(props: Record<string, unknown>) {
    const [, setLocation] = useLocation();
    const user = null; // TODO: get from AuthProvider

    useEffect(() => {
      if (!user) {
        setLocation('/signin');
      }
    }, [user, setLocation]);

    if (!user) return null;
    return <Component {...props} />;
  };
}
