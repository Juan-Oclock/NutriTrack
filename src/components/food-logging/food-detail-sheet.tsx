"use client"

import { useState, useEffect, useMemo } from "react"
import { Loader2, Minus, Plus, Clock, Coffee, Sun, Moon, Cookie, ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { NutritionPreview } from "./nutrition-preview"
import { ServingSizeSelector } from "./serving-size-selector"
import { VerifiedBadge } from "./verified-badge"
import { motion, AnimatePresence } from "framer-motion"
import type { MealType, FoodServingOption } from "@/types/database"
import type { SearchResult } from "@/hooks/use-food-search"

interface ServingOption {
  id: string
  label: string
  serving_size: number
  serving_unit: string
  multiplier: number
  is_default?: boolean | null
}

interface FoodDetailSheetProps {
  food: SearchResult | null
  servingOptions: FoodServingOption[]
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    servings: number
    servingOption: ServingOption
    mealType: MealType
    loggedTime: string | null
  }) => Promise<void>
  initialMealType: MealType
  isLoading?: boolean
}

const mealOptions: { value: MealType; label: string; icon: typeof Coffee }[] = [
  { value: "breakfast", label: "Breakfast", icon: Coffee },
  { value: "lunch", label: "Lunch", icon: Sun },
  { value: "dinner", label: "Dinner", icon: Moon },
  { value: "snacks", label: "Snacks", icon: Cookie },
]

export function FoodDetailSheet({
  food,
  servingOptions,
  isOpen,
  onClose,
  onSubmit,
  initialMealType,
  isLoading = false,
}: FoodDetailSheetProps) {
  const [servings, setServings] = useState(1)
  const [selectedServingOption, setSelectedServingOption] = useState<ServingOption | null>(null)
  const [mealType, setMealType] = useState<MealType>(initialMealType)
  const [loggedTime, setLoggedTime] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMealDropdownOpen, setIsMealDropdownOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Reset state when food changes
  useEffect(() => {
    if (food) {
      setServings(1)
      setMealType(initialMealType)
      setLoggedTime(null)

      // Set default serving option
      const defaultOption = servingOptions.find((o) => o.is_default) || servingOptions[0]
      if (defaultOption) {
        setSelectedServingOption({
          id: defaultOption.id,
          label: defaultOption.label,
          serving_size: defaultOption.serving_size,
          serving_unit: defaultOption.serving_unit,
          multiplier: defaultOption.multiplier,
          is_default: defaultOption.is_default,
        })
      } else if (food) {
        // Create default from food's serving info
        setSelectedServingOption({
          id: "default",
          label: `${food.serving_size} ${food.serving_unit}`,
          serving_size: food.serving_size,
          serving_unit: food.serving_unit,
          multiplier: 1,
          is_default: true,
        })
      }
    }
  }, [food, servingOptions, initialMealType])

  // Calculate nutrition based on servings and multiplier
  const calculatedNutrition = useMemo(() => {
    if (!food || !selectedServingOption) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0 }
    }

    const multiplier = selectedServingOption.multiplier

    return {
      calories: (food.calories || 0) * multiplier * servings,
      protein: (food.protein_g || 0) * multiplier * servings,
      carbs: (food.carbs_g || 0) * multiplier * servings,
      fat: (food.fat_g || 0) * multiplier * servings,
    }
  }, [food, selectedServingOption, servings])

  const handleSubmit = async () => {
    if (!selectedServingOption) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        servings: servings,
        servingOption: selectedServingOption,
        mealType,
        loggedTime,
      })
      onClose()
    } catch (error) {
      console.error("Error logging food:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const incrementServings = () => {
    setServings((prev) => Math.min(prev + 0.5, 20))
  }

  const decrementServings = () => {
    setServings((prev) => Math.max(prev - 0.5, 0.5))
  }

  const formatTime12Hour = (time24: string) => {
    if (!time24) return ""
    const [hours, minutes] = time24.split(":")
    const hour = parseInt(hours, 10)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const setToNow = () => {
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, "0")
    const minutes = now.getMinutes().toString().padStart(2, "0")
    setLoggedTime(`${hours}:${minutes}`)
  }

  const isUserFood = food && "isUserFood" in food && food.isUserFood
  const isVerified = food && !isUserFood && "is_verified" in food && food.is_verified

  // Convert FoodServingOption[] to ServingOption[]
  const displayServingOptions: ServingOption[] = servingOptions.map((opt) => ({
    id: opt.id,
    label: opt.label,
    serving_size: opt.serving_size,
    serving_unit: opt.serving_unit,
    multiplier: opt.multiplier,
    is_default: opt.is_default,
  }))

  const currentMeal = mealOptions.find((m) => m.value === mealType) || mealOptions[0]
  const MealIcon = currentMeal.icon

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="bottom"
        className="h-auto max-h-[85vh] rounded-t-3xl pb-safe"
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-2 pb-4">
          <div className="w-10 h-1 rounded-full bg-muted" />
        </div>

        {food && (
          <div className="space-y-4 px-1">
            {/* Header */}
            <SheetHeader className="text-left">
              <div className="flex items-start gap-2">
                <SheetTitle className="text-xl font-bold flex-1">
                  {food.name}
                </SheetTitle>
                {isVerified && <VerifiedBadge showTooltip />}
              </div>
              {food.brand && (
                <p className="text-sm text-muted-foreground">{food.brand}</p>
              )}
            </SheetHeader>

            {/* Nutrition Preview */}
            <div className="bg-muted/30 rounded-2xl p-4">
              <NutritionPreview
                calories={calculatedNutrition.calories}
                protein={calculatedNutrition.protein}
                carbs={calculatedNutrition.carbs}
                fat={calculatedNutrition.fat}
              />
            </div>

            {/* iOS-style Form Fields */}
            <div className="bg-card rounded-2xl border border-border/50 divide-y divide-border/50 overflow-hidden">
              {/* Serving Size & Count - Combined Row */}
              <div className="flex items-center justify-between p-4">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-xs text-muted-foreground mb-1.5">Serving Size</p>
                  <ServingSizeSelector
                    options={displayServingOptions}
                    selectedOption={selectedServingOption}
                    onSelect={setSelectedServingOption}
                    defaultServingSize={food.serving_size}
                    defaultServingUnit={food.serving_unit}
                  />
                </div>
                <div className="flex-shrink-0">
                  <p className="text-xs text-muted-foreground mb-1.5 text-center">Servings</p>
                  <div className="flex items-center gap-1 bg-muted/30 rounded-xl p-1">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={decrementServings}
                      disabled={servings <= 0.5}
                      className="h-9 w-9 rounded-lg bg-card flex items-center justify-center tap-highlight disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                    >
                      <Minus className="h-4 w-4" />
                    </motion.button>
                    <span className="w-12 text-center font-semibold text-lg tabular-nums">
                      {servings % 1 === 0 ? servings : servings.toFixed(1)}
                    </span>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={incrementServings}
                      disabled={servings >= 20}
                      className="h-9 w-9 rounded-lg bg-card flex items-center justify-center tap-highlight disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                    >
                      <Plus className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Time Row */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Clock className="h-4.5 w-4.5 text-blue-500" />
                  </div>
                  <span className="font-medium">Time</span>
                </div>
                <div className="flex items-center gap-2">
                  {mounted && (
                    <>
                      <input
                        type="time"
                        value={loggedTime || ""}
                        onChange={(e) => setLoggedTime(e.target.value || null)}
                        className="bg-transparent text-right text-primary font-medium focus:outline-none"
                      />
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={setToNow}
                        className="px-3 py-1.5 rounded-lg bg-muted/50 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors tap-highlight"
                      >
                        Now
                      </motion.button>
                    </>
                  )}
                </div>
              </div>

              {/* Meal Type Row */}
              <div className="relative">
                <motion.button
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setIsMealDropdownOpen(!isMealDropdownOpen)}
                  className="w-full flex items-center justify-between p-4 tap-highlight"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MealIcon className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <span className="font-medium">Meal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-primary font-medium">{currentMeal.label}</span>
                    <ChevronDown className={cn(
                      "h-5 w-5 text-muted-foreground transition-transform",
                      isMealDropdownOpen && "rotate-180"
                    )} />
                  </div>
                </motion.button>

                <AnimatePresence>
                  {isMealDropdownOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-border/50"
                    >
                      <div className="p-2 grid grid-cols-4 gap-2">
                        {mealOptions.map((meal) => {
                          const Icon = meal.icon
                          const isSelected = mealType === meal.value
                          return (
                            <motion.button
                              key={meal.value}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setMealType(meal.value)
                                setIsMealDropdownOpen(false)
                              }}
                              className={cn(
                                "flex flex-col items-center gap-1.5 p-3 rounded-xl tap-highlight transition-colors",
                                isSelected
                                  ? "bg-primary/10"
                                  : "hover:bg-muted/50"
                              )}
                            >
                              <div className={cn(
                                "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                                isSelected ? "bg-primary" : "bg-muted"
                              )}>
                                <Icon className={cn(
                                  "h-5 w-5",
                                  isSelected ? "text-primary-foreground" : "text-muted-foreground"
                                )} />
                              </div>
                              <span className={cn(
                                "text-xs font-medium",
                                isSelected ? "text-primary" : "text-muted-foreground"
                              )}>
                                {meal.label}
                              </span>
                            </motion.button>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Submit Button */}
            <motion.div
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || isLoading}
                className="w-full h-13 rounded-2xl text-base font-semibold"
              >
                {isSubmitting || isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Add to {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
              </Button>
            </motion.div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
