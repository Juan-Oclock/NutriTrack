"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { toDateString } from "@/lib/utils/date"
import { queryKeys, useGoals } from "./use-dashboard-data"
import type { MealType, QuickAddEntry, NutritionGoal } from "@/types/database"

// Extended type for diary entries with joined food data
export interface DiaryEntryWithFood {
  id: string
  meal_type: MealType
  logged_at: string
  logged_calories: number
  logged_protein_g: number | null
  logged_carbs_g: number | null
  logged_fat_g: number | null
  servings: number
  foods: { name: string; brand: string | null; serving_size: number; serving_unit: string } | null
  user_foods: { name: string; brand: string | null; serving_size: number; serving_unit: string } | null
  recipes: { name: string } | null
}

export function useDiaryEntries(userId: string | undefined, date: Date) {
  const supabase = createClient()
  const dateStr = toDateString(date)

  return useQuery({
    queryKey: queryKeys.diaryEntries(userId || "", dateStr),
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase
        .from("diary_entries")
        .select(`
          id, meal_type, logged_at, logged_calories, logged_protein_g, logged_carbs_g, logged_fat_g, servings,
          foods (name, brand, serving_size, serving_unit),
          user_foods (name, brand, serving_size, serving_unit),
          recipes (name)
        `)
        .eq("user_id", userId)
        .eq("date", dateStr)
        .order("logged_at", { ascending: true })

      if (error) throw error
      return (data || []) as DiaryEntryWithFood[]
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
  })
}

export function useQuickAddEntries(userId: string | undefined, date: Date) {
  const supabase = createClient()
  const dateStr = toDateString(date)

  return useQuery({
    queryKey: queryKeys.quickAddEntries(userId || "", dateStr),
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase
        .from("quick_add_entries")
        .select("id, meal_type, created_at, calories, protein_g, carbs_g, fat_g, description")
        .eq("user_id", userId)
        .eq("date", dateStr)
        .order("created_at", { ascending: true })

      if (error) throw error
      return (data || []) as QuickAddEntry[]
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
  })
}

export function useDeleteEntry(userId: string | undefined, date: Date) {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const dateStr = toDateString(date)

  return useMutation({
    mutationFn: async ({ id, isQuickAdd }: { id: string; isQuickAdd: boolean }) => {
      const table = isQuickAdd ? "quick_add_entries" : "diary_entries"
      const { error } = await supabase.from(table).delete().eq("id", id)
      if (error) throw error
      return { id, isQuickAdd }
    },
    onMutate: async ({ id, isQuickAdd }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.diaryEntries(userId || "", dateStr) })
      await queryClient.cancelQueries({ queryKey: queryKeys.quickAddEntries(userId || "", dateStr) })

      // Snapshot previous values
      const previousDiaryEntries = queryClient.getQueryData(queryKeys.diaryEntries(userId || "", dateStr))
      const previousQuickAddEntries = queryClient.getQueryData(queryKeys.quickAddEntries(userId || "", dateStr))

      // Optimistically update
      if (isQuickAdd) {
        queryClient.setQueryData(
          queryKeys.quickAddEntries(userId || "", dateStr),
          (old: QuickAddEntry[] | undefined) => old?.filter((e) => e.id !== id) || []
        )
      } else {
        queryClient.setQueryData(
          queryKeys.diaryEntries(userId || "", dateStr),
          (old: DiaryEntryWithFood[] | undefined) => old?.filter((e) => e.id !== id) || []
        )
      }

      return { previousDiaryEntries, previousQuickAddEntries }
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousDiaryEntries) {
        queryClient.setQueryData(queryKeys.diaryEntries(userId || "", dateStr), context.previousDiaryEntries)
      }
      if (context?.previousQuickAddEntries) {
        queryClient.setQueryData(queryKeys.quickAddEntries(userId || "", dateStr), context.previousQuickAddEntries)
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.diaryEntries(userId || "", dateStr) })
      queryClient.invalidateQueries({ queryKey: queryKeys.quickAddEntries(userId || "", dateStr) })
      // Also invalidate daily summary for dashboard
      queryClient.invalidateQueries({ queryKey: queryKeys.dailySummary(userId || "", dateStr) })
    },
  })
}

// Combined hook for diary page
export function useDiaryData(userId: string | undefined, date: Date) {
  const diaryEntries = useDiaryEntries(userId, date)
  const quickAddEntries = useQuickAddEntries(userId, date)
  const goals = useGoals(userId)
  const deleteMutation = useDeleteEntry(userId, date)

  return {
    diaryEntries: diaryEntries.data || [],
    quickAddEntries: quickAddEntries.data || [],
    goals: goals.data as NutritionGoal | null,
    isLoading: diaryEntries.isLoading || quickAddEntries.isLoading,
    isFetching: diaryEntries.isFetching || quickAddEntries.isFetching,
    deleteEntry: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  }
}
