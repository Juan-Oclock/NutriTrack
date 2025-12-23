"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  User,
  Target,
  Scale,
  Settings,
  ChevronRight,
  LogOut,
  Apple,
  ChefHat,
  Bell,
  HelpCircle,
  FileText,
  Shield,
} from "lucide-react"
import { toast } from "sonner"
import { getInitials } from "@/lib/utils"
import type { Profile, NutritionGoal } from "@/types/database"

const menuItems = [
  { href: "/profile/goals", icon: Target, label: "Nutrition Goals" },
  { href: "/profile/my-foods", icon: Apple, label: "My Foods" },
  { href: "/recipes", icon: ChefHat, label: "My Recipes" },
  { href: "/profile/settings", icon: Settings, label: "Settings" },
]

const supportItems = [
  { href: "/help", icon: HelpCircle, label: "Help & Support" },
  { href: "/privacy", icon: Shield, label: "Privacy Policy" },
  { href: "/terms", icon: FileText, label: "Terms of Service" },
]

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [goals, setGoals] = useState<NutritionGoal | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

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
      <div className="max-w-lg mx-auto p-4 space-y-4">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <Header title="Profile" />

      <div className="p-4 space-y-6">
        {/* Profile Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="text-lg">
                  {getInitials(profile?.full_name || "User")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{profile?.full_name || "User"}</h2>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
              </div>
              <Link href="/profile/edit">
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </Link>
            </div>

            <Separator className="my-4" />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{goals?.calories_goal || "--"}</p>
                <p className="text-xs text-muted-foreground">Daily Calories</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{profile?.current_weight_kg?.toFixed(1) || "--"}</p>
                <p className="text-xs text-muted-foreground">Current (kg)</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{profile?.target_weight_kg?.toFixed(1) || "--"}</p>
                <p className="text-xs text-muted-foreground">Goal (kg)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <Card>
          <CardContent className="p-0">
            {menuItems.map((item, index) => (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center justify-between p-4 hover:bg-muted/50 transition-colors ${
                  index < menuItems.length - 1 ? "border-b border-border" : ""
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Support Items */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium">
              Support
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {supportItems.map((item, index) => (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center justify-between p-4 hover:bg-muted/50 transition-colors ${
                  index < supportItems.length - 1 ? "border-b border-border" : ""
                }`}>
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Sign Out */}
        <Button
          variant="outline"
          className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          NutriTrack v1.0.0
        </p>
      </div>
    </div>
  )
}
