"use client"

import { ChevronDown, Coffee, Sun, Moon, Cookie } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { MealType } from "@/types/database"

interface MealTypeSelectorProps {
  value: MealType
  onChange: (meal: MealType) => void
  className?: string
  variant?: "default" | "header"
}

const mealOptions: { value: MealType; label: string; icon: typeof Coffee }[] = [
  { value: "breakfast", label: "Breakfast", icon: Coffee },
  { value: "lunch", label: "Lunch", icon: Sun },
  { value: "dinner", label: "Dinner", icon: Moon },
  { value: "snacks", label: "Snacks", icon: Cookie },
]

export function MealTypeSelector({
  value,
  onChange,
  className,
  variant = "default",
}: MealTypeSelectorProps) {
  const currentMeal = mealOptions.find((m) => m.value === value) || mealOptions[0]
  const Icon = currentMeal.icon

  if (variant === "header") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className={cn(
            "flex items-center gap-1.5 text-sm font-medium text-primary tap-highlight",
            className
          )}>
            <span>{currentMeal.label}</span>
            <ChevronDown className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-40">
          {mealOptions.map((meal) => {
            const MealIcon = meal.icon
            return (
              <DropdownMenuItem
                key={meal.value}
                onClick={() => onChange(meal.value)}
                className={cn(
                  "flex items-center gap-2",
                  value === meal.value && "bg-primary/10"
                )}
              >
                <MealIcon className="h-4 w-4" />
                <span>{meal.label}</span>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={cn(
          "flex items-center justify-between w-full px-3 py-2 rounded-lg border border-input bg-background hover:bg-accent transition-colors tap-highlight",
          className
        )}>
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span>{currentMeal.label}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {mealOptions.map((meal) => {
          const MealIcon = meal.icon
          return (
            <DropdownMenuItem
              key={meal.value}
              onClick={() => onChange(meal.value)}
              className={cn(
                "flex items-center gap-2",
                value === meal.value && "bg-primary/10"
              )}
            >
              <MealIcon className="h-4 w-4" />
              <span>{meal.label}</span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
