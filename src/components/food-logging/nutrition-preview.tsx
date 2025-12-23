"use client"

import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface NutritionPreviewProps {
  calories: number
  protein: number
  carbs: number
  fat: number
  className?: string
}

export function NutritionPreview({
  calories,
  protein,
  carbs,
  fat,
  className,
}: NutritionPreviewProps) {
  const totalMacros = protein + carbs + fat
  const proteinPercent = totalMacros > 0 ? Math.round((protein * 4 / (calories || 1)) * 100) : 0
  const carbsPercent = totalMacros > 0 ? Math.round((carbs * 4 / (calories || 1)) * 100) : 0
  const fatPercent = totalMacros > 0 ? Math.round((fat * 9 / (calories || 1)) * 100) : 0

  // Mini calorie ring
  const size = 80
  const strokeWidth = 6
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI

  return (
    <div className={cn("flex items-center gap-6", className)}>
      {/* Mini Calorie Ring */}
      <div className="relative flex-shrink-0">
        <svg width={size} height={size} className="transform -rotate-90">
          <defs>
            <linearGradient id="miniCalorieGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(160 70% 40%)" />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
            opacity={0.2}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#miniCalorieGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * 0.25 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={calories}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="text-xl font-bold"
            >
              {Math.round(calories)}
            </motion.span>
          </AnimatePresence>
          <span className="text-[9px] text-muted-foreground uppercase">cal</span>
        </div>
      </div>

      {/* Macro Bars */}
      <div className="flex-1 grid grid-cols-3 gap-3">
        <MacroItem
          label="Carbs"
          value={carbs}
          percent={carbsPercent}
          color="text-carbs"
          bgColor="bg-carbs/20"
          barColor="bg-carbs"
        />
        <MacroItem
          label="Fat"
          value={fat}
          percent={fatPercent}
          color="text-fat"
          bgColor="bg-fat/20"
          barColor="bg-fat"
        />
        <MacroItem
          label="Protein"
          value={protein}
          percent={proteinPercent}
          color="text-protein"
          bgColor="bg-protein/20"
          barColor="bg-protein"
        />
      </div>
    </div>
  )
}

function MacroItem({
  label,
  value,
  percent,
  color,
  bgColor,
  barColor,
}: {
  label: string
  value: number
  percent: number
  color: string
  bgColor: string
  barColor: string
}) {
  return (
    <div className="text-center">
      <p className={cn("text-xs font-medium mb-1", color)}>{percent}%</p>
      <AnimatePresence mode="wait">
        <motion.p
          key={value}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="text-sm font-semibold"
        >
          {value.toFixed(1)} g
        </motion.p>
      </AnimatePresence>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  )
}
