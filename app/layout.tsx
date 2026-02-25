import Header from './components/Header';
import Link from 'next/link';
import { Facebook, Instagram, Linkedin, X as XIcon } from 'lucide-react';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-primary font-sans">
        <Header />
        <main className="min-h-screen">
          <div className="relative mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
        <footer className="bg-dark text-primary-foreground border-t border-border py-14">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
            <div className="space-y-3">
              <h3 className="font-serif text-xl text-accent">Chess Registry</h3>
              <p className="text-sm text-primary-foreground/80">
                Official district chess platform.
              </p>
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-primary-foreground">Quick Links</p>
              <Link href="/events" className="block text-primary-foreground/80 transition hover:text-accent">
                Events
              </Link>
              <Link href="/players" className="block text-primary-foreground/80 transition hover:text-accent">
                Players
              </Link>
              <Link href="/login" className="block text-primary-foreground/80 transition hover:text-accent">
                Login
              </Link>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium text-primary-foreground">Follow</p>
              <div className="flex items-center gap-3">
                <Link href="#" aria-label="Facebook" className="rounded-full border border-border p-2 text-primary-foreground/80 transition hover:text-accent">
                  <Facebook className="h-4 w-4" />
                </Link>
                <Link href="#" aria-label="Instagram" className="rounded-full border border-border p-2 text-primary-foreground/80 transition hover:text-accent">
                  <Instagram className="h-4 w-4" />
                </Link>
                <Link href="#" aria-label="LinkedIn" className="rounded-full border border-border p-2 text-primary-foreground/80 transition hover:text-accent">
                  <Linkedin className="h-4 w-4" />
                </Link>
                <Link href="#" aria-label="X" className="rounded-full border border-border p-2 text-primary-foreground/80 transition hover:text-accent">
                  <XIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
