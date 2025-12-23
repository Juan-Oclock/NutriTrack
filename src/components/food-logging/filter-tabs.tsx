"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export type FilterTab = "all" | "meals" | "recipes" | "foods"

interface FilterTabsProps {
  activeTab: FilterTab
  onTabChange: (tab: FilterTab) => void
  counts?: {
    meals?: number
    recipes?: number
    foods?: number
  }
  className?: string
}

const tabs: { value: FilterTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "meals", label: "My Meals" },
  { value: "recipes", label: "My Recipes" },
  { value: "foods", label: "My Foods" },
]

export function FilterTabs({
  activeTab,
  onTabChange,
  counts,
  className,
}: FilterTabsProps) {
  return (
    <div className={cn("flex gap-1 overflow-x-auto scrollbar-hide pb-1", className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value
        const count = tab.value !== "all" ? counts?.[tab.value] : undefined

        return (
          <button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className={cn(
              "relative flex-shrink-0 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors tap-highlight",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-primary/10 rounded-lg"
                initial={false}
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              {tab.label}
              {count !== undefined && count > 0 && (
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full",
                  isActive ? "bg-primary/20" : "bg-muted"
                )}>
                  {count}
                </span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}
