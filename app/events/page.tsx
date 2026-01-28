'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      const { data } = await supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: true });

      setEvents(data || []);
      setLoading(false);
    };

    loadEvents();
  }, []);

  if (loading) return <p>Loading events...</p>;

  return (
    <div style={{ padding: 40 }}>
      <h1>Chess Events</h1>

      {events.length === 0 && <p>No upcoming events</p>}

      <ul>
        {events.map((event) => (
          <li key={event.id} style={{ marginBottom: 16 }}>
            <h3>{event.name}</h3>
            <p>
              {event.location} | {event.start_date} → {event.end_date}
            </p>

            <Link href={`/events/${event.id}`}>
              View details
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
