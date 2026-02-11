'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import {
  Calendar,
  CheckCircle,
  CreditCard,
  IndianRupee,
  Info,
  MapPin,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Playfair_Display, Manrope } from 'next/font/google';
import { ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/react/24/outline'


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

export default function EventRegisterPage() {
  const params = useParams();
  const eventId = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [event, setEvent] = useState<any>(null);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  // ─────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        router.push(`/login?redirect=/events/${eventId}/register`);
        return;
      }

      const user = sessionData.session.user;

      // Load event
      const { data: eventData } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (!eventData) {
        setLoading(false);
        return;
      }

      setEvent(eventData);



      const { data: mapping, error } = await supabase
        .from('player_events')
        .select('user_id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .maybeSingle();

      setAlreadyRegistered(!!mapping);
      setLoading(false);
    };

    init();
  }, [eventId, router]);

  // ─────────────────────────────────────────────
  // REGISTER
  // ─────────────────────────────────────────────
  const registerForEvent = async () => {
    if (alreadyRegistered || submitting) return;

    setSubmitting(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (!user) return;

    const { error } = await supabase
      .from('player_events')
      .upsert(
        {
          user_id: user.id,
          event_id: eventId,
          status: 'pending',
        },
        { onConflict: 'user_id,event_id' }
      );

    if (!error) {
      setAlreadyRegistered(true);
    }

    setSubmitting(false);
  };

  // ─────────────────────────────────────────────
  // STATES
  // ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading registration…</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Event not found</p>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────
  return (
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

      <div className="mx-auto max-w-3xl space-y-6 rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur md:p-8">
        {/* Header */}
        <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm md:p-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-600">
            <ShieldCheck className="h-4 w-4 text-slate-400" />
            Official Chess Registry Event
          </div>
          <h1 className={`${display.className} mt-3 text-2xl text-slate-900 md:text-3xl`}>
            Event Registration
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Complete your registration for the event
          </p>
        </section>

        {/* Event Summary */}
        <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative h-24 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white md:h-24 md:w-36">
              {event.image_url ? (
                <Image
                  src={event.image_url}
                  alt={event.name}
                  width={360}
                  height={240}
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
              <h2 className="text-lg font-semibold text-slate-900">
                {event.name}
              </h2>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin size={16} className="text-slate-400" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar size={16} className="text-slate-400" />
                <span>{event.start_date} → {event.end_date}</span>
              </div>
              {event.fee_amount && (
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-800">
                  <IndianRupee size={14} className="text-amber-700" />
                  <span>Fee: {event.fee_amount}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ───────────────────────────── */}
        {/* NOT REGISTERED */}
        {/* ───────────────────────────── */}
        {!alreadyRegistered && (
          <>
            <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm md:p-6">
              <h3 className="text-sm font-semibold text-slate-800">
                Registration
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Confirm your participation in this official event.
              </p>
              <button
                onClick={registerForEvent}
                disabled={submitting}
                className="mt-4 w-full rounded-full bg-slate-900 text-white py-3 text-sm font-semibold shadow-lg shadow-slate-900/20 transition hover:bg-slate-800 disabled:opacity-60"
              >
                {submitting ? 'Registering…' : 'Confirm Registration'}
              </button>
              <p className="mt-3 text-xs text-slate-500">
                By registering, you agree to event rules.
              </p>
            </section>

            <div className="flex items-start gap-2 text-xs text-slate-500">
              <Info size={14} className="mt-0.5" />
              <p>Payment will be done after registration.</p>
            </div>
          </>
        )}

        {/* ───────────────────────────── */}
        {/* REGISTERED */}
        {/* ───────────────────────────── */}
        {alreadyRegistered && (
          <>
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 space-y-2 shadow-sm">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <CheckCircle size={18} />
                Registration already submitted
              </div>

              <p className="text-sm text-slate-600">
                Your registration is pending confirmation.
                Please complete payment or contact support if needed.
              </p>
            </div>

            {/* Payment */}
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 font-medium text-slate-900">
                <CreditCard size={18} />
                <span>Payment (Manual Verification)</span>
              </div>

              {event.fee_amount && (
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <IndianRupee size={16} />
                  <span>Amount to Pay: {event.fee_amount}</span>
                </div>
              )}

              <p className="text-sm text-slate-700">
                Please pay via PhonePe using the QR code below.
                Mention your <strong>name</strong> and <strong>event name</strong>.
              </p>

              <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="w-40 h-40 border border-slate-200 rounded-xl flex items-center justify-center bg-slate-50 text-sm text-slate-600">
                  PhonePe QR
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  UPI ID: <span className="font-semibold text-slate-900">your-upi-id@upi</span>
                  <button
                    onClick={() => navigator.clipboard.writeText('your-upi-id@upi')}
                    className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 text-center">
                  Any amount is appreciated and supports local chess activities.
                </p>
              </div>

              {event.support_whatsapp && (
                <Link
                  href={`https://wa.me/${event.support_whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  className="inline-flex items-center gap-2 text-sm text-slate-700 font-medium hover:underline"
                >
                  <ChatBubbleOvalLeftEllipsisIcon className="h-5 w-5 shrink-0" />
                    <span>Contact support on WhatsApp</span>
                </Link>
              )}
            </div>

            <div className="flex items-start gap-2 text-xs text-slate-500">
              <Info size={14} className="mt-0.5" />
              <p>
                Registration will be confirmed manually after payment verification by organizers.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
