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
    // USER PROFILE
    supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single(),

    // DOCUMENTS
    supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),

    // REGISTRATIONS (NEW SYSTEM)
    supabase
  .from('registrations')
  .select(`
    id,
    payment_status,
    verification_status,
    event_id,
    events (
      id,
      name,
      start_date,
      end_date
    )
  `)
  .eq('user_id', user.id),
  ])

  // If no profile → redirect to register page
  if (!profileRes.data) {
    redirect('/register')
  }

  // Map registrations safely
  const registrations =
    regsRes.data
      ?.map((r) => ({
        payment_status: r.payment_status,
        verification_status: r.verification_status,
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