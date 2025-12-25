"use client"

import { useState, useMemo } from "react"
import { DateSelector } from "@/components/diary/date-selector"
import { DailySummary } from "@/components/diary/daily-summary"
import { MealSection } from "@/components/diary/meal-section"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { Skeleton } from "@/components/ui/skeleton"
import { toDateString, getDefaultMealType } from "@/lib/utils/date"
import { toast } from "sonner"
import { Sun, Utensils, Moon, Cookie, CalendarDays, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useDiaryData, type DiaryEntryWithFood } from "@/hooks/use-diary-data"
import { useUserId } from "@/hooks/use-user"
import type { QuickAddEntry, MealType } from "@/types/database"

const mealTypes: MealType[] = ["breakfast", "lunch", "dinner", "snacks"]

const mealOptions: { value: MealType; label: string; icon: React.ReactNode }[] = [
  { value: "breakfast", label: "Breakfast", icon: <Sun className="h-4 w-4" /> },
  { value: "lunch", label: "Lunch", icon: <Utensils className="h-4 w-4" /> },
  { value: "dinner", label: "Dinner", icon: <Moon className="h-4 w-4" /> },
  { value: "snacks", label: "Snacks", icon: <Cookie className="h-4 w-4" /> },
]

export default function DiaryPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedMeal, setSelectedMeal] = useState<MealType>(getDefaultMealType)
  const { userId, isLoading: isUserLoading } = useUserId()

  const {
    diaryEntries,
    quickAddEntries,
    goals,
    isLoading,
    isFetching,
    deleteEntry,
  } = useDiaryData(userId, selectedDate)

  const handleDeleteEntry = async (id: string, isQuickAdd: boolean) => {
    deleteEntry(
      { id, isQuickAdd },
      {
        onSuccess: () => toast.success("Entry deleted"),
        onError: () => toast.error("Failed to delete entry"),
      }
    )
  }

  // Memoize totals calculation
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

  // Calculate calories for selected meal
  const selectedMealCalories = useMemo(() => {
    return entriesByMeal[selectedMeal]?.reduce((sum, entry) => {
      if ("logged_calories" in entry) {
        return sum + (entry.logged_calories || 0)
      }
      return sum + (entry.calories || 0)
    }, 0) || 0
  }, [entriesByMeal, selectedMeal])

  // Show skeleton only on initial load (no cached data yet)
  const showInitialSkeleton = isUserLoading || (isLoading && diaryEntries.length === 0 && quickAddEntries.length === 0)

  if (showInitialSkeleton) {
    return (
      <div className="max-w-lg mx-auto pb-24">
        <Skeleton className="h-[140px] w-full" />
        <Skeleton className="h-[100px] w-full" />
        <div className="p-4 space-y-3">
          <Skeleton className="h-[48px] w-full rounded-xl" />
          <Skeleton className="h-[200px] w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto pb-24">
      <DateSelector
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        isFetching={isFetching}
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

      {/* Meal Plans Quick Access */}
      <Link href="/plans" className="block">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.98 }}
          className="mx-4 mt-4 bg-card rounded-2xl elevation-1 border border-border/50 p-4 tap-highlight"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CalendarDays className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Meal Plans</p>
                <p className="text-sm text-muted-foreground">Plan your weekly meals</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </motion.div>
      </Link>

      <div className="p-4 space-y-4">
        {/* Segmented Control */}
        <SegmentedControl
          options={mealOptions}
          value={selectedMeal}
          onChange={setSelectedMeal}
          className="w-full"
        />

        {/* Selected Meal Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold capitalize">{selectedMeal}</h2>
          <div className="text-right">
            <span className="text-2xl font-bold tabular-nums">{Math.round(selectedMealCalories)}</span>
            <span className="text-sm text-muted-foreground ml-1">cal</span>
          </div>
        </div>

        {/* Meal Content with Animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedMeal}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <MealSection
              mealType={selectedMeal}
              entries={entriesByMeal[selectedMeal]}
              date={toDateString(selectedDate)}
              onDeleteEntry={handleDeleteEntry}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
