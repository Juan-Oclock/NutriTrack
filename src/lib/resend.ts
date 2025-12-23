import { Resend } from "resend"

// Use a placeholder key during build if not set
const apiKey = process.env.RESEND_API_KEY || "re_placeholder"

export const resend = new Resend(apiKey)

export const isResendConfigured = (): boolean => {
  return !!process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "re_placeholder"
}

export const EMAIL_FROM = process.env.RESEND_FROM_EMAIL || "CalorieCue <noreply@caloriecue.juan-oclock.com>"

export type EmailType = "verification" | "password_reset" | "welcome"
