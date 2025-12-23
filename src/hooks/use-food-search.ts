"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { debounce } from "@/lib/utils"
import type { Food, UserFood, FoodServingOption } from "@/types/database"

// Extended type for USDA foods
export interface USDAFood {
  id: string
  fdcId: number
  name: string
  brand: string | null
  serving_size: number
  serving_unit: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g: number
  sugar_g: number
  sodium_mg: number
  saturated_fat_g: number
  cholesterol_mg: number
  potassium_mg: number
  is_verified: boolean
  source: "usda"
  dataType: string
}

export type SearchResult = (Food | UserFood | USDAFood) & {
  isUserFood?: boolean
  isUSDA?: boolean
  serving_options?: FoodServingOption[]
}

export interface SearchResults {
  bestMatch: SearchResult[]
  moreResults: SearchResult[]
  totalCount: number
}

interface UseFoodSearchOptions {
  minQueryLength?: number
  debounceMs?: number
  limit?: number
}

export function useFoodSearch(options: UseFoodSearchOptions = {}) {
  const {
    minQueryLength = 2,
    debounceMs = 300,
    limit = 25,
  } = options

  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResults>({
    bestMatch: [],
    moreResults: [],
    totalCount: 0,
  })
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const supabase = createClient()
  const abortControllerRef = useRef<AbortController | null>(null)

  const searchFoods = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.length < minQueryLength) {
        setResults({ bestMatch: [], moreResults: [], totalCount: 0 })
        return
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      setIsSearching(true)
      setError(null)

      try {
        const { data: { user } } = await supabase.auth.getUser()

        // Search in parallel: USDA API + local user foods
        const [usdaRes, localFoodsRes, userFoodsRes] = await Promise.all([
          // USDA API search
          fetch(`/api/search-foods?query=${encodeURIComponent(searchQuery)}&pageSize=${limit}`, {
            signal: abortControllerRef.current.signal,
          }).then(res => res.json()).catch(() => ({ foods: [], bestMatch: [], moreResults: [] })),

          // Local foods table (for previously saved foods)
          supabase
            .from("foods")
            .select("*, food_serving_options(*)")
            .or(`name.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%`)
            .order("is_verified", { ascending: false })
            .order("name")
            .limit(10),

          // User's custom foods
          user
            ? supabase
                .from("user_foods")
                .select("*, food_serving_options(*)")
                .eq("user_id", user.id)
                .ilike("name", `%${searchQuery}%`)
                .limit(10)
            : Promise.resolve({ data: [] }),
        ])

        // Process local foods
        const localFoods = (localFoodsRes.data || []) as (Food & { food_serving_options: FoodServingOption[] })[]
        const userFoods = ((userFoodsRes.data || []) as (UserFood & { food_serving_options: FoodServingOption[] })[]).map(
          (f) => ({
            ...f,
            isUserFood: true,
            serving_options: f.food_serving_options,
          })
        )

        // Process USDA foods
        const usdaFoods = (usdaRes.foods || []).map((f: USDAFood) => ({
          ...f,
          isUSDA: true,
        }))

        // Combine results
        // Best Match: USDA Foundation/SR Legacy foods + verified local foods
        const bestMatch: SearchResult[] = [
          ...localFoods.filter(f => f.is_verified).map(f => ({ ...f, serving_options: f.food_serving_options })),
          ...(usdaRes.bestMatch || []).map((f: USDAFood) => ({ ...f, isUSDA: true })),
        ]

        // More Results: User foods + unverified local + USDA branded foods
        const moreResults: SearchResult[] = [
          ...userFoods,
          ...localFoods.filter(f => !f.is_verified).map(f => ({ ...f, serving_options: f.food_serving_options })),
          ...(usdaRes.moreResults || []).map((f: USDAFood) => ({ ...f, isUSDA: true })),
        ]

        // Remove duplicates (prefer local over USDA if same name)
        const seenNames = new Set<string>()
        const dedupedBestMatch = bestMatch.filter(f => {
          const key = f.name.toLowerCase()
          if (seenNames.has(key)) return false
          seenNames.add(key)
          return true
        })

        const dedupedMoreResults = moreResults.filter(f => {
          const key = f.name.toLowerCase()
          if (seenNames.has(key)) return false
          seenNames.add(key)
          return true
        })

        setResults({
          bestMatch: dedupedBestMatch.slice(0, 10),
          moreResults: dedupedMoreResults.slice(0, 20),
          totalCount: dedupedBestMatch.length + dedupedMoreResults.length,
        })
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return
        }
        setError(err instanceof Error ? err : new Error("Search failed"))
        console.error("Search error:", err)
      } finally {
        setIsSearching(false)
      }
    },
    [supabase, minQueryLength, limit]
  )

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((q: string) => searchFoods(q), debounceMs),
    [searchFoods, debounceMs]
  )

  useEffect(() => {
    debouncedSearch(query)
  }, [query, debouncedSearch])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    query,
    setQuery,
    results,
    isSearching,
    error,
    clearResults: () => setResults({ bestMatch: [], moreResults: [], totalCount: 0 }),
  }
}
