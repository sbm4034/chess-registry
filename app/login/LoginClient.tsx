'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useSearchParams } from 'next/navigation';
import { Check, Mail } from 'lucide-react';
import { Card } from '@/app/components/ui/Card';
import { Section } from '@/app/components/ui/Section';
import LoadingButton from '@/app/components/ui/LoadingButton';

const supabase = createClient();

export default function LoginClient() {
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState(() => {
    if (typeof window === 'undefined') return '';
    try {
      return localStorage.getItem('last_login_email') ?? '';
    } catch {
      return '';
    }
  });

  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMagicLink = async () => {
  if (!email || loading) return;

  try {
    setLoading(true);
    setError(null);

    localStorage.setItem('last_login_email', email);

    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
      window.location.pathname
    )}`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      if (error.message.toLowerCase().includes('rate')) {
        setError('Too many attempts. Please wait a minute and try again.');
      } else {
        setError('Unable to send login link. Please try again.');
      }
      return;
    }

    setSent(true);
  } catch (err) {
    console.error('Login error:', err);
    setError(
      'We could not connect to the server. Please check your internet connection and try again.'
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="bg-background min-h-screen flex items-center justify-center px-4 py-8 font-sans">
      <Section className="py-8 flex items-center justify-center">
        <div className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-surface p-10 shadow-lg">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
              Official Access
            </div>

            <h1 className="font-serif text-2xl text-primary">
              Login / Register
            </h1>

            <div className="mx-auto h-[2px] w-16 bg-accent" />

            <p className="text-sm text-muted-foreground">
              {searchParams.get('next')
                ? 'Please login to continue'
                : 'We’ll email you a secure magic link'}
            </p>
          </div>

          <Card className="space-y-4">
            {!sent ? (
              <>
                <div>
                  <label className="text-sm text-muted-foreground">
                    Email address
                  </label>

                  <div className="relative mt-1">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <input
                      ref={inputRef}
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="you@example.com"
                      className="w-full bg-background border border-border rounded-md px-9 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-600 text-center">{error}</p>
                )}

                <LoadingButton
                  onClick={sendMagicLink}
                  loading={loading}
                  disabled={!email}
                  loadingText="Sending link..."
                  className="w-full justify-center py-2.5 font-semibold disabled:opacity-60 bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300 shadow-md hover:shadow-lg rounded-full"
                  spinnerClassName="text-primary-foreground"
                >
                  Send Magic Link
                </LoadingButton>

                <p className="text-xs text-muted-foreground text-center">
                  No password required · Secure login · Link expires in a few
                  minutes
                </p>
              </>
            ) : (
              <div className="text-center space-y-3">
                <p className="text-primary font-medium inline-flex items-center justify-center gap-2">
                  <Check className="h-4 w-4" />
                  Check your email
                </p>

                <p className="text-sm text-muted-foreground">
                  We sent a login link to
                </p>

                <p className="text-sm font-medium text-primary">{email}</p>

                <LoadingButton
                  onClick={sendMagicLink}
                  loading={loading}
                  loadingText="Sending link..."
                  className="text-sm text-primary hover:text-accent transition"
                >
                  Didn’t receive it? Resend link
                </LoadingButton>
              </div>
            )}
          </Card>

          <div className="text-center space-y-1">
            <p className="text-xs text-muted-foreground">
              Secure access for players, parents, and organizers
            </p>
            <p className="text-xs text-muted-foreground">
              By continuing, you agree to tournament rules and policies
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}
