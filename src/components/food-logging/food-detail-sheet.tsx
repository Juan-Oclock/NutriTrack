"use client"

import { useState, useEffect, useMemo } from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { NutritionPreview } from "./nutrition-preview"
import { ServingSizeSelector } from "./serving-size-selector"
import { TimePicker } from "./time-picker"
import { MealTypeSelector } from "./meal-type-selector"
import { VerifiedBadge } from "./verified-badge"
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

export function FoodDetailSheet({
  food,
  servingOptions,
  isOpen,
  onClose,
  onSubmit,
  initialMealType,
  isLoading = false,
}: FoodDetailSheetProps) {
  const [servings, setServings] = useState("1")
  const [selectedServingOption, setSelectedServingOption] = useState<ServingOption | null>(null)
  const [mealType, setMealType] = useState<MealType>(initialMealType)
  const [loggedTime, setLoggedTime] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset state when food changes
  useEffect(() => {
    if (food) {
      setServings("1")
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

    const servingsNum = parseFloat(servings) || 1
    const multiplier = selectedServingOption.multiplier

    return {
      calories: (food.calories || 0) * multiplier * servingsNum,
      protein: (food.protein_g || 0) * multiplier * servingsNum,
      carbs: (food.carbs_g || 0) * multiplier * servingsNum,
      fat: (food.fat_g || 0) * multiplier * servingsNum,
    }
  }, [food, selectedServingOption, servings])

  const handleSubmit = async () => {
    if (!selectedServingOption) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        servings: parseFloat(servings) || 1,
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
          <div className="space-y-5 px-1">
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

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Serving Size */}
              <div className="space-y-2">
                <Label>Serving Size</Label>
                <ServingSizeSelector
                  options={displayServingOptions}
                  selectedOption={selectedServingOption}
                  onSelect={setSelectedServingOption}
                  defaultServingSize={food.serving_size}
                  defaultServingUnit={food.serving_unit}
                />
              </div>

              {/* Number of Servings */}
              <div className="space-y-2">
                <Label>Number of Servings</Label>
                <Input
                  type="number"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  min="0.25"
                  step="0.25"
                  className="text-center text-lg font-medium"
                />
              </div>

              {/* Time */}
              <div className="space-y-2">
                <Label>Time</Label>
                <TimePicker
                  value={loggedTime}
                  onChange={setLoggedTime}
                />
              </div>

              {/* Meal Type */}
              <div className="space-y-2">
                <Label>Meal</Label>
                <MealTypeSelector
                  value={mealType}
                  onChange={setMealType}
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || isLoading}
              className="w-full h-12 rounded-xl text-base font-semibold"
            >
              {isSubmitting || isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Add to {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
