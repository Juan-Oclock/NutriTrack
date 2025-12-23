"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { DateSelector } from "@/components/diary/date-selector"
import { DailySummary } from "@/components/diary/daily-summary"
import { MealSection } from "@/components/diary/meal-section"
import { Skeleton } from "@/components/ui/skeleton"
import { toDateString } from "@/lib/utils/date"
import { toast } from "sonner"
import type { DiaryEntry, QuickAddEntry, NutritionGoal, MealType } from "@/types/database"

const mealTypes: MealType[] = ["breakfast", "lunch", "dinner", "snacks"]

export default function DiaryPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([])
  const [quickAddEntries, setQuickAddEntries] = useState<QuickAddEntry[]>([])
  const [goals, setGoals] = useState<NutritionGoal | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const loadDiaryData = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const dateStr = toDateString(selectedDate)

      const { data: diaryData } = await supabase
        .from("diary_entries")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", dateStr)
        .order("logged_at", { ascending: true })

      const { data: quickAddData } = await supabase
        .from("quick_add_entries")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", dateStr)
        .order("created_at", { ascending: true })

      const { data: goalsData } = await supabase
        .from("nutrition_goals")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single()

      if (diaryData) setDiaryEntries(diaryData as DiaryEntry[])
      if (quickAddData) setQuickAddEntries(quickAddData as QuickAddEntry[])
      if (goalsData) setGoals(goalsData as NutritionGoal)
    } catch (error) {
      console.error("Error loading diary:", error)
      toast.error("Failed to load diary entries")
    } finally {
      setIsLoading(false)
    }
  }, [selectedDate, supabase])

  useEffect(() => {
    loadDiaryData()
  }, [loadDiaryData])

  const handleDeleteEntry = async (id: string, isQuickAdd: boolean) => {
    try {
      const table = isQuickAdd ? "quick_add_entries" : "diary_entries"
      const { error } = await supabase.from(table).delete().eq("id", id)

      if (error) throw error

      if (isQuickAdd) {
        setQuickAddEntries((prev) => prev.filter((e) => e.id !== id))
      } else {
        setDiaryEntries((prev) => prev.filter((e) => e.id !== id))
      }

      toast.success("Entry deleted")
    } catch (error) {
      console.error("Error deleting entry:", error)
      toast.error("Failed to delete entry")
    }
  }

  // Calculate totals
  const totals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  }

  diaryEntries.forEach((entry) => {
    totals.calories += entry.logged_calories || 0
    totals.protein += entry.logged_protein_g || 0
    totals.carbs += entry.logged_carbs_g || 0
    totals.fat += entry.logged_fat_g || 0
  })

  quickAddEntries.forEach((entry) => {
    totals.calories += entry.calories || 0
    totals.protein += entry.protein_g || 0
    totals.carbs += entry.carbs_g || 0
    totals.fat += entry.fat_g || 0
  })

  // Group entries by meal type
  const entriesByMeal = mealTypes.reduce((acc, mealType) => {
    acc[mealType] = [
      ...diaryEntries.filter((e) => e.meal_type === mealType),
      ...quickAddEntries.filter((e) => e.meal_type === mealType),
    ]
    return acc
  }, {} as Record<MealType, (DiaryEntry | QuickAddEntry)[]>)

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto pb-24">
        <Skeleton className="h-[120px] w-full" />
        <Skeleton className="h-[100px] w-full" />
        <div className="p-4 space-y-3">
          <Skeleton className="h-[100px] w-full rounded-2xl" />
          <Skeleton className="h-[100px] w-full rounded-2xl" />
          <Skeleton className="h-[100px] w-full rounded-2xl" />
          <Skeleton className="h-[100px] w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto pb-24">
      <DateSelector
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      <DailySummary
        calories={{
          consumed: totals.calories,
          goal: goals?.calories_goal || 2000,
        }}
        protein={{
          consumed: totals.protein,
          goal: goals?.protein_goal_g || 150,
        }}
        carbs={{
          consumed: totals.carbs,
          goal: goals?.carbs_goal_g || 250,
        }}
        fat={{
          consumed: totals.fat,
          goal: goals?.fat_goal_g || 65,
        }}
      />

      <div className="p-4 space-y-3">
        {mealTypes.map((mealType, index) => (
          <MealSection
            key={mealType}
            mealType={mealType}
            entries={entriesByMeal[mealType]}
            date={toDateString(selectedDate)}
            onDeleteEntry={handleDeleteEntry}
          />
        ))}
      </div>
    </div>
  )
}
