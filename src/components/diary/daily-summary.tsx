"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

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
  const remaining = Math.abs(calories.goal - calories.consumed)
  const isOver = calories.consumed > calories.goal

  const macros = [
    { label: "Protein", short: "P", consumed: protein.consumed, goal: protein.goal, color: "text-protein", bgColor: "bg-protein" },
    { label: "Carbs", short: "C", consumed: carbs.consumed, goal: carbs.goal, color: "text-carbs", bgColor: "bg-carbs" },
    { label: "Fat", short: "F", consumed: fat.consumed, goal: fat.goal, color: "text-fat", bgColor: "bg-fat" },
  ]

  return (
    <div className={cn("bg-card p-4", className)}>
      {/* Calories progress bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="h-2.5 rounded-full bg-muted/30 overflow-hidden">
            <motion.div
              className={cn(
                "h-full rounded-full",
                isOver ? "bg-destructive" : "bg-primary"
              )}
              initial={{ width: 0 }}
              animate={{ width: `${caloriePercentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
        <div className="text-right min-w-[100px]">
          <span className="text-lg font-bold tabular-nums">
            {Math.round(calories.consumed)}
          </span>
          <span className="text-sm text-muted-foreground">
            {" "}/ {calories.goal}
          </span>
        </div>
      </div>

      {/* Remaining badge */}
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-muted-foreground uppercase tracking-wide">
          Calories
        </span>
        <span className={cn(
          "text-xs font-medium px-2 py-0.5 rounded-full",
          isOver ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
        )}>
          {Math.round(remaining)} {isOver ? "over" : "left"}
        </span>
      </div>

      {/* Macros - compact pills */}
      <div className="flex justify-center gap-3 mt-4 pt-4 border-t border-border/50">
        {macros.map((macro) => {
          const percentage = Math.min((macro.consumed / macro.goal) * 100, 100)
          const macroIsOver = macro.consumed > macro.goal

          return (
            <div key={macro.label} className="flex items-center gap-2">
              <div className={cn(
                "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold",
                macro.color,
                `${macro.bgColor}/15`
              )}>
                {macro.short}
              </div>
              <div className="text-sm">
                <span className={cn("font-semibold tabular-nums", macroIsOver && "text-destructive")}>
                  {Math.round(macro.consumed)}
                </span>
                <span className="text-muted-foreground text-xs">
                  /{macro.goal}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
