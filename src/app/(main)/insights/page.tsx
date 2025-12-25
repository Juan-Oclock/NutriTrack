"use client"

import { useEffect, useState, lazy, Suspense } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/layout/header"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Flame,
  TrendingUp,
  TrendingDown,
  Scale,
  ChevronRight,
  Target,
  Zap,
  Award,
} from "lucide-react"
import { subDays } from "date-fns"
import { toDateString } from "@/lib/utils/date"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

// Lazy load chart component to reduce initial bundle (~80KB savings)
const WeeklyCalorieChart = lazy(() =>
  import("@/components/charts/weekly-calorie-chart").then(mod => ({ default: mod.WeeklyCalorieChart }))
)

interface DailyStats {
  date: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

export default function InsightsPage() {
  const [weeklyStats, setWeeklyStats] = useState<DailyStats[]>([])
  const [averages, setAverages] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  })
  const [goals, setGoals] = useState({
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 65,
  })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadInsights() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Get last 7 days of data
        const dates = Array.from({ length: 7 }, (_, i) =>
          toDateString(subDays(new Date(), 6 - i))
        )

        const { data: diaryData } = await supabase
          .from("diary_entries")
          .select("date, logged_calories, logged_protein_g, logged_carbs_g, logged_fat_g")
          .eq("user_id", user.id)
          .gte("date", dates[0])
          .lte("date", dates[6])

        const { data: quickAddData } = await supabase
          .from("quick_add_entries")
          .select("date, calories, protein_g, carbs_g, fat_g")
          .eq("user_id", user.id)
          .gte("date", dates[0])
          .lte("date", dates[6])

        const { data: goalsData } = await supabase
          .from("nutrition_goals")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .single()

        if (goalsData) {
          const g = goalsData as { calories_goal: number; protein_goal_g: number; carbs_goal_g: number; fat_goal_g: number }
          setGoals({
            calories: g.calories_goal,
            protein: g.protein_goal_g,
            carbs: g.carbs_goal_g,
            fat: g.fat_goal_g,
          })
        }

        // Aggregate by date
        const statsMap: Record<string, DailyStats> = {}
        dates.forEach((date) => {
          statsMap[date] = { date, calories: 0, protein: 0, carbs: 0, fat: 0 }
        })

        type DiaryEntryData = { date: string; logged_calories: number; logged_protein_g: number | null; logged_carbs_g: number | null; logged_fat_g: number | null }
        type QuickAddData = { date: string; calories: number; protein_g: number | null; carbs_g: number | null; fat_g: number | null }

        if (diaryData) {
          (diaryData as DiaryEntryData[]).forEach((entry) => {
            if (statsMap[entry.date]) {
              statsMap[entry.date].calories += entry.logged_calories || 0
              statsMap[entry.date].protein += entry.logged_protein_g || 0
              statsMap[entry.date].carbs += entry.logged_carbs_g || 0
              statsMap[entry.date].fat += entry.logged_fat_g || 0
            }
          })
        }

        if (quickAddData) {
          (quickAddData as QuickAddData[]).forEach((entry) => {
            if (statsMap[entry.date]) {
              statsMap[entry.date].calories += entry.calories || 0
              statsMap[entry.date].protein += entry.protein_g || 0
              statsMap[entry.date].carbs += entry.carbs_g || 0
              statsMap[entry.date].fat += entry.fat_g || 0
            }
          })
        }

        const stats = Object.values(statsMap)
        setWeeklyStats(stats)

        // Calculate averages
        const daysWithData = stats.filter((s) => s.calories > 0).length || 1
        setAverages({
          calories: Math.round(stats.reduce((sum, s) => sum + s.calories, 0) / daysWithData),
          protein: Math.round(stats.reduce((sum, s) => sum + s.protein, 0) / daysWithData),
          carbs: Math.round(stats.reduce((sum, s) => sum + s.carbs, 0) / daysWithData),
          fat: Math.round(stats.reduce((sum, s) => sum + s.fat, 0) / daysWithData),
        })
      } catch (error) {
        console.error("Error loading insights:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadInsights()
  }, [supabase])

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto">
        <Header title="Insights" />
        <div className="p-4 space-y-4">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  const caloriesDiff = averages.calories - goals.calories
  const isOverCalories = caloriesDiff > 0
  const daysOnTarget = weeklyStats.filter((s) => s.calories > 0 && Math.abs(s.calories - goals.calories) <= 100).length
  const totalCalories = weeklyStats.reduce((sum, s) => sum + s.calories, 0)

  return (
    <div className="max-w-lg mx-auto pb-24">
      <Header title="Insights" />

      <div className="p-4 space-y-4">
        {/* Weekly Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl elevation-1 border border-border/50 p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Flame className="h-4 w-4 text-orange-500" />
            </div>
            <h2 className="font-semibold">Weekly Average</h2>
          </div>

          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-4xl font-bold tabular-nums">{averages.calories}</p>
              <p className="text-sm text-muted-foreground">cal/day average</p>
            </div>
            <div className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium",
              isOverCalories
                ? "bg-red-500/10 text-red-600 dark:text-red-400"
                : "bg-green-500/10 text-green-600 dark:text-green-400"
            )}>
              {isOverCalories ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>
                {Math.abs(caloriesDiff)} {isOverCalories ? "over" : "under"}
              </span>
            </div>
          </div>

          {/* Calorie Chart - Lazy Loaded */}
          <Suspense fallback={<Skeleton className="w-full h-[150px] rounded-xl" />}>
            <WeeklyCalorieChart data={weeklyStats} />
          </Suspense>
        </motion.div>

        {/* Macro Averages */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-card rounded-2xl elevation-1 border border-border/50 p-5"
        >
          <div className="mb-4">
            <h2 className="font-semibold">Macro Breakdown</h2>
            <p className="text-sm text-muted-foreground">7-day averages vs. goals</p>
          </div>

          <div className="space-y-4">
            <MacroRow
              label="Protein"
              value={averages.protein}
              goal={goals.protein}
              color="bg-rose-500"
              bgColor="bg-rose-500/10"
            />
            <MacroRow
              label="Carbs"
              value={averages.carbs}
              goal={goals.carbs}
              color="bg-blue-500"
              bgColor="bg-blue-500/10"
            />
            <MacroRow
              label="Fat"
              value={averages.fat}
              goal={goals.fat}
              color="bg-amber-500"
              bgColor="bg-amber-500/10"
            />
          </div>
        </motion.div>

        {/* Quick Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-3"
        >
          <div className="bg-card rounded-2xl elevation-1 border border-border/50 p-4 text-center">
            <div className="h-12 w-12 mx-auto mb-2 rounded-xl bg-primary/10 flex items-center justify-center">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <p className="text-3xl font-bold tabular-nums">{daysOnTarget}</p>
            <p className="text-xs text-muted-foreground mt-1">Days on target</p>
          </div>
          <div className="bg-card rounded-2xl elevation-1 border border-border/50 p-4 text-center">
            <div className="h-12 w-12 mx-auto mb-2 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Zap className="h-6 w-6 text-orange-500" />
            </div>
            <p className="text-3xl font-bold tabular-nums">{totalCalories.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Total calories</p>
          </div>
        </motion.div>

        {/* Navigation Links - iOS style */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card rounded-2xl elevation-1 border border-border/50 divide-y divide-border/50"
        >
          <Link href="/profile/goals" className="block">
            <motion.div
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-between p-4 tap-highlight"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Scale className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">Weight & Goals</p>
                  <p className="text-sm text-muted-foreground">Update your target weight</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </motion.div>
          </Link>

          <Link href="/diary" className="block">
            <motion.div
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-between p-4 tap-highlight"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Award className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">Food Diary</p>
                  <p className="text-sm text-muted-foreground">View your daily meals</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

function MacroRow({
  label,
  value,
  goal,
  color,
  bgColor,
}: {
  label: string
  value: number
  goal: number
  color: string
  bgColor: string
}) {
  const percentage = Math.min((value / goal) * 100, 100)
  const isOver = value > goal

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-medium">{label}</span>
        <span className={cn(
          "text-sm tabular-nums",
          isOver ? "text-destructive font-semibold" : "text-muted-foreground"
        )}>
          {value}g <span className="text-muted-foreground font-normal">/ {goal}g</span>
        </span>
      </div>
      <div className={cn("h-2.5 rounded-full overflow-hidden", bgColor)}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={cn(
            "h-full rounded-full",
            isOver ? "bg-destructive" : color
          )}
        />
      </div>
    </div>
  )
}
