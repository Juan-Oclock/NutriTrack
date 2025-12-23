"use client"

import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface DailySummaryProps {
  calories: { consumed: number; goal: number }
  protein: { consumed: number; goal: number }
  carbs: { consumed: number; goal: number }
  fat: { consumed: number; goal: number }
  className?: string
}

export function DailySummary({
  calories,
  protein,
  carbs,
  fat,
  className,
}: DailySummaryProps) {
  const caloriePercentage = Math.min((calories.consumed / calories.goal) * 100, 100)
  const remaining = calories.goal - calories.consumed
  const isOver = calories.consumed > calories.goal

  return (
    <div className={cn("bg-card border-b border-border p-4 space-y-4", className)}>
      {/* Calories */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-medium">Calories</span>
          <div className="text-right">
            <span className="font-bold tabular-nums">
              {Math.round(calories.consumed)}
            </span>
            <span className="text-muted-foreground"> / {calories.goal}</span>
            <span className={cn(
              "ml-2 text-sm font-medium",
              isOver ? "text-destructive" : "text-primary"
            )}>
              ({isOver ? "+" : ""}{Math.round(remaining * -1 * (isOver ? 1 : -1))} {isOver ? "over" : "left"})
            </span>
          </div>
        </div>
        <Progress
          value={caloriePercentage}
          className="h-3"
          indicatorClassName={isOver ? "bg-destructive" : "bg-primary"}
        />
      </div>

      {/* Macros */}
      <div className="grid grid-cols-3 gap-4">
        <MacroItem
          label="Protein"
          consumed={protein.consumed}
          goal={protein.goal}
          color="text-red-500"
          bgColor="bg-red-500"
        />
        <MacroItem
          label="Carbs"
          consumed={carbs.consumed}
          goal={carbs.goal}
          color="text-blue-500"
          bgColor="bg-blue-500"
        />
        <MacroItem
          label="Fat"
          consumed={fat.consumed}
          goal={fat.goal}
          color="text-yellow-500"
          bgColor="bg-yellow-500"
        />
      </div>
    </div>
  )
}

interface MacroItemProps {
  label: string
  consumed: number
  goal: number
  color: string
  bgColor: string
}

function MacroItem({ label, consumed, goal, color, bgColor }: MacroItemProps) {
  const percentage = Math.min((consumed / goal) * 100, 100)
  const isOver = consumed > goal

  return (
    <div className="text-center">
      <p className={cn("text-sm font-medium mb-1", color)}>{label}</p>
      <p className="text-lg font-bold tabular-nums">
        {Math.round(consumed)}
        <span className="text-xs text-muted-foreground font-normal">/{goal}g</span>
      </p>
      <Progress
        value={percentage}
        className="h-1.5 mt-1"
        indicatorClassName={isOver ? "bg-destructive" : bgColor}
      />
    </div>
  )
}
