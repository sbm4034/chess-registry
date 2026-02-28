'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Search } from 'lucide-react';
import LoadingButton from '@/app/components/ui/LoadingButton';

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
  const supabase = createClient();
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
    <div className="w-full font-sans">
      <section className="relative min-h-[50vh]">
        <div className="absolute inset-0">
          <Image
            src="/chess_another_hero_banner.jpg"
            alt="Players banner"
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
              Official Player Directory
            </h1>
            <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
              Find registered players, coaches, and referees by name or location.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-background">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <h2 className="font-serif text-3xl md:text-4xl text-primary text-center">
            Player Search
          </h2>
          <div className="mt-8 bg-surface border border-border rounded-xl shadow-sm p-4">
            <div className="grid gap-2 sm:grid-cols-5">
              <div className="relative sm:col-span-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  placeholder="Search by name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-9 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-9 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                <LoadingButton
                  onClick={searchPlayers}
                  loading={loading}
                  loadingText="Searching..."
                  className="flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3 bg-primary text-primary-foreground hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  spinnerClassName="text-primary-foreground"
                >
                  <Search className="h-4 w-4" />
                  Search
                </LoadingButton>
                <button
                  onClick={() => {
                    setName('');
                    setCity('');
                    setState('');
                    setTimeout(() => searchPlayers(), 0);
                  }}
                  className="flex items-center justify-center rounded-full px-6 py-3 border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition"
                  title="Reset filters"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {loading && (
            <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={`player-skeleton-${idx}`}
                  className="rounded-xl border border-border bg-surface p-5 shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="h-5 w-2/3 rounded-full bg-muted animate-pulse" />
                    <div className="h-4 w-1/2 rounded-full bg-muted animate-pulse" />
                    <div className="h-3 w-24 rounded-full bg-muted animate-pulse" />
                  </div>
                </div>
              ))}
            </section>
          )}

          {!loading && players.length === 0 && (
            <div className="mt-8 rounded-xl border border-border bg-surface p-6 text-sm text-muted-foreground shadow-sm">
              No players found.
            </div>
          )}

          {!loading && players.length > 0 && (
            <section className="mt-8 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {players.map((p, index) => (
                <div
                  key={p.id}
                  className="rounded-xl border border-border bg-surface p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                      ♞
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <span className="rounded-full bg-accent text-accent-foreground px-2 py-0.5 text-[10px]">
                          {p.role === 'coach'
                            ? 'Coach'
                            : p.role === 'referee'
                            ? 'Referee'
                            : 'Player'}
                        </span>
                      </div>
                      <p className="mt-2 text-lg font-semibold text-primary">
                        {p.name}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {p.city || '—'}, {p.state || '—'}
                      </p>
                      <Link
                        href={`/players/${p.id}`}
                        className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary text-primary hover:bg-primary hover:text-primary-foreground px-4 py-2 text-sm font-semibold transition"
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
      </section>

    </div>
  );
}
