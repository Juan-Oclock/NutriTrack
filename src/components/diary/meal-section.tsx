"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Sun, Cloud, Moon, Cookie, ChevronDown, ChevronUp, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MealType, DiaryEntry, QuickAddEntry } from "@/types/database"

const mealIcons: Record<MealType, React.ElementType> = {
  breakfast: Sun,
  lunch: Cloud,
  dinner: Moon,
  snacks: Cookie,
}

const mealLabels: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snacks: "Snacks",
}

interface MealSectionProps {
  mealType: MealType
  entries: (DiaryEntry | QuickAddEntry)[]
  date: string
  onDeleteEntry?: (id: string, isQuickAdd: boolean) => void
}

export function MealSection({ mealType, entries, date, onDeleteEntry }: MealSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const Icon = mealIcons[mealType]

  const totalCalories = entries.reduce((sum, entry) => {
    if ("logged_calories" in entry) {
      return sum + (entry.logged_calories || 0)
    }
    return sum + (entry.calories || 0)
  }, 0)

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base font-medium">
              {mealLabels[mealType]}
            </CardTitle>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          <div className="flex items-center gap-3">
            <span className="font-semibold tabular-nums">
              {Math.round(totalCalories)}
            </span>
            <Link href={`/add-food?meal=${mealType}&date=${date}`}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Plus className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="pt-0">
          {entries.length === 0 ? (
            <Link
              href={`/add-food?meal=${mealType}&date=${date}`}
              className="block py-4 text-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus className="h-5 w-5 mx-auto mb-1" />
              <span className="text-sm">Add Food</span>
            </Link>
          ) : (
            <div className="divide-y divide-border">
              {entries.map((entry) => {
                const isQuickAdd = !("logged_calories" in entry)
                const calories = isQuickAdd
                  ? (entry as QuickAddEntry).calories
                  : (entry as DiaryEntry).logged_calories
                const name = isQuickAdd
                  ? (entry as QuickAddEntry).description || "Quick Add"
                  : "Food Entry"

                return (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between py-3 group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{name}</p>
                      <p className="text-sm text-muted-foreground">
                        {!isQuickAdd && `${(entry as DiaryEntry).servings} serving`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium tabular-nums">
                        {Math.round(calories)}
                      </span>
                      {onDeleteEntry && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                          onClick={() => onDeleteEntry(entry.id, isQuickAdd)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
