import PlayerProfileClient from './PlayerProfileClient';
import { supabase } from '@/lib/supabase/client';

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // PLAYER
  const { data: player } = await supabase
    .from('user_profiles')
    .select(`
      id,
      name,
      city,
      state,
      role,
      bio,
      profile_photo_url
    `)
    .eq('id', id)
    .maybeSingle();

  if (!player) {
    return <p className="p-6">Player not found</p>;
  }

  // CERTIFICATES (PUBLIC ONLY)
  const { data: certificates } = await supabase
    .from('documents')
    .select('id, file_url')
    .eq('user_id', id)
    .eq('type', 'certificate')
    .eq('visibility', 'public');

  // EVENTS PARTICIPATION
  const { data: events } = await supabase
    .from('player_events')
    .select(`
      status,
      events:events (
        id,
        name,
        location,
        start_date,
        end_date
      )
    `)
    .eq('user_id', id);

  return (
    <PlayerProfileClient
      player={player}
      certificates={certificates || []}
      events={events || []}
    />
  );
}
