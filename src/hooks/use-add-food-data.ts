"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { useUserId } from "./use-user"
import type { Food, UserFood, Recipe } from "@/types/database"

interface DiaryEntryWithRelations {
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

export const addFoodQueryKeys = {
  recent: (userId: string) => ["addFood", "recent", userId] as const,
  frequent: (userId: string) => ["addFood", "frequent", userId] as const,
  myFoods: (userId: string) => ["addFood", "myFoods", userId] as const,
  recipes: (userId: string) => ["addFood", "recipes", userId] as const,
}

export function useRecentFoods() {
  const { userId } = useUserId()
  const supabase = createClient()

  return useQuery({
    queryKey: addFoodQueryKeys.recent(userId || ""),
    queryFn: async () => {
      if (!userId) return []

      // Get recent diary entries with food details
      const [{ data: foodEntries }, { data: userFoodEntries }] = await Promise.all([
        supabase
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
          .eq("user_id", userId)
          .not("food_id", "is", null)
          .order("logged_at", { ascending: false })
          .limit(20),
        supabase
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
          .eq("user_id", userId)
          .not("user_food_id", "is", null)
          .order("logged_at", { ascending: false })
          .limit(20)
      ])

      const typedEntries = (foodEntries || []) as DiaryEntryWithRelations[]
      const typedUserFoodEntries = (userFoodEntries || []) as DiaryEntryWithRelations[]
      const allEntries = [...typedEntries, ...typedUserFoodEntries]

      const seen = new Set<string>()
      return allEntries
        .filter(entry => {
          const key = entry.food_id || entry.user_food_id || entry.recipe_id
          if (!key || seen.has(key)) return false
          seen.add(key)
          return true
        })
        .sort((a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime())
        .slice(0, 20)
    },
    enabled: !!userId,
    staleTime: 60 * 1000, // Data is fresh for 1 minute
  })
}

export function useFrequentFoods() {
  const { userId } = useUserId()
  const supabase = createClient()

  return useQuery({
    queryKey: addFoodQueryKeys.frequent(userId || ""),
    queryFn: async (): Promise<FrequentFood[]> => {
      if (!userId) return []

      const { data: entries } = await supabase
        .from("diary_entries")
        .select("food_id, user_food_id")
        .eq("user_id", userId)

      if (!entries) return []

      // Count occurrences
      type DiaryEntryPartial = { food_id: string | null; user_food_id: string | null }
      const typedEntries = entries as DiaryEntryPartial[]
      const foodCounts = new Map<string, { food_id: string | null; user_food_id: string | null; count: number }>()

      typedEntries.forEach(entry => {
        const key = entry.food_id || entry.user_food_id
        if (key) {
          const existing = foodCounts.get(key) || { food_id: entry.food_id, user_food_id: entry.user_food_id, count: 0 }
          existing.count++
          foodCounts.set(key, existing)
        }
      })

      // Sort and take top 20
      const sortedFoods = Array.from(foodCounts.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 20)

      // Fetch food details
      const foodIds = sortedFoods.filter(f => f.food_id).map(f => f.food_id!)
      const userFoodIds = sortedFoods.filter(f => f.user_food_id).map(f => f.user_food_id!)

      const [foodsResult, userFoodsResult] = await Promise.all([
        foodIds.length > 0
          ? supabase.from("foods").select("*").in("id", foodIds)
          : Promise.resolve({ data: [] }),
        userFoodIds.length > 0
          ? supabase.from("user_foods").select("*").in("id", userFoodIds)
          : Promise.resolve({ data: [] })
      ])

      const foods = (foodsResult.data || []) as Food[]
      const userFoods = (userFoodsResult.data || []) as UserFood[]

      const foodMap = new Map(foods.map(f => [f.id, f]))
      const userFoodMap = new Map(userFoods.map(f => [f.id, f]))

      return sortedFoods.map(f => ({
        ...f,
        food: f.food_id ? foodMap.get(f.food_id) || null : null,
        user_food: f.user_food_id ? userFoodMap.get(f.user_food_id) || null : null,
      }))
    },
    enabled: !!userId,
    staleTime: 60 * 1000,
  })
}

export function useMyFoods() {
  const { userId } = useUserId()
  const supabase = createClient()

  return useQuery({
    queryKey: addFoodQueryKeys.myFoods(userId || ""),
    queryFn: async () => {
      if (!userId) return []
      const { data } = await supabase
        .from("user_foods")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
      return (data || []) as UserFood[]
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // User foods change less often
  })
}

export function useMyRecipes() {
  const { userId } = useUserId()
  const supabase = createClient()

  return useQuery({
    queryKey: addFoodQueryKeys.recipes(userId || ""),
    queryFn: async () => {
      if (!userId) return []
      const { data } = await supabase
        .from("recipes")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
      return (data || []) as Recipe[]
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  })
}

// Hook to prefetch all tab data
export function usePrefetchAddFoodData() {
  const { userId } = useUserId()
  const queryClient = useQueryClient()
  const supabase = createClient()

  const prefetch = () => {
    if (!userId) return

    // Prefetch all tabs in the background
    queryClient.prefetchQuery({
      queryKey: addFoodQueryKeys.recent(userId),
      staleTime: 60 * 1000,
    })
    queryClient.prefetchQuery({
      queryKey: addFoodQueryKeys.frequent(userId),
      staleTime: 60 * 1000,
    })
    queryClient.prefetchQuery({
      queryKey: addFoodQueryKeys.myFoods(userId),
      staleTime: 2 * 60 * 1000,
    })
    queryClient.prefetchQuery({
      queryKey: addFoodQueryKeys.recipes(userId),
      staleTime: 2 * 60 * 1000,
    })
  }

  return { prefetch }
}
