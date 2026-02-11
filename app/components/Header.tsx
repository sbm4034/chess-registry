'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { Playfair_Display, Manrope } from 'next/font/google';
import { supabase } from '@/lib/supabase/client';

const display = Playfair_Display({
  subsets: ['latin'],
  weight: ['600', '700'],
  preload: false,
});

const sans = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  preload: false,
});

export default function Header() {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setIsLoggedIn(!!data.user);
    });
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsLoggedIn(!!session?.user);
      },
    );
    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <header className={`${sans.className} sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 text-lg font-semibold text-slate-900">
          <span className="relative h-8 w-8">
            <Image
              src="/logo.png"
              alt="Panipat Chess Association logo"
              fill
              sizes="32px"
              className="object-contain"
              priority
            />
          </span>
          <span className={display.className}>Chess Registry</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
          <Link href="/events" className="transition hover:text-slate-900">
            Events
          </Link>
          <Link href="/players" className="transition hover:text-slate-900">
            Players
          </Link>
          <Link
            href={isLoggedIn ? '/profile' : '/login'}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-slate-900 shadow-sm transition hover:bg-slate-50"
          >
            {isLoggedIn ? 'My Profile' : 'Login'}
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setOpen(!open)}
          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-700 shadow-sm transition hover:bg-slate-50 md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="border-t border-slate-200 bg-white/95 md:hidden">
          <div className="mx-auto space-y-3 px-4 py-4 text-sm font-medium text-slate-700 md:max-w-3xl lg:max-w-5xl">
            <Link
              href="/"
              className="block rounded-lg px-3 py-2 transition hover:bg-slate-50"
              onClick={() => setOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/events"
              className="block rounded-lg px-3 py-2 transition hover:bg-slate-50"
              onClick={() => setOpen(false)}
            >
              Events
            </Link>
            <Link
              href="/players"
              className="block rounded-lg px-3 py-2 transition hover:bg-slate-50"
              onClick={() => setOpen(false)}
            >
              Players
            </Link>
            <Link
              href={isLoggedIn ? '/profile' : '/login'}
              className="block rounded-lg px-3 py-2 transition hover:bg-slate-50"
              onClick={() => setOpen(false)}
            >
              {isLoggedIn ? 'My Profile' : 'Login'}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
