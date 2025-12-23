import { NextRequest, NextResponse } from "next/server"
import { Webhook } from "standardwebhooks"
import { resend, EMAIL_FROM, isResendConfigured } from "@/lib/resend"
import VerificationEmail from "@/emails/verification-email"
import PasswordResetEmail from "@/emails/password-reset-email"

// Supabase Auth Hook types
interface AuthHookPayload {
  type: "signup" | "recovery" | "invite" | "magiclink" | "email_change" | "reauthentication"
  user: {
    id: string
    email: string
    user_metadata?: {
      full_name?: string
    }
  }
  email_data: {
    token: string
    token_hash: string
    redirect_to: string
    email_action_type: string
    site_url: string
    token_new?: string
    token_hash_new?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if Resend is configured
    if (!isResendConfigured()) {
      console.warn("Resend is not configured. Auth hook will not send emails.")
      return NextResponse.json({ success: true, skipped: true })
    }

    // Verify the webhook signature using Standard Webhooks
    const webhookSecret = process.env.SUPABASE_AUTH_HOOK_SECRET
    if (!webhookSecret) {
      console.error("SUPABASE_AUTH_HOOK_SECRET is not configured")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    // Extract the base64 secret (remove 'v1,whsec_' prefix)
    const base64Secret = webhookSecret.replace("v1,whsec_", "")
    const wh = new Webhook(base64Secret)

    // Get the raw body and headers for verification
    const body = await request.text()
    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      headers[key] = value
    })

    let payload: AuthHookPayload
    try {
      payload = wh.verify(body, headers) as AuthHookPayload
    } catch (err) {
      console.error("Webhook verification failed:", err)
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 })
    }

    const { type, user, email_data } = payload

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
      ? `https://${process.env.NEXT_PUBLIC_APP_URL.replace(/^https?:\/\//, "")}`
      : "https://caloriecue.juan-oclock.com"

    let emailResult

    switch (type) {
      case "signup": {
        // Build the confirmation URL
        const confirmationUrl = `${baseUrl}/auth/callback?token_hash=${email_data.token_hash}&type=signup`

        emailResult = await resend.emails.send({
          from: EMAIL_FROM,
          to: user.email,
          subject: "Verify your email for CalorieCue",
          react: VerificationEmail({
            confirmationUrl,
            userEmail: user.email,
          }),
        })

        // Also send welcome email after a short delay (they'll get it after verifying)
        // We could also trigger this from auth callback instead
        break
      }

      case "recovery": {
        // Build the password reset URL
        const resetUrl = `${baseUrl}/auth/callback?token_hash=${email_data.token_hash}&type=recovery`

        emailResult = await resend.emails.send({
          from: EMAIL_FROM,
          to: user.email,
          subject: "Reset your CalorieCue password",
          react: PasswordResetEmail({
            resetUrl,
            userEmail: user.email,
          }),
        })
        break
      }

      case "magiclink": {
        // Build the magic link URL
        const magicLinkUrl = `${baseUrl}/auth/callback?token_hash=${email_data.token_hash}&type=magiclink`

        emailResult = await resend.emails.send({
          from: EMAIL_FROM,
          to: user.email,
          subject: "Sign in to CalorieCue",
          react: VerificationEmail({
            confirmationUrl: magicLinkUrl,
            userEmail: user.email,
          }),
        })
        break
      }

      case "email_change": {
        // Build the email change confirmation URL
        const emailChangeUrl = `${baseUrl}/auth/callback?token_hash=${email_data.token_hash}&type=email_change`

        emailResult = await resend.emails.send({
          from: EMAIL_FROM,
          to: user.email,
          subject: "Confirm your new email for CalorieCue",
          react: VerificationEmail({
            confirmationUrl: emailChangeUrl,
            userEmail: user.email,
          }),
        })
        break
      }

      case "invite":
      case "reauthentication":
        // Handle other types if needed
        console.log(`Auth hook received for type: ${type}`)
        break

      default:
        console.log(`Unhandled auth hook type: ${type}`)
    }

    if (emailResult?.error) {
      console.error("Failed to send email:", emailResult.error)
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Auth hook error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
