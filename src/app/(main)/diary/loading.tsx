import { Skeleton } from "@/components/ui/skeleton"

export default function DiaryLoading() {
  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/50">
        <Skeleton className="h-6 w-24" />
      </div>

      <div className="p-4 space-y-4">
        {/* Date selector */}
        <Skeleton className="h-12 w-full rounded-xl" />

        {/* Summary card */}
        <Skeleton className="h-24 w-full rounded-2xl" />

        {/* Meal sections */}
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  )
}
