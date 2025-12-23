"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/layout/header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Target,
  Settings,
  ChevronRight,
  LogOut,
  Apple,
  ChefHat,
  HelpCircle,
  FileText,
  Shield,
  Sun,
  Moon,
  Monitor,
} from "lucide-react"
import { toast } from "sonner"
import { getInitials } from "@/lib/utils"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { Profile, NutritionGoal } from "@/types/database"

const menuItems = [
  { href: "/profile/goals", icon: Target, label: "Nutrition Goals", color: "from-primary to-emerald-600" },
  { href: "/profile/my-foods", icon: Apple, label: "My Foods", color: "from-red-500 to-orange-500" },
  { href: "/recipes", icon: ChefHat, label: "My Recipes", color: "from-purple-500 to-pink-500" },
  { href: "/profile/settings", icon: Settings, label: "Settings", color: "from-gray-500 to-gray-600" },
]

const supportItems = [
  { href: "/help", icon: HelpCircle, label: "Help & Support" },
  { href: "/privacy", icon: Shield, label: "Privacy Policy" },
  { href: "/terms", icon: FileText, label: "Terms of Service" },
]

const themeOptions = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "dark", icon: Moon, label: "Dark" },
  { value: "system", icon: Monitor, label: "Auto" },
]

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [goals, setGoals] = useState<NutritionGoal | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        const { data: goalsData } = await supabase
          .from("nutrition_goals")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .single()

        if (profileData) setProfile(profileData as Profile)
        if (goalsData) setGoals(goalsData as NutritionGoal)
      } catch (error) {
        console.error("Error loading profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [supabase])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      toast.success("Signed out successfully")
      router.push("/login")
    } catch (error) {
      toast.error("Failed to sign out")
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto p-4 space-y-4 pb-24">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto pb-24">
      <Header title="Profile" />

      <div className="p-4 space-y-5">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-5 elevation-2"
        >
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-primary/20">
              <AvatarImage src={profile?.avatar_url || ""} />
              <AvatarFallback className="text-lg bg-primary/10 text-primary font-bold">
                {getInitials(profile?.full_name || "User")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{profile?.full_name || "User"}</h2>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
            </div>
            <Link href="/profile/edit">
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center tap-highlight"
              >
                <Settings className="h-5 w-5 text-muted-foreground" />
              </motion.div>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-border/50">
            <div className="text-center">
              <p className="text-2xl font-bold">{goals?.calories_goal || "--"}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Calories</p>
            </div>
            <div className="text-center border-x border-border/50">
              <p className="text-2xl font-bold">{profile?.current_weight_kg?.toFixed(1) || "--"}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Current kg</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{profile?.target_weight_kg?.toFixed(1) || "--"}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Goal kg</p>
            </div>
          </div>
        </motion.div>

        {/* Theme Selector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-4 elevation-1"
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Appearance</p>
          <div className="flex gap-2">
            {mounted && themeOptions.map((option) => {
              const Icon = option.icon
              const isActive = theme === option.value
              return (
                <motion.button
                  key={option.value}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTheme(option.value)}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-2 py-3 rounded-xl transition-all tap-highlight",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-muted/50 hover:bg-muted"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{option.label}</span>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Menu Items */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card rounded-2xl overflow-hidden elevation-1"
        >
          {menuItems.map((item, index) => (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center justify-between p-4 tap-highlight",
                  index < menuItems.length - 1 && "border-b border-border/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-sm",
                    item.color
                  )}>
                    <item.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-medium">{item.label}</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </motion.div>
            </Link>
          ))}
        </motion.div>

        {/* Support Items */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl overflow-hidden elevation-1"
        >
          <div className="px-4 py-3 border-b border-border/50">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Support</p>
          </div>
          {supportItems.map((item, index) => (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center justify-between p-4 tap-highlight",
                  index < supportItems.length - 1 && "border-b border-border/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </motion.div>
            </Link>
          ))}
        </motion.div>

        {/* Sign Out */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-destructive/10 text-destructive font-medium tap-highlight"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </motion.button>

        <p className="text-center text-xs text-muted-foreground pt-2">
          NutriTrack v1.0.0
        </p>
      </div>
    </div>
  )
}
