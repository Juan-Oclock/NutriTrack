"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

export function useUser() {
  const supabase = createClient()

  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return user
    },
    staleTime: 5 * 60 * 1000, // User session is stable
    gcTime: 30 * 60 * 1000,
  })
}

export function useUserId() {
  const { data: user, isLoading, error } = useUser()
  return {
    userId: user?.id,
    isLoading,
    error,
  }
}
