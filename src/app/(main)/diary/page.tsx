"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { DateSelector } from "@/components/diary/date-selector"
import { DailySummary } from "@/components/diary/daily-summary"
import { MealSection } from "@/components/diary/meal-section"
import { Skeleton } from "@/components/ui/skeleton"
import { toDateString } from "@/lib/utils/date"
import { toast } from "sonner"
import type { QuickAddEntry, NutritionGoal, MealType } from "@/types/database"

// Extended type for diary entries with joined food data
interface DiaryEntryWithFood {
  id: string
  meal_type: MealType
  logged_at: string
  logged_calories: number
  logged_protein_g: number | null
  logged_carbs_g: number | null
  logged_fat_g: number | null
  servings: number
  foods: { name: string; brand: string | null; serving_size: number; serving_unit: string } | null
  user_foods: { name: string; brand: string | null; serving_size: number; serving_unit: string } | null
  recipes: { name: string } | null
}

const mealTypes: MealType[] = ["breakfast", "lunch", "dinner", "snacks"]

export default function DiaryPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntryWithFood[]>([])
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

      // Fetch all data in parallel for better performance
      const [
        { data: diaryData },
        { data: quickAddData },
        { data: goalsData }
      ] = await Promise.all([
        supabase
          .from("diary_entries")
          .select(`
            id, meal_type, logged_at, logged_calories, logged_protein_g, logged_carbs_g, logged_fat_g, servings,
            foods (name, brand, serving_size, serving_unit),
            user_foods (name, brand, serving_size, serving_unit),
            recipes (name)
          `)
          .eq("user_id", user.id)
          .eq("date", dateStr)
          .order("logged_at", { ascending: true }),
        supabase
          .from("quick_add_entries")
          .select("id, meal_type, created_at, calories, protein_g, carbs_g, fat_g, description")
          .eq("user_id", user.id)
          .eq("date", dateStr)
          .order("created_at", { ascending: true }),
        supabase
          .from("nutrition_goals")
          .select("calories_goal, protein_goal_g, carbs_goal_g, fat_goal_g")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .single()
      ])

      if (diaryData) setDiaryEntries(diaryData as DiaryEntryWithFood[])
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

  // Memoize totals calculation to avoid recalculating on every render
  const totals = useMemo(() => {
    const result = { calories: 0, protein: 0, carbs: 0, fat: 0 }

    diaryEntries.forEach((entry) => {
      result.calories += entry.logged_calories || 0
      result.protein += entry.logged_protein_g || 0
      result.carbs += entry.logged_carbs_g || 0
      result.fat += entry.logged_fat_g || 0
    })

    quickAddEntries.forEach((entry) => {
      result.calories += entry.calories || 0
      result.protein += entry.protein_g || 0
      result.carbs += entry.carbs_g || 0
      result.fat += entry.fat_g || 0
    })

    return result
  }, [diaryEntries, quickAddEntries])

  // Memoize entries grouped by meal type
  const entriesByMeal = useMemo(() => {
    return mealTypes.reduce((acc, mealType) => {
      acc[mealType] = [
        ...diaryEntries.filter((e) => e.meal_type === mealType),
        ...quickAddEntries.filter((e) => e.meal_type === mealType),
      ]
      return acc
    }, {} as Record<MealType, (DiaryEntryWithFood | QuickAddEntry)[]>)
  }, [diaryEntries, quickAddEntries])

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
