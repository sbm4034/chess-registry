'use client';

import { useEffect, useState } from 'react';
import PlayerAvatar from '@/app/components/PlayerAvatar';
import { CalendarDays, Check, Copy, FileText, MapPin, ShieldCheck, X } from 'lucide-react';
import { Playfair_Display, Manrope } from 'next/font/google';

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
  status: string;
  events: {
    id: string;
    name: string;
    location: string;
    start_date: string;
    end_date: string;
  };
};

const getCertificateUrl = (path: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documents-public/${path}`;

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
  const chessIcons = ['♔', '♕', '♘', '♗', '♖'];

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

  return (
    <>
      <div className={`${sans.className} min-h-screen px-4 py-8`}>
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_20%_-10%,rgba(30,41,59,0.08),transparent_60%),radial-gradient(900px_500px_at_85%_10%,rgba(15,23,42,0.06),transparent_55%),linear-gradient(180deg,#ffffff_0%,#f8fafc_60%,#ffffff_100%)]" />
          <div
            className="absolute inset-0 bg-no-repeat opacity-[0.04]"
            style={{
              backgroundImage: "url('/logo.png')",
              backgroundPosition: '50% 35%',
              backgroundSize: 'clamp(280px, 45vw, 640px) auto',
            }}
          />
        </div>

        <div className="mx-auto max-w-5xl space-y-6 rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur md:p-8">
          {/* Profile Header */}
          <section className="rounded-3xl border border-slate-800 bg-slate-900 text-white p-5 shadow-sm md:p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative">
                  <PlayerAvatar
                    photoUrl={player.profile_photo_url}
                    name={player.name}
                    className="h-24 w-24 md:h-28 md:w-28 border-slate-200 shadow-sm"
                  />
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-700 shadow-sm">
                    Official Profile
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className={`${display.className} text-2xl text-white md:text-3xl`}>
                      {player.name}
                    </h1>
                    <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                      {player.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <MapPin className="h-4 w-4 text-white/60" />
                    <span>{player.city || '—'}, {player.state || '—'}</span>
                  </div>
                  {player.bio && (
                    <p className="text-sm text-white/80 max-w-2xl">
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
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
                >
                  <Copy className="h-4 w-4" />
                  Copy profile link
                </button>
                {copied && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-white/80">
                    <Check className="h-3.5 w-3.5" />
                    Copied
                  </span>
                )}
              </div>
            </div>
          </section>

        {/* CERTIFICATES */}
        <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm md:p-6">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-800">
              Chess Certificates
            </h2>
          </div>
          <div className="mt-3 h-px w-full bg-slate-100" />

          {certificates.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-white/70 p-4 text-sm text-slate-600">
              No public certificates uploaded yet
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {certificates.map((doc) => {
                const url = getCertificateUrl(doc.file_url);
                return (
                  <button
                    key={doc.id}
                    onClick={() => setPreviewUrl(url)}
                    className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <img
                      src={url}
                      alt="Chess certificate"
                      className="h-28 w-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                      Certificate
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* EVENTS */}
        <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm md:p-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-800">
              Event Participation
            </h2>
          </div>
          <div className="mt-3 h-px w-full bg-slate-100" />

          {events.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-white/70 p-4 text-sm text-slate-600">
              No event participation yet
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {events.map((e, idx) => {
                const eventImage = (e.events as any).image_url as string | undefined;
                const bgClass = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/80';
                return (
                  <div
                    key={e.events.id}
                    className={`flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 shadow-sm md:flex-row md:items-center ${bgClass}`}
                  >
                    <div className="relative h-28 w-full overflow-hidden rounded-xl border border-slate-200 bg-white md:h-24 md:w-36">
                      {eventImage ? (
                        <img
                          src={eventImage}
                          alt={e.events.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div
                          className="flex h-full w-full items-center justify-center bg-slate-100 text-xs text-slate-500"
                          style={{
                            backgroundImage: "url('/logo.png')",
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center',
                            backgroundSize: '60% auto',
                            opacity: 0.8,
                          }}
                        >
                          <span className="sr-only">Event</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white text-lg font-semibold shadow-sm">
                          {chessIcons[idx % chessIcons.length]}
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Tournament
                          </p>
                          <p className="text-base font-semibold text-slate-900">
                            {e.events.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span>{e.events.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <CalendarDays className="h-4 w-4 text-slate-400" />
                        <span>{e.events.start_date} → {e.events.end_date}</span>
                      </div>
                    </div>
                    <span className="inline-flex w-fit rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-700">
                      {e.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
        </div>
      </div>

      {/* CERTIFICATE MODAL */}
      {previewUrl && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="relative max-w-[90vw] max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute -top-3 -right-3 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow"
            >
              <X className="h-4 w-4 text-gray-700" />
            </button>

            <img
              src={previewUrl}
              alt="Certificate preview"
              className="max-w-full max-h-[90vh] rounded-2xl shadow-xl"
            />
          </div>
        </div>
      )}
    </>
  );
}
