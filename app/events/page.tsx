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

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">Loading events...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold">Chess Events</h1>
          <p className="text-sm text-gray-400 mt-1">
            Upcoming official chess tournaments
          </p>
        </div>

        {/* Empty state */}
        {events.length === 0 && (
          <p className="text-gray-400">No upcoming events</p>
        )}

        {/* Event cards */}
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-zinc-900 rounded-xl p-4 border border-zinc-800"
            >
              <h3 className="font-semibold text-lg">
                {event.name}
              </h3>

              <p className="text-sm text-gray-400 mt-1">
                {event.location}
              </p>

              <p className="text-sm text-gray-400">
                {event.start_date} → {event.end_date}
              </p>

              <Link
                href={`/events/${event.id}`}
                className="inline-block mt-3 text-yellow-400 font-medium"
              >
                View details →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
