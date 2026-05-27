import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const emailSchema = z.object({
  email: z.string().email('Enter a valid email'),
});

const newPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  });

type EmailValues = z.infer<typeof emailSchema>;
type PasswordValues = z.infer<typeof newPasswordSchema>;

export default function ResetPassword() {
  usePageTitle('Reset Password');
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<'request' | 'update'>('request');
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState('');

  // Supabase puts the recovery token in the URL hash
  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    if (hash.get('type') === 'recovery' && hash.get('access_token')) {
      setMode('update');
    }
  }, []);

  const emailForm = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: '', confirm: '' },
  });

  async function onRequestReset(values: EmailValues) {
    setServerError('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Failed to send reset email');
    }
  }

  async function onUpdatePassword(values: PasswordValues) {
    setServerError('');
    try {
      const { error } = await supabase.auth.updateUser({ password: values.password });
      if (error) throw error;
      setLocation('/');
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Failed to update password');
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {mode === 'request' ? 'Reset your password' : 'Set new password'}
          </CardTitle>
          <CardDescription>
            {mode === 'request'
              ? "We'll send you a link to reset your password"
              : 'Choose a new password for your account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mode === 'request' ? (
            sent ? (
              <div className="text-center space-y-2">
                <p className="text-primary font-medium">Check your email</p>
                <p className="text-sm text-muted-foreground">
                  We sent a reset link. It may take a minute to arrive.
                </p>
              </div>
            ) : (
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(onRequestReset)} className="space-y-4">
                  <FormField
                    control={emailForm.control}
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
                  {serverError && <p className="text-sm text-destructive">{serverError}</p>}
                  <Button type="submit" className="w-full" disabled={emailForm.formState.isSubmitting}>
                    {emailForm.formState.isSubmitting ? 'Sending…' : 'Send Reset Link'}
                  </Button>
                </form>
              </Form>
            )
          ) : (
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onUpdatePassword)} className="space-y-4">
                <FormField
                  control={passwordForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="confirm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {serverError && <p className="text-sm text-destructive">{serverError}</p>}
                <Button type="submit" className="w-full" disabled={passwordForm.formState.isSubmitting}>
                  {passwordForm.formState.isSubmitting ? 'Updating…' : 'Update Password'}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
