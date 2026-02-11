'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { Calendar, MapPin, Search, X } from 'lucide-react';
import { Playfair_Display, Manrope } from 'next/font/google';

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

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // input state
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // applied filters
  const [filters, setFilters] = useState({
    search: '',
    city: '',
    startDate: '',
    endDate: '',
  });

  const chessIcons = [
    { label: '♔', name: 'King', bg: 'bg-slate-900', text: 'text-white' },
    { label: '♕', name: 'Queen', bg: 'bg-slate-100', text: 'text-slate-900' },
    { label: '♘', name: 'Knight', bg: 'bg-slate-800', text: 'text-white' },
    { label: '♗', name: 'Bishop', bg: 'bg-slate-200', text: 'text-slate-900' },
    { label: '♖', name: 'Rook', bg: 'bg-slate-700', text: 'text-white' },
  ];

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);

      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 8000)
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
        alert(
          'Unable to load events right now. Please try again in a moment.'
        );
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
    <>
      <div className={`${sans.className} w-full space-y-8`}>
        {/* Hero */}
        <section className="space-y-5">
          <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/70 p-6 shadow-sm backdrop-blur md:p-8">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-no-repeat opacity-[0.05]"
              style={{
                backgroundImage: "url('/logo.png')",
                backgroundPosition: '85% 18%',
                backgroundSize: 'clamp(240px, 40vw, 520px) auto',
              }}
            />
            <div className="relative space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-700 shadow-sm">
                Official Events Directory
              </div>
              <h1
                className={`${display.className} text-3xl leading-tight text-gray-900 md:text-5xl`}
              >
                Chess Events
              </h1>
              <p className="text-gray-700 md:text-lg max-w-2xl">
                Browse upcoming official tournaments, registration details, and
                verified venues.
              </p>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm backdrop-blur">
          <div className="grid gap-2 sm:grid-cols-5">
            <input
              placeholder="Event name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none"
            />

            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full rounded-xl border border-slate-200 bg-white/90 px-9 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none"
              />
            </div>

            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white/90 px-9 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none"
              />
            </div>

            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white/90 px-9 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={triggerSearch}
                disabled={loading}
                title="Search"
                className="
                  flex items-center justify-center gap-2
                  rounded-xl px-4 py-2
                  bg-slate-900 text-white
                  hover:bg-slate-800
                  shadow-lg shadow-slate-900/20
                  transition
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
              >
                <Search className="h-4 w-4" />
                <span className="text-sm">Search</span>
              </button>

              <button
                onClick={clearFilters}
                title="Clear filters"
                className="
                  flex items-center justify-center
                  rounded-xl px-3 py-2
                  border border-slate-200
                  hover:bg-slate-50
                  transition
                "
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </section>

        {/* Loading skeleton */}
        {loading && (
          <section className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={`event-skeleton-${idx}`}
                className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-slate-200 animate-pulse" />
                  <div className="flex-1 space-y-3">
                    <div className="h-3 w-24 rounded-full bg-slate-200 animate-pulse" />
                    <div className="h-5 w-3/4 rounded-full bg-slate-200 animate-pulse" />
                    <div className="h-4 w-1/2 rounded-full bg-slate-200 animate-pulse" />
                    <div className="h-3 w-32 rounded-full bg-slate-200 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Empty */}
        {!loading && events.length === 0 && (
          <div className="rounded-2xl border border-slate-100 bg-white/80 p-6 text-sm text-slate-600 shadow-sm">
            No events found.
          </div>
        )}

        {/* Featured event */}
        {!loading && events.length > 0 && (() => {
          const today = new Date().toISOString().slice(0, 10);
          const upcoming = events.filter(
            (event) => event.start_date && event.start_date >= today,
          );
          const source = upcoming.length ? upcoming : events;
          const featured = [...source].sort((a, b) =>
            String(a.start_date).localeCompare(String(b.start_date)),
          )[0];

          if (!featured) return null;

          return (
            <section className="rounded-3xl border border-slate-200 bg-[linear-gradient(135deg,rgba(15,23,42,0.08),rgba(15,23,42,0.02)),linear-gradient(180deg,#ffffff,#f8fafc)] p-6 shadow-sm">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                    Featured Event
                  </div>
                  <h2 className={`${display.className} mt-3 text-2xl text-slate-900 md:text-3xl`}>
                    {featured.name}
                  </h2>
                  <p className="mt-2 text-sm text-slate-700">
                    {featured.location}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {featured.start_date} → {featured.end_date}
                  </p>
                </div>
                <Link
                  href={`/events/${featured.id}`}
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  View featured event →
                </Link>
              </div>
            </section>
          );
        })()}

        {/* Event cards */}
        {!loading && (
        <section className="grid gap-4 sm:grid-cols-2">
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
              const isStrong = index % 2 === 1;

              return (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className={`
                    group block rounded-2xl border p-5 shadow-sm transition-all
                    hover:-translate-y-0.5 hover:shadow-md
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20
                    ${
                      isFeatured
                        ? 'border-slate-900/30 bg-slate-900 text-white'
                        : isStrong
                        ? 'border-slate-300 bg-slate-50/80'
                        : 'border-slate-200 bg-white/80'
                    }
                  `}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                        isFeatured ? 'bg-white/10 text-white' : `${icon.bg} ${icon.text}`
                      } text-lg font-semibold shadow-sm`}
                      aria-hidden="true"
                    >
                      {icon.label}
                    </div>
                    <div className="flex-1">
                      <div className={`flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider ${
                        isFeatured ? 'text-white/70' : 'text-slate-500'
                      }`}>
                        <span>Tournament</span>
                        {isFeatured && (
                          <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] text-white">
                            Featured
                          </span>
                        )}
                      </div>
                      <h3 className={`mt-2 text-lg font-semibold ${
                        isFeatured ? 'text-white' : 'text-slate-900'
                      }`}>
                        {event.name}
                      </h3>

                      <p className={`mt-2 text-sm ${
                        isFeatured ? 'text-white/80' : 'text-slate-700'
                      }`}>
                        {event.location}
                      </p>

                      <p className={`mt-3 text-xs ${
                        isFeatured ? 'text-white/70' : 'text-slate-500'
                      }`}>
                        {event.start_date} → {event.end_date}
                      </p>

                      <div className={`mt-4 inline-flex items-center gap-2 text-sm font-semibold ${
                        isFeatured ? 'text-white' : 'text-slate-900'
                      } group-hover:underline`}>
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
    </>
  );
}
