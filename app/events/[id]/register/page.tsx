'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import {
  Calendar,
  CheckCircle,
  CreditCard,
  IndianRupee,
  Info,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/react/24/outline';
import { PrimaryButton } from '@/app/components/ui/PrimaryButton';
import { Card } from '@/app/components/ui/Card';
import { Section } from '@/app/components/ui/Section';

export default function EventRegisterPage() {
  const supabase = createClient();
  const params = useParams();
  const eventId = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [event, setEvent] = useState<any>(null);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        router.push(`/login?redirect=/events/${eventId}/register`);
        return;
      }

      const user = sessionData.session.user;

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

      const { data: mapping } = await supabase
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
        { onConflict: 'user_id,event_id' },
      );

    if (!error) {
      setAlreadyRegistered(true);
    }

    setSubmitting(false);
  };

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

  return (
    <div className="min-h-screen px-4 py-8 font-sans bg-surface-base">
      <Section className="py-6">
        <div className="mx-auto max-w-3xl space-y-6 rounded-3xl border border-surface-warm bg-white/80 p-4 shadow-sm backdrop-blur md:p-8">
          <Card className="p-5 md:p-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-600">
              <ShieldCheck className="h-4 w-4 text-gray-400" />
              Official Chess Registry Event
            </div>
            <h1 className="font-serif mt-3 text-2xl text-text-default md:text-3xl">
              Event Registration
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Complete your registration for the event
            </p>
          </Card>

          <Card className="p-5 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative h-24 w-full overflow-hidden rounded-2xl border border-surface-warm bg-white md:h-24 md:w-36">
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
                    className="flex h-full w-full items-center justify-center bg-surface-warm text-xs text-gray-500"
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
                <h2 className="text-lg font-semibold text-text-default">
                  {event.name}
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={16} className="text-gray-400" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={16} className="text-gray-400" />
                  <span>
                    {event.start_date} → {event.end_date}
                  </span>
                </div>
                {event.fee_amount && (
                  <div className="inline-flex items-center gap-2 rounded-full bg-brand-gold/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-dark">
                    <IndianRupee size={14} className="text-brand-dark" />
                    <span>Fee: {event.fee_amount}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {!alreadyRegistered && (
            <>
              <Card className="p-5 md:p-6">
                <h3 className="text-sm font-semibold text-gray-700">Registration</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Confirm your participation in this official event.
                </p>
                <PrimaryButton
                  onClick={registerForEvent}
                  disabled={submitting}
                  className="mt-4 w-full py-3 text-sm font-semibold shadow-lg shadow-brand-primary/10 disabled:opacity-60"
                >
                  {submitting ? 'Registering…' : 'Confirm Registration'}
                </PrimaryButton>
                <p className="mt-3 text-xs text-gray-500">
                  By registering, you agree to event rules.
                </p>
              </Card>

              <div className="flex items-start gap-2 text-xs text-gray-500">
                <Info size={14} className="mt-0.5" />
                <p>Payment will be done after registration.</p>
              </div>
            </>
          )}

          {alreadyRegistered && (
            <>
              <Card className="p-5 space-y-2">
                <div className="flex items-center gap-2 text-gray-700 font-medium">
                  <CheckCircle size={18} />
                  Registration already submitted
                </div>

                <p className="text-sm text-gray-600">
                  Your registration is pending confirmation. Please complete payment or contact support if needed.
                </p>
              </Card>

              <Card className="p-5 space-y-4">
                <div className="flex items-center gap-2 font-medium text-text-default">
                  <CreditCard size={18} />
                  <span>Payment (Manual Verification)</span>
                </div>

                {event.fee_amount && (
                  <div className="flex items-center gap-2 text-sm font-semibold text-text-default">
                    <IndianRupee size={16} />
                    <span>Amount to Pay: {event.fee_amount}</span>
                  </div>
                )}

                <p className="text-sm text-gray-700">
                  Please pay via PhonePe using the QR code below. Mention your <strong>name</strong> and{' '}
                  <strong>event name</strong>.
                </p>

                <div className="flex flex-col items-center gap-3 rounded-2xl border border-surface-warm bg-white p-4">
                  <div className="w-40 h-40 border border-surface-warm rounded-xl flex items-center justify-center bg-surface-base text-sm text-gray-600">
                    PhonePe QR
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    UPI ID:
                    <span className="font-semibold text-text-default">your-upi-id@upi</span>
                    <button
                      onClick={() => navigator.clipboard.writeText('your-upi-id@upi')}
                      className="rounded-full border border-surface-warm bg-white px-2 py-0.5 text-[10px] font-semibold text-gray-700 hover:bg-surface-base"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-500 text-center">
                    Any amount is appreciated and supports local chess activities.
                  </p>
                </div>

                {event.support_whatsapp && (
                  <Link
                    href={`https://wa.me/${event.support_whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    className="inline-flex items-center gap-2 text-sm text-gray-700 font-medium hover:underline"
                  >
                    <ChatBubbleOvalLeftEllipsisIcon className="h-5 w-5 shrink-0" />
                    <span>Contact support on WhatsApp</span>
                  </Link>
                )}
              </Card>

              <div className="flex items-start gap-2 text-xs text-gray-500">
                <Info size={14} className="mt-0.5" />
                <p>Registration will be confirmed manually after payment verification by organizers.</p>
              </div>
            </>
          )}
        </div>
      </Section>
    </div>
  );
}
