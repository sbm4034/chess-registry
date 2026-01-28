'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';

export default function EventDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p>Loading event...</p>;
  if (!event) return <p>Event not found</p>;

  return (
    <div style={{ padding: 40 }}>
      <h1>{event.name}</h1>

      <p>
        <strong>Location:</strong> {event.location}
      </p>

      <p>
        <strong>Dates:</strong> {event.start_date} → {event.end_date}
      </p>

      {event.registration_link && (
        <p>
          External registration:{' '}
          <a href={event.registration_link} target="_blank">
            Google Form
          </a>
        </p>
      )}

      <hr />

      <button onClick={handleRegisterClick}>
        Register for this event
      </button>
    </div>
  );
}
