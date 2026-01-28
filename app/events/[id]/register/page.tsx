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

  if (loading) return <p>Loading...</p>;
  if (!event) return <p>Event not found</p>;

  return (
    <div style={{ padding: 40 }}>
      <h1>Register for Event</h1>

      <h2>{event.name}</h2>
      <p>{event.location}</p>
      <p>
        {event.start_date} → {event.end_date}
      </p>

      <hr />

      {alreadyRegistered ? (
        <p>
          ✅ You have already registered for this event.
          <br />
          Status: <strong>Pending confirmation</strong>
        </p>
      ) : (
        <button onClick={registerForEvent}>
          Confirm Registration
        </button>
      )}

      <hr />

      <h3>Payment Instructions</h3>

      <p>
        Please pay the registration fee via PhonePe using the QR code
        below.
      </p>

      <p>
        <strong>Important:</strong> Mention your name and event name
        while making the payment.
      </p>

      <p>
        Registration will be confirmed after payment verification.
      </p>

      {/* Placeholder for QR */}
      <div
        style={{
          width: 200,
          height: 200,
          border: '1px solid #ccc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 10
        }}
      >
        PhonePe QR
      </div>
    </div>
  );
}
