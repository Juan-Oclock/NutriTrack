"use client"

import { useState, useEffect, Suspense, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/layout/header"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Search, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { useFoodSearch, type SearchResult, type USDAFood } from "@/hooks/use-food-search"
import { useServingOptions } from "@/hooks/use-serving-options"
import { cacheUSDAFood } from "@/lib/food-cache"
import { FoodDetailSheet } from "@/components/food-logging/food-detail-sheet"
import { MealTypeSelector } from "@/components/food-logging/meal-type-selector"
import { FilterTabs, type FilterTab } from "@/components/food-logging/filter-tabs"
import { VerifiedBadge } from "@/components/food-logging/verified-badge"
import { QuickAddButton } from "@/components/food-logging/quick-add-button"
import type { Food, UserFood, MealType, FoodServingOption, SavedMeal, Recipe } from "@/types/database"

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialMeal = (searchParams.get("meal") as MealType) || "breakfast"
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0]

  const [mealType, setMealType] = useState<MealType>(initialMeal)
  const [activeTab, setActiveTab] = useState<FilterTab>("all")
  const [selectedFood, setSelectedFood] = useState<SearchResult | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [quickAddingId, setQuickAddingId] = useState<string | null>(null)

  // Tab content
  const [userMeals, setUserMeals] = useState<SavedMeal[]>([])
  const [userRecipes, setUserRecipes] = useState<Recipe[]>([])
  const [userFoods, setUserFoods] = useState<UserFood[]>([])
  const [isLoadingTabs, setIsLoadingTabs] = useState(false)

  const supabase = createClient()

  // Search hook
  const {
    query,
    setQuery,
    results,
    isSearching,
  } = useFoodSearch()

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

  // Load tab content
  useEffect(() => {
    async function loadTabContent() {
      if (activeTab === "all") return

      setIsLoadingTabs(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        if (activeTab === "meals") {
          const { data } = await supabase
            .from("saved_meals")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
          setUserMeals(data || [])
        } else if (activeTab === "recipes") {
          const { data } = await supabase
            .from("recipes")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
          setUserRecipes(data || [])
        } else if (activeTab === "foods") {
          const { data } = await supabase
            .from("user_foods")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
          setUserFoods(data || [])
        }
      } catch (error) {
        console.error("Error loading tab content:", error)
      } finally {
        setIsLoadingTabs(false)
      }
    }

    loadTabContent()
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
      const isUSDAFood = "isUSDA" in food && food.isUSDA

      // Cache USDA food locally if needed
      let foodId: string | null = null
      if (isUSDAFood) {
        foodId = await cacheUSDAFood(food as USDAFood)
        if (!foodId) {
          throw new Error("Failed to cache food")
        }
      } else if (!isUserFood) {
        foodId = food.id
      }

      const { error } = await supabase.from("diary_entries").insert({
        user_id: user.id,
        date,
        meal_type: mealType,
        food_id: foodId,
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

      toast.success(`${food.name} added to ${mealType}`, {
        action: {
          label: "Undo",
          onClick: () => {
            // TODO: Implement undo
          },
        },
      })
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
      const isUSDAFood = "isUSDA" in selectedFood && selectedFood.isUSDA
      const multiplier = data.servingOption.multiplier
      const servings = data.servings

      // Cache USDA food locally if needed
      let foodId: string | null = null
      if (isUSDAFood) {
        foodId = await cacheUSDAFood(selectedFood as USDAFood)
        if (!foodId) {
          throw new Error("Failed to cache food")
        }
      } else if (!isUserFood) {
        foodId = selectedFood.id
      }

      const { error } = await supabase.from("diary_entries").insert({
        user_id: user.id,
        date,
        meal_type: data.mealType,
        food_id: foodId,
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

  const renderFoodItem = (food: SearchResult, index: number) => {
    const isUserFood = "isUserFood" in food && food.isUserFood
    const isVerified = !isUserFood && (food as Food).is_verified

    return (
      <motion.div
        key={food.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
      >
        <Card
          className="cursor-pointer transition-colors hover:border-primary/50 tap-highlight"
          onClick={() => handleSelectFood(food)}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium truncate">{food.name}</p>
                {isVerified && <VerifiedBadge />}
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
                onClick={() => handleQuickAdd(food)}
                isLoading={quickAddingId === food.id}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="max-w-lg mx-auto pb-24">
      <Header
        showBack
        centerContent={
          <MealTypeSelector
            value={mealType}
            onChange={setMealType}
            variant="header"
          />
        }
      />

      <div className="p-4 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search foods..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-12 rounded-xl"
            autoFocus
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Filter Tabs */}
        <FilterTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={{
            meals: userMeals.length,
            recipes: userRecipes.length,
            foods: userFoods.length,
          }}
        />

        {/* Content based on active tab */}
        {activeTab === "all" ? (
          <div className="space-y-4">
            {/* Search Results */}
            {query.length >= 2 ? (
              <>
                {/* Best Match Section */}
                {results.bestMatch.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-muted-foreground">Best Match</h3>
                    {results.bestMatch.map((food, index) => renderFoodItem(food, index))}
                  </div>
                )}

                {/* More Results Section */}
                {results.moreResults.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-muted-foreground">More Results</h3>
                    {results.moreResults.map((food, index) =>
                      renderFoodItem(food, index + results.bestMatch.length)
                    )}
                  </div>
                )}

                {/* No results */}
                {results.totalCount === 0 && !isSearching && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No foods found for &quot;{query}&quot;</p>
                    <p className="text-sm">Try a different search term</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Search for foods to add to your diary</p>
                <p className="text-sm mt-1">Type at least 2 characters to search</p>
              </div>
            )}
          </div>
        ) : activeTab === "meals" ? (
          <div className="space-y-2">
            {isLoadingTabs ? (
              <>
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
              </>
            ) : userMeals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No saved meals yet</p>
                <p className="text-sm">Create meals to quickly log multiple foods</p>
              </div>
            ) : (
              userMeals.map((meal) => (
                <Card key={meal.id} className="cursor-pointer hover:border-primary/50">
                  <CardContent className="p-4">
                    <p className="font-medium">{meal.name}</p>
                    {meal.description && (
                      <p className="text-sm text-muted-foreground">{meal.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        ) : activeTab === "recipes" ? (
          <div className="space-y-2">
            {isLoadingTabs ? (
              <>
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </>
            ) : userRecipes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No recipes yet</p>
                <p className="text-sm">Create recipes to track homemade meals</p>
              </div>
            ) : (
              userRecipes.map((recipe) => (
                <Card key={recipe.id} className="cursor-pointer hover:border-primary/50">
                  <CardContent className="p-4">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{recipe.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {recipe.servings} servings
                        </p>
                      </div>
                      {recipe.calories_per_serving && (
                        <div className="text-right">
                          <p className="font-semibold">{Math.round(recipe.calories_per_serving)}</p>
                          <p className="text-xs text-muted-foreground">cal/serving</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        ) : activeTab === "foods" ? (
          <div className="space-y-2">
            {isLoadingTabs ? (
              <>
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
              </>
            ) : userFoods.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No custom foods yet</p>
                <p className="text-sm">Create your own food entries</p>
              </div>
            ) : (
              userFoods.map((food, index) => (
                <motion.div
                  key={food.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card
                    className="cursor-pointer hover:border-primary/50"
                    onClick={() => handleSelectFood({ ...food, isUserFood: true })}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{food.name}</p>
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
                          onClick={() => handleQuickAdd({ ...food, isUserFood: true })}
                          isLoading={quickAddingId === food.id}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        ) : null}
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
        initialMealType={mealType}
        isLoading={isLoadingOptions}
      />
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-lg mx-auto p-4 space-y-4">
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
