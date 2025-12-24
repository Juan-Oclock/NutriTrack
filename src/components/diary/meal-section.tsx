"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Sun, Utensils, Moon, Cookie, ChevronDown, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
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

const mealConfig: Record<MealType, { icon: React.ElementType; gradient: string }> = {
  breakfast: { icon: Sun, gradient: "from-amber-500 to-orange-500" },
  lunch: { icon: Utensils, gradient: "from-emerald-500 to-teal-500" },
  dinner: { icon: Moon, gradient: "from-indigo-500 to-purple-500" },
  snacks: { icon: Cookie, gradient: "from-pink-500 to-rose-500" },
}

const mealLabels: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snacks: "Snacks",
}

interface MealSectionProps {
  mealType: MealType
  entries: (DiaryEntryWithFood | QuickAddEntry)[]
  date: string
  onDeleteEntry?: (id: string, isQuickAdd: boolean) => void
}

export function MealSection({ mealType, entries, date, onDeleteEntry }: MealSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const { icon: Icon, gradient } = mealConfig[mealType]

  const totalCalories = entries.reduce((sum, entry) => {
    if ("logged_calories" in entry) {
      return sum + (entry.logged_calories || 0)
    }
    return sum + (entry.calories || 0)
  }, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl overflow-hidden elevation-1"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-3 tap-highlight"
        >
          <div className={cn(
            "h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-sm",
            gradient
          )}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div className="text-left">
            <p className="font-semibold">{mealLabels[mealType]}</p>
            <p className="text-xs text-muted-foreground">
              {entries.length} {entries.length === 1 ? "item" : "items"}
            </p>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </motion.div>
        </motion.button>
        <div className="flex items-center gap-2">
          <span className="font-bold tabular-nums text-lg">
            {Math.round(totalCalories)}
            <span className="text-xs font-normal text-muted-foreground ml-0.5">cal</span>
          </span>
          <Link href={`/add-food?meal=${mealType}&date=${date}`}>
            <motion.div
              whileTap={{ scale: 0.9 }}
              className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center tap-highlight"
            >
              <Plus className="h-5 w-5 text-primary" />
            </motion.div>
          </Link>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {entries.length === 0 ? (
                <Link
                  href={`/add-food?meal=${mealType}&date=${date}`}
                  className="block"
                >
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    className="py-6 text-center rounded-xl border-2 border-dashed border-border/50 hover:border-primary/30 transition-colors tap-highlight"
                  >
                    <Plus className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Add Food</span>
                  </motion.div>
                </Link>
              ) : (
                <div className="space-y-2">
                  {entries.map((entry) => {
                    const isQuickAdd = !("logged_calories" in entry)
                    const calories = isQuickAdd
                      ? (entry as QuickAddEntry).calories
                      : (entry as DiaryEntryWithFood).logged_calories

                    let name = "Quick Add"
                    let servingInfo = ""
                    if (isQuickAdd) {
                      name = (entry as QuickAddEntry).description || "Quick Add"
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
                        servingInfo = `${diaryEntry.servings} serving${diaryEntry.servings !== 1 ? 's' : ''}`
                      } else {
                        name = "Food Entry"
                        servingInfo = `${diaryEntry.servings} serving${diaryEntry.servings !== 1 ? 's' : ''}`
                      }
                    }

                    return (
                      <motion.div
                        key={entry.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-muted/30 group"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{name}</p>
                          {!isQuickAdd && servingInfo && (
                            <p className="text-xs text-muted-foreground">
                              {servingInfo}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm tabular-nums">
                            {Math.round(calories)}
                          </span>
                          {onDeleteEntry && (
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              className="h-7 w-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 md:opacity-0 group-active:opacity-100 transition-opacity bg-destructive/10 text-destructive tap-highlight"
                              onClick={() => onDeleteEntry(entry.id, isQuickAdd)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </motion.button>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
