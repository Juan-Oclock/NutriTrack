"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/layout/header"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { Bell, Scale, Droplets, Timer, Smartphone, ChevronRight, Vibrate, Download, Share, X, Utensils, BellOff, Loader2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useMealReminders } from "@/hooks/use-meal-reminders"
import { setHapticEnabled, hapticSuccess } from "@/lib/haptics"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
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

    // Update localStorage for haptic feedback
    if (key === "haptic_feedback") {
      setHapticEnabled(value as boolean)
      if (value) hapticSuccess()
    }

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

  // Export user data
  const handleExportData = async () => {
    setIsExporting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("You must be logged in")
        return
      }

      // Fetch all user data
      const [
        { data: profile },
        { data: diaryEntries },
        { data: quickAddEntries },
        { data: weightLogs },
        { data: recipes },
        { data: userFoods },
        { data: nutritionGoals },
      ] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("diary_entries").select("*").eq("user_id", user.id),
        supabase.from("quick_add_entries").select("*").eq("user_id", user.id),
        supabase.from("weight_logs").select("*").eq("user_id", user.id),
        supabase.from("recipes").select("*, recipe_ingredients(*)").eq("user_id", user.id),
        supabase.from("user_foods").select("*").eq("user_id", user.id),
        supabase.from("nutrition_goals").select("*").eq("user_id", user.id),
      ])

      const exportData = {
        exportDate: new Date().toISOString(),
        profile,
        nutritionGoals,
        diaryEntries,
        quickAddEntries,
        weightLogs,
        recipes,
        userFoods,
      }

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `caloriecue-export-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success("Data exported successfully!")
      hapticSuccess()
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Failed to export data")
    } finally {
      setIsExporting(false)
    }
  }

  // Delete account
  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      toast.error("Please type DELETE to confirm")
      return
    }

    setIsDeleting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("You must be logged in")
        return
      }

      // Delete all user data in order (respecting foreign keys)
      await Promise.all([
        supabase.from("quick_add_entries").delete().eq("user_id", user.id),
        supabase.from("diary_entries").delete().eq("user_id", user.id),
        supabase.from("weight_logs").delete().eq("user_id", user.id),
        supabase.from("meal_scans").delete().eq("user_id", user.id),
        supabase.from("user_streaks").delete().eq("user_id", user.id),
        supabase.from("notifications").delete().eq("user_id", user.id),
        supabase.from("user_settings").delete().eq("user_id", user.id),
        supabase.from("nutrition_goals").delete().eq("user_id", user.id),
      ])

      // Delete recipes (need to delete ingredients first)
      const { data: userRecipes } = await supabase.from("recipes").select("id").eq("user_id", user.id)
      if (userRecipes && userRecipes.length > 0) {
        const recipeIds = (userRecipes as { id: string }[]).map(r => r.id)
        await supabase.from("recipe_ingredients").delete().in("recipe_id", recipeIds)
        await supabase.from("recipes").delete().eq("user_id", user.id)
      }

      // Delete user foods
      await supabase.from("user_foods").delete().eq("user_id", user.id)

      // Delete profile (this should cascade or be handled by Supabase auth)
      await supabase.from("profiles").delete().eq("id", user.id)

      // Sign out and redirect
      await supabase.auth.signOut()
      toast.success("Account deleted successfully")
      window.location.href = "/login"
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Failed to delete account. Please contact support.")
    } finally {
      setIsDeleting(false)
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
            onClick={handleExportData}
            disabled={isExporting}
            className="w-full flex items-center justify-between p-4 tap-highlight disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                {isExporting ? (
                  <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                ) : (
                  <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                )}
              </div>
              <span className="font-medium">{isExporting ? "Exporting..." : "Export Data"}</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowDeleteModal(true)}
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

        {/* Delete Account Modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
              onClick={() => !isDeleting && setShowDeleteModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card w-full max-w-md rounded-2xl p-6 space-y-4 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Delete Account</h3>
                    <p className="text-sm text-muted-foreground">This action cannot be undone</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>Deleting your account will permanently remove:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>All your diary entries and food logs</li>
                    <li>Your custom foods and recipes</li>
                    <li>Weight tracking history</li>
                    <li>All settings and preferences</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Type <span className="text-destructive font-bold">DELETE</span> to confirm
                  </label>
                  <Input
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="Type DELETE"
                    className="rounded-xl"
                    disabled={isDeleting}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl"
                    onClick={() => {
                      setShowDeleteModal(false)
                      setDeleteConfirmation("")
                    }}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 rounded-xl"
                    onClick={handleDeleteAccount}
                    disabled={isDeleting || deleteConfirmation !== "DELETE"}
                  >
                    {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isDeleting ? "Deleting..." : "Delete Account"}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
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
