"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { memo, useEffect, useState } from "react"
import { Flame } from "lucide-react"

interface CalorieRingProps {
  consumed: number
  goal: number
  size?: number
  strokeWidth?: number
  className?: string
}

export const CalorieRing = memo(function CalorieRing({
  consumed,
  goal,
  size = 200,
  strokeWidth = 16,
  className,
}: CalorieRingProps) {
  const [animatedConsumed, setAnimatedConsumed] = useState(0)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const percentage = Math.min((consumed / goal) * 100, 100)
  const strokeDashoffset = circumference - (percentage / 100) * circumference
  const remaining = Math.max(goal - consumed, 0)
  const isOver = consumed > goal

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedConsumed(consumed), 100)
    return () => clearTimeout(timer)
  }, [consumed])

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      {/* Outer glow effect */}
      <div
        className={cn(
          "absolute rounded-full opacity-20 blur-xl",
          isOver ? "bg-destructive" : "bg-primary"
        )}
        style={{
          width: size + 40,
          height: size + 40,
        }}
      />

      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="innerShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.1" />
          </filter>
        </defs>

        {/* Background circle with subtle gradient */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          opacity={0.15}
          filter="url(#innerShadow)"
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isOver ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          strokeLinecap="round"
          filter="url(#glow)"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {/* Flame icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className={cn(
            "mb-1 p-2 rounded-full",
            isOver ? "bg-destructive/10" : "bg-primary/10"
          )}
        >
          <Flame className={cn(
            "h-5 w-5",
            isOver ? "text-destructive" : "text-primary"
          )} />
        </motion.div>

        {/* Calorie count */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex items-baseline gap-1"
        >
          <span className="text-4xl font-bold tracking-tight">
            {Math.round(animatedConsumed).toLocaleString()}
          </span>
          <span className="text-sm text-muted-foreground font-medium">
            /{goal.toLocaleString()}
          </span>
        </motion.div>

        <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mt-0.5">
          calories
        </span>

        {/* Remaining badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className={cn(
            "mt-3 px-4 py-1.5 rounded-full text-sm font-semibold",
            "shadow-sm border",
            isOver
              ? "bg-destructive/10 text-destructive border-destructive/20"
              : "bg-primary/10 text-primary border-primary/20"
          )}
        >
          {isOver
            ? `${Math.round(consumed - goal).toLocaleString()} over`
            : `${Math.round(remaining).toLocaleString()} left`}
        </motion.div>
      </div>
    </div>
  )
})
