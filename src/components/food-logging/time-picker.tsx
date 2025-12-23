"use client"

import { useState, useEffect } from "react"
import { Clock, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface TimePickerProps {
  value: string | null
  onChange: (time: string | null) => void
  defaultToNow?: boolean
  className?: string
}

export function TimePicker({
  value,
  onChange,
  defaultToNow = false,
  className,
}: TimePickerProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (defaultToNow && !value) {
      const now = new Date()
      const hours = now.getHours().toString().padStart(2, "0")
      const minutes = now.getMinutes().toString().padStart(2, "0")
      onChange(`${hours}:${minutes}`)
    }
  }, [defaultToNow, value, onChange])

  const setToNow = () => {
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, "0")
    const minutes = now.getMinutes().toString().padStart(2, "0")
    onChange(`${hours}:${minutes}`)
  }

  const formatTime12Hour = (time24: string) => {
    if (!time24) return ""
    const [hours, minutes] = time24.split(":")
    const hour = parseInt(hours, 10)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  if (!mounted) return null

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative flex-1">
        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="time"
          value={value || ""}
          onChange={(e) => onChange(e.target.value || null)}
          className="pl-10 pr-10"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={setToNow}
        className="flex-shrink-0"
      >
        Now
      </Button>
    </div>
  )
}
