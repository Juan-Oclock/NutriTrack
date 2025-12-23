"use client"

import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface MacroBarsProps {
  protein: { consumed: number; goal: number }
  carbs: { consumed: number; goal: number }
  fat: { consumed: number; goal: number }
  className?: string
}

export function MacroBars({ protein, carbs, fat, className }: MacroBarsProps) {
  const macros = [
    {
      label: "Protein",
      consumed: protein.consumed,
      goal: protein.goal,
      color: "bg-red-500",
      bgColor: "bg-red-100",
    },
    {
      label: "Carbs",
      consumed: carbs.consumed,
      goal: carbs.goal,
      color: "bg-blue-500",
      bgColor: "bg-blue-100",
    },
    {
      label: "Fat",
      consumed: fat.consumed,
      goal: fat.goal,
      color: "bg-yellow-500",
      bgColor: "bg-yellow-100",
    },
  ]

  return (
    <div className={cn("space-y-3", className)}>
      {macros.map((macro) => {
        const percentage = Math.min((macro.consumed / macro.goal) * 100, 100)
        const isOver = macro.consumed > macro.goal

        return (
          <div key={macro.label} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{macro.label}</span>
              <span className={cn(
                "tabular-nums",
                isOver ? "text-destructive font-medium" : "text-muted-foreground"
              )}>
                {Math.round(macro.consumed)}
                <span className="text-muted-foreground">/{macro.goal}g</span>
              </span>
            </div>
            <Progress
              value={percentage}
              className={cn("h-2", macro.bgColor)}
              indicatorClassName={cn(macro.color, isOver && "bg-destructive")}
            />
          </div>
        )
      })}
    </div>
  )
}
