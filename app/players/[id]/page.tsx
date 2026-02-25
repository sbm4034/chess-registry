import PlayerProfileClient from './PlayerProfileClient'
import { createClient } from '@/lib/supabase/server'

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()

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
    .maybeSingle()

  if (!player) {
    return (
      <div className="bg-background min-h-screen py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="rounded-2xl border border-border bg-surface p-6 text-primary">
            Player not found
          </p>
        </div>
      </div>
    )
  }

  // CERTIFICATES (PUBLIC ONLY)
  const { data: certificates } = await supabase
    .from('documents')
    .select('id, file_url')
    .eq('user_id', id)
    .eq('type', 'certificate')
    .eq('visibility', 'public')

  // EVENTS PARTICIPATION
  const { data } = await supabase
  .from('player_events')
  .select(`
    status,
    events!player_events_event_id_fkey (
      id,
      name,
      location,
      start_date,
      end_date
    )
  `)
  .eq('user_id', id)

const events =
  data?.map((e) => ({
    status: e.status,
    event: Array.isArray(e.events) ? e.events[0] : e.events,
  })).filter((e) => e.event !== null) ?? []

  return (
    <div className="bg-background min-h-screen py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <PlayerProfileClient
          player={player}
          certificates={certificates || []}
          events={events || []}
        />
      </div>
    </div>
  )
}