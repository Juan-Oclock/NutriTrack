"use client"

import { ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

interface VerifiedBadgeProps {
  className?: string
  showTooltip?: boolean
}

export function VerifiedBadge({ className, showTooltip = false }: VerifiedBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center",
        className
      )}
      title={showTooltip ? "Verified by NutriTrack" : undefined}
    >
      <ShieldCheck className="h-4 w-4 text-emerald-500" />
    </div>
  )
}
