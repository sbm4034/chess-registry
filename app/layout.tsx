import Header from './components/Header';
import Link from 'next/link';
import { Facebook, Instagram, Mail, Phone } from "lucide-react";
import TopProgressBar from './components/ui/TopProgressBar';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-primary font-sans">
        <TopProgressBar />
        <Header />
        <main className="min-h-screen">
          <div className="relative mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
<footer className="bg-dark text-primary-foreground border-t border-border py-14">
  <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
    
    {/* Column 1 */}
    <div className="space-y-3">
      <h3 className="font-serif text-xl text-accent">Chess Registry</h3>
      <p className="text-sm text-primary-foreground/80">
        Official Panipat chess platform.
      </p>
    </div>

    {/* Column 2 */}
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

    {/* Column 3 */}
    <div className="space-y-4">
      <p className="text-sm font-medium text-primary-foreground">Connect</p>

      {/* Social Icons */}
      <div className="flex items-center gap-3">
        <Link
          href="https://www.facebook.com/pnpchess/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          className="rounded-full border border-border p-2 text-primary-foreground/80 transition hover:text-accent hover:border-accent hover:bg-surface"
        >
          <Facebook className="h-4 w-4" />
        </Link>

        <Link
          href="https://instagram.com/pnpchess"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="rounded-full border border-border p-2 text-primary-foreground/80 transition hover:text-accent hover:border-accent hover:bg-surface"
        >
          <Instagram className="h-4 w-4" />
        </Link>
      </div>

      {/* Email */}
      <div className="flex items-center gap-2 text-sm text-primary-foreground/80">
        <Mail className="h-4 w-4 text-accent" />
        <a
          href="mailto:indianchessscl@gmail.com"
          className="transition hover:text-accent"
        >
          indianchessscl@gmail.com
        </a>
      </div>

      {/* WhatsApp */}
      <div className="flex items-center gap-2 text-sm text-primary-foreground/80">
        <Phone className="h-4 w-4 text-accent" />
        <a
          href="https://wa.me/917988390744"
          target="_blank"
          rel="noopener noreferrer"
          className="transition hover:text-accent"
        >
          WhatsApp: +91 79883 90744
        </a>
      </div>

    </div>
  </div>
</footer>
      </body>
    </html>
  );
}
