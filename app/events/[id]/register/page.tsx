'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';

export default function EventRegisterPage() {
  const { id: eventId } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
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

      // Load event
      const { data: event } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (!event) {
        setLoading(false);
        return;
      }

      setEvent(event);

      // Check if already registered
      const { data: mapping } = await supabase
        .from('player_events')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();

      if (mapping) {
        setAlreadyRegistered(true);
      }

      setLoading(false);
    };

    init();
  }, [eventId, router]);

  const registerForEvent = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (!user) return;

    const { error } = await supabase.from('player_events').insert({
      user_id: user.id,
      event_id: eventId,
      status: 'pending'
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert('Registration submitted. Please complete payment.');
    setAlreadyRegistered(true);
  };

if (loading) {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <p className="text-gray-400">Loading registration...</p>
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
  <div className="min-h-screen bg-black text-white px-4 py-8">
    <div className="max-w-md mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">
          Event Registration
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Complete your registration for the event
        </p>
      </div>

      {/* Event summary */}
      <div className="bg-zinc-900 rounded-xl p-4 space-y-2 border border-zinc-800">
        <h2 className="font-semibold">{event.name}</h2>

        <p className="text-sm text-gray-400">
          {event.location}
        </p>

        <p className="text-sm text-gray-400">
          {event.start_date} → {event.end_date}
        </p>
      </div>

      {/* Registration status / CTA */}
      {alreadyRegistered ? (
        <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
          <p className="text-green-400 font-medium">
            ✅ Registration Submitted
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Your registration is pending confirmation.
          </p>
        </div>
      ) : (
        <button
          onClick={registerForEvent}
          className="w-full bg-yellow-500 text-black py-3 rounded-xl font-semibold text-lg"
        >
          Confirm Registration
        </button>
      )}

      {/* Payment instructions */}
      <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 space-y-3">
        <h3 className="font-medium">Payment Instructions</h3>

        <p className="text-sm text-gray-400">
          Please pay the registration fee via PhonePe using the QR code below.
        </p>

        <p className="text-sm text-gray-400">
          Mention your <strong>name</strong> and <strong>event name</strong>
          while making the payment.
        </p>

        {/* QR placeholder */}
        <div className="w-40 h-40 border border-zinc-700 rounded-lg flex items-center justify-center text-gray-500 text-sm">
          PhonePe QR
        </div>
      </div>

      {/* Reassurance */}
      <p className="text-xs text-gray-500 text-center">
        Registration will be confirmed after payment verification by organizers.
      </p>
    </div>
  </div>
);

}
