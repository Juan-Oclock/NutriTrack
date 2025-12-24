"use client"

import { useState, useEffect } from "react"
import { Bell, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useMealReminders } from "@/hooks/use-meal-reminders"
import { createClient } from "@/lib/supabase/client"

const PROMPT_DISMISSED_KEY = "notificationPromptDismissed"
const PROMPT_DELAY_MS = 30000 // Show after 30 seconds of app usage
const MIN_SESSIONS_BEFORE_PROMPT = 2

export function PermissionPrompt() {
  const [show, setShow] = useState(false)
  const { isEnabled, permissionStatus, toggleReminders, isLoading } = useMealReminders()
  const supabase = createClient()

  useEffect(() => {
    // Don't show if notifications are already enabled or permission denied
    if (isEnabled || permissionStatus === "denied" || permissionStatus === "granted") {
      return
    }

    // Check if prompt was previously dismissed
    const dismissed = localStorage.getItem(PROMPT_DISMISSED_KEY)
    if (dismissed) {
      const dismissedDate = new Date(dismissed)
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24)
      // Don't show again for 7 days after dismissal
      if (daysSinceDismissed < 7) {
        return
      }
    }

    // Track session count
    const sessionCount = parseInt(localStorage.getItem("sessionCount") || "0", 10)
    localStorage.setItem("sessionCount", String(sessionCount + 1))

    // Wait for minimum sessions and some time before showing
    if (sessionCount < MIN_SESSIONS_BEFORE_PROMPT) {
      return
    }

    // Check if user is logged in
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Show prompt after delay
      const timer = setTimeout(() => {
        setShow(true)
      }, PROMPT_DELAY_MS)

      return () => clearTimeout(timer)
    }

    checkAuth()
  }, [isEnabled, permissionStatus, supabase])

  const handleEnable = async () => {
    await toggleReminders()
    setShow(false)
  }

  const handleDismiss = () => {
    localStorage.setItem(PROMPT_DISMISSED_KEY, new Date().toISOString())
    setShow(false)
  }

  if (isLoading) return null

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-20 left-4 right-4 z-50 max-w-lg mx-auto"
        >
          <div className="bg-card rounded-2xl p-4 elevation-3 border border-border/50">
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 h-7 w-7 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>

            <div className="flex items-start gap-3 pr-8">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Bell className="h-5 w-5 text-primary" />
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-sm">Enable Meal Reminders?</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Get notified when it&apos;s time to log your breakfast, lunch, or dinner.
                </p>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleEnable}
                    className="flex-1 py-2 px-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
                  >
                    Enable
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="py-2 px-3 bg-muted text-muted-foreground rounded-lg text-sm font-medium"
                  >
                    Not now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
