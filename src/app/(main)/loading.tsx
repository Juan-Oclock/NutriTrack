import { Skeleton } from "@/components/ui/skeleton"

export default function MainLoading() {
  return (
    <div className="max-w-lg mx-auto p-4 space-y-6">
      {/* Header placeholder */}
      <div className="space-y-2 pt-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-48" />
      </div>

      {/* Main content card */}
      <Skeleton className="h-[280px] w-full rounded-3xl" />

      {/* Secondary content */}
      <Skeleton className="h-20 w-full rounded-2xl" />

      {/* Grid items */}
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
    </div>
  )
}
