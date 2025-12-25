"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Skeleton } from "@/components/ui/skeleton"
import { CalorieRing } from "@/components/dashboard/calorie-ring"
import { MacroBars } from "@/components/dashboard/macro-bars"
import { StreakCard } from "@/components/dashboard/streak-card"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { formatDiaryDate } from "@/lib/utils/date"
import { ChevronRight, TrendingDown, Scale, BookOpen, ChartBar, Sun, Moon } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import { useUserId } from "@/hooks/use-user"

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const { userId, isLoading: isUserLoading } = useUserId()
  const { profile, goals, streak, todaySummary, isLoading: isDataLoading } = useDashboardData(userId)

  const isLoading = isUserLoading || isDataLoading

  useEffect(() => {
    setMounted(true)
  }, [])

  if (isLoading) {
    return (
      <div className="p-4 space-y-6 max-w-lg mx-auto pb-24">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-[280px] w-full rounded-3xl" />
        <Skeleton className="h-[80px] w-full rounded-2xl" />
        <Skeleton className="h-[140px] w-full rounded-2xl" />
      </div>
    )
  }

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  const firstName = profile?.full_name?.split(" ")[0] || "there"

  return (
    <div className="max-w-lg mx-auto pb-24">
      {/* Fixed Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed left-0 right-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/50"
        style={{ top: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="flex items-end justify-between px-4 py-3 max-w-lg mx-auto">
          <div>
            <p className="text-muted-foreground text-sm">{formatDiaryDate(new Date())}</p>
            <h1 className="text-2xl font-bold tracking-tight">
              {greeting()}, {firstName}
            </h1>
          </div>
          {mounted && (
            <div className="flex items-center gap-2">
              <NotificationBell />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="h-10 w-10 rounded-xl bg-card elevation-1 flex items-center justify-center tap-highlight"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5 text-amber-500" />
                ) : (
                  <Moon className="h-5 w-5 text-slate-600" />
                )}
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Content with top padding to account for fixed header */}
      <div
        className="p-4 space-y-5"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 4.5rem)' }}
      >

      {/* Main Calorie Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-3xl p-6 elevation-2"
      >
        <div className="flex flex-col items-center">
          <CalorieRing
            consumed={todaySummary.calories}
            goal={goals?.calories_goal || 2000}
          />
          <div className="mt-6 w-full">
            <MacroBars
              protein={{
                consumed: todaySummary.protein,
                goal: goals?.protein_goal_g || 150,
              }}
              carbs={{
                consumed: todaySummary.carbs,
                goal: goals?.carbs_goal_g || 250,
              }}
              fat={{
                consumed: todaySummary.fat,
                goal: goals?.fat_goal_g || 65,
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Streak */}
      {streak && streak.current_streak > 0 && (
        <StreakCard
          currentStreak={streak.current_streak}
          longestStreak={streak.longest_streak}
        />
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
          Log Food
        </h2>
        <QuickActions />
      </motion.div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-2 gap-3"
      >
        {/* View Diary */}
        <Link href="/diary" className="tap-highlight">
          <motion.div
            whileTap={{ scale: 0.97 }}
            className="bg-card rounded-2xl p-4 elevation-1 flex flex-col gap-3"
          >
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Food Diary</p>
              <p className="text-xs text-muted-foreground">View meals</p>
            </div>
          </motion.div>
        </Link>

        {/* Insights */}
        <Link href="/insights" className="tap-highlight">
          <motion.div
            whileTap={{ scale: 0.97 }}
            className="bg-card rounded-2xl p-4 elevation-1 flex flex-col gap-3"
          >
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <ChartBar className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="font-medium text-sm">Insights</p>
              <p className="text-xs text-muted-foreground">Weekly stats</p>
            </div>
          </motion.div>
        </Link>
      </motion.div>

      {/* Weight Card */}
      {profile?.current_weight_kg && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Link href="/profile/goals" className="tap-highlight block">
            <motion.div
              whileTap={{ scale: 0.98 }}
              className="bg-card rounded-2xl p-4 elevation-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <Scale className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold tracking-tight">
                      {profile.current_weight_kg.toFixed(1)}
                      <span className="text-sm font-normal text-muted-foreground ml-1">kg</span>
                    </p>
                    <p className="text-xs text-muted-foreground">Current weight</p>
                  </div>
                </div>
                {profile.target_weight_kg && (
                  <div className="text-right flex items-center gap-2">
                    <div>
                      <div className="flex items-center gap-1 text-primary">
                        <TrendingDown className="h-4 w-4" />
                        <span className="font-semibold text-sm">
                          {Math.abs(profile.current_weight_kg - profile.target_weight_kg).toFixed(1)} kg
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">to goal</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>
            </motion.div>
          </Link>
        </motion.div>
      )}
      </div>
    </div>
  )
}
