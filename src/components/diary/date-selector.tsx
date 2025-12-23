"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { formatDiaryDate, formatDayOfWeek, toDateString, getPreviousDay, getNextDay, getCurrentWeekDays, isSameDayCheck } from "@/lib/utils/date"
import { cn } from "@/lib/utils"

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

  const isToday = isSameDayCheck(selectedDate, today)
  const isFuture = selectedDate > today

  return (
    <div className="bg-card border-b border-border">
      {/* Main date navigation */}
      <div className="flex items-center justify-between px-4 py-3">
        <Button variant="ghost" size="icon" onClick={handlePrevDay}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="text-center">
          <h2 className="font-semibold">{formatDiaryDate(selectedDate)}</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextDay}
          disabled={isFuture}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Week view */}
      <div className="flex justify-between px-2 pb-3">
        {weekDays.map((day) => {
          const isSelected = isSameDayCheck(day, selectedDate)
          const isDayToday = isSameDayCheck(day, today)
          const dayIsFuture = day > today

          return (
            <button
              key={toDateString(day)}
              onClick={() => !dayIsFuture && onDateChange(day)}
              disabled={dayIsFuture}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-[40px]",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : dayIsFuture
                  ? "text-muted-foreground/50"
                  : "hover:bg-muted"
              )}
            >
              <span className="text-xs font-medium">
                {formatDayOfWeek(day)}
              </span>
              <span className={cn(
                "text-sm font-bold",
                isDayToday && !isSelected && "text-primary"
              )}>
                {day.getDate()}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
