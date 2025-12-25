"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useRef, useState, useEffect } from "react"

interface SegmentOption<T extends string> {
  value: T
  label: string
  icon?: React.ReactNode
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })

  const selectedIndex = options.findIndex((opt) => opt.value === value)

  useEffect(() => {
    if (containerRef.current) {
      const buttons = containerRef.current.querySelectorAll("button")
      const selectedButton = buttons[selectedIndex]
      if (selectedButton) {
        setIndicatorStyle({
          left: selectedButton.offsetLeft,
          width: selectedButton.offsetWidth,
        })
      }
    }
  }, [selectedIndex, options])

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative inline-flex p-1 bg-muted rounded-xl",
        className
      )}
      role="tablist"
    >
      {/* Animated background indicator */}
      <motion.div
        className="absolute top-1 bottom-1 bg-card rounded-lg shadow-sm"
        initial={false}
        animate={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
        }}
      />

      {/* Segment buttons */}
      {options.map((option) => {
        const isSelected = option.value === value
        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={isSelected}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative z-10 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-lg flex-1 min-w-0",
              isSelected
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground/80"
            )}
          >
            {option.icon && (
              <span className="flex-shrink-0">{option.icon}</span>
            )}
            <span className="truncate">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
