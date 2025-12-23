"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/layout/header"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Check, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { debounce } from "@/lib/utils"
import type { Food, UserFood } from "@/types/database"

type SearchResult = (Food | UserFood) & { isUserFood?: boolean }

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const meal = searchParams.get("meal") || "breakfast"
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0]

  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedFood, setSelectedFood] = useState<SearchResult | null>(null)
  const [servings, setServings] = useState("1")
  const [isLogging, setIsLogging] = useState(false)

  const supabase = createClient()

  const searchFoods = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([])
      return
    }

    setIsSearching(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Search both foods and user_foods tables
      const [foodsRes, userFoodsRes] = await Promise.all([
        supabase
          .from("foods")
          .select("*")
          .ilike("name", `%${searchQuery}%`)
          .limit(20),
        user
          ? supabase
              .from("user_foods")
              .select("*")
              .eq("user_id", user.id)
              .ilike("name", `%${searchQuery}%`)
              .limit(10)
          : Promise.resolve({ data: [] }),
      ])

      const foods = (foodsRes.data || []) as Food[]
      const userFoods = ((userFoodsRes.data || []) as UserFood[]).map((f) => ({
        ...f,
        isUserFood: true,
      }))

      setResults([...userFoods, ...foods])
    } catch (error) {
      console.error("Search error:", error)
      toast.error("Failed to search foods")
    } finally {
      setIsSearching(false)
    }
  }

  const debouncedSearch = debounce(searchFoods, 300)

  useEffect(() => {
    debouncedSearch(query)
  }, [query])

  const handleLogFood = async () => {
    if (!selectedFood) return

    setIsLogging(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("You must be logged in")
        return
      }

      const servingsNum = parseFloat(servings) || 1
      const isUserFood = "isUserFood" in selectedFood && selectedFood.isUserFood

      const { error } = await supabase.from("diary_entries").insert({
        user_id: user.id,
        date,
        meal_type: meal as "breakfast" | "lunch" | "dinner" | "snacks",
        food_id: isUserFood ? null : selectedFood.id,
        user_food_id: isUserFood ? selectedFood.id : null,
        servings: servingsNum,
        logged_calories: selectedFood.calories * servingsNum,
        logged_protein_g: selectedFood.protein_g * servingsNum,
        logged_carbs_g: selectedFood.carbs_g * servingsNum,
        logged_fat_g: selectedFood.fat_g * servingsNum,
        logged_fiber_g: selectedFood.fiber_g * servingsNum,
        logged_sugar_g: selectedFood.sugar_g * servingsNum,
        logged_sodium_mg: selectedFood.sodium_mg * servingsNum,
      } as never)

      if (error) throw error

      toast.success(`${selectedFood.name} added to ${meal}`)
      router.push("/diary")
    } catch (error) {
      console.error("Error logging food:", error)
      toast.error("Failed to log food")
    } finally {
      setIsLogging(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <Header title="Search Foods" showBack />

      <div className="p-4 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search foods..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
            autoFocus
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Results */}
        <div className="space-y-2">
          {results.length === 0 && query.length >= 2 && !isSearching && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No foods found for &quot;{query}&quot;</p>
              <p className="text-sm">Try a different search term</p>
            </div>
          )}

          {results.map((food) => {
            const isSelected = selectedFood?.id === food.id
            const isUserFood = "isUserFood" in food && food.isUserFood

            return (
              <Card
                key={food.id}
                className={`cursor-pointer transition-colors ${
                  isSelected ? "border-primary bg-primary/5" : "hover:border-primary/50"
                }`}
                onClick={() => setSelectedFood(isSelected ? null : food)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{food.name}</p>
                      {isUserFood && (
                        <Badge variant="secondary" className="text-xs">My Food</Badge>
                      )}
                      {!isUserFood && (food as Food).is_verified && (
                        <Badge variant="default" className="text-xs">Verified</Badge>
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
                    {isSelected ? (
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full border-2 border-muted flex items-center justify-center">
                        <Plus className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Bottom sheet for selected food */}
      {selectedFood && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 safe-area-bottom">
          <div className="max-w-lg mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{selectedFood.name}</p>
                <p className="text-sm text-muted-foreground">
                  {Math.round(selectedFood.calories * (parseFloat(servings) || 1))} cal
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  className="w-20 text-center"
                  min="0.25"
                  step="0.25"
                />
                <span className="text-sm text-muted-foreground">servings</span>
              </div>
            </div>
            <Button
              className="w-full"
              onClick={handleLogFood}
              disabled={isLogging}
            >
              {isLogging && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add to {meal.charAt(0).toUpperCase() + meal.slice(1)}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <SearchContent />
    </Suspense>
  )
}
