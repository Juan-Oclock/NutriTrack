import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { type EmailOtpType } from "@supabase/supabase-js"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const token_hash = searchParams.get("token_hash")
  const type = searchParams.get("type") as EmailOtpType | null
  const next = searchParams.get("next") ?? "/dashboard"

  const supabase = await createClient()
  let authError = null

  // Handle OAuth PKCE flow (code parameter)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    authError = error
  }
  // Handle email verification flow (token_hash parameter)
  else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    })
    authError = error
  }

  if (!authError && (code || token_hash)) {
    // Check if user has completed onboarding
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("goal_type, height_cm, current_weight_kg")
        .eq("id", user.id)
        .single()

      // If profile is incomplete, redirect to onboarding
      const profile = profileData as { goal_type: string | null; height_cm: number | null; current_weight_kg: number | null } | null
      if (!profile?.goal_type || !profile?.height_cm || !profile?.current_weight_kg) {
        return NextResponse.redirect(`${origin}/onboarding/welcome`)
      }
    }

    return NextResponse.redirect(`${origin}${next}`)
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
