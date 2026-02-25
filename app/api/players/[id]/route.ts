import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("user_profiles")
    .select(`
      id,
      name,
      city,
      state,
      role,
      bio,
      profile_photo_url
    `)
    .eq("id", id)
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: "Profile not found" },
      { status: 404 }
    )
  }

  return NextResponse.json(data)
}