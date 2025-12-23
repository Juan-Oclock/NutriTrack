"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CalorieRing } from "@/components/dashboard/calorie-ring"
import { MacroBars } from "@/components/dashboard/macro-bars"
import { StreakCard } from "@/components/dashboard/streak-card"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { formatDiaryDate, toDateString } from "@/lib/utils/date"
import { ChevronRight, TrendingDown, Scale } from "lucide-react"
import Link from "next/link"
import type { Profile, NutritionGoal, UserStreak } from "@/types/database"

interface DailySummary {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [goals, setGoals] = useState<NutritionGoal | null>(null)
  const [streak, setStreak] = useState<UserStreak | null>(null)
  const [todaySummary, setTodaySummary] = useState<DailySummary>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const today = toDateString(new Date())

        // Fetch profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()
        if (profileData) setProfile(profileData as Profile)

        // Fetch goals
        const { data: goalsData } = await supabase
          .from("nutrition_goals")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .single()
        if (goalsData) setGoals(goalsData as NutritionGoal)

        // Fetch streak
        const { data: streakData } = await supabase
          .from("user_streaks")
          .select("*")
          .eq("user_id", user.id)
          .single()
        if (streakData) setStreak(streakData as UserStreak)

        // Fetch diary entries
        const { data: diaryData } = await supabase
          .from("diary_entries")
          .select("logged_calories, logged_protein_g, logged_carbs_g, logged_fat_g")
          .eq("user_id", user.id)
          .eq("date", today)

        // Fetch quick add entries
        const { data: quickAddData } = await supabase
          .from("quick_add_entries")
          .select("calories, protein_g, carbs_g, fat_g")
          .eq("user_id", user.id)
          .eq("date", today)

        // Calculate today's totals
        let totalCalories = 0
        let totalProtein = 0
        let totalCarbs = 0
        let totalFat = 0

        if (diaryData) {
          (diaryData as { logged_calories: number; logged_protein_g: number | null; logged_carbs_g: number | null; logged_fat_g: number | null }[]).forEach((entry) => {
            totalCalories += entry.logged_calories || 0
            totalProtein += entry.logged_protein_g || 0
            totalCarbs += entry.logged_carbs_g || 0
            totalFat += entry.logged_fat_g || 0
          })
        }

        if (quickAddData) {
          (quickAddData as { calories: number; protein_g: number | null; carbs_g: number | null; fat_g: number | null }[]).forEach((entry) => {
            totalCalories += entry.calories || 0
            totalProtein += entry.protein_g || 0
            totalCarbs += entry.carbs_g || 0
            totalFat += entry.fat_g || 0
          })
        }

        setTodaySummary({
          calories: totalCalories,
          protein: totalProtein,
          carbs: totalCarbs,
          fat: totalFat,
        })
      } catch (error) {
        console.error("Error loading dashboard:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [supabase])

  if (isLoading) {
    return (
      <div className="p-4 space-y-6 max-w-lg mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[200px] w-full rounded-xl" />
        <Skeleton className="h-[120px] w-full rounded-xl" />
        <Skeleton className="h-[80px] w-full rounded-xl" />
      </div>
    )
  }

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  return (
    <div className="p-4 space-y-6 max-w-lg mx-auto">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold">
          {greeting()}, {profile?.full_name?.split(" ")[0] || "there"}!
        </h1>
        <p className="text-muted-foreground">{formatDiaryDate(new Date())}</p>
      </div>

      {/* Calorie Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center">
            <CalorieRing
              consumed={todaySummary.calories}
              goal={goals?.calories_goal || 2000}
            />
            <div className="mt-6 w-full">
              <MacroBars
                protein={{
                  consumed: todaySummary.protein,
                  goal: goals?.protein_goal_g || 150,
                }}
                carbs={{
                  consumed: todaySummary.carbs,
                  goal: goals?.carbs_goal_g || 250,
                }}
                fat={{
                  consumed: todaySummary.fat,
                  goal: goals?.fat_goal_g || 65,
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Streak */}
      {streak && streak.current_streak > 0 && (
        <StreakCard
          currentStreak={streak.current_streak}
          longestStreak={streak.longest_streak}
        />
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <QuickActions />
      </div>

      {/* Weight Trend */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Scale className="h-4 w-4 text-muted-foreground" />
              Weight Trend
            </CardTitle>
            <Link href="/insights/weight">
              <Button variant="ghost" size="sm" className="text-primary">
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">
                {profile?.current_weight_kg?.toFixed(1) || "--"} kg
              </p>
              <p className="text-sm text-muted-foreground">Current weight</p>
            </div>
            {profile?.target_weight_kg && (
              <div className="text-right">
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingDown className="h-4 w-4" />
                  <span className="font-medium">
                    {(profile.current_weight_kg! - profile.target_weight_kg).toFixed(1)} kg to go
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Goal: {profile.target_weight_kg} kg
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* View Diary Link */}
      <Link href="/diary" className="block">
        <Card className="hover:border-primary/50 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium">View Food Diary</p>
                <p className="text-sm text-muted-foreground">
                  See all your meals for today
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}
