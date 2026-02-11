'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import { CalendarDays, Clock, MapPin, MessageCircle, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { X } from 'lucide-react';
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

export default function EventDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showImage, setShowImage] = useState(false);
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
      // 👇 redirect to login, then back here
      router.push(`/login?redirect=/events/${id}`);
      return;
    }

    // logged in → go to registration step
    router.push(`/events/${id}/register`);
  };

if (loading) {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <p className="text-gray-400">Loading event...</p>
    </div>
  );
}

if (!event) {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <p className="text-gray-400">Event not found</p>
    </div>
  );
}

return (
  <div className={`${sans.className} min-h-screen px-4 py-8`}>
    <div className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_20%_-10%,rgba(30,41,59,0.08),transparent_60%),radial-gradient(900px_500px_at_85%_10%,rgba(15,23,42,0.06),transparent_55%),linear-gradient(180deg,#ffffff_0%,#f8fafc_60%,#ffffff_100%)]" />
    </div>

    <div className="mx-auto max-w-5xl space-y-6 rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur md:p-8">
      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          {/* Hero */}
          <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm md:p-6">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-no-repeat opacity-[0.04]"
              style={{
                backgroundImage: "url('/logo.png')",
                backgroundPosition: '85% 20%',
                backgroundSize: 'clamp(220px, 35vw, 520px) auto',
              }}
            />
            <div className="relative space-y-4">
              {event.image_url && (
                <div
                  className="relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-white cursor-zoom-in"
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
                  <span className="absolute bottom-2 right-2 text-xs bg-white/80 px-2 py-1 rounded-full shadow-sm">
                    Click to zoom
                  </span>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className={`${display.className} text-2xl text-slate-900 md:text-3xl`}>
                    {event.name}
                  </h1>
                  {(() => {
                    const today = new Date().toISOString().slice(0, 10);
                    const status =
                      event.end_date && event.end_date < today
                        ? 'Completed'
                        : event.start_date && event.start_date > today
                        ? 'Upcoming'
                        : 'Open';
                    return (
                      <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                        {status}
                      </span>
                    );
                  })()}
                </div>
                <div className="flex items-start gap-2 text-sm text-slate-700">
                  <MapPin className="h-4 w-4 mt-0.5 text-slate-400" />
                  <div>
                    <p>{event.location}</p>
                    {event.address && (
                      <p className="text-xs text-slate-500">{event.address}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <CalendarDays className="h-4 w-4 text-slate-400" />
                  <span>{event.start_date} → {event.end_date}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Details */}
          <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm md:p-6">
            <h2 className="text-sm font-semibold text-slate-800">Event Details</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {event.start_time && event.end_time && (
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span>{event.start_time} – {event.end_time}</span>
                </div>
              )}
              {event.fee_amount && (
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                  <ShieldCheck className="h-4 w-4 text-slate-400" />
                  <span>Fee: {event.fee_amount}</span>
                </div>
              )}
              {event.organizer && (
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                  <ShieldCheck className="h-4 w-4 text-slate-400" />
                  <span>{event.organizer}</span>
                </div>
              )}
              {event.support_whatsapp && (
                <a
                  href={`https://wa.me/${String(event.support_whatsapp).replace(/\D/g, '')}`}
                  target="_blank"
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <MessageCircle className="h-4 w-4 text-slate-400" />
                  <span>Support on WhatsApp</span>
                </a>
              )}
            </div>
          </section>

          {/* About */}
          {event.description && (
            <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm md:p-6">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">
                About this Event
              </h3>
              <p className="text-sm text-slate-700 whitespace-pre-line">
                {event.description}
              </p>
            </section>
          )}

          {/* Rules */}
          {event.rules_link && (
            <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm md:p-6">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">
                Rules & Guidelines
              </h3>
              <a
                href={event.rules_link}
                target="_blank"
                className="text-sm font-semibold text-slate-900 hover:underline"
              >
                View rules →
              </a>
            </section>
          )}
        </div>

        {/* CTA */}
        <aside className="md:sticky md:top-24">
          <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-600">
              <ShieldCheck className="h-4 w-4 text-slate-400" />
              Official Chess Registry Event
            </div>
            <button
              onClick={handleRegisterClick}
              className="mt-4 w-full rounded-full bg-slate-900 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800"
            >
              Register for Event
            </button>
            <p className="mt-3 text-xs text-slate-500">
              By registering, you agree to event rules.
            </p>
          </div>
        </aside>
      </div>

      {/* Image modal */}
      {showImage && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4"
          onClick={() => setShowImage(false)}
        >
          <div
            className="relative max-w-5xl w-full bg-white rounded-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowImage(false)}
              className="group absolute top-3 right-3 rounded-full bg-white shadow p-2 hover:bg-gray-100 transition"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-gray-700 group-hover:text-black transition" />
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
    </div>

);}
