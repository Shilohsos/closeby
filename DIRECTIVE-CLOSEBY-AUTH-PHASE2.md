# DIRECTIVE-CLOSEBY-AUTH-PHASE2

**IMPORTANT: Merge main into your branch first.** Then start a feature branch called `auth-supabase`.

**Schema is LIVE on Supabase.** I ran your SQL against the production database. All 5 tables exist.

**DATABASE_URL:**
`postgresql://postgres:9n04cFgivj40UpxG@db.xtyjnidszeovtjkdazzf.supabase.co:5432/postgres`

This goes in `apps/api/.env`. Do NOT commit it.

## Goal

Implement full Supabase Auth — frontend AuthProvider + auth pages, backend JWT verification + role middleware. After this phase, users can sign up, sign in, and protected routes actually work.

---

## 1. AuthProvider — `apps/web/src/providers/AuthProvider.tsx`

Wrap the app at `main.tsx` level. Expose a `useAuth()` hook:

```ts
type AuthContext = {
  user: User | null;
  profile: { id: string; email: string; role: 'buyer' | 'seller' | 'organizer' } | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};
```

- On mount: call `supabase.auth.getSession()` and subscribe to `onAuthStateChange`
- Parse `user_metadata.role` from session — this is where the role lives permanently
- Store resolved user + profile in state
- Export `AuthProvider` component and `useAuth` hook

Create `apps/web/src/hooks/useAuth.ts` that re-exports from the provider.

## 2. Sign Up page — `apps/web/src/pages/SignUp.tsx`

Form fields:
- Email (text input)
- Password (password input, min 8 chars)
- Role selector — **shown only on signup, never again** (immutable):
  - Buyer (default)
  - Seller
  - Organizer
- "Continue with Google" button

On submit:
```ts
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: { data: { role } },
});
```
On success → redirect to `/` (buyers) or `/profile` (sellers/organizers).

Zod client-side validation for email format and password length.

## 3. Sign In page — `apps/web/src/pages/SignIn.tsx`

Form fields:
- Email
- Password
- "Forgot password?" link → `/reset-password`
- "Continue with Google" button
- Link to "/signup" for new users

On submit: `supabase.auth.signInWithPassword({ email, password })`

On success → redirect to `/` or `/profile` based on role.

## 4. Google OAuth — Supabase dashboard config needed

**Tell Wizard to:**
1. Go to Supabase Dashboard → Authentication → Providers → Google
2. Enable it
3. Set Client ID and Client Secret from Google Cloud Console

Until then, the Google button shows an alert: "Google sign-in coming soon" or gracefully handles the error.

On the frontend, implement:
```ts
const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
  if (error) throw error;
};
```

## 5. Password Reset — `apps/web/src/pages/ResetPassword.tsx`

Two states:
1. **Email form** — user enters email, calls `supabase.auth.resetPasswordForEmail(email)`, shows success message
2. **Update password** — reads token from URL hash (`#access_token=...`), calls `supabase.auth.updateUser({ password })`. Confirmation form with new password + confirm password.

Supabase sends the reset email automatically — no custom SMTP needed for this.

## 6. Route guard — `apps/web/src/guards/requireAuth.tsx`

Rewrite this to actually use the AuthProvider:
```tsx
export function requireAuth(Component: React.ComponentType, allowedRoles?: string[]) {
  return function Guarded(props: Record<string, unknown>) {
    const { user, loading } = useAuth();
    const [, setLocation] = useLocation();

    useEffect(() => {
      if (!loading && !user) setLocation('/signin');
      if (!loading && user && allowedRoles && !allowedRoles.includes(user.role))
        setLocation('/'); // or show 403
    }, [user, loading]);

    if (loading) return <div>Loading...</div>;
    if (!user) return null;
    return <Component {...props} />;
  };
}
```

## 7. Navbar update — `apps/web/src/components/Navbar.tsx`

Add conditional rendering based on auth state:
- **Signed out**: Browse, Hush, Sign In
- **Signed in (buyer)**: Browse, Hush, Profile
- **Signed in (seller)**: Browse, Hush, Post Listing, Profile
- **Signed in (organizer)**: Browse, Hush, Post Event, Profile

Use `useAuth()` hook to get user state.

## 8. API — JWT verification middleware — `apps/api/src/middleware/auth.ts`

Rewrite the existing placeholder to actually verify Supabase JWTs:

```ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // this is the key — not the anon key
);

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError(401, 'Missing or invalid authorization header');
  }

  const { data: { user }, error } = await supabase.auth.getUser(authHeader.slice(7));

  if (error || !user) {
    throw new AppError(401, 'Invalid or expired token');
  }

  req.user = {
    id: user.id,
    email: user.email!,
    role: user.user_metadata?.role || 'buyer',
  };

  next();
}
```

**The user needs `SUPABASE_SERVICE_ROLE_KEY`** — ask Wizard (the Hermes agent) for it. Tell him to check Supabase Dashboard → Project Settings → API → `service_role` key. Do not attempt to guess it.

## 9. API — requireRole middleware — keep existing `apps/api/src/middleware/auth.ts`

The `requireRole` function already exists. Make sure it's properly exported and usable:
```ts
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) throw new AppError(401, 'Not authenticated');
    if (!roles.includes(req.user.role)) throw new AppError(403, 'Insufficient permissions');
    next();
  };
}
```

## 10. Apply guards to routes — `apps/web/src/App.tsx`

Wrap protected routes with `requireAuth`:

```tsx
<Route path="/create" component={requireAuth(CreateListing, ['seller'])} />
<Route path="/profile" component={requireAuth(Profile)} />
<Route path="/hush/post" component={requireAuth(PostEvent, ['organizer'])} />
```

## 11. Store Supabase session in localStorage

Configure the Supabase client to persist sessions:
```ts
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
  },
});
```

## 12. .env files

**apps/web/.env** (already has values):
```
VITE_SUPABASE_URL=https://xtyjnidszeovtjkdazzf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0eWpuaWRzemVvdnRqa2RhenpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MDUwNzIsImV4cCI6MjA5NDE4MTA3Mn0.z5JDkBYX2QADIKyvwxdyH8XBXOpsNG9qENeMyrfvRPw
```

**apps/api/.env** (Wizard will fill — do NOT commit):
```
SUPABASE_URL=https://xtyjnidszeovtjkdazzf.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<ask Wizard for this>
DATABASE_URL=postgresql://postgres:9n04cFgivj40UpxG@db.xtyjnidszeovtjkdazzf.supabase.co:5432/postgres
```

## Do NOT

- Do NOT implement actual listing/event pages yet — just get auth working
- Do NOT create a "change role" endpoint or UI — role immutability is a business rule
- Do NOT merge to main until Wizard has provided the SUPABASE_SERVICE_ROLE_KEY
- Do NOT hardcode the service role key anywhere — it goes in .env only
