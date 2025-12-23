import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { resend, EMAIL_FROM, isResendConfigured } from "@/lib/resend"
import WelcomeEmail from "@/emails/welcome-email"

export async function POST(request: NextRequest) {
  try {
    // Check if Resend is configured
    if (!isResendConfigured()) {
      console.warn("Resend is not configured. Skipping welcome email.")
      return NextResponse.json({ success: true, skipped: true })
    }

    const supabase = await createClient()

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile for the name
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single()

    const profileData = profile as { full_name: string | null } | null
    const userName = profileData?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0]

    // Send welcome email
    const { error: emailError } = await resend.emails.send({
      from: EMAIL_FROM,
      to: user.email!,
      subject: "Welcome to CalorieCue - Let's start your journey!",
      react: WelcomeEmail({
        userName,
      }),
    })

    if (emailError) {
      console.error("Failed to send welcome email:", emailError)
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Welcome email error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
