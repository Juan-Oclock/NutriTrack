"use client"

import { useEffect, useState, lazy, Suspense } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
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
import { subDays, format } from "date-fns"
import { toDateString } from "@/lib/utils/date"

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
      <div className="max-w-lg mx-auto p-4 space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    )
  }

  const caloriesDiff = averages.calories - goals.calories
  const isOverCalories = caloriesDiff > 0

  return (
    <div className="max-w-lg mx-auto">
      <Header title="Insights" />

      <div className="p-4 space-y-6">
        {/* Weekly Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              Weekly Average
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-3xl font-bold">{averages.calories}</p>
                <p className="text-sm text-muted-foreground">cal/day average</p>
              </div>
              <div className={`flex items-center gap-1 ${isOverCalories ? "text-red-500" : "text-green-500"}`}>
                {isOverCalories ? (
                  <TrendingUp className="h-5 w-5" />
                ) : (
                  <TrendingDown className="h-5 w-5" />
                )}
                <span className="font-medium">
                  {Math.abs(caloriesDiff)} {isOverCalories ? "over" : "under"}
                </span>
              </div>
            </div>

            {/* Calorie Chart - Lazy Loaded */}
            <Suspense fallback={<Skeleton className="w-full h-[150px]" />}>
              <WeeklyCalorieChart data={weeklyStats} />
            </Suspense>
          </CardContent>
        </Card>

        {/* Macro Averages */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Macro Breakdown</CardTitle>
            <CardDescription>7-day averages vs. goals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <MacroRow
              label="Protein"
              value={averages.protein}
              goal={goals.protein}
              color="bg-red-500"
            />
            <MacroRow
              label="Carbs"
              value={averages.carbs}
              goal={goals.carbs}
              color="bg-blue-500"
            />
            <MacroRow
              label="Fat"
              value={averages.fat}
              goal={goals.fat}
              color="bg-yellow-500"
            />
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">
                {weeklyStats.filter((s) => s.calories > 0 && Math.abs(s.calories - goals.calories) <= 100).length}
              </p>
              <p className="text-sm text-muted-foreground">Days on target</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Zap className="h-8 w-8 mx-auto mb-2 text-orange-500" />
              <p className="text-2xl font-bold">
                {weeklyStats.reduce((sum, s) => sum + s.calories, 0).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Total calories</p>
            </CardContent>
          </Card>
        </div>

        {/* View More Links */}
        <div className="space-y-2">
          <Link href="/profile/goals">
            <Card className="hover:border-primary/50 transition-colors">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                    <Scale className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium">Weight & Goals</p>
                    <p className="text-sm text-muted-foreground">Update your target weight</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/diary">
            <Card className="hover:border-primary/50 transition-colors">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                    <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium">Food Diary</p>
                    <p className="text-sm text-muted-foreground">View your daily meals</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}

function MacroRow({
  label,
  value,
  goal,
  color,
}: {
  label: string
  value: number
  goal: number
  color: string
}) {
  const percentage = Math.min((value / goal) * 100, 100)
  const isOver = value > goal

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className={isOver ? "text-destructive font-medium" : "text-muted-foreground"}>
          {value}g <span className="text-muted-foreground">/ {goal}g</span>
        </span>
      </div>
      <Progress
        value={percentage}
        className="h-2"
        indicatorClassName={isOver ? "bg-destructive" : color}
      />
    </div>
  )
}
