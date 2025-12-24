"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/layout/header"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, ChefHat, Plus, Search, X, Minus } from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { useDebounce } from "@/hooks/use-debounce"
import type { Food, UserFood } from "@/types/database"

interface FoodItem {
  id: string
  name: string
  brand?: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  serving_size: number
  serving_unit: string
  source: "food" | "user_food"
}

interface Ingredient {
  food: FoodItem
  quantity: number
  unit: string
}

export default function CreateRecipePage() {
  const router = useRouter()
  const supabase = createClient()

  // Recipe basic info
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [servings, setServings] = useState("1")
  const [prepTime, setPrepTime] = useState("")
  const [cookTime, setCookTime] = useState("")
  const [instructions, setInstructions] = useState("")

  // Ingredients
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<FoodItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  const [isLoading, setIsLoading] = useState(false)

  const debouncedSearch = useDebounce(searchQuery, 300)

  // Search foods
  const searchFoods = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Search in foods table
      const { data: foods } = await supabase
        .from("foods")
        .select("id, name, brand, calories, protein_g, carbs_g, fat_g, serving_size, serving_unit")
        .ilike("name", `%${query}%`)
        .limit(10)

      // Search in user_foods table
      const { data: userFoods } = await supabase
        .from("user_foods")
        .select("id, name, brand, calories, protein_g, carbs_g, fat_g, serving_size, serving_unit")
        .eq("user_id", user.id)
        .ilike("name", `%${query}%`)
        .limit(10)

      const userFoodResults = ((userFoods || []) as UserFood[]).map((f) => ({
        id: f.id,
        name: f.name,
        brand: f.brand || undefined,
        calories: f.calories,
        protein_g: f.protein_g,
        carbs_g: f.carbs_g,
        fat_g: f.fat_g,
        serving_size: f.serving_size,
        serving_unit: f.serving_unit,
        source: "user_food" as const,
      }))

      const foodResults = ((foods || []) as Food[]).map((f) => ({
        id: f.id,
        name: f.name,
        brand: f.brand || undefined,
        calories: f.calories,
        protein_g: f.protein_g,
        carbs_g: f.carbs_g,
        fat_g: f.fat_g,
        serving_size: f.serving_size,
        serving_unit: f.serving_unit,
        source: "food" as const,
      }))

      const results: FoodItem[] = [...userFoodResults, ...foodResults]

      setSearchResults(results)
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setIsSearching(false)
    }
  }, [supabase])

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedSearch) {
      searchFoods(debouncedSearch)
    }
  }, [debouncedSearch, searchFoods])

  // Add ingredient
  const addIngredient = (food: FoodItem) => {
    // Check if already added
    const exists = ingredients.some(
      i => i.food.id === food.id && i.food.source === food.source
    )
    if (exists) {
      toast.error("This ingredient is already added")
      return
    }

    setIngredients([
      ...ingredients,
      {
        food,
        quantity: food.serving_size,
        unit: food.serving_unit,
      },
    ])
    setSearchQuery("")
    setSearchResults([])
    setShowSearch(false)
    toast.success(`Added ${food.name}`)
  }

  // Update ingredient quantity
  const updateQuantity = (index: number, quantity: number) => {
    if (quantity < 0) return
    setIngredients(
      ingredients.map((ing, i) =>
        i === index ? { ...ing, quantity } : ing
      )
    )
  }

  // Remove ingredient
  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  // Calculate nutrition
  const calculateNutrition = () => {
    return ingredients.reduce(
      (acc, ing) => {
        const multiplier = ing.quantity / ing.food.serving_size
        return {
          calories: acc.calories + ing.food.calories * multiplier,
          protein: acc.protein + ing.food.protein_g * multiplier,
          carbs: acc.carbs + ing.food.carbs_g * multiplier,
          fat: acc.fat + ing.food.fat_g * multiplier,
        }
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    )
  }

  const totalNutrition = calculateNutrition()
  const servingsNum = parseInt(servings) || 1
  const perServing = {
    calories: Math.round(totalNutrition.calories / servingsNum),
    protein: Math.round(totalNutrition.protein / servingsNum),
    carbs: Math.round(totalNutrition.carbs / servingsNum),
    fat: Math.round(totalNutrition.fat / servingsNum),
  }

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error("Please enter a recipe name")
      return
    }

    if (ingredients.length === 0) {
      toast.error("Please add at least one ingredient")
      return
    }

    if (!servings || parseInt(servings) < 1) {
      toast.error("Please enter valid number of servings")
      return
    }

    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("You must be logged in")
        router.push("/login")
        return
      }

      // Create recipe
      const { data: recipe, error: recipeError } = await supabase
        .from("recipes")
        .insert({
          user_id: user.id,
          name: name.trim(),
          description: description.trim() || null,
          servings: parseInt(servings),
          prep_time_minutes: prepTime ? parseInt(prepTime) : null,
          cook_time_minutes: cookTime ? parseInt(cookTime) : null,
          instructions: instructions.trim() || null,
          calories_per_serving: perServing.calories,
          protein_per_serving: perServing.protein,
          carbs_per_serving: perServing.carbs,
          fat_per_serving: perServing.fat,
        } as never)
        .select("id")
        .single()

      if (recipeError) throw recipeError

      // Add ingredients
      const recipeId = (recipe as { id: string }).id
      const ingredientInserts = ingredients.map((ing, index) => ({
        recipe_id: recipeId,
        food_id: ing.food.source === "food" ? ing.food.id : null,
        user_food_id: ing.food.source === "user_food" ? ing.food.id : null,
        quantity: ing.quantity,
        unit: ing.unit,
        order_index: index,
      }))

      const { error: ingredientsError } = await supabase
        .from("recipe_ingredients")
        .insert(ingredientInserts as never)

      if (ingredientsError) throw ingredientsError

      toast.success("Recipe created!")
      router.push("/recipes")
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to create recipe")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto pb-44">
      <Header title="Create Recipe" showBack />

      <div className="p-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header Card */}
          <div className="bg-card rounded-2xl p-5 elevation-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <ChefHat className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">New Recipe</h2>
                <p className="text-sm text-muted-foreground">Combine ingredients into a meal</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Basic Info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground font-medium">Recipe Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="e.g., Chicken Stir Fry"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 rounded-xl"
                    autoFocus
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-foreground font-medium">Description (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="A quick and healthy weeknight dinner..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="rounded-xl resize-none"
                    rows={2}
                  />
                </div>
              </div>

              {/* Servings and Time */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="servings" className="text-xs text-foreground font-medium">Servings *</Label>
                  <Input
                    id="servings"
                    type="number"
                    placeholder="1"
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                    min="1"
                    className="h-10 rounded-lg text-sm"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prepTime" className="text-xs text-foreground font-medium">Prep (min)</Label>
                  <Input
                    id="prepTime"
                    type="number"
                    placeholder="15"
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                    min="0"
                    className="h-10 rounded-lg text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cookTime" className="text-xs text-foreground font-medium">Cook (min)</Label>
                  <Input
                    id="cookTime"
                    type="number"
                    placeholder="30"
                    value={cookTime}
                    onChange={(e) => setCookTime(e.target.value)}
                    min="0"
                    className="h-10 rounded-lg text-sm"
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Ingredients Section */}
          <div className="bg-card rounded-2xl p-5 elevation-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Ingredients</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowSearch(!showSearch)}
                className="rounded-lg"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>

            {/* Search Bar */}
            <AnimatePresence>
              {showSearch && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4"
                >
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search foods..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        searchFoods(e.target.value)
                      }}
                      className="pl-9 h-10 rounded-lg"
                      autoFocus
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("")
                          setSearchResults([])
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        <X className="h-4 w-4 text-muted-foreground" />
                      </button>
                    )}
                  </div>

                  {/* Search Results */}
                  {(isSearching || searchResults.length > 0) && (
                    <div className="mt-2 bg-muted rounded-lg max-h-48 overflow-y-auto">
                      {isSearching ? (
                        <div className="p-3 text-center text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                          Searching...
                        </div>
                      ) : searchResults.length === 0 && searchQuery ? (
                        <div className="p-3 text-center text-sm text-muted-foreground">
                          No foods found
                        </div>
                      ) : (
                        searchResults.map((food) => (
                          <button
                            key={`${food.source}-${food.id}`}
                            type="button"
                            onClick={() => addIngredient(food)}
                            className="w-full p-3 text-left hover:bg-background/50 border-b border-border/50 last:border-0 transition-colors"
                          >
                            <p className="font-medium text-sm">{food.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {food.calories} cal per {food.serving_size}{food.serving_unit}
                              {food.brand && ` - ${food.brand}`}
                            </p>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Ingredients List */}
            {ingredients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No ingredients added yet</p>
                <p className="text-xs mt-1">Click "Add" to search for foods</p>
              </div>
            ) : (
              <div className="space-y-2">
                {ingredients.map((ing, index) => (
                  <div
                    key={`${ing.food.source}-${ing.food.id}`}
                    className="flex items-center gap-2 p-3 bg-muted rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{ing.food.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round((ing.food.calories * ing.quantity) / ing.food.serving_size)} cal
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(index, ing.quantity - (ing.food.serving_size / 4))}
                        className="p-1.5 rounded-md hover:bg-background"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <Input
                        type="number"
                        value={ing.quantity}
                        onChange={(e) => updateQuantity(index, parseFloat(e.target.value) || 0)}
                        className="w-16 h-8 text-center text-sm rounded-md"
                        min="0"
                        step="0.1"
                      />
                      <span className="text-xs text-muted-foreground w-6">{ing.unit}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(index, ing.quantity + (ing.food.serving_size / 4))}
                        className="p-1.5 rounded-md hover:bg-background"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Nutrition Summary */}
          {ingredients.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl p-5 elevation-1"
            >
              <h3 className="font-semibold mb-4">Nutrition per Serving</h3>
              <div className="grid grid-cols-4 gap-3">
                <div className="text-center p-3 bg-muted rounded-xl">
                  <p className="text-2xl font-bold text-primary">{perServing.calories}</p>
                  <p className="text-xs text-muted-foreground">Calories</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-xl">
                  <p className="text-2xl font-bold text-protein">{perServing.protein}g</p>
                  <p className="text-xs text-muted-foreground">Protein</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-xl">
                  <p className="text-2xl font-bold text-carbs">{perServing.carbs}g</p>
                  <p className="text-xs text-muted-foreground">Carbs</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-xl">
                  <p className="text-2xl font-bold text-fat">{perServing.fat}g</p>
                  <p className="text-xs text-muted-foreground">Fat</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-3">
                Total: {Math.round(totalNutrition.calories)} cal for {servingsNum} serving{servingsNum > 1 ? "s" : ""}
              </p>
            </motion.div>
          )}

          {/* Instructions (optional) */}
          <div className="bg-card rounded-2xl p-5 elevation-1">
            <div className="space-y-2">
              <Label htmlFor="instructions" className="text-foreground font-medium">Instructions (optional)</Label>
              <Textarea
                id="instructions"
                placeholder="1. Heat oil in a pan...&#10;2. Add vegetables...&#10;3. Cook until done..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="rounded-xl resize-none"
                rows={4}
              />
            </div>
          </div>

          {/* Submit Button - Fixed above bottom nav */}
          <div className="fixed left-0 right-0 px-4 z-40" style={{ bottom: '6.5rem' }}>
            <div className="max-w-lg mx-auto">
              <Button
                type="submit"
                onClick={handleSubmit}
                className="w-full h-12 rounded-xl text-base font-semibold"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {ingredients.length === 0 ? "Add Ingredients to Save" : "Create Recipe"}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
