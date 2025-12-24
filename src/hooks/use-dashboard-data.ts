"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { toDateString } from "@/lib/utils/date"
import type { Profile, NutritionGoal, UserStreak } from "@/types/database"

interface DailySummary {
  calories: number
  protein: number
  carbs: number
  fat: number
}

// Query keys for cache management
export const queryKeys = {
  profile: (userId: string) => ["profile", userId] as const,
  goals: (userId: string) => ["goals", userId] as const,
  streak: (userId: string) => ["streak", userId] as const,
  dailySummary: (userId: string, date: string) => ["dailySummary", userId, date] as const,
  diaryEntries: (userId: string, date: string) => ["diaryEntries", userId, date] as const,
  quickAddEntries: (userId: string, date: string) => ["quickAddEntries", userId, date] as const,
}

export function useProfile(userId: string | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: queryKeys.profile(userId || ""),
    queryFn: async () => {
      if (!userId) return null
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, current_weight_kg, target_weight_kg")
        .eq("id", userId)
        .single()

      if (error) throw error
      return data as Profile
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // Profile data is stable
  })
}

export function useGoals(userId: string | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: queryKeys.goals(userId || ""),
    queryFn: async () => {
      if (!userId) return null
      const { data, error } = await supabase
        .from("nutrition_goals")
        .select("calories_goal, protein_goal_g, carbs_goal_g, fat_goal_g")
        .eq("user_id", userId)
        .eq("is_active", true)
        .single()

      if (error && error.code !== "PGRST116") throw error
      return data as NutritionGoal | null
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useStreak(userId: string | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: queryKeys.streak(userId || ""),
    queryFn: async () => {
      if (!userId) return null
      const { data, error } = await supabase
        .from("user_streaks")
        .select("current_streak, longest_streak")
        .eq("user_id", userId)
        .single()

      if (error && error.code !== "PGRST116") throw error
      return data as UserStreak | null
    },
    enabled: !!userId,
    staleTime: 60 * 1000, // Streak can change more frequently
  })
}

export function useDailySummary(userId: string | undefined, date?: Date) {
  const supabase = createClient()
  const dateStr = toDateString(date || new Date())

  return useQuery({
    queryKey: queryKeys.dailySummary(userId || "", dateStr),
    queryFn: async (): Promise<DailySummary> => {
      if (!userId) return { calories: 0, protein: 0, carbs: 0, fat: 0 }

      const [{ data: diaryData }, { data: quickAddData }] = await Promise.all([
        supabase
          .from("diary_entries")
          .select("logged_calories, logged_protein_g, logged_carbs_g, logged_fat_g")
          .eq("user_id", userId)
          .eq("date", dateStr),
        supabase
          .from("quick_add_entries")
          .select("calories, protein_g, carbs_g, fat_g")
          .eq("user_id", userId)
          .eq("date", dateStr)
      ])

      let totalCalories = 0
      let totalProtein = 0
      let totalCarbs = 0
      let totalFat = 0

      if (diaryData) {
        diaryData.forEach((entry: { logged_calories: number; logged_protein_g: number | null; logged_carbs_g: number | null; logged_fat_g: number | null }) => {
          totalCalories += entry.logged_calories || 0
          totalProtein += entry.logged_protein_g || 0
          totalCarbs += entry.logged_carbs_g || 0
          totalFat += entry.logged_fat_g || 0
        })
      }

      if (quickAddData) {
        quickAddData.forEach((entry: { calories: number; protein_g: number | null; carbs_g: number | null; fat_g: number | null }) => {
          totalCalories += entry.calories || 0
          totalProtein += entry.protein_g || 0
          totalCarbs += entry.carbs_g || 0
          totalFat += entry.fat_g || 0
        })
      }

      return {
        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat,
      }
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // Diary data changes often
  })
}

// Combined hook for dashboard
export function useDashboardData(userId: string | undefined) {
  const profile = useProfile(userId)
  const goals = useGoals(userId)
  const streak = useStreak(userId)
  const dailySummary = useDailySummary(userId)

  return {
    profile: profile.data,
    goals: goals.data,
    streak: streak.data,
    todaySummary: dailySummary.data || { calories: 0, protein: 0, carbs: 0, fat: 0 },
    isLoading: profile.isLoading || goals.isLoading || streak.isLoading || dailySummary.isLoading,
    error: profile.error || goals.error || streak.error || dailySummary.error,
  }
}
