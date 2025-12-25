"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { FoodServingOption } from "@/types/database"

interface UseServingOptionsProps {
  foodId?: string | null
  userFoodId?: string | null
  enabled?: boolean
}

export function useServingOptions({
  foodId,
  userFoodId,
  enabled = true,
}: UseServingOptionsProps) {
  const [options, setOptions] = useState<FoodServingOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const supabase = createClient()

  const fetchOptions = useCallback(async () => {
    if (!enabled || (!foodId && !userFoodId)) {
      setOptions([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      let query = supabase
        .from("food_serving_options")
        .select("*")
        .order("is_default", { ascending: false })
        .order("label")

      if (foodId) {
        query = query.eq("food_id", foodId)
      } else if (userFoodId) {
        query = query.eq("user_food_id", userFoodId)
      }

      const { data, error: queryError } = await query

      if (queryError) throw queryError

      setOptions(data || [])
    } catch (err) {
      // Handle Supabase PostgrestError which has code, message, details, hint properties
      const errorMessage = err && typeof err === 'object' && 'message' in err
        ? (err as { message: string }).message
        : "Failed to fetch serving options"
      const errorCode = err && typeof err === 'object' && 'code' in err
        ? (err as { code: string }).code
        : undefined

      setError(new Error(errorMessage))

      // Only log actual errors, not "no rows" cases
      if (errorCode !== 'PGRST116') {
        console.error("Serving options error:", errorMessage, errorCode ? `(code: ${errorCode})` : "")
      }
    } finally {
      setIsLoading(false)
    }
  }, [supabase, foodId, userFoodId, enabled])

  useEffect(() => {
    fetchOptions()
  }, [fetchOptions])

  return {
    options,
    isLoading,
    error,
    refetch: fetchOptions,
  }
}
