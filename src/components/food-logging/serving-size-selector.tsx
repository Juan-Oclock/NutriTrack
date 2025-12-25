"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

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
  onCustomValueChange?: (value: number) => void
  defaultServingSize?: number
  defaultServingUnit?: string
  className?: string
  baseCaloriesPerUnit?: number
}

export function ServingSizeSelector({
  options,
  selectedOption,
  onSelect,
  onCustomValueChange,
  defaultServingSize,
  defaultServingUnit = "g",
  className,
}: ServingSizeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCustom, setIsCustom] = useState(false)
  const [customValue, setCustomValue] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Focus input when custom mode is activated
  useEffect(() => {
    if (isCustom && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isCustom])

  const handleSelectOption = (option: ServingOption) => {
    setIsCustom(false)
    setCustomValue("")
    onSelect(option)
    setIsOpen(false)
  }

  const handleSelectCustom = () => {
    setIsCustom(true)
    setIsOpen(false)
    // Set initial custom value to current serving size
    if (selectedOption) {
      setCustomValue(selectedOption.serving_size.toString())
    } else if (defaultServingSize) {
      setCustomValue(defaultServingSize.toString())
    }
  }

  const handleCustomValueChange = (value: string) => {
    setCustomValue(value)
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue > 0) {
      // Calculate multiplier based on custom value vs base serving size
      const baseSize = defaultServingSize || selectedOption?.serving_size || 100
      const multiplier = numValue / baseSize

      const customOption: ServingOption = {
        id: "custom",
        label: `${numValue} ${defaultServingUnit || selectedOption?.serving_unit || "g"}`,
        serving_size: numValue,
        serving_unit: defaultServingUnit || selectedOption?.serving_unit || "g",
        multiplier: multiplier,
        is_default: false,
      }
      onSelect(customOption)
      onCustomValueChange?.(numValue)
    }
  }

  const displayLabel = isCustom && customValue
    ? `${customValue} ${defaultServingUnit || "g"}`
    : selectedOption?.label || displayOptions[0]?.label || "Select size"

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {isCustom ? (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="number"
              value={customValue}
              onChange={(e) => handleCustomValueChange(e.target.value)}
              placeholder="Enter amount"
              className="w-full h-11 px-4 pr-12 rounded-xl border border-border bg-muted/30 text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              min="1"
              step="1"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              {defaultServingUnit || "g"}
            </span>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsCustom(false)
              // Reset to first option
              if (displayOptions[0]) {
                onSelect(displayOptions[0])
              }
            }}
            className="h-11 px-4 rounded-xl bg-muted/50 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors tap-highlight"
          >
            Cancel
          </motion.button>
        </div>
      ) : (
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsOpen(!isOpen)}
          className="w-full h-11 px-4 rounded-xl border border-border bg-muted/30 flex items-center justify-between tap-highlight hover:bg-muted/50 transition-colors"
        >
          <span className="text-primary font-medium">{displayLabel}</span>
          <ChevronDown className={cn(
            "h-5 w-5 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )} />
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full left-0 right-0 mt-2 bg-card rounded-2xl border border-border shadow-lg overflow-hidden"
          >
            <div className="py-1">
              {displayOptions.map((option) => (
                <motion.button
                  key={option.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectOption(option)}
                  className={cn(
                    "w-full px-4 py-3 flex items-center justify-between tap-highlight transition-colors",
                    selectedOption?.id === option.id && !isCustom
                      ? "bg-primary/10"
                      : "hover:bg-muted/50"
                  )}
                >
                  <span className={cn(
                    "font-medium",
                    selectedOption?.id === option.id && !isCustom && "text-primary"
                  )}>
                    {option.label}
                  </span>
                  {selectedOption?.id === option.id && !isCustom && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </motion.button>
              ))}

              {/* Divider */}
              <div className="mx-4 my-1 border-t border-border/50" />

              {/* Custom option */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleSelectCustom}
                className={cn(
                  "w-full px-4 py-3 flex items-center justify-between tap-highlight transition-colors",
                  isCustom ? "bg-primary/10" : "hover:bg-muted/50"
                )}
              >
                <span className={cn("font-medium", isCustom && "text-primary")}>
                  Custom amount
                </span>
                {isCustom && <Check className="h-5 w-5 text-primary" />}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
