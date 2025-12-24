"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Calendar, ChefHat, Sun, Cloud, Moon, Cookie, Trash2, Utensils } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type MealType = "breakfast" | "lunch" | "dinner" | "snacks"

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
    lightBg: "bg-amber-500/10",
  },
  lunch: {
    icon: Utensils,
    bgColor: "bg-primary",
    lightBg: "bg-primary/10",
  },
  dinner: {
    icon: Moon,
    bgColor: "bg-indigo-500",
    lightBg: "bg-indigo-500/10",
  },
  snacks: {
    icon: Cookie,
    bgColor: "bg-rose-500",
    lightBg: "bg-rose-500/10",
  },
}

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const mealTypes: MealType[] = ["breakfast", "lunch", "dinner", "snacks"]

export default function PlansPage() {
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
          <Skeleton className="h-12 w-full rounded-lg" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto pb-24">
      <Header title="Meal Plans" />

      <div className="p-4 space-y-6">
        <Tabs defaultValue="weekly">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weekly">Weekly Plan</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="mt-4 space-y-4">
            {/* Day Selector */}
            <div className="flex justify-between bg-card rounded-xl p-1.5 border border-border/50 elevation-1">
              {days.map((day, index) => (
                <motion.button
                  key={day}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDay(index)}
                  className={cn(
                    "flex-1 py-2.5 text-sm font-medium rounded-lg transition-all",
                    selectedDay === index
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "hover:bg-muted/50"
                  )}
                >
                  {day}
                </motion.button>
              ))}
            </div>

            {/* Meal Slots */}
            <div className="space-y-3">
              {mealTypes.map((mealType) => {
                const items = itemsByMealType[mealType] || []
                const totalCals = caloriesByMealType[mealType]
                const config = mealConfig[mealType]
                const Icon = config.icon

                return (
                  <motion.div
                    key={mealType}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "rounded-2xl overflow-hidden",
                      config.lightBg,
                      "border border-border/40"
                    )}
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "h-10 w-10 rounded-xl flex items-center justify-center shadow-md",
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
                                "h-9 w-9 rounded-lg flex items-center justify-center shadow-sm",
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
                                    "bg-background/70 backdrop-blur-sm",
                                    "border border-border/30",
                                    "group hover:bg-background/90 transition-colors"
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
                                        "h-7 w-7 rounded-md flex items-center justify-center",
                                        "opacity-0 group-hover:opacity-100 transition-opacity",
                                        "bg-destructive/10 text-destructive",
                                        "disabled:opacity-50"
                                      )}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
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
                            className="py-4 text-center"
                          >
                            <p className="text-sm text-muted-foreground">
                              No meal planned
                            </p>
                            {dayId && (
                              <Link href={`/plans/add-meal?dayId=${dayId}&meal=${mealType}`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="mt-2 text-xs"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add {mealType}
                                </Button>
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

            {/* Daily Summary */}
            {planDays.length > 0 && (
              <Card className="bg-primary/10 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <span className="font-medium">{days[selectedDay]} Total</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-primary">
                        {Math.round(dailyTotalCalories)}
                      </span>
                      <span className="text-sm text-muted-foreground ml-1">cal</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="templates" className="mt-4 space-y-4">
            {/* Template Cards */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                      <ChefHat className="h-4 w-4 text-rose-500" />
                    </div>
                    High Protein Plan
                  </CardTitle>
                  <CardDescription>
                    ~2,200 cal | 180g protein
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    A week of high-protein meals perfect for muscle building
                  </p>
                  <Button size="sm" variant="outline" className="w-full" disabled>
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <Card className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <ChefHat className="h-4 w-4 text-blue-500" />
                    </div>
                    Low Carb Plan
                  </CardTitle>
                  <CardDescription>
                    ~1,800 cal | 50g carbs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Keto-friendly meals for effective weight loss
                  </p>
                  <Button size="sm" variant="outline" className="w-full" disabled>
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <ChefHat className="h-4 w-4 text-emerald-500" />
                    </div>
                    Balanced Diet
                  </CardTitle>
                  <CardDescription>
                    ~2,000 cal | Balanced macros
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Well-rounded meals for maintaining a healthy lifestyle
                  </p>
                  <Button size="sm" variant="outline" className="w-full" disabled>
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Info Card */}
            <Card className="border-dashed bg-muted/30">
              <CardContent className="p-6 text-center">
                <ChefHat className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <p className="font-medium mb-1">Templates Coming Soon</p>
                <p className="text-sm text-muted-foreground">
                  Pre-made meal plan templates will be available in a future update
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
