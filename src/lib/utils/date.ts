import { format, formatDistanceToNow, isToday, isYesterday, startOfDay, endOfDay, subDays, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from "date-fns"

export function formatDate(date: Date | string, formatStr: string = "MMM d, yyyy"): string {
  const d = typeof date === "string" ? parseISO(date) : date
  return format(d, formatStr)
}

export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date

  if (isToday(d)) return "Today"
  if (isYesterday(d)) return "Yesterday"

  return formatDistanceToNow(d, { addSuffix: true })
}

export function formatDiaryDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date

  if (isToday(d)) return "Today"
  if (isYesterday(d)) return "Yesterday"

  return format(d, "EEEE, MMM d")
}

export function formatShortDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date
  return format(d, "MMM d")
}

export function formatDayOfWeek(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date
  return format(d, "EEE")
}

export function toDateString(date: Date): string {
  return format(date, "yyyy-MM-dd")
}

export function fromDateString(dateStr: string): Date {
  return parseISO(dateStr)
}

export function getStartOfDay(date: Date): Date {
  return startOfDay(date)
}

export function getEndOfDay(date: Date): Date {
  return endOfDay(date)
}

export function getStartOfWeek(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 0 })
}

export function getEndOfWeek(date: Date): Date {
  return endOfWeek(date, { weekStartsOn: 0 })
}

export function getPreviousDay(date: Date): Date {
  return subDays(date, 1)
}

export function getNextDay(date: Date): Date {
  return addDays(date, 1)
}

export function getDaysInRange(start: Date, end: Date): Date[] {
  return eachDayOfInterval({ start, end })
}

export function getLast7Days(date: Date = new Date()): Date[] {
  return getDaysInRange(subDays(date, 6), date)
}

export function getLast30Days(date: Date = new Date()): Date[] {
  return getDaysInRange(subDays(date, 29), date)
}

export function isSameDayCheck(date1: Date, date2: Date): boolean {
  return isSameDay(date1, date2)
}

export function getCurrentWeekDays(): Date[] {
  const today = new Date()
  const start = getStartOfWeek(today)
  const end = getEndOfWeek(today)
  return getDaysInRange(start, end)
}
