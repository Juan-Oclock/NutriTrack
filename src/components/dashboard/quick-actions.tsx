"use client"

import Link from "next/link"
import { ScanBarcode, Camera, Search, Zap } from "lucide-react"
import { motion } from "framer-motion"

function getCurrentMeal(): string {
  const hour = new Date().getHours()
  if (hour < 10) return "breakfast"
  if (hour < 14) return "lunch"
  if (hour < 17) return "snacks"
  return "dinner"
}

const actions = [
  {
    path: "/add-food/barcode",
    label: "Scan",
    icon: ScanBarcode,
    gradient: "from-blue-500 to-blue-600",
    shadow: "shadow-blue-500/25",
  },
  {
    path: "/add-food/meal-scan",
    label: "Photo",
    icon: Camera,
    gradient: "from-purple-500 to-purple-600",
    shadow: "shadow-purple-500/25",
  },
  {
    path: "/add-food/search",
    label: "Search",
    icon: Search,
    gradient: "from-primary to-emerald-600",
    shadow: "shadow-primary/25",
  },
  {
    path: "/add-food/quick-add",
    label: "Quick",
    icon: Zap,
    gradient: "from-orange-500 to-orange-600",
    shadow: "shadow-orange-500/25",
  },
]

export function QuickActions() {
  const meal = getCurrentMeal()
  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="grid grid-cols-4 gap-2">
      {actions.map((action, index) => {
        const href = `${action.path}?meal=${meal}&date=${today}`
        return (
        <motion.div
          key={action.path}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 + index * 0.05 }}
        >
          <Link
            href={href}
            className="flex flex-col items-center gap-2 tap-highlight"
          >
            <motion.div
              whileTap={{ scale: 0.9 }}
              className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg ${action.shadow}`}
            >
              <action.icon className="h-6 w-6 text-white" />
            </motion.div>
            <span className="text-xs font-medium text-muted-foreground">
              {action.label}
            </span>
          </Link>
        </motion.div>
        )
      })}
    </div>
  )
}
