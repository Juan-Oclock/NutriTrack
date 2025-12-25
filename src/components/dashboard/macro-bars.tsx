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
      ringColor: "stroke-rose-500",
      textColor: "text-rose-500",
      bgColor: "bg-rose-100 dark:bg-rose-500/20",
      borderColor: "border-rose-200 dark:border-rose-500/30",
    },
    {
      label: "Carbs",
      short: "C",
      consumed: carbs.consumed,
      goal: carbs.goal,
      ringColor: "stroke-blue-500",
      textColor: "text-blue-500",
      bgColor: "bg-blue-100 dark:bg-blue-500/20",
      borderColor: "border-blue-200 dark:border-blue-500/30",
    },
    {
      label: "Fat",
      short: "F",
      consumed: fat.consumed,
      goal: fat.goal,
      ringColor: "stroke-amber-500",
      textColor: "text-amber-500",
      bgColor: "bg-amber-100 dark:bg-amber-500/20",
      borderColor: "border-amber-200 dark:border-amber-500/30",
    },
  ]

  if (compact) {
    return (
      <div className={cn("flex items-center justify-center gap-4", className)}>
        {macros.map((macro, index) => {
          const percentage = Math.min((macro.consumed / macro.goal) * 100, 100)
          const circumference = 2 * Math.PI * 18
          const strokeDashoffset = circumference - (percentage / 100) * circumference

          return (
            <motion.div
              key={macro.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center gap-1"
            >
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-muted/10"
                  />
                  <motion.circle
                    cx="24"
                    cy="24"
                    r="18"
                    fill="none"
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    strokeLinecap="round"
                    className={macro.ringColor}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={cn("text-xs font-bold", macro.textColor)}>{macro.short}</span>
                </div>
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
    <div className={cn("flex items-center justify-between gap-2", className)}>
      {macros.map((macro, index) => {
        const percentage = Math.min((macro.consumed / macro.goal) * 100, 100)
        const isOver = macro.consumed > macro.goal
        const circumference = 2 * Math.PI * 24
        const strokeDashoffset = circumference - (percentage / 100) * circumference

        return (
          <motion.div
            key={macro.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 + index * 0.1, type: "spring", stiffness: 200 }}
            className={cn(
              "flex-1 flex flex-col items-center p-3 rounded-2xl border",
              macro.bgColor,
              macro.borderColor
            )}
          >
            {/* Circular Progress */}
            <div className="relative w-14 h-14 mb-2">
              <svg className="w-14 h-14 transform -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  className="text-background/50"
                />
                <motion.circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  strokeWidth="5"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1, ease: [0.4, 0, 0.2, 1], delay: 0.6 + index * 0.1 }}
                  strokeLinecap="round"
                  className={isOver ? "stroke-destructive" : macro.ringColor}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={cn(
                  "text-base font-bold",
                  isOver ? "text-destructive" : macro.textColor
                )}>
                  {Math.round(percentage)}%
                </span>
              </div>
            </div>

            {/* Label */}
            <span className="text-xs font-semibold text-foreground/80 mb-0.5">
              {macro.label}
            </span>

            {/* Values */}
            <div className="text-center">
              <span className={cn(
                "text-sm font-bold tabular-nums",
                isOver ? "text-destructive" : "text-foreground"
              )}>
                {Math.round(macro.consumed)}
              </span>
              <span className="text-xs text-muted-foreground">
                /{macro.goal}g
              </span>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
})
