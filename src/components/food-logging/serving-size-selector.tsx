"use client"

import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { FoodServingOption } from "@/types/database"

interface ServingOption {
  id: string
  label: string
  serving_size: number
  serving_unit: string
  multiplier: number
  is_default?: boolean | null
}

interface ServingSizeSelectorProps {
  options: ServingOption[]
  selectedOption: ServingOption | null
  onSelect: (option: ServingOption) => void
  defaultServingSize?: number
  defaultServingUnit?: string
  className?: string
}

export function ServingSizeSelector({
  options,
  selectedOption,
  onSelect,
  defaultServingSize,
  defaultServingUnit,
  className,
}: ServingSizeSelectorProps) {
  // If no options, create a default one from the food's serving info
  const displayOptions: ServingOption[] = options.length > 0
    ? options
    : defaultServingSize && defaultServingUnit
      ? [{
          id: "default",
          label: `${defaultServingSize} ${defaultServingUnit}`,
          serving_size: defaultServingSize,
          serving_unit: defaultServingUnit,
          multiplier: 1,
          is_default: true,
        }]
      : []

  const currentValue = selectedOption?.id || displayOptions[0]?.id || ""

  return (
    <Select
      value={currentValue}
      onValueChange={(value) => {
        const option = displayOptions.find((o) => o.id === value)
        if (option) onSelect(option)
      }}
    >
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder="Select serving size">
          {selectedOption ? (
            <span className="text-primary font-medium">
              {selectedOption.label}
            </span>
          ) : displayOptions[0] ? (
            <span className="text-primary font-medium">
              {displayOptions[0].label}
            </span>
          ) : (
            "Select size"
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {displayOptions.map((option) => (
          <SelectItem key={option.id} value={option.id}>
            <div className="flex items-center justify-between w-full">
              <span>{option.label}</span>
              {option.serving_size && option.serving_unit && (
                <span className="text-xs text-muted-foreground ml-2">
                  ({option.serving_size} {option.serving_unit})
                </span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
