import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileClient from './ProfileClient'

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
  data: { user },
} = await supabase.auth.getUser()

if (!user) {
  redirect('/login')
}

  // Fetch everything in parallel
  const [profileRes, docsRes, regsRes] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single(),

    supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),

    supabase
      .from('player_events')
      .select(`
        status,
        events (
          id,
          name,
          start_date,
          end_date
        )
      `)
      .eq('user_id', user.id),
  ])

  if (!profileRes.data) {
    redirect('/register')
  }

  const registrations =
  regsRes.data
    ?.map((r) => ({
      status: r.status,
      event: r.events ?? null,
    }))
    .filter((r) => r.event !== null) ?? []

  return (
    <ProfileClient
      user={user}
      profile={profileRes.data}
      documents={docsRes.data ?? []}
      registrations={registrations}
    />
  )
}