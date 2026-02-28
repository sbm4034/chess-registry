'use client';

import { useEffect, useMemo, useState } from 'react';
import PlayerAvatar from '@/app/components/PlayerAvatar';
import Image from 'next/image';
import Link from 'next/link';
import {
  CalendarDays,
  Check,
  Copy,
  FileText,
  MapPin,
  ShieldCheck,
  X,
} from 'lucide-react';

type Player = {
  id: string;
  name: string;
  city?: string;
  state?: string;
  role: string;
  bio?: string;
  profile_photo_url?: string;
};

type Certificate = {
  id: string;
  file_url: string;
};

type EventParticipation = {
  id: string;
  name: string;
  location: string;
  start_date: string;
  end_date: string;
};

const getCertificateUrl = (path: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documents-public/${path}`;

export default function PlayerProfileClient({
  player,
  certificates,
  events,
}: {
  player: Player;
  certificates: Certificate[];
  events: EventParticipation[];
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const profileUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/players/${player.id}`
      : '';

  useEffect(() => {
    if (!previewUrl) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [previewUrl]);

  /* ───────────────────────────────────────────── */
  /* EVENT GROUPING */
  /* ───────────────────────────────────────────── */

  const { upcoming, past } = useMemo(() => {
    const today = new Date();

    const upcomingEvents: EventParticipation[] = [];
    const pastEvents: EventParticipation[] = [];

    events.forEach((e) => {
      const end = new Date(e.end_date);
      if (end >= today) {
        upcomingEvents.push(e);
      } else {
        pastEvents.push(e);
      }
    });

    return { upcoming: upcomingEvents, past: pastEvents };
  }, [events]);

  /* ───────────────────────────────────────────── */
  /* UI */
  /* ───────────────────────────────────────────── */

  return (
    <>
      <div className="min-h-screen py-16 text-primary">
        <div className="mx-auto max-w-6xl space-y-10">

          {/* PROFILE HEADER */}
          <section className="bg-surface border border-border rounded-2xl shadow-md p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">

              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative">
                  <PlayerAvatar
                    photoUrl={player.profile_photo_url}
                    name={player.name}
                    className="w-32 h-32 rounded-full border-4 border-accent object-cover shadow-md"
                  />
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-background border border-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                    Official Profile
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="font-serif text-3xl md:text-4xl tracking-tight">
                      {player.name}
                    </h1>
                    <span className="rounded-full bg-background border border-border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider">
                      {player.role}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {player.city || '—'}, {player.state || '—'}
                    </span>
                  </div>

                  {player.bio && (
                    <p className="text-sm text-muted-foreground max-w-2xl">
                      {player.bio}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(profileUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-6 py-2 text-sm font-semibold"
                >
                  <Copy className="h-4 w-4" />
                  Copy profile link
                </button>

                {copied && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                    <Check className="h-3.5 w-3.5" />
                    Copied
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* CERTIFICATES */}
          <section>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-serif text-2xl">Chess Certificates</h2>
            </div>

            <div className="w-16 h-[2px] bg-accent mt-3 mb-8" />

            {certificates.length === 0 ? (
              <div className="rounded-xl border border-border bg-surface p-6 text-sm text-muted-foreground">
                No public certificates uploaded yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {certificates.map((doc) => {
                  const url = getCertificateUrl(doc.file_url);

                  return (
                    <button
                      key={doc.id}
                      onClick={() => setPreviewUrl(url)}
                      className="group relative overflow-hidden rounded-xl border border-border shadow-sm hover:shadow-lg transition"
                    >
                      <div className="relative h-44 w-full">
                        <Image
                          src={url}
                          alt="Chess certificate"
                          fill
                          className="object-cover group-hover:scale-105 transition duration-300"
                          unoptimized
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* EVENTS */}
          <section>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-serif text-2xl">Event Participation</h2>
            </div>

            <div className="w-16 h-[2px] bg-accent mt-3 mb-8" />

            {events.length === 0 && (
              <div className="rounded-xl border border-border bg-surface p-6 text-sm text-muted-foreground">
                No confirmed participation yet.
              </div>
            )}

            {/* UPCOMING */}
            {upcoming.length > 0 && (
              <>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                  Upcoming
                </h3>

                <div className="space-y-4 mb-10">
                  {upcoming.map((e) => (
                    <Link
                      key={e.id}
                      href={`/events/${e.id}`}
                      className="block rounded-xl border border-border p-5 hover:shadow-md transition"
                    >
                      <p className="font-semibold">{e.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {e.start_date} → {e.end_date}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {e.location}
                      </p>

                      <span className="inline-flex mt-3 rounded-full px-3 py-1 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        Registered
                      </span>
                    </Link>
                  ))}
                </div>
              </>
            )}

            {/* PAST */}
            {past.length > 0 && (
              <>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                  Past Events
                </h3>

                <div className="space-y-4">
                  {past.map((e) => (
                    <Link
                      key={e.id}
                      href={`/events/${e.id}`}
                      className="block rounded-xl border border-border p-5 hover:shadow-md transition"
                    >
                      <p className="font-semibold">{e.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {e.start_date} → {e.end_date}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {e.location}
                      </p>

                      <span className="inline-flex mt-3 rounded-full px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                        Played
                      </span>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      </div>

      {/* MODAL */}
      {previewUrl && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="relative max-w-[90vw] max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute -top-3 -right-3 bg-white rounded-full p-2"
            >
              <X className="h-4 w-4" />
            </button>

            <Image
              src={previewUrl}
              alt="Certificate preview"
              width={1200}
              height={1600}
              className="rounded-2xl object-contain max-h-[90vh]"
              unoptimized
            />
          </div>
        </div>
      )}
    </>
  );
}