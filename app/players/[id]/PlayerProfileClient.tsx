'use client';

import { useEffect, useState } from 'react';
import PlayerAvatar from '@/app/components/PlayerAvatar';
import { CalendarDays, Check, Copy, FileText, MapPin, ShieldCheck, X } from 'lucide-react';

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
  event: {
    id: string;
    name: string;
    location: string;
    start_date: string;
    end_date: string;
  };
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
      <div className="min-h-screen py-16 text-primary">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Profile Header */}
          <section className="bg-surface border border-border rounded-2xl shadow-md p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative">
                  <PlayerAvatar
                    photoUrl={player.profile_photo_url}
                    name={player.name}
                    className="w-32 h-32 rounded-full border-4 border-accent object-cover shadow-md"
                  />
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-background border border-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary shadow-sm">
                    Official Profile
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="font-serif text-3xl md:text-4xl tracking-tight text-primary">
                      {player.name}
                    </h1>
                    <span className="rounded-full bg-background border border-border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
                      {player.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm uppercase tracking-widest text-muted-foreground mt-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{player.city || '—'}, {player.state || '—'}</span>
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
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300 rounded-full px-6 py-2 shadow-md hover:shadow-lg text-sm font-semibold"
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
        <section className="mt-16">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-serif text-2xl text-primary">
              Chess Certificates
            </h2>
          </div>
          <div className="w-16 h-[2px] bg-accent mt-3 mb-8" />

          {certificates.length === 0 ? (
            <div className="rounded-xl border border-border bg-surface p-6 text-sm text-muted-foreground">
              No public certificates uploaded yet
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {certificates.map((doc) => {
                const url = getCertificateUrl(doc.file_url);
                return (
                  <button
                    key={doc.id}
                    onClick={() => setPreviewUrl(url)}
                    className="group relative overflow-hidden bg-surface border border-border rounded-xl shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    <img
                      src={url}
                      alt="Chess certificate"
                      className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute bottom-3 left-3 rounded-full bg-background/90 border border-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Certificate
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* EVENTS */}
        <section className="mt-16">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-serif text-2xl text-primary">
              Event Participation
            </h2>
          </div>
          <div className="w-16 h-[2px] bg-accent mt-3 mb-8" />

          {events.length === 0 ? (
            <div className="bg-surface border border-border rounded-xl p-6 text-sm text-muted-foreground">
              No event participation yet
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-xl p-6">
              {events.map((e, idx) => {
                return (
                  <div
                    key={e.event?.id}
                    className="flex justify-between items-center py-3 border-b border-border last:border-b-0 gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-lg font-semibold shadow-sm">
                          {chessIcons[idx % chessIcons.length]}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Tournament
                          </p>
                          <p className="text-primary font-medium truncate">
                            {e.event?.name}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate">{e.event?.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                            <span>{e.event?.start_date} → {e.event?.end_date}</span>
                          </div>
                        </div>
                      </div>
                    <span className="inline-flex w-fit rounded-full bg-background border border-border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
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
          className="fixed inset-0 bg-dark/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="relative max-w-[90vw] max-h-[90vh] bg-surface border border-border rounded-2xl shadow-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute -top-3 -right-3 bg-background border border-border rounded-full p-2 hover:bg-accent hover:text-accent-foreground transition-all"
            >
              <X className="h-4 w-4 text-primary" />
            </button>

            <img
              src={previewUrl}
              alt="Certificate preview"
              className="max-w-full max-h-[80vh] rounded-xl shadow-md"
            />
          </div>
        </div>
      )}
    </>
  );
}
