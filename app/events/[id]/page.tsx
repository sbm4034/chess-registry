'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import { CalendarDays, Clock, MapPin, MessageCircle, ShieldCheck, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function EventDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showImage, setShowImage] = useState(false);
  const supabase = createClient();
  
  useEffect(() => {
    const loadEvent = async () => {
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      setEvent(data);
      setLoading(false);
    };

    loadEvent();
  }, [id]);

  const handleRegisterClick = async () => {
    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session) {
      router.push(`/login?redirect=/events/${id}`);
      return;
    }

    router.push(`/events/${id}/register`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-primary flex items-center justify-center">
        <p className="text-muted-foreground">Loading event...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background text-primary flex items-center justify-center">
        <p className="text-muted-foreground">Event not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans">
      <section className="relative min-h-[50vh]">
        <div className="absolute inset-0">
          <Image
            src="/chess_hero_banner.png"
            alt="Event banner"
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
              Verified tournaments and registration details for official competition.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-background">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
            <div className="space-y-6">
              <div className="bg-surface border border-border rounded-xl shadow-sm p-5">
                <div className="space-y-4">
                  {event.image_url && (
                    <div
                      className="relative w-full overflow-hidden rounded-xl border border-border bg-surface cursor-zoom-in"
                      onClick={() => setShowImage(true)}
                    >
                      <Image
                        src={event.image_url}
                        alt={event.name}
                        width={1200}
                        height={700}
                        className="h-56 w-full object-cover md:h-64"
                        priority
                      />
                      <span className="absolute bottom-2 right-2 text-xs bg-background/80 px-2 py-1 rounded-full shadow-sm">
                        Click to zoom
                      </span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-serif text-2xl text-primary md:text-3xl">
                        {event.name}
                      </h2>
                      {(() => {
                        const today = new Date().toISOString().slice(0, 10);
                        const status =
                          event.end_date && event.end_date < today
                            ? 'Completed'
                            : event.start_date && event.start_date > today
                            ? 'Upcoming'
                            : 'Open';
                        return (
                          <span className="rounded-full bg-accent text-accent-foreground px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider">
                            {status}
                          </span>
                        );
                      })()}
                    </div>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p>{event.location}</p>
                        {event.address && (
                          <p className="text-xs text-muted-foreground">{event.address}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {event.start_date} → {event.end_date}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-surface border border-border rounded-xl shadow-sm p-5">
                <h2 className="text-sm font-semibold text-primary">Event Details</h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {event.start_time && event.end_time && (
                    <div className="flex items-center gap-2 rounded-xl border border-border bg-background p-3 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {event.start_time} – {event.end_time}
                      </span>
                    </div>
                  )}
                  {event.fee_amount && (
                    <div className="flex items-center gap-2 rounded-xl border border-border bg-background p-3 text-sm text-muted-foreground">
                      <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                      <span>Fee: {event.fee_amount}</span>
                    </div>
                  )}
                  {event.organizer && (
                    <div className="flex items-center gap-2 rounded-xl border border-border bg-background p-3 text-sm text-muted-foreground">
                      <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                      <span>{event.organizer}</span>
                    </div>
                  )}
                  {event.support_whatsapp && (
                    <a
                      href={`https://wa.me/${String(event.support_whatsapp).replace(/\D/g, '')}`}
                      target="_blank"
                      className="flex items-center gap-2 rounded-xl border border-border bg-background p-3 text-sm text-muted-foreground transition hover:shadow-sm"
                    >
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      <span>Support on WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>

              {event.description && (
                <div className="bg-surface border border-border rounded-xl shadow-sm p-5">
                  <h3 className="text-sm font-semibold text-primary mb-2">
                    About this Event
                  </h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {event.description}
                  </p>
                </div>
              )}

              {event.rules_link && (
                <div className="bg-surface border border-border rounded-xl shadow-sm p-5">
                  <h3 className="text-sm font-semibold text-primary mb-2">
                    Rules & Guidelines
                  </h3>
                  <a
                    href={event.rules_link}
                    target="_blank"
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    View rules →
                  </a>
                </div>
              )}
            </div>

            <aside className="md:sticky md:top-24">
              <div className="bg-surface border border-border rounded-xl shadow-sm p-5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  Official Chess Registry Event
                </div>
                <button
                  onClick={handleRegisterClick}
                  className="mt-4 w-full rounded-full bg-primary text-primary-foreground py-3 text-sm font-medium hover:opacity-90 transition"
                >
                  Register for Event
                </button>
                <p className="mt-3 text-xs text-muted-foreground">
                  By registering, you agree to event rules.
                </p>
              </div>
            </aside>
          </div>

          {showImage && (
            <div
              className="fixed inset-0 z-50 bg-dark/70 flex items-center justify-center px-4"
              onClick={() => setShowImage(false)}
            >
              <div
                className="relative max-w-5xl w-full bg-background rounded-2xl p-2"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowImage(false)}
                  className="group absolute top-3 right-3 rounded-full bg-background shadow p-2 hover:bg-surface transition"
                  aria-label="Close"
                >
                  <X className="w-4 h-4 text-primary group-hover:text-primary transition" />
                </button>

                <Image
                  src={event.image_url}
                  alt={event.name}
                  width={1600}
                  height={1200}
                  className="w-full h-auto object-contain max-h-[85vh]"
                />
              </div>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
