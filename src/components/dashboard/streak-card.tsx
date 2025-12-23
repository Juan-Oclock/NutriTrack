"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Flame } from "lucide-react"

interface StreakCardProps {
  currentStreak: number
  longestStreak: number
}

export function StreakCard({ currentStreak, longestStreak }: StreakCardProps) {
  return (
    <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{currentStreak} day{currentStreak !== 1 ? "s" : ""}</p>
              <p className="text-sm text-white/80">Current streak</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">{longestStreak}</p>
            <p className="text-xs text-white/80">Best streak</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
