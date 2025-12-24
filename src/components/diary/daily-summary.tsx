"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Flame } from "lucide-react"

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
    {
      label: "Protein",
      short: "P",
      consumed: protein.consumed,
      goal: protein.goal,
      ringColor: "stroke-rose-500",
      textColor: "text-rose-500",
      bgColor: "bg-rose-500/10",
    },
    {
      label: "Carbs",
      short: "C",
      consumed: carbs.consumed,
      goal: carbs.goal,
      ringColor: "stroke-blue-500",
      textColor: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Fat",
      short: "F",
      consumed: fat.consumed,
      goal: fat.goal,
      ringColor: "stroke-amber-500",
      textColor: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
  ]

  return (
    <div className={cn("bg-card p-5", className)}>
      {/* Calories Section */}
      <div className="flex items-center gap-4">
        {/* Mini calorie ring */}
        <div className="relative w-16 h-16 shrink-0">
          <svg className="w-16 h-16 transform -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="26"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="6"
              opacity={0.15}
            />
            <motion.circle
              cx="32"
              cy="32"
              r="26"
              fill="none"
              strokeWidth="6"
              strokeDasharray={163.36}
              initial={{ strokeDashoffset: 163.36 }}
              animate={{ strokeDashoffset: 163.36 - (caloriePercentage / 100) * 163.36 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              strokeLinecap="round"
              className={isOver ? "stroke-destructive" : "stroke-primary"}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Flame className={cn(
              "h-5 w-5",
              isOver ? "text-destructive" : "text-primary"
            )} />
          </div>
        </div>

        {/* Calorie info */}
        <div className="flex-1">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold tabular-nums">
              {Math.round(calories.consumed).toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground font-medium">
              / {calories.goal.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              Calories
            </span>
            <span className={cn(
              "text-xs font-semibold px-2.5 py-1 rounded-full",
              isOver
                ? "bg-destructive/10 text-destructive"
                : "bg-primary/10 text-primary"
            )}>
              {Math.round(remaining).toLocaleString()} {isOver ? "over" : "left"}
            </span>
          </div>
        </div>
      </div>

      {/* Macros - Modern circular indicators */}
      <div className="flex justify-between gap-2 mt-5 pt-4 border-t border-border/30">
        {macros.map((macro, index) => {
          const percentage = Math.min((macro.consumed / macro.goal) * 100, 100)
          const macroIsOver = macro.consumed > macro.goal
          const circumference = 2 * Math.PI * 16

          return (
            <motion.div
              key={macro.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className={cn(
                "flex-1 flex flex-col items-center p-2.5 rounded-xl",
                macro.bgColor
              )}
            >
              {/* Mini ring */}
              <div className="relative w-10 h-10 mb-1.5">
                <svg className="w-10 h-10 transform -rotate-90">
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-background/50"
                  />
                  <motion.circle
                    cx="20"
                    cy="20"
                    r="16"
                    fill="none"
                    strokeWidth="3"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: circumference - (percentage / 100) * circumference }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 + index * 0.05 }}
                    strokeLinecap="round"
                    className={macroIsOver ? "stroke-destructive" : macro.ringColor}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={cn(
                    "text-[10px] font-bold",
                    macroIsOver ? "text-destructive" : macro.textColor
                  )}>
                    {macro.short}
                  </span>
                </div>
              </div>

              {/* Values */}
              <div className="text-center">
                <span className={cn(
                  "text-sm font-bold tabular-nums",
                  macroIsOver ? "text-destructive" : "text-foreground"
                )}>
                  {Math.round(macro.consumed)}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  /{macro.goal}g
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
