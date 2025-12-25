"use client"

import { useEffect, useRef, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format, subDays, addDays, isSameDay, startOfDay } from "date-fns"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface DateSelectorProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
  isFetching?: boolean
}

// Generate an array of dates centered around today
function generateDateRange(centerDate: Date, daysBefore: number = 14, daysAfter: number = 7): Date[] {
  const dates: Date[] = []
  const start = subDays(startOfDay(centerDate), daysBefore)
  const totalDays = daysBefore + daysAfter + 1

  for (let i = 0; i < totalDays; i++) {
    dates.push(addDays(start, i))
  }
  return dates
}

export function DateSelector({ selectedDate, onDateChange, isFetching }: DateSelectorProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const selectedDayRef = useRef<HTMLButtonElement>(null)
  const today = startOfDay(new Date())

  // Generate dates: 14 days before today, today, 7 days after
  const dates = generateDateRange(today, 14, 7)

  // Scroll to selected date
  const scrollToDate = useCallback((behavior: ScrollBehavior = "smooth") => {
    if (selectedDayRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const element = selectedDayRef.current
      const containerWidth = container.offsetWidth
      const elementLeft = element.offsetLeft
      const elementWidth = element.offsetWidth
      const scrollLeft = elementLeft - (containerWidth / 2) + (elementWidth / 2)

      container.scrollTo({ left: scrollLeft, behavior })
    }
  }, [])

  // Initial scroll to selected date
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => scrollToDate("instant"), 50)
    return () => clearTimeout(timer)
  }, []) // Only on mount

  // Scroll when selected date changes
  useEffect(() => {
    scrollToDate("smooth")
  }, [selectedDate, scrollToDate])

  const handlePrevDay = () => {
    onDateChange(subDays(selectedDate, 1))
  }

  const handleNextDay = () => {
    const nextDay = addDays(selectedDate, 1)
    if (nextDay <= today) {
      onDateChange(nextDay)
    }
  }

  const canGoForward = addDays(selectedDate, 1) <= today

  // Format the header date
  const headerText = isSameDay(selectedDate, today)
    ? "Today"
    : isSameDay(selectedDate, subDays(today, 1))
    ? "Yesterday"
    : format(selectedDate, "MMMM d")

  return (
    <div
      className="bg-card sticky z-40 border-b border-border/50"
      style={{ top: 'env(safe-area-inset-top, 0px)' }}
    >
      {/* Month and navigation header */}
      <div className="flex items-center justify-between px-4 py-3">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handlePrevDay}
          className="h-10 w-10 rounded-xl flex items-center justify-center hover:bg-muted transition-colors tap-highlight"
          aria-label="Previous day"
        >
          <ChevronLeft className="h-5 w-5" />
        </motion.button>

        <div className="text-center flex items-center gap-2">
          <h2 className="font-semibold text-lg">{headerText}</h2>
          {isFetching && (
            <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          )}
        </div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleNextDay}
          disabled={!canGoForward}
          className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center transition-colors tap-highlight",
            !canGoForward ? "opacity-30 cursor-not-allowed" : "hover:bg-muted"
          )}
          aria-label="Next day"
        >
          <ChevronRight className="h-5 w-5" />
        </motion.button>
      </div>

      {/* Scrollable date strip */}
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto scrollbar-hide pb-3 px-2 gap-1 scroll-smooth"
        style={{
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {dates.map((day) => {
          const isSelected = isSameDay(day, selectedDate)
          const isDayToday = isSameDay(day, today)
          const isFutureDay = day > today

          return (
            <motion.button
              key={day.toISOString()}
              ref={isSelected ? selectedDayRef : null}
              whileTap={{ scale: 0.95 }}
              onClick={() => !isFutureDay && onDateChange(day)}
              disabled={isFutureDay}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all flex-shrink-0 tap-highlight relative",
                "min-w-[52px]",
                isSelected && "bg-primary",
                isFutureDay && "opacity-30 cursor-not-allowed"
              )}
              style={{ scrollSnapAlign: "center" }}
            >
              {/* Day name */}
              <span
                className={cn(
                  "text-[10px] font-medium uppercase tracking-wide",
                  isSelected ? "text-primary-foreground" : "text-muted-foreground"
                )}
              >
                {format(day, "EEE")}
              </span>

              {/* Date number */}
              <span
                className={cn(
                  "text-base font-bold w-9 h-9 flex items-center justify-center rounded-full transition-colors",
                  isSelected && "text-primary-foreground",
                  isDayToday && !isSelected && "text-primary font-extrabold"
                )}
              >
                {day.getDate()}
              </span>

              {/* Today indicator dot */}
              {isDayToday && !isSelected && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
