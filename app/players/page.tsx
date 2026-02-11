'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { MapPin, Search, User } from 'lucide-react';
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

type Player = {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  role: string;
};

export default function PlayersPage() {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [loading, setLoading] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);

  const searchPlayers = async () => {
    setLoading(true);

    let query = supabase
      .from('user_profiles')
      .select('id, name, city, state, role')
      .in('role', ['player', 'coach', 'referee']);

    if (name) query = query.ilike('name', `%${name}%`);
    if (city) query = query.ilike('city', `%${city}%`);
    if (state) query = query.eq('state', state);

    const { data } = await query.limit(50);

    setPlayers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    searchPlayers();
  }, []);

  return (
    <div className={`${sans.className} w-full space-y-8 py-8`}>
      {/* Hero */}
      <section className="space-y-5">
        <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-white via-white to-slate-50/40 p-6 shadow-sm backdrop-blur md:p-8">
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
              Official Player Directory
            </div>
            <h1 className={`${display.className} text-3xl leading-tight text-gray-900 md:text-5xl`}>
              Search Players
            </h1>
            <p className="text-gray-700 md:text-lg max-w-2xl">
              Find registered players, coaches, and referees by name or location.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm backdrop-blur">
        <div className="grid gap-2 sm:grid-cols-5">
          <div className="relative sm:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search by name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white/90 px-9 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none"
            />
          </div>

          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white/90 px-9 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none"
            />
          </div>

          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none"
          >
            <option value="">All States</option>
            <option value="Andhra Pradesh">Andhra Pradesh</option>
            <option value="Arunachal Pradesh">Arunachal Pradesh</option>
            <option value="Assam">Assam</option>
            <option value="Bihar">Bihar</option>
            <option value="Chhattisgarh">Chhattisgarh</option>
            <option value="Goa">Goa</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Haryana">Haryana</option>
            <option value="Himachal Pradesh">Himachal Pradesh</option>
            <option value="Jharkhand">Jharkhand</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Kerala">Kerala</option>
            <option value="Madhya Pradesh">Madhya Pradesh</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Manipur">Manipur</option>
            <option value="Meghalaya">Meghalaya</option>
            <option value="Mizoram">Mizoram</option>
            <option value="Nagaland">Nagaland</option>
            <option value="Odisha">Odisha</option>
            <option value="Punjab">Punjab</option>
            <option value="Rajasthan">Rajasthan</option>
            <option value="Sikkim">Sikkim</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Telangana">Telangana</option>
            <option value="Tripura">Tripura</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Uttarakhand">Uttarakhand</option>
            <option value="West Bengal">West Bengal</option>
            <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
            <option value="Chandigarh">Chandigarh</option>
            <option value="Dadra and Nagar Haveli and Daman and Diu">
              Dadra and Nagar Haveli and Daman and Diu
            </option>
            <option value="Delhi">Delhi</option>
            <option value="Jammu and Kashmir">Jammu and Kashmir</option>
            <option value="Ladakh">Ladakh</option>
            <option value="Lakshadweep">Lakshadweep</option>
            <option value="Puducherry">Puducherry</option>
          </select>

          <div className="flex gap-2">
            <button
              onClick={searchPlayers}
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Search className="h-4 w-4" />
              Search
            </button>
            <button
              onClick={() => {
                setName('');
                setCity('');
                setState('');
                setTimeout(() => searchPlayers(), 0);
              }}
              className="flex items-center justify-center rounded-xl border border-slate-200 px-3 py-2 text-slate-700 shadow-sm transition hover:bg-slate-50"
              title="Reset filters"
            >
              Reset
            </button>
          </div>
        </div>
      </section>

      {/* Loading skeleton */}
      {loading && (
        <section className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={`player-skeleton-${idx}`}
              className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm"
            >
              <div className="space-y-3">
                <div className="h-5 w-2/3 rounded-full bg-slate-200 animate-pulse" />
                <div className="h-4 w-1/2 rounded-full bg-slate-200 animate-pulse" />
                <div className="h-3 w-24 rounded-full bg-slate-200 animate-pulse" />
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Empty */}
      {!loading && players.length === 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white/80 p-6 text-sm text-slate-600 shadow-sm">
          No players found.
        </div>
      )}

      {/* Results */}
      {!loading && players.length > 0 && (
        <section className="grid gap-4 sm:grid-cols-2">
          {players.map((p, index) => (
            <div
              key={p.id}
              className={`rounded-2xl border p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                index % 2 === 1 ? 'border-slate-300 bg-slate-50/80' : 'border-slate-200 bg-white/80'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                  ♞
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] text-white">
                      {p.role === 'coach'
                        ? 'Coach'
                        : p.role === 'referee'
                        ? 'Referee'
                        : 'Player'}
                    </span>
                  </div>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {p.name}
                  </p>
                  <p className="mt-2 text-sm text-slate-700">
                    {p.city || '—'}, {p.state || '—'}
                  </p>
                  <Link
                    href={`/players/${p.id}`}
                    className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
                  >
                    View profile →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
