"use client"

import { Plus, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface QuickAddButtonProps {
  onClick: () => void
  isLoading?: boolean
  className?: string
}

export function QuickAddButton({
  onClick,
  isLoading = false,
  className,
}: QuickAddButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={(e) => {
        e.stopPropagation() // Prevent opening the detail sheet
        onClick()
      }}
      disabled={isLoading}
      className={cn(
        "h-8 w-8 rounded-full flex items-center justify-center transition-colors tap-highlight",
        "bg-primary/10 hover:bg-primary/20 text-primary",
        isLoading && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Plus className="h-4 w-4" />
      )}
    </motion.button>
  )
}
