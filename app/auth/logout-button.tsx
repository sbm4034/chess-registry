"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export function LogoutButton() {
  const router = useRouter()
  const supabase = createClient();
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace("/")
    router.refresh()
  }

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  )
}