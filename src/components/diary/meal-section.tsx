"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Sun, Utensils, Moon, Cookie, ChevronUp, Trash2, Sparkles } from "lucide-react"
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

const mealConfig: Record<MealType, {
  icon: React.ElementType
  gradient: string
  bgGradient: string
  lightBg: string
}> = {
  breakfast: {
    icon: Sun,
    gradient: "from-amber-400 to-orange-500",
    bgGradient: "from-amber-500/10 to-orange-500/5",
    lightBg: "bg-amber-500/10"
  },
  lunch: {
    icon: Utensils,
    gradient: "from-emerald-400 to-teal-500",
    bgGradient: "from-emerald-500/10 to-teal-500/5",
    lightBg: "bg-emerald-500/10"
  },
  dinner: {
    icon: Moon,
    gradient: "from-indigo-400 to-purple-500",
    bgGradient: "from-indigo-500/10 to-purple-500/5",
    lightBg: "bg-indigo-500/10"
  },
  snacks: {
    icon: Cookie,
    gradient: "from-pink-400 to-rose-500",
    bgGradient: "from-pink-500/10 to-rose-500/5",
    lightBg: "bg-pink-500/10"
  },
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
  const { icon: Icon, gradient, bgGradient, lightBg } = mealConfig[mealType]

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
      className={cn(
        "rounded-2xl overflow-hidden",
        "bg-gradient-to-br",
        bgGradient,
        "border border-border/40"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-3 tap-highlight"
        >
          <div className={cn(
            "h-11 w-11 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
            gradient
          )}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-[15px]">{mealLabels[mealType]}</p>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              </motion.div>
            </div>
            <p className="text-xs text-muted-foreground">
              {entries.length} {entries.length === 1 ? "item" : "items"}
            </p>
          </div>
        </motion.button>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="font-bold tabular-nums text-xl">
              {Math.round(totalCalories)}
            </span>
            <span className="text-xs font-medium text-muted-foreground ml-0.5">cal</span>
          </div>
          <Link href={`/add-food?meal=${mealType}&date=${date}`}>
            <motion.div
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center tap-highlight",
                "bg-gradient-to-br shadow-md",
                gradient
              )}
            >
              <Plus className="h-5 w-5 text-white" strokeWidth={2.5} />
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
            transition={{ duration: 0.25, ease: "easeInOut" }}
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
                    whileHover={{ scale: 1.01 }}
                    className={cn(
                      "py-8 text-center rounded-xl",
                      "bg-background/60 backdrop-blur-sm",
                      "border-2 border-dashed border-border/50",
                      "hover:border-primary/40 hover:bg-background/80",
                      "transition-all duration-200 tap-highlight"
                    )}
                  >
                    <div className={cn(
                      "h-12 w-12 mx-auto mb-3 rounded-full flex items-center justify-center",
                      lightBg
                    )}>
                      <Plus className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">Add Food</span>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Tap to log your {mealType}
                    </p>
                  </motion.div>
                </Link>
              ) : (
                <div className="space-y-2">
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
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ delay: index * 0.03 }}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-xl",
                          "bg-background/70 backdrop-blur-sm",
                          "border border-border/30",
                          "group hover:bg-background/90 transition-colors"
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
                        "py-2.5 text-center rounded-xl",
                        "bg-background/40",
                        "border border-dashed border-border/40",
                        "hover:bg-background/60 hover:border-primary/30",
                        "transition-all tap-highlight"
                      )}
                    >
                      <span className="text-xs font-medium text-muted-foreground">
                        + Add more
                      </span>
                    </motion.div>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
