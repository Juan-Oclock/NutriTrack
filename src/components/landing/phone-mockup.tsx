"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Leaf, Apple, Camera, Search, Zap } from "lucide-react"

interface PhoneMockupProps {
  src?: string
  alt: string
  className?: string
  priority?: boolean
  variant?: "dashboard" | "diary" | "insights"
}

// Placeholder content that mimics the actual app screens
function DashboardPlaceholder() {
  return (
    <div className="p-4 space-y-4 bg-background h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground">Good morning</div>
          <div className="font-semibold text-sm text-foreground">John</div>
        </div>
        <div className="h-8 w-8 rounded-full bg-muted" />
      </div>

      {/* Calorie Ring */}
      <div className="bg-card rounded-2xl p-4 relative overflow-hidden">
        <div className="flex items-center justify-center py-4">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="url(#gradient)" strokeWidth="8" strokeDasharray="264" strokeDashoffset="66" strokeLinecap="round" />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(153 60% 45%)" />
                  <stop offset="100%" stopColor="hsl(153 60% 45%)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-foreground">1,450</span>
              <span className="text-[10px] text-muted-foreground">of 2,000</span>
            </div>
          </div>
        </div>
        {/* Macro bars */}
        <div className="grid grid-cols-3 gap-2 mt-2">
          <div className="space-y-1">
            <div className="h-1.5 bg-pink-500/20 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-pink-500 rounded-full" />
            </div>
            <div className="text-[9px] text-muted-foreground text-center">Protein</div>
          </div>
          <div className="space-y-1">
            <div className="h-1.5 bg-blue-500/20 rounded-full overflow-hidden">
              <div className="h-full w-1/2 bg-blue-500 rounded-full" />
            </div>
            <div className="text-[9px] text-muted-foreground text-center">Carbs</div>
          </div>
          <div className="space-y-1">
            <div className="h-1.5 bg-amber-500/20 rounded-full overflow-hidden">
              <div className="h-full w-2/3 bg-amber-500 rounded-full" />
            </div>
            <div className="text-[9px] text-muted-foreground text-center">Fat</div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: Camera, color: "bg-blue-500" },
          { icon: Search, color: "bg-purple-500" },
          { icon: Apple, color: "bg-primary" },
          { icon: Zap, color: "bg-amber-500" },
        ].map((item, i) => (
          <div key={i} className={cn("h-12 rounded-xl flex items-center justify-center", item.color)}>
            <item.icon className="h-5 w-5 text-white" />
          </div>
        ))}
      </div>

      {/* Streak card */}
      <div className="bg-orange-500 rounded-2xl p-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔥</span>
          <div>
            <div className="text-xs text-white/80">Current Streak</div>
            <div className="font-bold text-white">7 days</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DiaryPlaceholder() {
  return (
    <div className="p-4 space-y-4 bg-background h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="font-semibold text-sm text-foreground">Food Diary</div>
        <div className="text-xs text-muted-foreground">Today</div>
      </div>

      {/* Summary card */}
      <div className="bg-card rounded-2xl p-3 flex items-center justify-between">
        <div className="text-center">
          <div className="text-lg font-bold text-foreground">1,450</div>
          <div className="text-[10px] text-muted-foreground">Eaten</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-primary">550</div>
          <div className="text-[10px] text-muted-foreground">Remaining</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-foreground">2,000</div>
          <div className="text-[10px] text-muted-foreground">Goal</div>
        </div>
      </div>

      {/* Meals */}
      {["Breakfast", "Lunch", "Dinner", "Snacks"].map((meal, i) => (
        <div key={meal} className="bg-card rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium text-xs text-foreground">{meal}</div>
            <div className="text-xs text-muted-foreground">{[420, 580, 350, 100][i]} cal</div>
          </div>
          <div className="space-y-1">
            {i < 3 && (
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground">Sample food item</span>
                <span className="text-muted-foreground">{[180, 280, 200][i]}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function InsightsPlaceholder() {
  return (
    <div className="p-4 space-y-4 bg-background h-full">
      {/* Header */}
      <div className="font-semibold text-sm text-foreground">Insights</div>

      {/* Weight chart placeholder */}
      <div className="bg-card rounded-2xl p-4">
        <div className="text-xs text-muted-foreground mb-3">Weight Progress</div>
        <div className="h-24 flex items-end justify-between gap-1">
          {[70, 65, 60, 55, 58, 52, 48].map((h, i) => (
            <div key={i} className="flex-1 bg-primary/20 rounded-t" style={{ height: `${h}%` }}>
              <div className="h-full bg-primary rounded-t" style={{ height: "70%" }} />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-[8px] text-muted-foreground">
          <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-card rounded-xl p-3">
          <div className="text-[10px] text-muted-foreground">Current Weight</div>
          <div className="text-lg font-bold text-foreground">165 lbs</div>
        </div>
        <div className="bg-card rounded-xl p-3">
          <div className="text-[10px] text-muted-foreground">Target</div>
          <div className="text-lg font-bold text-primary">155 lbs</div>
        </div>
      </div>

      {/* Weekly summary */}
      <div className="bg-card rounded-xl p-3">
        <div className="text-xs text-muted-foreground mb-2">This Week</div>
        <div className="flex items-center gap-2">
          <div className="text-xl">📉</div>
          <div>
            <div className="text-sm font-medium text-foreground">-1.5 lbs</div>
            <div className="text-[10px] text-muted-foreground">Great progress!</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function PhoneMockup({ alt, className, variant = "dashboard" }: PhoneMockupProps) {
  const PlaceholderContent = {
    dashboard: DashboardPlaceholder,
    diary: DiaryPlaceholder,
    insights: InsightsPlaceholder,
  }[variant]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={cn("relative", className)}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 -z-10 bg-primary/20 blur-3xl rounded-full scale-75" />

      {/* Phone frame */}
      <div className="relative rounded-[2.5rem] bg-slate-900 p-2 shadow-2xl shadow-black/50 border border-slate-700/50">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-900 rounded-b-2xl z-10" />

        {/* Screen */}
        <div className="rounded-[2rem] overflow-hidden bg-background w-[280px] h-[580px]">
          <PlaceholderContent />
        </div>

        {/* Home indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 bg-slate-600 rounded-full" />
      </div>
    </motion.div>
  )
}
