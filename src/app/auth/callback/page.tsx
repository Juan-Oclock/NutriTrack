"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle, Leaf, ExternalLink, Smartphone } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import type { EmailOtpType } from "@supabase/supabase-js"

type VerificationState = "loading" | "success" | "error"
type VerificationType = "signup" | "recovery" | "magiclink" | "email_change" | "oauth"

function AuthCallbackContent() {
  const [state, setState] = useState<VerificationState>("loading")
  const [errorMessage, setErrorMessage] = useState("")
  const [verificationType, setVerificationType] = useState<VerificationType>("signup")
  const [redirectPath, setRedirectPath] = useState("/dashboard")
  const [isIOS, setIsIOS] = useState(false)
  const [isPWAInstalled, setIsPWAInstalled] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    // Detect platform
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window)
    setIsIOS(isIOSDevice)

    // Detect if PWA is installed (works on some browsers)
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
      || (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    setIsPWAInstalled(isStandalone)
  }, [])

  useEffect(() => {
    async function handleAuth() {
      const code = searchParams.get("code")
      const token_hash = searchParams.get("token_hash")
      const type = searchParams.get("type") as EmailOtpType | null
      const next = searchParams.get("next") ?? "/dashboard"

      try {
        let authError = null

        // Handle OAuth PKCE flow (code parameter)
        if (code) {
          setVerificationType("oauth")
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          authError = error
        }
        // Handle email verification flow (token_hash parameter)
        else if (token_hash && type) {
          setVerificationType(type as VerificationType)
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type,
          })
          authError = error
        } else {
          // No valid parameters
          setErrorMessage("Invalid verification link")
          setState("error")
          return
        }

        if (authError) {
          console.error("Auth error:", authError)
          setErrorMessage(authError.message || "Verification failed")
          setState("error")
          return
        }

        // Check if user has completed onboarding
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("goal_type, height_cm, current_weight_kg")
            .eq("id", user.id)
            .single()

          const profile = profileData as { goal_type: string | null; height_cm: number | null; current_weight_kg: number | null } | null
          if (!profile?.goal_type || !profile?.height_cm || !profile?.current_weight_kg) {
            setRedirectPath("/onboarding/welcome")
          } else {
            setRedirectPath(next)
          }
        }

        setState("success")
      } catch (error) {
        console.error("Callback error:", error)
        setErrorMessage("An unexpected error occurred")
        setState("error")
      }
    }

    handleAuth()
  }, [searchParams, supabase, router])

  const getSuccessTitle = () => {
    switch (verificationType) {
      case "signup":
        return "Email Verified!"
      case "recovery":
        return "Password Reset Ready"
      case "magiclink":
        return "Signed In!"
      case "email_change":
        return "Email Updated!"
      case "oauth":
        return "Signed In!"
      default:
        return "Success!"
    }
  }

  const getSuccessDescription = () => {
    switch (verificationType) {
      case "signup":
        return "Your account is ready. Continue to set up your profile."
      case "recovery":
        return "You can now set a new password."
      case "magiclink":
        return "You've been signed in successfully."
      case "email_change":
        return "Your email has been updated."
      case "oauth":
        return "You've been signed in successfully."
      default:
        return "You can now continue."
    }
  }

  const handleOpenInApp = () => {
    // Simply navigate to the redirect path
    // The PWA and browser share the same session
    window.location.href = redirectPath
  }

  const handleContinueInBrowser = () => {
    router.push(redirectPath)
  }

  // Loading state
  if (state === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="h-16 w-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Verifying...</h1>
            <p className="text-muted-foreground mt-1">Please wait a moment</p>
          </div>
        </motion.div>
      </div>
    )
  }

  // Error state
  if (state === "error") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-6"
        >
          {/* Logo */}
          <div className="flex justify-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">CalorieCue</span>
            </Link>
          </div>

          {/* Error Card */}
          <div className="bg-card rounded-2xl overflow-hidden elevation-1">
            <div className="p-6 text-center space-y-4">
              <div className="h-16 w-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Verification Failed</h1>
                <p className="text-muted-foreground mt-2">{errorMessage}</p>
              </div>
            </div>
            <div className="p-4 border-t border-border/50 space-y-3">
              <Button
                onClick={() => router.push("/login")}
                className="w-full h-12 rounded-xl"
              >
                Go to Sign In
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/register")}
                className="w-full h-12 rounded-xl"
              >
                Create New Account
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // Success state
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-6"
      >
        {/* Logo */}
        <div className="flex justify-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">CalorieCue</span>
          </Link>
        </div>

        {/* Success Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl overflow-hidden elevation-1"
        >
          <div className="p-6 text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="h-20 w-20 mx-auto rounded-full bg-primary flex items-center justify-center"
            >
              <CheckCircle className="h-10 w-10 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{getSuccessTitle()}</h1>
              <p className="text-muted-foreground mt-2">{getSuccessDescription()}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-border/50 space-y-3">
            {/* Primary action - Open in App */}
            <Button
              onClick={handleOpenInApp}
              className="w-full h-14 rounded-xl text-base font-semibold shadow-lg shadow-primary/25"
            >
              <Smartphone className="h-5 w-5 mr-2" />
              Open CalorieCue App
            </Button>

            {/* Secondary action - Continue in Browser */}
            <Button
              variant="outline"
              onClick={handleContinueInBrowser}
              className="w-full h-12 rounded-xl"
            >
              Continue in Browser
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </motion.div>

        {/* PWA Install Hint */}
        {!isPWAInstalled && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-2xl p-4 elevation-1"
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Don&apos;t have the app?</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isIOS
                    ? "Tap Share → Add to Home Screen in Safari"
                    : "Tap the menu → Install app in your browser"
                  }
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* iOS-specific instructions */}
        {isIOS && !isPWAInstalled && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-amber-500/10 rounded-2xl p-4 border border-amber-500/20"
          >
            <p className="text-sm text-amber-700 dark:text-amber-400 text-center">
              <strong>Note:</strong> On iPhone, the app will open in a new browser tab.
              For the best experience, install CalorieCue to your Home Screen.
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

// Loading fallback for Suspense
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Loading...</h1>
          <p className="text-muted-foreground mt-1">Please wait a moment</p>
        </div>
      </div>
    </div>
  )
}

// Wrap with Suspense for useSearchParams
export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthCallbackContent />
    </Suspense>
  )
}
