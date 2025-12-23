"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { memo } from "react"

interface MacroBarsProps {
  protein: { consumed: number; goal: number }
  carbs: { consumed: number; goal: number }
  fat: { consumed: number; goal: number }
  className?: string
  compact?: boolean
}

export const MacroBars = memo(function MacroBars({ protein, carbs, fat, className, compact = false }: MacroBarsProps) {
  const macros = [
    {
      label: "Protein",
      short: "P",
      consumed: protein.consumed,
      goal: protein.goal,
      color: "bg-protein",
      textColor: "text-protein",
      bgColor: "bg-protein/15",
    },
    {
      label: "Carbs",
      short: "C",
      consumed: carbs.consumed,
      goal: carbs.goal,
      color: "bg-carbs",
      textColor: "text-carbs",
      bgColor: "bg-carbs/15",
    },
    {
      label: "Fat",
      short: "F",
      consumed: fat.consumed,
      goal: fat.goal,
      color: "bg-fat",
      textColor: "text-fat",
      bgColor: "bg-fat/15",
    },
  ]

  if (compact) {
    return (
      <div className={cn("flex items-center justify-center gap-4", className)}>
        {macros.map((macro, index) => {
          const percentage = Math.min((macro.consumed / macro.goal) * 100, 100)
          return (
            <motion.div
              key={macro.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center gap-1"
            >
              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center relative", macro.bgColor)}>
                <svg className="w-12 h-12 absolute transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-muted/10"
                  />
                  <motion.circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={125.6}
                    initial={{ strokeDashoffset: 125.6 }}
                    animate={{ strokeDashoffset: 125.6 - (percentage / 100) * 125.6 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    strokeLinecap="round"
                    className={macro.textColor}
                  />
                </svg>
                <span className={cn("text-xs font-bold", macro.textColor)}>{macro.short}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {Math.round(macro.consumed)}g
              </span>
            </motion.div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      {macros.map((macro, index) => {
        const percentage = Math.min((macro.consumed / macro.goal) * 100, 100)
        const isOver = macro.consumed > macro.goal

        return (
          <motion.div
            key={macro.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="flex items-center gap-3"
          >
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", macro.bgColor)}>
              <span className={cn("text-xs font-bold", macro.textColor)}>{macro.short}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{macro.label}</span>
                <span className={cn(
                  "text-xs tabular-nums",
                  isOver ? "text-destructive font-medium" : "text-muted-foreground"
                )}>
                  {Math.round(macro.consumed)}/{macro.goal}g
                </span>
              </div>
              <div className={cn("h-1.5 rounded-full overflow-hidden", macro.bgColor)}>
                <motion.div
                  className={cn(
                    "h-full rounded-full",
                    isOver ? "bg-destructive" : macro.color
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 + index * 0.1 }}
                />
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
})
