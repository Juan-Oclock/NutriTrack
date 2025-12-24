"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

export interface DetectedFood {
  name: string
  portion: string
  calories: number
  protein: number
  carbs: number
  fat: number
  confidence: number
}

export interface MealScan {
  id: string
  user_id: string
  image_url: string
  detected_foods: DetectedFood[]
  selected_foods: DetectedFood[] | null
  meal_name: string | null
  total_calories: number | null
  is_favorite: boolean
  scan_date: string
}

interface UseMealHistoryOptions {
  limit?: number
  favoritesOnly?: boolean
}

export function useMealHistory(options: UseMealHistoryOptions = {}) {
  const { limit = 10, favoritesOnly = false } = options

  const [scans, setScans] = useState<MealScan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchScans = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setScans([])
        setLoading(false)
        return
      }

      let query = supabase
        .from("meal_scans")
        .select("*")
        .eq("user_id", user.id)
        .order("scan_date", { ascending: false })
        .limit(limit)

      if (favoritesOnly) {
        query = query.eq("is_favorite", true)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        console.error("Error fetching meal scans:", fetchError)
        setError("Failed to load meal history")
        setScans([])
      } else {
        setScans(data || [])
      }
    } catch (err) {
      console.error("Error in useMealHistory:", err)
      setError("Failed to load meal history")
      setScans([])
    } finally {
      setLoading(false)
    }
  }, [supabase, limit, favoritesOnly])

  // Toggle favorite status
  const toggleFavorite = useCallback(async (scanId: string) => {
    const scan = scans.find((s) => s.id === scanId)
    if (!scan) return

    const newFavoriteStatus = !scan.is_favorite

    // Optimistic update
    setScans((prev) =>
      prev.map((s) =>
        s.id === scanId ? { ...s, is_favorite: newFavoriteStatus } : s
      )
    )

    try {
      const { error: updateError } = await supabase
        .from("meal_scans")
        .update({ is_favorite: newFavoriteStatus } as never)
        .eq("id", scanId)

      if (updateError) {
        // Revert on error
        setScans((prev) =>
          prev.map((s) =>
            s.id === scanId ? { ...s, is_favorite: !newFavoriteStatus } : s
          )
        )
        console.error("Error updating favorite:", updateError)
      }
    } catch (err) {
      console.error("Error toggling favorite:", err)
      // Revert on error
      setScans((prev) =>
        prev.map((s) =>
          s.id === scanId ? { ...s, is_favorite: !newFavoriteStatus } : s
        )
      )
    }
  }, [scans, supabase])

  // Delete a scan
  const deleteScan = useCallback(async (scanId: string) => {
    const previousScans = [...scans]

    // Optimistic update
    setScans((prev) => prev.filter((s) => s.id !== scanId))

    try {
      const { error: deleteError } = await supabase
        .from("meal_scans")
        .delete()
        .eq("id", scanId)

      if (deleteError) {
        // Revert on error
        setScans(previousScans)
        console.error("Error deleting scan:", deleteError)
      }
    } catch (err) {
      console.error("Error deleting scan:", err)
      setScans(previousScans)
    }
  }, [scans, supabase])

  // Fetch on mount
  useEffect(() => {
    fetchScans()
  }, [fetchScans])

  return {
    scans,
    loading,
    error,
    refetch: fetchScans,
    toggleFavorite,
    deleteScan,
    hasHistory: scans.length > 0,
  }
}
