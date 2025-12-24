"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is considered fresh for 2 minutes
            staleTime: 2 * 60 * 1000,
            // Cache data for 10 minutes
            gcTime: 10 * 60 * 1000,
            // Refetch on window focus only if data is stale
            refetchOnWindowFocus: true,
            // Don't retry failed requests immediately
            retry: 1,
            retryDelay: 1000,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
