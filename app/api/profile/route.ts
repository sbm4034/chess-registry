import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const supabase = await createClient()

  const body = await request.json()
  const { user_id, name, role, phone, city } = body

  const { error } = await supabase
    .from("user_profiles")
    .insert([{ id: user_id, name, role, phone, city }])

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}