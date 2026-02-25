'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { Playfair_Display, Manrope } from 'next/font/google';
import { createClient } from '@/lib/supabase/client';

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
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();
  useEffect(() => {
  const getUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
  };

  getUser();

  const { data: authListener } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setUser(session?.user ?? null);
    }
  );

  return () => {
    authListener.subscription.unsubscribe();
  };
}, []);
  
const handleLogout = async () => {
  await supabase.auth.signOut();
  setUser(null);
  router.replace('/login');
  router.refresh();
};
  return (
    <header className={`${sans.className} sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 text-lg font-semibold text-primary">
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

        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <Link href="/events" className="transition hover:text-primary">
            Events
          </Link>
          <Link href="/players" className="transition hover:text-primary">
            Players
          </Link>
          {user ? (
  <>
    <Link
      href="/profile"
      className="transition hover:text-primary"
    >
      My Profile
    </Link>

    <button
      onClick={handleLogout}
      className="rounded-full border border-border px-3 py-1.5 text-primary shadow-sm transition hover:bg-background"
    >
      Logout
    </button>
  </>
) : (
  <Link
    href="/login"
    className="rounded-full border border-border px-3 py-1.5 text-primary shadow-sm transition hover:bg-background"
  >
    Login
  </Link>
)}
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setOpen(!open)}
          className="inline-flex items-center justify-center rounded-full border border-border bg-surface p-2 text-primary shadow-sm transition hover:bg-background md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="border-t border-border bg-surface md:hidden">
          <div className="mx-auto space-y-3 px-4 py-4 text-sm font-medium text-muted-foreground md:max-w-3xl lg:max-w-5xl">
            <Link
              href="/"
              className="block rounded-lg px-3 py-2 transition hover:bg-background hover:text-primary"
              onClick={() => setOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/events"
              className="block rounded-lg px-3 py-2 transition hover:bg-background hover:text-primary"
              onClick={() => setOpen(false)}
            >
              Events
            </Link>
            <Link
              href="/players"
              className="block rounded-lg px-3 py-2 transition hover:bg-background hover:text-primary"
              onClick={() => setOpen(false)}
            >
              Players
            </Link>
            {user ? (
  <>
    <Link
      href="/profile"
      className="block rounded-lg px-3 py-2 transition hover:bg-background hover:text-primary"
      onClick={() => setOpen(false)}
    >
      My Profile
    </Link>

    <button
      onClick={() => {
        handleLogout();
        setOpen(false);
      }}
      className="block w-full text-left rounded-lg px-3 py-2 transition hover:bg-background hover:text-primary"
    >
      Logout
    </button>
  </>
) : (
  <Link
    href="/login"
    className="block rounded-lg px-3 py-2 transition hover:bg-background hover:text-primary"
    onClick={() => setOpen(false)}
  >
    Login
  </Link>
)}
          </div>
        </nav>
      )}
    </header>
  );
}
