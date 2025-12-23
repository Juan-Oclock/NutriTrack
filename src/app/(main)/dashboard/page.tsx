"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"
import { CalorieRing } from "@/components/dashboard/calorie-ring"
import { MacroBars } from "@/components/dashboard/macro-bars"
import { StreakCard } from "@/components/dashboard/streak-card"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { formatDiaryDate, toDateString } from "@/lib/utils/date"
import { ChevronRight, TrendingDown, Scale, BookOpen, ChartBar } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
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
      <div className="p-4 space-y-6 max-w-lg mx-auto pb-24">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-[280px] w-full rounded-3xl" />
        <Skeleton className="h-[80px] w-full rounded-2xl" />
        <Skeleton className="h-[140px] w-full rounded-2xl" />
      </div>
    )
  }

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  const firstName = profile?.full_name?.split(" ")[0] || "there"

  return (
    <div className="p-4 space-y-5 max-w-lg mx-auto pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-2"
      >
        <p className="text-muted-foreground text-sm">{formatDiaryDate(new Date())}</p>
        <h1 className="text-2xl font-bold tracking-tight">
          {greeting()}, {firstName}
        </h1>
      </motion.div>

      {/* Main Calorie Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-3xl p-6 elevation-2"
      >
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
      </motion.div>

      {/* Streak */}
      {streak && streak.current_streak > 0 && (
        <StreakCard
          currentStreak={streak.current_streak}
          longestStreak={streak.longest_streak}
        />
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
          Log Food
        </h2>
        <QuickActions />
      </motion.div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-2 gap-3"
      >
        {/* View Diary */}
        <Link href="/diary" className="tap-highlight">
          <motion.div
            whileTap={{ scale: 0.97 }}
            className="bg-card rounded-2xl p-4 elevation-1 flex flex-col gap-3"
          >
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Food Diary</p>
              <p className="text-xs text-muted-foreground">View meals</p>
            </div>
          </motion.div>
        </Link>

        {/* Insights */}
        <Link href="/insights" className="tap-highlight">
          <motion.div
            whileTap={{ scale: 0.97 }}
            className="bg-card rounded-2xl p-4 elevation-1 flex flex-col gap-3"
          >
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <ChartBar className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="font-medium text-sm">Insights</p>
              <p className="text-xs text-muted-foreground">Weekly stats</p>
            </div>
          </motion.div>
        </Link>
      </motion.div>

      {/* Weight Card */}
      {profile?.current_weight_kg && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Link href="/insights/weight" className="tap-highlight block">
            <motion.div
              whileTap={{ scale: 0.98 }}
              className="bg-card rounded-2xl p-4 elevation-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <Scale className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold tracking-tight">
                      {profile.current_weight_kg.toFixed(1)}
                      <span className="text-sm font-normal text-muted-foreground ml-1">kg</span>
                    </p>
                    <p className="text-xs text-muted-foreground">Current weight</p>
                  </div>
                </div>
                {profile.target_weight_kg && (
                  <div className="text-right flex items-center gap-2">
                    <div>
                      <div className="flex items-center gap-1 text-primary">
                        <TrendingDown className="h-4 w-4" />
                        <span className="font-semibold text-sm">
                          {Math.abs(profile.current_weight_kg - profile.target_weight_kg).toFixed(1)} kg
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">to goal</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>
            </motion.div>
          </Link>
        </motion.div>
      )}
    </div>
  )
}
