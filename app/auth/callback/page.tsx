"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client" // wherever your supabase client is

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuth = async () => {
      const params = new URLSearchParams(window.location.search)
      const code = params.get("code")

      if (code) {
        await supabase.auth.exchangeCodeForSession(code)
      }

      router.replace("/profile")
    }

    handleAuth()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      Signing you in...
    </div>
  )
}
