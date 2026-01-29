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
  <div className="min-h-screen bg-black text-white px-4 py-8">
    <div className="max-w-md mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">
          {event.name}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Official chess tournament
        </p>
      </div>

      {/* Event Details Card */}
      <div className="bg-zinc-900 rounded-xl p-4 space-y-3 border border-zinc-800">
        <div>
          <p className="text-sm text-gray-400">Location</p>
          <p>{event.location}</p>
        </div>

        <div>
          <p className="text-sm text-gray-400">Dates</p>
          <p>
            {event.start_date} → {event.end_date}
          </p>
        </div>
      </div>

      {/* External registration (optional) */}
      {event.registration_link && (
        <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
          <p className="text-sm text-gray-400 mb-1">
            External Registration
          </p>
          <a
            href={event.registration_link}
            target="_blank"
            className="text-yellow-400 font-medium"
          >
            Open Google Form →
          </a>
        </div>
      )}

      {/* Register CTA */}
      <button
        onClick={handleRegisterClick}
        className="w-full bg-yellow-500 text-black py-3 rounded-xl font-semibold text-lg"
      >
        Register for this Event
      </button>

      {/* Reassurance */}
      <p className="text-xs text-gray-500 text-center">
        Registration confirmation is subject to document and payment verification.
      </p>
    </div>
  </div>
);

}
