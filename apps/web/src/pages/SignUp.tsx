import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription,
} from '@/components/ui/form';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['buyer', 'seller', 'organizer']),
});

type FormValues = z.infer<typeof schema>;

const ROLES = [
  { value: 'buyer', label: 'Buyer', description: 'Browse and buy from campus sellers' },
  { value: 'seller', label: 'Seller', description: 'List and sell your goods & services' },
  { value: 'organizer', label: 'Organizer', description: 'Host Hush events on campus' },
] as const;

export default function SignUp() {
  usePageTitle('Sign Up');
  const { signUp, signInWithGoogle } = useAuth();
  const [, setLocation] = useLocation();
  const [serverError, setServerError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', role: 'buyer' },
  });

  async function onSubmit(values: FormValues) {
    setServerError('');
    try {
      await signUp(values.email, values.password, values.role);
      setLocation(values.role === 'buyer' ? '/' : '/profile');
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Sign up failed');
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Google sign-in failed');
      setGoogleLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>Join Nigeria's campus marketplace</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>I am a…</FormLabel>
                    <FormDescription className="text-xs">
                      This cannot be changed after signup.
                    </FormDescription>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      {ROLES.map((r) => (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => field.onChange(r.value)}
                          className={[
                            'rounded-lg border p-3 text-left transition-colors',
                            field.value === r.value
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border bg-secondary hover:border-primary/50',
                          ].join(' ')}
                        >
                          <div className="font-medium text-sm">{r.label}</div>
                          <div className="text-xs text-muted-foreground mt-1 leading-tight">
                            {r.description}
                          </div>
                        </button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {serverError && (
                <p className="text-sm text-destructive">{serverError}</p>
              )}

              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Creating account…' : 'Create Account'}
              </Button>
            </form>
          </Form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={handleGoogle} disabled={googleLoading}>
            {googleLoading ? 'Redirecting…' : 'Continue with Google'}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/signin" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
