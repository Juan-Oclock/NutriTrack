"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { debounce } from "@/lib/utils"
import type { Food, UserFood, FoodServingOption } from "@/types/database"

export type SearchResult = (Food | UserFood) & {
  isUserFood?: boolean
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
    limit = 30,
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

        // Search both tables in parallel
        const [foodsRes, userFoodsRes] = await Promise.all([
          supabase
            .from("foods")
            .select("*, food_serving_options(*)")
            .or(`name.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%`)
            .order("is_verified", { ascending: false })
            .order("name")
            .limit(limit),
          user
            ? supabase
                .from("user_foods")
                .select("*, food_serving_options(*)")
                .eq("user_id", user.id)
                .ilike("name", `%${searchQuery}%`)
                .limit(Math.floor(limit / 3))
            : Promise.resolve({ data: [] }),
        ])

        const foods = (foodsRes.data || []) as (Food & { food_serving_options: FoodServingOption[] })[]
        const userFoods = ((userFoodsRes.data || []) as (UserFood & { food_serving_options: FoodServingOption[] })[]).map(
          (f) => ({
            ...f,
            isUserFood: true,
            serving_options: f.food_serving_options,
          })
        )

        // Separate verified (Best Match) from unverified (More Results)
        const verifiedFoods = foods
          .filter((f) => f.is_verified)
          .map((f) => ({ ...f, serving_options: f.food_serving_options }))
        const unverifiedFoods = foods
          .filter((f) => !f.is_verified)
          .map((f) => ({ ...f, serving_options: f.food_serving_options }))

        // User foods go in More Results
        const moreResults = [...userFoods, ...unverifiedFoods]

        setResults({
          bestMatch: verifiedFoods,
          moreResults,
          totalCount: verifiedFoods.length + moreResults.length,
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
