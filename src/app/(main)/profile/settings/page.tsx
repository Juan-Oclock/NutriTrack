"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/layout/header"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { Bell, Scale, Droplets, Timer, Smartphone, ChevronRight, Vibrate, Download, Share, X, Utensils, BellOff } from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useMealReminders } from "@/hooks/use-meal-reminders"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

interface Settings {
  notifications_enabled: boolean
  daily_reminder: boolean
  reminder_time: string
  water_tracking: boolean
  weight_unit: "kg" | "lb"
  haptic_feedback: boolean
}

const defaultSettings: Settings = {
  notifications_enabled: true,
  daily_reminder: true,
  reminder_time: "09:00",
  water_tracking: true,
  weight_unit: "kg",
  haptic_feedback: true,
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)
  const supabase = createClient()

  const {
    isEnabled: mealRemindersEnabled,
    permissionStatus,
    toggleReminders,
    isLoading: mealRemindersLoading,
  } = useMealReminders()

  const handleMealRemindersToggle = async () => {
    const newValue = await toggleReminders()
    if (newValue) {
      toast.success("Meal reminders enabled")
    } else if (permissionStatus === "denied") {
      toast.error("Notifications are blocked. Please enable them in your browser settings.")
    } else {
      toast.success("Meal reminders disabled")
    }
  }

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
          .from("user_settings")
          .select("*")
          .eq("user_id", user.id)
          .single()

        if (data) {
          setSettings({ ...defaultSettings, ...(data as Partial<Settings>) })
        }
      } catch (error) {
        // Use defaults if no settings exist
      } finally {
        setIsLoading(false)
      }
    }
    loadSettings()
  }, [supabase])

  useEffect(() => {
    // Check if already installed (works for both iOS and Android)
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
    const isIOSStandalone = ("standalone" in window.navigator) && (window.navigator as Navigator & { standalone: boolean }).standalone

    if (isStandalone || isIOSStandalone) {
      setIsInstalled(true)
    }

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window)
    setIsIOS(isIOSDevice)

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
      toast.success("App installed successfully!")
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      toast.error("App installation is not available")
      return
    }

    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      toast.success("Installing app...")
    }

    setDeferredPrompt(null)
  }

  const updateSetting = async <K extends keyof Settings>(key: K, value: Settings[K]) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase
        .from("user_settings")
        .upsert({
          user_id: user.id,
          [key]: value,
          updated_at: new Date().toISOString(),
        } as never)

      toast.success("Setting updated")
    } catch (error) {
      toast.error("Failed to update setting")
      setSettings(settings) // Revert
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto pb-24">
        <Header title="Settings" showBack />
        <div className="p-4 space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto pb-24">
      <Header title="Settings" showBack />

      <div className="p-4 space-y-5">
        {/* Notifications Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl overflow-hidden elevation-1"
        >
          <div className="px-4 py-3 border-b border-border/50">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Notifications</p>
          </div>

          <SettingRow
            icon={Bell}
            label="Push Notifications"
            description="Receive reminders and updates"
            action={
              <Switch
                checked={settings.notifications_enabled}
                onCheckedChange={(v) => updateSetting("notifications_enabled", v)}
              />
            }
          />

          <SettingRow
            icon={Utensils}
            label="Meal Reminders"
            description={
              permissionStatus === "denied"
                ? "Notifications blocked in browser"
                : "Get reminded when it's time to log"
            }
            action={
              permissionStatus === "denied" ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BellOff className="h-4 w-4" />
                  <span className="text-xs">Blocked</span>
                </div>
              ) : (
                <Switch
                  checked={mealRemindersEnabled}
                  onCheckedChange={handleMealRemindersToggle}
                  disabled={mealRemindersLoading}
                />
              )
            }
            border
          />

          <SettingRow
            icon={Timer}
            label="Daily Reminder"
            description="Get reminded to log meals"
            action={
              <Switch
                checked={settings.daily_reminder}
                onCheckedChange={(v) => updateSetting("daily_reminder", v)}
              />
            }
            border
          />
        </motion.div>

        {/* Tracking Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl overflow-hidden elevation-1"
        >
          <div className="px-4 py-3 border-b border-border/50">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Tracking</p>
          </div>

          <SettingRow
            icon={Droplets}
            label="Water Tracking"
            description="Track daily water intake"
            action={
              <Switch
                checked={settings.water_tracking}
                onCheckedChange={(v) => updateSetting("water_tracking", v)}
              />
            }
          />

          <SettingRow
            icon={Scale}
            label="Weight Unit"
            description={settings.weight_unit === "kg" ? "Kilograms" : "Pounds"}
            action={
              <div className="flex bg-muted rounded-lg p-1">
                {(["kg", "lb"] as const).map((unit) => (
                  <button
                    key={unit}
                    onClick={() => updateSetting("weight_unit", unit)}
                    className={cn(
                      "px-3 py-1 rounded-md text-sm font-medium transition-all",
                      settings.weight_unit === unit
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            }
            border
          />
        </motion.div>

        {/* App Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card rounded-2xl overflow-hidden elevation-1"
        >
          <div className="px-4 py-3 border-b border-border/50">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">App</p>
          </div>

          <SettingRow
            icon={Vibrate}
            label="Haptic Feedback"
            description="Vibration on interactions"
            action={
              <Switch
                checked={settings.haptic_feedback}
                onCheckedChange={(v) => updateSetting("haptic_feedback", v)}
              />
            }
          />

          {/* Android Install Button */}
          {!isInstalled && !isIOS && deferredPrompt && (
            <motion.button
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleInstallClick}
              className="w-full flex items-center justify-between p-4 border-t border-border/50 tap-highlight"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Download className="h-5 w-5 text-green-500" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Install App</p>
                  <p className="text-sm text-muted-foreground">Add to home screen</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </motion.button>
          )}

          {/* iOS Install Button */}
          {!isInstalled && isIOS && (
            <motion.button
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowIOSInstructions(true)}
              className="w-full flex items-center justify-between p-4 border-t border-border/50 tap-highlight"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Download className="h-5 w-5 text-green-500" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Install App</p>
                  <p className="text-sm text-muted-foreground">Add to home screen</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </motion.button>
          )}

          {/* iOS Instructions Modal */}
          {showIOSInstructions && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
              onClick={() => setShowIOSInstructions(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card w-full max-w-md rounded-2xl p-6 space-y-4 shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Install CalorieCue</h3>
                  <button
                    onClick={() => setShowIOSInstructions(false)}
                    className="h-8 w-8 rounded-full bg-muted flex items-center justify-center"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <p className="text-sm text-muted-foreground">
                  To install CalorieCue on your iPhone, follow these steps:
                </p>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-semibold text-primary">1</span>
                    </div>
                    <div>
                      <p className="font-medium">Tap the Share button</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        Look for the <Share className="h-4 w-4 inline" /> icon at the bottom of Safari
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-semibold text-primary">2</span>
                    </div>
                    <div>
                      <p className="font-medium">Scroll down and tap &quot;Add to Home Screen&quot;</p>
                      <p className="text-sm text-muted-foreground">You may need to scroll to find it</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-semibold text-primary">3</span>
                    </div>
                    <div>
                      <p className="font-medium">Tap &quot;Add&quot; in the top right</p>
                      <p className="text-sm text-muted-foreground">CalorieCue will appear on your home screen</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowIOSInstructions(false)}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium"
                >
                  Got it
                </button>
              </motion.div>
            </motion.div>
          )}

          <SettingRow
            icon={Smartphone}
            label="App Version"
            description="CalorieCue v1.0.0"
            action={
              isInstalled ? (
                <span className="text-sm text-green-500 flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Installed
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">Up to date</span>
              )
            }
            border
          />
        </motion.div>

        {/* Data Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl overflow-hidden elevation-1"
        >
          <div className="px-4 py-3 border-b border-border/50">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Data</p>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-between p-4 tap-highlight"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <span className="font-medium">Export Data</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-between p-4 border-t border-border/50 tap-highlight"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <svg className="h-5 w-5 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <span className="font-medium text-destructive">Delete Account</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}

function SettingRow({
  icon: Icon,
  label,
  description,
  action,
  border = false,
}: {
  icon: React.ElementType
  label: string
  description: string
  action: React.ReactNode
  border?: boolean
}) {
  return (
    <div className={cn("flex items-center justify-between p-4", border && "border-t border-border/50")}>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {action}
    </div>
  )
}
