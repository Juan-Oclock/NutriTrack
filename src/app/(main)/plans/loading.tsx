import { Skeleton } from "@/components/ui/skeleton"

export default function PlansLoading() {
  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/50">
        <Skeleton className="h-6 w-28" />
      </div>

      <div className="p-4 space-y-4">
        {/* Day selector */}
        <Skeleton className="h-12 w-full rounded-lg" />

        {/* Meal slots */}
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    </div>
  )
}
