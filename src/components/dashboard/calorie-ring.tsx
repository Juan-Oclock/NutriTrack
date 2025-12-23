"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { memo, useEffect, useState } from "react"

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
  size = 180,
  strokeWidth = 14,
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
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id="calorieGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(160 70% 40%)" />
          </linearGradient>
          <linearGradient id="overGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--destructive))" />
            <stop offset="100%" stopColor="hsl(20 80% 50%)" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          opacity={0.2}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isOver ? "url(#overGradient)" : "url(#calorieGradient)"}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
          strokeLinecap="round"
          filter="url(#glow)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <motion.span
          className="text-4xl font-bold tracking-tight"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {Math.round(animatedConsumed).toLocaleString()}
        </motion.span>
        <span className="text-xs text-muted-foreground uppercase tracking-widest mt-0.5">
          calories
        </span>
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className={cn(
            "mt-2 px-3 py-1 rounded-full text-sm font-medium",
            isOver
              ? "bg-destructive/10 text-destructive"
              : "bg-primary/10 text-primary"
          )}
        >
          {isOver
            ? `${Math.round(consumed - goal)} over`
            : `${Math.round(remaining)} left`}
        </motion.div>
      </div>
    </div>
  )
})
