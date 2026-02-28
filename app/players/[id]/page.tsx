import PlayerProfileClient from './PlayerProfileClient'
import { createClient } from '@/lib/supabase/server'

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  /* ───────────────────────────────────────────── */
  /* PLAYER */
  /* ───────────────────────────────────────────── */

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

  /* ───────────────────────────────────────────── */
  /* PUBLIC CERTIFICATES */
  /* ───────────────────────────────────────────── */

  const { data: certificates } = await supabase
    .from('documents')
    .select('id, file_url')
    .eq('user_id', id)
    .eq('type', 'certificate')
    .eq('visibility', 'public')

  /* ───────────────────────────────────────────── */
  /* APPROVED EVENT PARTICIPATION ONLY */
  /* ───────────────────────────────────────────── */

  const { data: registrations } = await supabase
    .from('registrations')
    .select(`
      id,
      verification_status,
      events (
        id,
        name,
        location,
        start_date,
        end_date
      )
    `)
    .eq('user_id', id)
    .eq('verification_status', 'approved')

  // Filter safely + optional upcoming filter
  const today = new Date().toISOString().split('T')[0]

const events =
  registrations
    ?.map((r) => r.events?.[0])
    .filter(Boolean)
    .filter((event) => event!.end_date && event!.end_date >= today) ?? []

  return (
    <div className="bg-background min-h-screen py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <PlayerProfileClient
          player={player}
          certificates={certificates || []}
          events={events}
        />
      </div>
    </div>
  )
}