'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, Search, X } from 'lucide-react';

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const supabase = createClient();
  const [filters, setFilters] = useState({
    search: '',
    city: '',
    startDate: '',
    endDate: '',
  });

  const chessIcons = [
    { label: '♔', name: 'King', bg: 'bg-primary', text: 'text-primary-foreground' },
    { label: '♕', name: 'Queen', bg: 'bg-surface', text: 'text-primary' },
    { label: '♘', name: 'Knight', bg: 'bg-dark', text: 'text-primary-foreground' },
    { label: '♗', name: 'Bishop', bg: 'bg-surface', text: 'text-primary' },
    { label: '♖', name: 'Rook', bg: 'bg-primary', text: 'text-primary-foreground' },
  ];

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);

      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 8000),
      );

      try {
        const queryPromise = (async () => {
          let query = supabase
            .from('events')
            .select('*')
            .order('start_date', { ascending: true });

          if (filters.search) {
            query = query.ilike('name', `%${filters.search}%`);
          }

          if (filters.city) {
            query = query.ilike('location', `%${filters.city}%`);
          }

          if (filters.startDate) {
            query = query.gte('start_date', filters.startDate);
          }

          if (filters.endDate) {
            query = query.lte('end_date', filters.endDate);
          }

          const { data, error } = await query;
          if (error) throw error;

          return data;
        })();

        const data = await Promise.race([queryPromise, timeout]);
        setEvents((data as any[]) || []);
      } catch (err) {
        alert('Unable to load events right now. Please try again in a moment.');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [filters]);

  const triggerSearch = () => {
    setFilters({
      search: search.trim(),
      city: city.trim(),
      startDate,
      endDate,
    });
  };

  const clearFilters = () => {
    setSearch('');
    setCity('');
    setStartDate('');
    setEndDate('');
    setFilters({
      search: '',
      city: '',
      startDate: '',
      endDate: '',
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      triggerSearch();
    }
  };

  return (
    <div className="w-full font-sans">
      <section className="relative min-h-[50vh]">
        <div className="absolute inset-0">
          <Image
            src="/chess_board.png"
            alt="Chess events banner"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-dark/70" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-20 text-center text-primary-foreground">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-widest text-gold">
              OFFICIAL CHESS REGISTRY
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold">
              Official Chess Events
            </h1>
            <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
              Browse upcoming official tournaments, registration details, and verified venues.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-background">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <h2 className="font-serif text-3xl md:text-4xl text-primary text-center">
            Upcoming Tournaments
          </h2>
          <div className="mt-8 bg-surface border border-border rounded-xl shadow-sm p-4">
            <div className="grid gap-2 sm:grid-cols-5">
              <input
                placeholder="Event name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />

              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full rounded-xl border border-border bg-background px-9 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-9 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-9 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={triggerSearch}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 rounded-full px-6 py-3 bg-primary text-primary-foreground hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Search className="h-4 w-4" />
                  <span className="text-sm">Search</span>
                </button>

                <button
                  onClick={clearFilters}
                  title="Clear filters"
                  className="flex items-center justify-center rounded-full px-6 py-3 border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </div>

          {loading && (
            <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={`event-skeleton-${idx}`}
                  className="rounded-xl border border-border bg-surface p-5 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-muted animate-pulse" />
                    <div className="flex-1 space-y-3">
                      <div className="h-3 w-24 rounded-full bg-muted animate-pulse" />
                      <div className="h-5 w-3/4 rounded-full bg-muted animate-pulse" />
                      <div className="h-4 w-1/2 rounded-full bg-muted animate-pulse" />
                      <div className="h-3 w-32 rounded-full bg-muted animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </section>
          )}

          {!loading && events.length === 0 && (
            <div className="mt-8 rounded-xl border border-border bg-surface p-6 text-sm text-muted-foreground shadow-sm">
              No events found.
            </div>
          )}

          {!loading && (
            <section className="mt-8 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {(() => {
                const today = new Date().toISOString().slice(0, 10);
                const upcoming = events.filter(
                  (event) => event.start_date && event.start_date >= today,
                );
                const source = upcoming.length ? upcoming : events;
                const featured =
                  [...source].sort((a, b) =>
                    String(a.start_date).localeCompare(String(b.start_date)),
                  )[0] || null;

                return events.map((event, index) => {
                  const icon = chessIcons[index % chessIcons.length];
                  const isFeatured = featured?.id === event.id;

                  return (
                    <Link
                      key={event.id}
                      href={`/events/${event.id}`}
                      className={`group block rounded-xl border border-border bg-surface p-5 shadow-sm transition hover:shadow-md ${
                        isFeatured ? 'ring-1 ring-accent' : ''
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl ${icon.bg} ${icon.text} text-lg font-semibold shadow-sm`}
                          aria-hidden="true"
                        >
                          {icon.label}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            <span>Tournament</span>
                            {isFeatured && (
                              <span className="rounded-full bg-accent text-accent-foreground px-2 py-0.5 text-[10px]">
                                Featured
                              </span>
                            )}
                          </div>
                          <h3 className="mt-2 text-lg font-semibold text-primary">
                            {event.name}
                          </h3>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {event.location}
                          </p>
                          <p className="mt-3 text-xs text-muted-foreground">
                            {event.start_date} → {event.end_date}
                          </p>
                          <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:underline">
                            View details →
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                });
              })()}
            </section>
          )}
        </div>
      </section>

    </div>
  );
}
