"use client"

import Link from "next/link"
import { ScanBarcode, Camera, Search, Zap } from "lucide-react"

const actions = [
  { href: "/add-food/barcode", label: "Scan Barcode", icon: ScanBarcode, color: "bg-blue-100 text-blue-600" },
  { href: "/add-food/meal-scan", label: "Meal Scan", icon: Camera, color: "bg-purple-100 text-purple-600" },
  { href: "/add-food/search", label: "Search Food", icon: Search, color: "bg-green-100 text-green-600" },
  { href: "/add-food/quick-add", label: "Quick Add", icon: Zap, color: "bg-orange-100 text-orange-600" },
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors"
        >
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${action.color}`}>
            <action.icon className="h-5 w-5" />
          </div>
          <span className="text-xs font-medium text-center leading-tight">
            {action.label}
          </span>
        </Link>
      ))}
    </div>
  )
}
