"use client"

import { cn } from "@/lib/utils"

interface CalorieRingProps {
  consumed: number
  goal: number
  size?: number
  strokeWidth?: number
  className?: string
}

export function CalorieRing({
  consumed,
  goal,
  size = 200,
  strokeWidth = 16,
  className,
}: CalorieRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const percentage = Math.min((consumed / goal) * 100, 100)
  const strokeDashoffset = circumference - (percentage / 100) * circumference
  const remaining = Math.max(goal - consumed, 0)
  const isOver = consumed > goal

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn(
            "transition-all duration-500 ease-out",
            isOver ? "text-destructive" : "text-primary"
          )}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-4xl font-bold tracking-tight">
          {Math.round(consumed).toLocaleString()}
        </span>
        <span className="text-sm text-muted-foreground">
          of {goal.toLocaleString()}
        </span>
        <span className={cn(
          "text-lg font-semibold mt-1",
          isOver ? "text-destructive" : "text-primary"
        )}>
          {isOver ? `${Math.round(consumed - goal)} over` : `${Math.round(remaining)} left`}
        </span>
      </div>
    </div>
  )
}
