"use client"

import { Flame, Trophy } from "lucide-react"
import { motion } from "framer-motion"

interface StreakCardProps {
  currentStreak: number
  longestStreak: number
}

export function StreakCard({ currentStreak, longestStreak }: StreakCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="relative overflow-hidden rounded-2xl bg-orange-500 p-4"
    >
      {/* Decorative background elements */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-xl" />
      <div className="absolute -left-4 -bottom-4 h-16 w-16 rounded-full bg-white/5 blur-lg" />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          >
            <Flame className="h-6 w-6 text-white" />
          </motion.div>
          <div>
            <p className="text-3xl font-bold text-white tracking-tight">
              {currentStreak}
              <span className="text-lg font-normal text-white/80 ml-1">
                {currentStreak === 1 ? "day" : "days"}
              </span>
            </p>
            <p className="text-sm text-white/70">Current streak</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2">
          <Trophy className="h-4 w-4 text-yellow-300" />
          <div className="text-right">
            <p className="text-lg font-bold text-white">{longestStreak}</p>
            <p className="text-[10px] text-white/70 uppercase tracking-wide">Best</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
