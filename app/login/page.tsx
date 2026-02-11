'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useSearchParams } from 'next/navigation';
import { Check, Mail } from 'lucide-react';
import { Playfair_Display, Manrope } from 'next/font/google';

const display = Playfair_Display({
  subsets: ['latin'],
  weight: ['600', '700'],
});

const sans = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirectTo =
  typeof window !== 'undefined'
    ? `${window.location.origin}/auth/callback`
    : undefined
  const inputRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Autofocus + remember email
  useEffect(() => {
    const savedEmail = localStorage.getItem('last_login_email');
    if (savedEmail) setEmail(savedEmail);
    inputRef.current?.focus();
  }, []);

  const sendMagicLink = async () => {
    if (!email) return;

    setLoading(true);
    setError(null);
    localStorage.setItem('last_login_email', email);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSent(true);
  };

  return (
    <div className={`${sans.className} min-h-screen flex items-center justify-center px-4 py-8`}>
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_20%_-10%,rgba(30,41,59,0.08),transparent_60%),radial-gradient(900px_500px_at_85%_10%,rgba(15,23,42,0.06),transparent_55%),linear-gradient(180deg,#ffffff_0%,#f8fafc_60%,#ffffff_100%)]" />
        <div
          className="absolute inset-0 bg-no-repeat opacity-[0.04]"
          style={{
            backgroundImage: "url('/logo.png')",
            backgroundPosition: '50% 35%',
            backgroundSize: 'clamp(240px, 40vw, 520px) auto',
          }}
        />
      </div>
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-sm backdrop-blur">

        {/* Context */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-600">
            Official Access
          </div>
          <h1 className={`${display.className} text-2xl text-slate-900`}>
            Login / Register
          </h1>
         <p className="text-sm text-slate-600">
    {redirectTo !== '/'
      ? 'Please login to continue'
      : 'We’ll email you a secure magic link'}
  </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 space-y-4 shadow-sm">

          {!sent ? (
            <>
              {/* Email input */}
              <div>
                <label className="text-sm text-slate-600">
                  Email address
                </label>
                <div className="relative mt-1">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                  ref={inputRef}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-white px-9 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                </div>
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-red-600">
                  {error}
                </p>
              )}

              {/* Button */}
              <button
                onClick={sendMagicLink}
                disabled={loading || !email}
                className="w-full rounded-full bg-slate-900 text-white py-2.5
                           font-semibold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition
                           disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {loading ? 'Sending link…' : 'Send Magic Link'}
              </button>

              {/* Trust cues */}
              <p className="text-xs text-slate-500 text-center">
                No password required · Secure login · Link expires in a few minutes
              </p>
            </>
          ) : (
            /* Success state */
            <div className="text-center space-y-3">
              <p className="text-slate-700 font-medium inline-flex items-center justify-center gap-2">
                <Check className="h-4 w-4" />
                Check your email
              </p>

              <p className="text-sm text-slate-600">
                We sent a login link to
              </p>

              <p className="text-sm font-medium text-slate-900">
                {email}
              </p>

              <button
                onClick={sendMagicLink}
                disabled={loading}
                className="text-sm text-slate-700 hover:underline"
              >
                Didn’t receive it? Resend link
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center space-y-1">
          <p className="text-xs text-slate-500">
            Secure access for players, parents, and organizers
          </p>
          <p className="text-xs text-slate-500">
            By continuing, you agree to tournament rules and policies
          </p>
        </div>
      </div>
    </div>
  );
}
