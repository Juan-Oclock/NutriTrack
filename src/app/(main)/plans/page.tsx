"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/layout/header"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Calendar, ChefHat, Sun, Moon, Cookie, Trash2, Utensils, ChevronRight } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type MealType = "breakfast" | "lunch" | "dinner" | "snacks"
type TabType = "weekly" | "templates"

interface MealPlanItem {
  id: string
  meal_type: MealType
  servings: number
  food_id: string | null
  user_food_id: string | null
  recipe_id: string | null
  foods: { name: string; calories: number } | null
  user_foods: { name: string; calories: number } | null
  recipes: { name: string; calories_per_serving: number } | null
}

interface MealPlanDay {
  id: string
  day_of_week: number
  items: MealPlanItem[]
}

interface MealPlan {
  id: string
  name: string
  description: string | null
  is_active: boolean
}

const mealConfig: Record<MealType, { icon: React.ElementType; bgColor: string; lightBg: string }> = {
  breakfast: {
    icon: Sun,
    bgColor: "bg-amber-500",
    lightBg: "bg-amber-50 dark:bg-amber-500/10",
  },
  lunch: {
    icon: Utensils,
    bgColor: "bg-primary",
    lightBg: "bg-primary/10",
  },
  dinner: {
    icon: Moon,
    bgColor: "bg-indigo-500",
    lightBg: "bg-indigo-50 dark:bg-indigo-500/10",
  },
  snacks: {
    icon: Cookie,
    bgColor: "bg-rose-500",
    lightBg: "bg-rose-50 dark:bg-rose-500/10",
  },
}

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const mealTypes: MealType[] = ["breakfast", "lunch", "dinner", "snacks"]

const tabOptions: { value: TabType; label: string }[] = [
  { value: "weekly", label: "Weekly Plan" },
  { value: "templates", label: "Templates" },
]

export default function PlansPage() {
  const [activeTab, setActiveTab] = useState<TabType>("weekly")
  const [selectedDay, setSelectedDay] = useState(new Date().getDay())
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null)
  const [planDays, setPlanDays] = useState<MealPlanDay[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const supabase = createClient()

  const loadMealPlan = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get or create active meal plan
      const { data: existingPlan } = await supabase
        .from("meal_plans")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single()

      let plan = existingPlan as MealPlan | null

      if (!plan) {
        // Create a new meal plan
        const { data: newPlan, error: createError } = await supabase
          .from("meal_plans")
          .insert({
            user_id: user.id,
            name: "My Weekly Plan",
            is_active: true,
          } as never)
          .select()
          .single()

        if (createError) {
          console.error("Error creating meal plan:", createError)
          return
        }

        plan = newPlan as MealPlan

        // Create days for the plan (0-6 for Sun-Sat)
        const daysToCreate = Array.from({ length: 7 }, (_, i) => ({
          meal_plan_id: plan!.id,
          day_of_week: i,
        }))

        await supabase.from("meal_plan_days").insert(daysToCreate as never)
      }

      setMealPlan(plan as MealPlan)

      // Load plan days with items
      const { data: daysData } = await supabase
        .from("meal_plan_days")
        .select(`
          id,
          day_of_week,
          meal_plan_items (
            id,
            meal_type,
            servings,
            food_id,
            user_food_id,
            recipe_id,
            foods ( name, calories ),
            user_foods ( name, calories ),
            recipes ( name, calories_per_serving )
          )
        `)
        .eq("meal_plan_id", plan.id)
        .order("day_of_week")

      if (daysData) {
        const formattedDays = (daysData as unknown as Array<{
          id: string
          day_of_week: number
          meal_plan_items: MealPlanItem[]
        }>).map(day => ({
          id: day.id,
          day_of_week: day.day_of_week,
          items: day.meal_plan_items || [],
        }))
        setPlanDays(formattedDays)
      }
    } catch (error) {
      console.error("Error loading meal plan:", error)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadMealPlan()
  }, [loadMealPlan])

  const handleDeleteItem = async (itemId: string) => {
    setIsDeleting(itemId)
    try {
      const { error } = await supabase
        .from("meal_plan_items")
        .delete()
        .eq("id", itemId)

      if (error) throw error

      // Update local state
      setPlanDays(prev => prev.map(day => ({
        ...day,
        items: day.items.filter(item => item.id !== itemId)
      })))

      toast.success("Meal removed from plan")
    } catch (error) {
      console.error("Error deleting item:", error)
      toast.error("Failed to remove meal")
    } finally {
      setIsDeleting(null)
    }
  }

  // Memoized current day data to avoid recalculating on every render
  const currentDay = useMemo(() => {
    return planDays.find(d => d.day_of_week === selectedDay)
  }, [planDays, selectedDay])

  const dayId = useMemo(() => currentDay?.id || null, [currentDay])

  // Memoized items grouped by meal type
  const itemsByMealType = useMemo(() => {
    if (!currentDay) return {} as Record<MealType, MealPlanItem[]>
    const groups: Record<MealType, MealPlanItem[]> = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: [],
    }
    currentDay.items.forEach(item => {
      groups[item.meal_type]?.push(item)
    })
    return groups
  }, [currentDay])

  // Memoized calorie totals for each meal type
  const caloriesByMealType = useMemo(() => {
    const totals: Record<MealType, number> = {
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      snacks: 0,
    }

    for (const mealType of mealTypes) {
      const items = itemsByMealType[mealType] || []
      totals[mealType] = items.reduce((sum, item) => {
        let calories = 0
        if (item.foods) calories = item.foods.calories
        else if (item.user_foods) calories = item.user_foods.calories
        else if (item.recipes) calories = item.recipes.calories_per_serving
        return sum + (calories * item.servings)
      }, 0)
    }

    return totals
  }, [itemsByMealType])

  // Memoized daily total calories
  const dailyTotalCalories = useMemo(() => {
    return Object.values(caloriesByMealType).reduce((sum, cal) => sum + cal, 0)
  }, [caloriesByMealType])

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto">
        <Header title="Meal Plans" />
        <div className="p-4 space-y-4">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto pb-24">
      <Header title="Meal Plans" />

      <div className="p-4 space-y-4">
        {/* Segmented Control */}
        <SegmentedControl
          options={tabOptions}
          value={activeTab}
          onChange={setActiveTab}
          className="w-full"
        />

        <AnimatePresence mode="wait">
          {activeTab === "weekly" ? (
            <motion.div
              key="weekly"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Day Selector - iOS style */}
              <div className="bg-card rounded-2xl p-2 border border-border/50 elevation-1">
                <div className="flex justify-between gap-1">
                  {days.map((day, index) => {
                    const isSelected = selectedDay === index
                    const isToday = new Date().getDay() === index

                    return (
                      <motion.button
                        key={day}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedDay(index)}
                        className={cn(
                          "flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all tap-highlight",
                          isSelected
                            ? "bg-primary text-primary-foreground shadow-md"
                            : isToday
                            ? "text-primary"
                            : "text-muted-foreground hover:bg-muted/50"
                        )}
                      >
                        {day}
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* Daily Summary Card */}
              {planDays.length > 0 && (
                <div className="bg-card rounded-2xl elevation-1 border border-border/50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <span className="font-semibold">{days[selectedDay]}&apos;s Plan</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold tabular-nums">
                        {Math.round(dailyTotalCalories)}
                      </span>
                      <span className="text-sm text-muted-foreground ml-1">cal</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Meal Slots */}
              <div className="space-y-3">
                {mealTypes.map((mealType, mealIndex) => {
                  const items = itemsByMealType[mealType] || []
                  const totalCals = caloriesByMealType[mealType]
                  const config = mealConfig[mealType]
                  const Icon = config.icon

                  return (
                    <motion.div
                      key={mealType}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: mealIndex * 0.05 }}
                      className={cn(
                        "rounded-2xl overflow-hidden",
                        "bg-card border border-border/50 elevation-1"
                      )}
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "h-10 w-10 rounded-xl flex items-center justify-center",
                              config.bgColor
                            )}>
                              <Icon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold capitalize">{mealType}</p>
                              {items.length > 0 && (
                                <p className="text-xs text-muted-foreground">
                                  {items.length} {items.length === 1 ? "item" : "items"} • {Math.round(totalCals)} cal
                                </p>
                              )}
                            </div>
                          </div>
                          {dayId && (
                            <Link href={`/plans/add-meal?dayId=${dayId}&meal=${mealType}`}>
                              <motion.div
                                whileTap={{ scale: 0.9 }}
                                className={cn(
                                  "h-9 w-9 rounded-xl flex items-center justify-center tap-highlight",
                                  config.bgColor
                                )}
                              >
                                <Plus className="h-4 w-4 text-white" strokeWidth={2.5} />
                              </motion.div>
                            </Link>
                          )}
                        </div>

                        {/* Meal Items */}
                        <AnimatePresence mode="popLayout">
                          {items.length > 0 ? (
                            <div className="space-y-2">
                              {items.map((item) => {
                                let name = "Unknown"
                                let calories = 0

                                if (item.foods) {
                                  name = item.foods.name
                                  calories = item.foods.calories
                                } else if (item.user_foods) {
                                  name = item.user_foods.name
                                  calories = item.user_foods.calories
                                } else if (item.recipes) {
                                  name = item.recipes.name
                                  calories = item.recipes.calories_per_serving
                                }

                                return (
                                  <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className={cn(
                                      "flex items-center justify-between p-3 rounded-xl",
                                      "bg-muted/50",
                                      "group hover:bg-muted transition-colors"
                                    )}
                                  >
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm truncate">{name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {item.servings} serving{item.servings !== 1 ? "s" : ""}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="text-right">
                                        <span className="font-semibold text-sm tabular-nums">
                                          {Math.round(calories * item.servings)}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground ml-0.5">cal</span>
                                      </div>
                                      <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        disabled={isDeleting === item.id}
                                        onClick={() => handleDeleteItem(item.id)}
                                        className={cn(
                                          "h-8 w-8 rounded-lg flex items-center justify-center tap-highlight",
                                          "opacity-0 group-hover:opacity-100 transition-opacity",
                                          "bg-destructive/10 text-destructive",
                                          "disabled:opacity-50"
                                        )}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </motion.button>
                                    </div>
                                  </motion.div>
                                )
                              })}
                            </div>
                          ) : (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="py-6 text-center"
                            >
                              <p className="text-sm text-muted-foreground mb-3">
                                No meal planned
                              </p>
                              {dayId && (
                                <Link href={`/plans/add-meal?dayId=${dayId}&meal=${mealType}`}>
                                  <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    className={cn(
                                      "inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium tap-highlight",
                                      "bg-muted/70 hover:bg-muted transition-colors"
                                    )}
                                  >
                                    <Plus className="h-4 w-4" />
                                    Add {mealType}
                                  </motion.button>
                                </Link>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="templates"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {/* Template Cards - iOS style */}
              {[
                {
                  name: "High Protein Plan",
                  description: "A week of high-protein meals perfect for muscle building",
                  calories: "~2,200 cal",
                  macros: "180g protein",
                  color: "rose",
                  delay: 0,
                },
                {
                  name: "Low Carb Plan",
                  description: "Keto-friendly meals for effective weight loss",
                  calories: "~1,800 cal",
                  macros: "50g carbs",
                  color: "blue",
                  delay: 0.05,
                },
                {
                  name: "Balanced Diet",
                  description: "Well-rounded meals for maintaining a healthy lifestyle",
                  calories: "~2,000 cal",
                  macros: "Balanced macros",
                  color: "emerald",
                  delay: 0.1,
                },
              ].map((template) => (
                <motion.div
                  key={template.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: template.delay }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "bg-card rounded-2xl elevation-1 border border-border/50 p-4",
                    "hover:border-primary/30 transition-colors tap-highlight"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
                      template.color === "rose" && "bg-rose-500/10",
                      template.color === "blue" && "bg-blue-500/10",
                      template.color === "emerald" && "bg-emerald-500/10"
                    )}>
                      <ChefHat className={cn(
                        "h-6 w-6",
                        template.color === "rose" && "text-rose-500",
                        template.color === "blue" && "text-blue-500",
                        template.color === "emerald" && "text-emerald-500"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold">{template.name}</h3>
                        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {template.calories} | {template.macros}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {template.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <span className="text-xs font-medium text-muted-foreground">Coming Soon</span>
                  </div>
                </motion.div>
              ))}

              {/* Info Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-2xl border-2 border-dashed border-border/50 p-6 text-center"
              >
                <div className="h-12 w-12 mx-auto mb-3 rounded-xl bg-muted flex items-center justify-center">
                  <ChefHat className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="font-semibold mb-1">Templates Coming Soon</p>
                <p className="text-sm text-muted-foreground">
                  Pre-made meal plan templates will be available in a future update
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
