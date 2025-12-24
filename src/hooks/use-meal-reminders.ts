"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { UserSettings, MealType } from "@/types/database"

interface MealReminder {
  meal: MealType
  hour: number
  label: string
}

const MEAL_REMINDERS: MealReminder[] = [
  { meal: "breakfast", hour: 8, label: "Breakfast" },
  { meal: "lunch", hour: 12, label: "Lunch" },
  { meal: "snacks", hour: 15, label: "Snacks" },
  { meal: "dinner", hour: 19, label: "Dinner" },
]

interface UseMealRemindersReturn {
  settings: UserSettings | null
  isLoading: boolean
  isEnabled: boolean
  permissionStatus: NotificationPermission | "default"
  toggleReminders: () => Promise<boolean>
  requestPermission: () => Promise<boolean>
  checkAndShowReminder: () => Promise<void>
}

export function useMealReminders(): UseMealRemindersReturn {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | "default">("default")
  const supabase = createClient()

  // Get current permission status
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermissionStatus(Notification.permission)
    }
  }, [])

  // Fetch user settings
  const fetchSettings = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setSettings(null)
        return
      }

      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (error && error.code !== "PGRST116") {
        throw error
      }

      setSettings(data)
    } catch (error) {
      console.error("Error fetching user settings:", error)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      setPermissionStatus(permission)

      // Update settings in database
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from("user_settings")
          .upsert({
            user_id: user.id,
            notifications_permission_granted: permission === "granted",
          } as never, {
            onConflict: "user_id",
          })
      }

      return permission === "granted"
    } catch (error) {
      console.error("Error requesting permission:", error)
      return false
    }
  }, [supabase])

  // Toggle meal reminders
  const toggleReminders = useCallback(async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const newValue = !settings?.meal_reminders_enabled

      // If enabling, request permission first
      if (newValue && permissionStatus !== "granted") {
        const granted = await requestPermission()
        if (!granted) return false
      }

      const { error } = await supabase
        .from("user_settings")
        .upsert({
          user_id: user.id,
          meal_reminders_enabled: newValue,
          notifications_permission_granted: permissionStatus === "granted",
        } as never, {
          onConflict: "user_id",
        })

      if (error) throw error

      setSettings((prev) => prev ? { ...prev, meal_reminders_enabled: newValue } : null)
      return newValue
    } catch (error) {
      console.error("Error toggling reminders:", error)
      return settings?.meal_reminders_enabled ?? false
    }
  }, [settings, permissionStatus, requestPermission, supabase])

  // Check if we should show a reminder and show it
  const checkAndShowReminder = useCallback(async () => {
    if (!settings?.meal_reminders_enabled || permissionStatus !== "granted") {
      return
    }

    const now = new Date()
    const currentHour = now.getHours()
    const today = now.toISOString().split("T")[0]

    // Find the current meal based on time
    const currentMeal = MEAL_REMINDERS.find((reminder) => {
      const nextMeal = MEAL_REMINDERS.find((r) => r.hour > reminder.hour)
      const endHour = nextMeal ? nextMeal.hour : 24
      return currentHour >= reminder.hour && currentHour < endHour
    })

    if (!currentMeal) return

    // Check if user already logged food for this meal today
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: entries } = await supabase
        .from("diary_entries")
        .select("id")
        .eq("user_id", user.id)
        .eq("date", today)
        .eq("meal_type", currentMeal.meal)
        .limit(1)

      // If no entries for this meal, show reminder
      if (!entries || entries.length === 0) {
        // Check localStorage to avoid showing too frequently
        const lastReminderKey = `lastReminder_${currentMeal.meal}`
        const lastReminder = localStorage.getItem(lastReminderKey)
        const lastReminderDate = lastReminder ? new Date(lastReminder) : null

        // Only show if we haven't shown in the last 2 hours
        if (!lastReminderDate || (now.getTime() - lastReminderDate.getTime()) > 2 * 60 * 60 * 1000) {
          // Show notification via service worker
          if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: "SHOW_NOTIFICATION",
              payload: {
                title: `Time to log ${currentMeal.label}!`,
                body: `Don't forget to track your ${currentMeal.label.toLowerCase()} calories.`,
                tag: `meal-reminder-${currentMeal.meal}`,
                data: {
                  url: `/add-food?meal=${currentMeal.meal}&date=${today}`,
                },
              },
            })

            localStorage.setItem(lastReminderKey, now.toISOString())
          }
        }
      }
    } catch (error) {
      console.error("Error checking meal entries:", error)
    }
  }, [settings, permissionStatus, supabase])

  // Set up periodic check
  useEffect(() => {
    if (!settings?.meal_reminders_enabled || permissionStatus !== "granted") {
      return
    }

    // Check every 30 minutes
    const interval = setInterval(checkAndShowReminder, 30 * 60 * 1000)

    // Initial check
    checkAndShowReminder()

    return () => clearInterval(interval)
  }, [settings?.meal_reminders_enabled, permissionStatus, checkAndShowReminder])

  return {
    settings,
    isLoading,
    isEnabled: settings?.meal_reminders_enabled ?? false,
    permissionStatus,
    toggleReminders,
    requestPermission,
    checkAndShowReminder,
  }
}
