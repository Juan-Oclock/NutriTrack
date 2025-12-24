"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/layout/header"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Search, ChefHat, Clock, Users, Trash2, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Recipe {
  id: string
  name: string
  description?: string
  servings: number
  prep_time_min?: number
  total_calories: number
  total_protein_g: number
  total_carbs_g: number
  total_fat_g: number
  created_at: string
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadRecipes() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
          .from("recipes")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (data) setRecipes(data as Recipe[])
      } catch (error) {
        console.error("Error loading recipes:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadRecipes()
  }, [supabase])

  const handleDelete = async (id: string) => {
    try {
      await supabase.from("recipes").delete().eq("id", id)
      setRecipes(recipes.filter(r => r.id !== id))
      toast.success("Recipe deleted")
    } catch (error) {
      toast.error("Failed to delete recipe")
    }
  }

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto pb-24">
        <Header title="My Recipes" showBack />
        <div className="p-4 space-y-3">
          <Skeleton className="h-12 w-full rounded-xl" />
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto pb-24">
      <Header title="My Recipes" showBack />

      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 rounded-xl bg-card"
          />
        </div>

        {/* Create Button */}
        <Link href="/recipes/create">
          <motion.div
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 p-4 rounded-2xl bg-primary text-white tap-highlight"
          >
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">Create Recipe</p>
              <p className="text-sm text-white/80">Combine foods into a meal</p>
            </div>
          </motion.div>
        </Link>

        {/* Recipes List */}
        {filteredRecipes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="h-20 w-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <ChefHat className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No recipes yet</h3>
            <p className="text-muted-foreground text-sm">
              Create recipes to quickly log your favorite meals
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredRecipes.map((recipe, index) => {
                const caloriesPerServing = Math.round(recipe.total_calories / recipe.servings)
                const proteinPerServing = Math.round(recipe.total_protein_g / recipe.servings)
                const carbsPerServing = Math.round(recipe.total_carbs_g / recipe.servings)
                const fatPerServing = Math.round(recipe.total_fat_g / recipe.servings)

                return (
                  <motion.div
                    key={recipe.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card rounded-2xl overflow-hidden elevation-1"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{recipe.name}</h4>
                          {recipe.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {recipe.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-primary">{caloriesPerServing}</p>
                          <p className="text-[10px] text-muted-foreground">cal/serving</p>
                        </div>
                      </div>

                      {/* Meta */}
                      <div className="flex gap-4 mb-3">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{recipe.servings} servings</span>
                        </div>
                        {recipe.prep_time_min && (
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{recipe.prep_time_min} min</span>
                          </div>
                        )}
                      </div>

                      {/* Macros */}
                      <div className="flex gap-4 pt-3 border-t border-border/50">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-bold text-protein bg-protein/20 px-1.5 py-0.5 rounded">P</span>
                          <span className="text-sm">{proteinPerServing}g</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-bold text-carbs bg-carbs/20 px-1.5 py-0.5 rounded">C</span>
                          <span className="text-sm">{carbsPerServing}g</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-bold text-fat bg-fat/20 px-1.5 py-0.5 rounded">F</span>
                          <span className="text-sm">{fatPerServing}g</span>
                        </div>
                        <div className="flex-1" />
                        <button
                          onClick={() => handleDelete(recipe.id)}
                          className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors tap-highlight"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
