"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Plus, Check, Loader2, Sun, Utensils, Moon, Cookie } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useDebounce } from "@/hooks/use-debounce"

type MealType = "breakfast" | "lunch" | "dinner" | "snacks"

interface FoodItem {
  id: string
  name: string
  brand: string | null
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  serving_size: number
  serving_unit: string
  type: "food" | "user_food" | "recipe"
}

const mealConfig: Record<MealType, { icon: React.ElementType; label: string; gradient: string }> = {
  breakfast: { icon: Sun, label: "Breakfast", gradient: "from-amber-400 to-orange-500" },
  lunch: { icon: Utensils, label: "Lunch", gradient: "from-emerald-400 to-teal-500" },
  dinner: { icon: Moon, label: "Dinner", gradient: "from-indigo-400 to-purple-500" },
  snacks: { icon: Cookie, label: "Snacks", gradient: "from-pink-400 to-rose-500" },
}

function AddMealContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dayId = searchParams.get("dayId")
  const mealType = (searchParams.get("meal") || "breakfast") as MealType

  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<FoodItem[]>([])
  const [recentFoods, setRecentFoods] = useState<FoodItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isAdding, setIsAdding] = useState<string | null>(null)
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set())

  const debouncedQuery = useDebounce(searchQuery, 300)
  const supabase = createClient()

  const config = mealConfig[mealType]
  const Icon = config.icon

  // Load recent foods
  useEffect(() => {
    async function loadRecentFoods() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get foods from recent diary entries
      const { data: diaryData } = await supabase
        .from("diary_entries")
        .select(`
          food_id,
          foods ( id, name, brand, calories, protein_g, carbs_g, fat_g, serving_size, serving_unit )
        `)
        .eq("user_id", user.id)
        .not("food_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(10)

      const { data: userFoodsData } = await supabase
        .from("user_foods")
        .select("id, name, brand, calories, protein_g, carbs_g, fat_g, serving_size, serving_unit")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5)

      const foods: FoodItem[] = []
      const seenIds = new Set<string>()

      if (diaryData) {
        for (const entry of diaryData) {
          const food = (entry as { foods: FoodItem | null }).foods
          if (food && !seenIds.has(food.id)) {
            seenIds.add(food.id)
            foods.push({ ...food, type: "food" })
          }
        }
      }

      if (userFoodsData) {
        for (const food of userFoodsData as FoodItem[]) {
          if (!seenIds.has(food.id)) {
            seenIds.add(food.id)
            foods.push({ ...food, type: "user_food" })
          }
        }
      }

      setRecentFoods(foods.slice(0, 8))
    }

    loadRecentFoods()
  }, [supabase])

  // Search foods
  const searchFoods = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([])
      return
    }

    setIsSearching(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const searchTerm = `%${query}%`

      // Search in foods table
      const { data: foodsData } = await supabase
        .from("foods")
        .select("id, name, brand, calories, protein_g, carbs_g, fat_g, serving_size, serving_unit")
        .or(`name.ilike.${searchTerm},brand.ilike.${searchTerm}`)
        .limit(10)

      // Search in user_foods table
      const { data: userFoodsData } = await supabase
        .from("user_foods")
        .select("id, name, brand, calories, protein_g, carbs_g, fat_g, serving_size, serving_unit")
        .eq("user_id", user.id)
        .or(`name.ilike.${searchTerm},brand.ilike.${searchTerm}`)
        .limit(5)

      // Search in recipes table
      const { data: recipesData } = await supabase
        .from("recipes")
        .select("id, name, calories_per_serving, protein_per_serving, carbs_per_serving, fat_per_serving, servings")
        .eq("user_id", user.id)
        .ilike("name", searchTerm)
        .limit(5)

      const allResults: FoodItem[] = []

      if (foodsData) {
        for (const food of foodsData as FoodItem[]) {
          allResults.push({ ...food, type: "food" })
        }
      }

      if (userFoodsData) {
        for (const food of userFoodsData as FoodItem[]) {
          allResults.push({ ...food, type: "user_food" })
        }
      }

      if (recipesData) {
        for (const recipe of recipesData as Array<{
          id: string
          name: string
          calories_per_serving: number
          protein_per_serving: number
          carbs_per_serving: number
          fat_per_serving: number
          servings: number
        }>) {
          allResults.push({
            id: recipe.id,
            name: recipe.name,
            brand: null,
            calories: recipe.calories_per_serving || 0,
            protein_g: recipe.protein_per_serving || 0,
            carbs_g: recipe.carbs_per_serving || 0,
            fat_g: recipe.fat_per_serving || 0,
            serving_size: 1,
            serving_unit: "serving",
            type: "recipe",
          })
        }
      }

      setResults(allResults)
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setIsSearching(false)
    }
  }, [supabase])

  useEffect(() => {
    searchFoods(debouncedQuery)
  }, [debouncedQuery, searchFoods])

  const handleAddFood = async (food: FoodItem) => {
    if (!dayId) {
      toast.error("Missing day information")
      return
    }

    setIsAdding(food.id)
    try {
      const insertData: Record<string, unknown> = {
        meal_plan_day_id: dayId,
        meal_type: mealType,
        servings: 1,
      }

      if (food.type === "food") {
        insertData.food_id = food.id
      } else if (food.type === "user_food") {
        insertData.user_food_id = food.id
      } else if (food.type === "recipe") {
        insertData.recipe_id = food.id
      }

      const { error } = await supabase
        .from("meal_plan_items")
        .insert(insertData as never)

      if (error) throw error

      setAddedItems(prev => new Set(prev).add(food.id))
      toast.success(`Added ${food.name} to ${config.label}`)
    } catch (error) {
      console.error("Error adding food:", error)
      toast.error("Failed to add food")
    } finally {
      setIsAdding(null)
    }
  }

  const displayedFoods = searchQuery.trim() ? results : recentFoods

  return (
    <div className="max-w-lg mx-auto pb-24">
      <Header
        title={`Add to ${config.label}`}
        showBack
      />

      <div className="p-4 space-y-4">
        {/* Meal Type Indicator */}
        <div className={cn(
          "flex items-center gap-3 p-4 rounded-2xl",
          "bg-gradient-to-br",
          config.gradient.replace("from-", "from-").replace("to-", "to-") + "/10"
        )}>
          <div className={cn(
            "h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-md",
            config.gradient
          )}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="font-semibold">{config.label}</p>
            <p className="text-sm text-muted-foreground">
              Search and add foods to your meal plan
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search foods, recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 rounded-xl text-base"
            autoFocus
          />
          {isSearching && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Results */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            {searchQuery.trim() ? "Search Results" : "Recent Foods"}
          </p>

          <AnimatePresence mode="popLayout">
            {displayedFoods.length > 0 ? (
              displayedFoods.map((food, index) => {
                const isAdded = addedItems.has(food.id)
                const isLoading = isAdding === food.id

                return (
                  <motion.div
                    key={food.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.03 }}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl",
                      "bg-card border border-border/50",
                      "hover:bg-muted/50 transition-colors"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{food.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {food.brand && `${food.brand} • `}
                        {food.serving_size}{food.serving_unit}
                        {food.type === "recipe" && " (Recipe)"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-semibold text-sm tabular-nums">
                          {Math.round(food.calories)}
                        </span>
                        <span className="text-[10px] text-muted-foreground ml-0.5">cal</span>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        disabled={isLoading || isAdded}
                        onClick={() => handleAddFood(food)}
                        className={cn(
                          "h-9 w-9 rounded-lg flex items-center justify-center",
                          "transition-colors",
                          isAdded
                            ? "bg-primary text-primary-foreground"
                            : "bg-primary/10 text-primary hover:bg-primary/20",
                          "disabled:opacity-50"
                        )}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : isAdded ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                )
              })
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 text-center"
              >
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  {searchQuery.trim()
                    ? "No foods found"
                    : "Search for foods to add to your meal plan"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Done Button */}
        {addedItems.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-24 left-4 right-4 max-w-lg mx-auto"
          >
            <Button
              onClick={() => router.back()}
              className="w-full h-12 rounded-xl text-base font-semibold shadow-lg"
            >
              Done ({addedItems.size} added)
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default function AddMealPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-lg mx-auto p-4 space-y-4">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </div>
      }
    >
      <AddMealContent />
    </Suspense>
  )
}
