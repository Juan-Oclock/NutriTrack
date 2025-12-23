"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { formatDiaryDate, formatDayOfWeek, toDateString, getPreviousDay, getNextDay, getCurrentWeekDays, isSameDayCheck } from "@/lib/utils/date"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface DateSelectorProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
}

export function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
  const weekDays = getCurrentWeekDays()
  const today = new Date()

  const handlePrevDay = () => {
    onDateChange(getPreviousDay(selectedDate))
  }

  const handleNextDay = () => {
    onDateChange(getNextDay(selectedDate))
  }

  const isFuture = selectedDate > today

  return (
    <div className="glass sticky top-0 z-40 border-b border-border/50">
      {/* Main date navigation */}
      <div className="flex items-center justify-between px-4 py-3">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handlePrevDay}
          className="h-10 w-10 rounded-xl flex items-center justify-center hover:bg-muted transition-colors tap-highlight"
        >
          <ChevronLeft className="h-5 w-5" />
        </motion.button>
        <div className="text-center">
          <h2 className="font-semibold text-lg">{formatDiaryDate(selectedDate)}</h2>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleNextDay}
          disabled={isFuture}
          className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center transition-colors tap-highlight",
            isFuture ? "opacity-30" : "hover:bg-muted"
          )}
        >
          <ChevronRight className="h-5 w-5" />
        </motion.button>
      </div>

      {/* Week view */}
      <div className="flex justify-between px-3 pb-3">
        {weekDays.map((day) => {
          const isSelected = isSameDayCheck(day, selectedDate)
          const isDayToday = isSameDayCheck(day, today)
          const dayIsFuture = day > today

          return (
            <motion.button
              key={toDateString(day)}
              whileTap={{ scale: 0.9 }}
              onClick={() => !dayIsFuture && onDateChange(day)}
              disabled={dayIsFuture}
              className={cn(
                "flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all min-w-[42px] tap-highlight relative",
                dayIsFuture && "opacity-30"
              )}
            >
              <span className={cn(
                "text-[10px] font-medium uppercase tracking-wide",
                isSelected ? "text-primary" : "text-muted-foreground"
              )}>
                {formatDayOfWeek(day)}
              </span>
              <div className="relative">
                <span className={cn(
                  "text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full transition-colors",
                  isSelected && "bg-primary text-primary-foreground",
                  isDayToday && !isSelected && "text-primary"
                )}>
                  {day.getDate()}
                </span>
                {isDayToday && !isSelected && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
