"use client"

import Link from "next/link"
import { Plus, Trash2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import type { MealType, QuickAddEntry } from "@/types/database"

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

const mealLabels: Record<MealType, string> = {
  breakfast: "breakfast",
  lunch: "lunch",
  dinner: "dinner",
  snacks: "snacks",
}

interface MealSectionProps {
  mealType: MealType
  entries: (DiaryEntryWithFood | QuickAddEntry)[]
  date: string
  onDeleteEntry?: (id: string, isQuickAdd: boolean) => void
}

export function MealSection({ mealType, entries, date, onDeleteEntry }: MealSectionProps) {
  return (
    <div className="space-y-2">
      {entries.length === 0 ? (
        <Link
          href={`/add-food?meal=${mealType}&date=${date}`}
          className="block"
        >
          <motion.div
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.01 }}
            className={cn(
              "py-10 text-center rounded-xl",
              "bg-muted/50",
              "border-2 border-dashed border-border/50",
              "hover:border-primary/40 hover:bg-muted/70",
              "transition-all duration-200 tap-highlight"
            )}
          >
            <div className="h-12 w-12 mx-auto mb-3 rounded-full flex items-center justify-center bg-primary/10">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground">Add Food</span>
            <p className="text-xs text-muted-foreground mt-1">
              Tap to log your {mealLabels[mealType]}
            </p>
          </motion.div>
        </Link>
      ) : (
        <>
          {entries.map((entry, index) => {
            const isQuickAdd = !("logged_calories" in entry)
            const calories = isQuickAdd
              ? (entry as QuickAddEntry).calories
              : (entry as DiaryEntryWithFood).logged_calories

            let name = "Quick Add"
            let servingInfo = ""
            let isAIDetected = false

            if (isQuickAdd) {
              const desc = (entry as QuickAddEntry).description || "Quick Add"
              name = desc
              isAIDetected = desc.includes("AI Detected")
            } else {
              const diaryEntry = entry as DiaryEntryWithFood
              if (diaryEntry.foods) {
                name = diaryEntry.foods.brand
                  ? `${diaryEntry.foods.name} (${diaryEntry.foods.brand})`
                  : diaryEntry.foods.name
                servingInfo = `${diaryEntry.servings} × ${diaryEntry.foods.serving_size}${diaryEntry.foods.serving_unit}`
              } else if (diaryEntry.user_foods) {
                name = diaryEntry.user_foods.brand
                  ? `${diaryEntry.user_foods.name} (${diaryEntry.user_foods.brand})`
                  : diaryEntry.user_foods.name
                servingInfo = `${diaryEntry.servings} × ${diaryEntry.user_foods.serving_size}${diaryEntry.user_foods.serving_unit}`
              } else if (diaryEntry.recipes) {
                name = diaryEntry.recipes.name
                servingInfo = `${diaryEntry.servings} serving${diaryEntry.servings !== 1 ? "s" : ""}`
              } else {
                name = "Food Entry"
                servingInfo = `${diaryEntry.servings} serving${diaryEntry.servings !== 1 ? "s" : ""}`
              }
            }

            return (
              <motion.div
                key={entry.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.03 }}
                className={cn(
                  "flex items-center justify-between p-3.5 rounded-xl",
                  "bg-card",
                  "border border-border/50",
                  "group hover:border-border transition-colors",
                  "elevation-1"
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">{name}</p>
                    {isAIDetected && (
                      <Sparkles className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                    )}
                  </div>
                  {!isQuickAdd && servingInfo && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {servingInfo}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="font-semibold text-sm tabular-nums">
                      {Math.round(calories)}
                    </span>
                    <span className="text-[10px] text-muted-foreground ml-0.5">cal</span>
                  </div>
                  {onDeleteEntry && (
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center",
                        "opacity-0 group-hover:opacity-100 transition-opacity",
                        "bg-destructive/10 text-destructive",
                        "tap-highlight"
                      )}
                      onClick={() => onDeleteEntry(entry.id, isQuickAdd)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )
          })}

          {/* Add more button when there are entries */}
          <Link
            href={`/add-food?meal=${mealType}&date=${date}`}
            className="block"
          >
            <motion.div
              whileTap={{ scale: 0.98 }}
              className={cn(
                "py-3 text-center rounded-xl",
                "bg-muted/30",
                "border border-dashed border-border/50",
                "hover:bg-muted/50 hover:border-primary/30",
                "transition-all tap-highlight"
              )}
            >
              <span className="text-sm font-medium text-muted-foreground">
                + Add more
              </span>
            </motion.div>
          </Link>
        </>
      )}
    </div>
  )
}
