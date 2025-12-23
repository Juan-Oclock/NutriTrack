import { NextRequest, NextResponse } from "next/server"
import { Webhook } from "standardwebhooks"
import { resend, EMAIL_FROM, isResendConfigured } from "@/lib/resend"

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, webhook-id, webhook-timestamp, webhook-signature",
    },
  })
}

// Supabase Auth Hook types - payload structure from Send Email Hook
interface AuthHookPayload {
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
    email_action_type: "signup" | "recovery" | "invite" | "magiclink" | "email_change" | "reauthentication"
    site_url: string
    token_new?: string
    token_hash_new?: string
  }
}

export async function POST(request: NextRequest) {
  console.log("=== Auth Hook POST started ===")

  try {
    // Check if Resend is configured
    console.log("Checking Resend configuration...")
    if (!isResendConfigured()) {
      console.warn("Resend is not configured. Auth hook will not send emails.")
      return NextResponse.json({ success: true, skipped: true })
    }
    console.log("Resend is configured")

    // Verify the webhook signature using Standard Webhooks
    const webhookSecret = process.env.SUPABASE_AUTH_HOOK_SECRET
    console.log("Webhook secret exists:", !!webhookSecret)
    if (!webhookSecret) {
      console.error("SUPABASE_AUTH_HOOK_SECRET is not configured")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    // Extract the base64 secret (remove 'v1,whsec_' prefix)
    const base64Secret = webhookSecret.replace("v1,whsec_", "")
    console.log("Creating Webhook instance...")
    const wh = new Webhook(base64Secret)
    console.log("Webhook instance created")

    // Get the raw body and headers for verification
    console.log("Reading request body...")
    const body = await request.text()
    console.log("Request body length:", body.length)

    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      headers[key] = value
    })
    console.log("Headers collected:", Object.keys(headers).join(", "))

    let payload: AuthHookPayload
    try {
      console.log("Verifying webhook signature...")
      const verified = wh.verify(body, headers)
      console.log("Webhook verified successfully")
      console.log("Auth hook payload received:", JSON.stringify(verified, null, 2))
      payload = verified as AuthHookPayload
    } catch (err) {
      console.error("Webhook verification failed:", err)
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 })
    }

    const { user, email_data } = payload

    // Defensive checks for payload structure
    if (!user || !email_data) {
      console.error("Invalid payload structure - missing user or email_data:", { user: !!user, email_data: !!email_data })
      return NextResponse.json({ error: "Invalid payload structure" }, { status: 400 })
    }

    const type = email_data.email_action_type
    if (!type) {
      console.error("Missing email_action_type in payload. email_data keys:", Object.keys(email_data))
      return NextResponse.json({ error: "Missing email action type" }, { status: 400 })
    }

    console.log("Processing email hook - type:", type, "user:", user?.email, "token_hash:", email_data.token_hash?.substring(0, 10) + "...")

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
      ? `https://${process.env.NEXT_PUBLIC_APP_URL.replace(/^https?:\/\//, "")}`
      : "https://caloriecue.juan-oclock.com"

    let emailResult

    switch (type) {
      case "signup": {
        // Build the confirmation URL
        const confirmationUrl = `${baseUrl}/auth/callback?token_hash=${email_data.token_hash}&type=signup`

        console.log("Sending signup email to:", user.email, "with URL:", confirmationUrl)

        try {
          emailResult = await resend.emails.send({
            from: EMAIL_FROM,
            to: user.email,
            subject: "Verify your email for CalorieCue",
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #22c55e;">Welcome to CalorieCue!</h1>
                <p>Thanks for signing up. Please verify your email address by clicking the button below:</p>
                <a href="${confirmationUrl}" style="display: inline-block; background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Verify Email</a>
                <p style="color: #666; font-size: 14px;">Or copy this link: ${confirmationUrl}</p>
              </div>
            `,
          })
          console.log("Email send result:", emailResult)
        } catch (emailError) {
          console.error("Email send error:", emailError instanceof Error ? { message: emailError.message, stack: emailError.stack } : emailError)
          throw emailError
        }
        break
      }

      case "recovery": {
        // Build the password reset URL
        const resetUrl = `${baseUrl}/auth/callback?token_hash=${email_data.token_hash}&type=recovery`

        console.log("Sending recovery email to:", user.email)

        try {
          emailResult = await resend.emails.send({
            from: EMAIL_FROM,
            to: user.email,
            subject: "Reset your CalorieCue password",
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #22c55e;">Reset Your Password</h1>
                <p>Click the button below to reset your password:</p>
                <a href="${resetUrl}" style="display: inline-block; background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Reset Password</a>
                <p style="color: #666; font-size: 14px;">Or copy this link: ${resetUrl}</p>
              </div>
            `,
          })
        } catch (emailError) {
          console.error("Email send error:", emailError)
          throw emailError
        }
        break
      }

      case "magiclink": {
        // Build the magic link URL
        const magicLinkUrl = `${baseUrl}/auth/callback?token_hash=${email_data.token_hash}&type=magiclink`

        console.log("Sending magiclink email to:", user.email)

        try {
          emailResult = await resend.emails.send({
            from: EMAIL_FROM,
            to: user.email,
            subject: "Sign in to CalorieCue",
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #22c55e;">Sign In to CalorieCue</h1>
                <p>Click the button below to sign in:</p>
                <a href="${magicLinkUrl}" style="display: inline-block; background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Sign In</a>
                <p style="color: #666; font-size: 14px;">Or copy this link: ${magicLinkUrl}</p>
              </div>
            `,
          })
        } catch (emailError) {
          console.error("Email send error:", emailError)
          throw emailError
        }
        break
      }

      case "email_change": {
        // Build the email change confirmation URL
        const emailChangeUrl = `${baseUrl}/auth/callback?token_hash=${email_data.token_hash}&type=email_change`

        console.log("Sending email_change email to:", user.email)

        try {
          emailResult = await resend.emails.send({
            from: EMAIL_FROM,
            to: user.email,
            subject: "Confirm your new email for CalorieCue",
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #22c55e;">Confirm Email Change</h1>
                <p>Click the button below to confirm your new email address:</p>
                <a href="${emailChangeUrl}" style="display: inline-block; background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Confirm Email</a>
                <p style="color: #666; font-size: 14px;">Or copy this link: ${emailChangeUrl}</p>
              </div>
            `,
          })
        } catch (emailError) {
          console.error("Email send error:", emailError)
          throw emailError
        }
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

    if (emailResult?.data) {
      console.log("Email sent successfully:", emailResult.data)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Auth hook error:", error instanceof Error ? { message: error.message, stack: error.stack } : error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
