"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/layout/header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Search, ScanBarcode, Camera, Zap, Clock, Star, Apple, ChefHat } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { FoodDetailSheet } from "@/components/food-logging/food-detail-sheet"
import { QuickAddButton } from "@/components/food-logging/quick-add-button"
import { useServingOptions } from "@/hooks/use-serving-options"
import type { Food, UserFood, Recipe, MealType } from "@/types/database"
import type { SearchResult } from "@/hooks/use-food-search"

interface RecentFood {
  id: string
  food_id: string | null
  user_food_id: string | null
  recipe_id: string | null
  logged_at: string
  food: Food | null
  user_food: UserFood | null
  recipe: Recipe | null
}

interface FrequentFood {
  food_id: string | null
  user_food_id: string | null
  count: number
  food: Food | null
  user_food: UserFood | null
}

function AddFoodContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const meal = (searchParams.get("meal") as MealType) || "breakfast"
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0]

  const [activeTab, setActiveTab] = useState("recent")
  const [isLoading, setIsLoading] = useState(false)
  const [recentFoods, setRecentFoods] = useState<RecentFood[]>([])
  const [frequentFoods, setFrequentFoods] = useState<FrequentFood[]>([])
  const [userFoods, setUserFoods] = useState<UserFood[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [selectedFood, setSelectedFood] = useState<SearchResult | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [quickAddingId, setQuickAddingId] = useState<string | null>(null)

  const supabase = createClient()

  // Serving options for selected food
  const { options: servingOptions, isLoading: isLoadingOptions } = useServingOptions({
    foodId: selectedFood && !("isUserFood" in selectedFood && selectedFood.isUserFood)
      ? selectedFood.id
      : null,
    userFoodId: selectedFood && "isUserFood" in selectedFood && selectedFood.isUserFood
      ? selectedFood.id
      : null,
    enabled: !!selectedFood,
  })

  // Load data based on active tab
  useEffect(() => {
    async function loadTabData() {
      setIsLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        if (activeTab === "recent") {
          // Get recent diary entries with food details
          const { data: entries } = await supabase
            .from("diary_entries")
            .select(`
              id,
              food_id,
              user_food_id,
              recipe_id,
              logged_at,
              food:foods(*),
              user_food:user_foods(*),
              recipe:recipes(*)
            `)
            .eq("user_id", user.id)
            .not("food_id", "is", null)
            .order("logged_at", { ascending: false })
            .limit(20)

          // Also get entries with user_food_id
          const { data: userFoodEntries } = await supabase
            .from("diary_entries")
            .select(`
              id,
              food_id,
              user_food_id,
              recipe_id,
              logged_at,
              food:foods(*),
              user_food:user_foods(*),
              recipe:recipes(*)
            `)
            .eq("user_id", user.id)
            .not("user_food_id", "is", null)
            .order("logged_at", { ascending: false })
            .limit(20)

          // Combine and deduplicate by food_id or user_food_id
          const allEntries = [...(entries || []), ...(userFoodEntries || [])]
          const seen = new Set<string>()
          const uniqueEntries = allEntries.filter(entry => {
            const key = entry.food_id || entry.user_food_id || entry.recipe_id
            if (!key || seen.has(key)) return false
            seen.add(key)
            return true
          }).sort((a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime())
            .slice(0, 20)

          setRecentFoods(uniqueEntries as RecentFood[])
        } else if (activeTab === "frequent") {
          // Get most frequently logged foods
          const { data: entries } = await supabase
            .from("diary_entries")
            .select("food_id, user_food_id")
            .eq("user_id", user.id)

          if (entries) {
            // Count occurrences
            const foodCounts = new Map<string, { food_id: string | null, user_food_id: string | null, count: number }>()
            entries.forEach(entry => {
              const key = entry.food_id || entry.user_food_id
              if (key) {
                const existing = foodCounts.get(key) || { food_id: entry.food_id, user_food_id: entry.user_food_id, count: 0 }
                existing.count++
                foodCounts.set(key, existing)
              }
            })

            // Sort by count and take top 20
            const sortedFoods = Array.from(foodCounts.values())
              .sort((a, b) => b.count - a.count)
              .slice(0, 20)

            // Fetch food details
            const foodIds = sortedFoods.filter(f => f.food_id).map(f => f.food_id!)
            const userFoodIds = sortedFoods.filter(f => f.user_food_id).map(f => f.user_food_id!)

            const [{ data: foods }, { data: userFoodsData }] = await Promise.all([
              foodIds.length > 0
                ? supabase.from("foods").select("*").in("id", foodIds)
                : { data: [] },
              userFoodIds.length > 0
                ? supabase.from("user_foods").select("*").in("id", userFoodIds)
                : { data: [] },
            ])

            const foodMap = new Map((foods || []).map(f => [f.id, f]))
            const userFoodMap = new Map((userFoodsData || []).map(f => [f.id, f]))

            const frequentWithDetails: FrequentFood[] = sortedFoods.map(f => ({
              ...f,
              food: f.food_id ? foodMap.get(f.food_id) || null : null,
              user_food: f.user_food_id ? userFoodMap.get(f.user_food_id) || null : null,
            }))

            setFrequentFoods(frequentWithDetails)
          }
        } else if (activeTab === "my-foods") {
          const { data } = await supabase
            .from("user_foods")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
          setUserFoods(data || [])
        } else if (activeTab === "recipes") {
          const { data } = await supabase
            .from("recipes")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
          setRecipes(data || [])
        }
      } catch (error) {
        console.error("Error loading tab data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTabData()
  }, [activeTab, supabase])

  const handleSelectFood = (food: SearchResult) => {
    setSelectedFood(food)
    setIsSheetOpen(true)
  }

  const handleQuickAdd = async (food: SearchResult) => {
    setQuickAddingId(food.id)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("You must be logged in")
        return
      }

      const isUserFood = "isUserFood" in food && food.isUserFood

      const { error } = await supabase.from("diary_entries").insert({
        user_id: user.id,
        date,
        meal_type: meal,
        food_id: isUserFood ? null : food.id,
        user_food_id: isUserFood ? food.id : null,
        servings: 1,
        logged_calories: food.calories,
        logged_protein_g: food.protein_g,
        logged_carbs_g: food.carbs_g,
        logged_fat_g: food.fat_g,
        logged_fiber_g: food.fiber_g,
        logged_sugar_g: food.sugar_g,
        logged_sodium_mg: food.sodium_mg,
      } as never)

      if (error) throw error

      toast.success(`${food.name} added to ${meal}`)
    } catch (error) {
      console.error("Quick add error:", error)
      toast.error("Failed to add food")
    } finally {
      setQuickAddingId(null)
    }
  }

  const handleSubmitFood = async (data: {
    servings: number
    servingOption: { multiplier: number }
    mealType: MealType
    loggedTime: string | null
  }) => {
    if (!selectedFood) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("You must be logged in")
        return
      }

      const isUserFood = "isUserFood" in selectedFood && selectedFood.isUserFood
      const multiplier = data.servingOption.multiplier
      const servings = data.servings

      const { error } = await supabase.from("diary_entries").insert({
        user_id: user.id,
        date,
        meal_type: data.mealType,
        food_id: isUserFood ? null : selectedFood.id,
        user_food_id: isUserFood ? selectedFood.id : null,
        servings,
        logged_calories: (selectedFood.calories || 0) * multiplier * servings,
        logged_protein_g: (selectedFood.protein_g || 0) * multiplier * servings,
        logged_carbs_g: (selectedFood.carbs_g || 0) * multiplier * servings,
        logged_fat_g: (selectedFood.fat_g || 0) * multiplier * servings,
        logged_fiber_g: (selectedFood.fiber_g || 0) * multiplier * servings,
        logged_sugar_g: (selectedFood.sugar_g || 0) * multiplier * servings,
        logged_sodium_mg: (selectedFood.sodium_mg || 0) * multiplier * servings,
        logged_time: data.loggedTime,
      } as never)

      if (error) throw error

      toast.success(`${selectedFood.name} added to ${data.mealType}`)
      router.push("/diary")
    } catch (error) {
      console.error("Error logging food:", error)
      toast.error("Failed to log food")
      throw error
    }
  }

  const handleLogRecipe = async (recipe: Recipe) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("You must be logged in")
        return
      }

      const { error } = await supabase.from("diary_entries").insert({
        user_id: user.id,
        date,
        meal_type: meal,
        recipe_id: recipe.id,
        servings: 1,
        logged_calories: recipe.calories_per_serving || 0,
        logged_protein_g: recipe.protein_per_serving,
        logged_carbs_g: recipe.carbs_per_serving,
        logged_fat_g: recipe.fat_per_serving,
      } as never)

      if (error) throw error

      toast.success(`${recipe.name} added to ${meal}`)
    } catch (error) {
      console.error("Error logging recipe:", error)
      toast.error("Failed to add recipe")
    }
  }

  const quickActions = [
    {
      href: `/add-food/barcode?meal=${meal}&date=${date}`,
      icon: ScanBarcode,
      label: "Scan",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      href: `/add-food/meal-scan?meal=${meal}&date=${date}`,
      icon: Camera,
      label: "Photo",
      gradient: "from-purple-500 to-purple-600",
    },
    {
      href: `/add-food/quick-add?meal=${meal}&date=${date}`,
      icon: Zap,
      label: "Quick",
      gradient: "from-orange-500 to-orange-600",
    },
  ]

  const mealLabels: Record<string, string> = {
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    snacks: "Snacks",
  }

  const renderFoodItem = (food: Food | UserFood, isUserFood: boolean, index: number) => {
    const searchResult: SearchResult = {
      ...food,
      isUserFood,
    } as SearchResult

    return (
      <motion.div
        key={food.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
      >
        <Card
          className="cursor-pointer transition-colors hover:border-primary/50 tap-highlight"
          onClick={() => handleSelectFood(searchResult)}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium truncate">{food.name}</p>
                {isUserFood && (
                  <Badge variant="secondary" className="text-xs">My Food</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {food.brand && `${food.brand} • `}
                {food.serving_size} {food.serving_unit}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-semibold">{Math.round(food.calories)}</p>
                <p className="text-xs text-muted-foreground">cal</p>
              </div>
              <QuickAddButton
                onClick={() => handleQuickAdd(searchResult)}
                isLoading={quickAddingId === food.id}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const renderRecipeItem = (recipe: Recipe, index: number) => (
    <motion.div
      key={recipe.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <Card
        className="cursor-pointer transition-colors hover:border-primary/50 tap-highlight"
        onClick={() => handleLogRecipe(recipe)}
      >
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{recipe.name}</p>
            <p className="text-sm text-muted-foreground">
              {recipe.servings} servings
              {recipe.prep_time_minutes && ` • ${recipe.prep_time_minutes} min prep`}
            </p>
          </div>
          {recipe.calories_per_serving && (
            <div className="text-right">
              <p className="font-semibold">{Math.round(recipe.calories_per_serving)}</p>
              <p className="text-xs text-muted-foreground">cal/serving</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <div className="max-w-lg mx-auto pb-24">
      <Header title={`Add to ${mealLabels[meal]}`} showBack />

      <div className="p-4 space-y-6">
        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link href={`/add-food/search?meal=${meal}&date=${date}`}>
            <motion.div
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 bg-card rounded-2xl px-4 py-4 elevation-1 tap-highlight"
            >
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <span className="text-muted-foreground">Search foods...</span>
            </motion.div>
          </Link>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          {quickActions.map((action, index) => (
            <Link key={action.href} href={action.href}>
              <motion.div
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + index * 0.05 }}
                className="flex flex-col items-center gap-2 tap-highlight"
              >
                <div className={cn(
                  "h-16 w-16 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                  action.gradient
                )}>
                  <action.icon className="h-7 w-7 text-white" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">{action.label}</span>
              </motion.div>
            </Link>
          ))}
        </motion.div>

        {/* Tabs for different food sources */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-12 p-1 bg-muted/50 rounded-xl">
              <TabsTrigger value="recent" className="text-xs rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <Clock className="h-3.5 w-3.5 mr-1.5" />
                Recent
              </TabsTrigger>
              <TabsTrigger value="frequent" className="text-xs rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <Star className="h-3.5 w-3.5 mr-1.5" />
                Frequent
              </TabsTrigger>
              <TabsTrigger value="my-foods" className="text-xs rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <Apple className="h-3.5 w-3.5 mr-1.5" />
                Foods
              </TabsTrigger>
              <TabsTrigger value="recipes" className="text-xs rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <ChefHat className="h-3.5 w-3.5 mr-1.5" />
                Recipes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recent" className="mt-4 space-y-2">
              {isLoading ? (
                <>
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                </>
              ) : recentFoods.length === 0 ? (
                <div className="text-center py-12 rounded-2xl bg-card elevation-1">
                  <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                    <Clock className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="font-medium">No recent foods</p>
                  <p className="text-sm text-muted-foreground mt-1">Foods you log will appear here</p>
                </div>
              ) : (
                recentFoods.map((entry, index) => {
                  if (entry.food) {
                    return renderFoodItem(entry.food, false, index)
                  } else if (entry.user_food) {
                    return renderFoodItem(entry.user_food, true, index)
                  }
                  return null
                })
              )}
            </TabsContent>

            <TabsContent value="frequent" className="mt-4 space-y-2">
              {isLoading ? (
                <>
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                </>
              ) : frequentFoods.length === 0 ? (
                <div className="text-center py-12 rounded-2xl bg-card elevation-1">
                  <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                    <Star className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="font-medium">No frequent foods</p>
                  <p className="text-sm text-muted-foreground mt-1">Your most logged foods will appear here</p>
                </div>
              ) : (
                frequentFoods.map((entry, index) => {
                  if (entry.food) {
                    return (
                      <div key={entry.food.id} className="relative">
                        {renderFoodItem(entry.food, false, index)}
                        <Badge
                          variant="secondary"
                          className="absolute top-2 right-2 text-xs"
                        >
                          {entry.count}x
                        </Badge>
                      </div>
                    )
                  } else if (entry.user_food) {
                    return (
                      <div key={entry.user_food.id} className="relative">
                        {renderFoodItem(entry.user_food, true, index)}
                        <Badge
                          variant="secondary"
                          className="absolute top-2 right-2 text-xs"
                        >
                          {entry.count}x
                        </Badge>
                      </div>
                    )
                  }
                  return null
                })
              )}
            </TabsContent>

            <TabsContent value="my-foods" className="mt-4 space-y-2">
              {isLoading ? (
                <>
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                </>
              ) : userFoods.length === 0 ? (
                <div className="text-center py-12 rounded-2xl bg-card elevation-1">
                  <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                    <Apple className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="font-medium">No custom foods</p>
                  <p className="text-sm text-muted-foreground mt-1">Create your own foods to log them quickly</p>
                </div>
              ) : (
                userFoods.map((food, index) => renderFoodItem(food, true, index))
              )}
            </TabsContent>

            <TabsContent value="recipes" className="mt-4 space-y-2">
              {isLoading ? (
                <>
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                </>
              ) : recipes.length === 0 ? (
                <div className="text-center py-12 rounded-2xl bg-card elevation-1">
                  <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                    <ChefHat className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="font-medium">No recipes</p>
                  <p className="text-sm text-muted-foreground mt-1">Create recipes to track homemade meals</p>
                </div>
              ) : (
                recipes.map((recipe, index) => renderRecipeItem(recipe, index))
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Food Detail Sheet */}
      <FoodDetailSheet
        food={selectedFood}
        servingOptions={servingOptions}
        isOpen={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false)
          setSelectedFood(null)
        }}
        onSubmit={handleSubmitFood}
        initialMealType={meal}
        isLoading={isLoadingOptions}
      />
    </div>
  )
}

export default function AddFoodPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <AddFoodContent />
    </Suspense>
  )
}
