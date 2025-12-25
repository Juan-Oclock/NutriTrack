"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BookOpen, Plus, BarChart2, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

function getCurrentMeal(): string {
  const hour = new Date().getHours()
  if (hour < 10) return "breakfast"
  if (hour < 14) return "lunch"
  if (hour < 17) return "snacks"
  return "dinner"
}

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/diary", label: "Diary", icon: BookOpen },
  { href: "/add-food", label: "Add", icon: Plus, isCenter: true, dynamic: true },
  { href: "/insights", label: "Insights", icon: BarChart2 },
  { href: "/profile", label: "Profile", icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div
        className="glass border-t border-border/50"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)' }}
      >
        <div className="flex items-center justify-around h-14 max-w-lg mx-auto px-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            const Icon = item.icon

            if (item.isCenter) {
              const href = item.dynamic ? `${item.href}?meal=${getCurrentMeal()}` : item.href
              return (
                <Link
                  key={item.href}
                  href={href}
                  className="flex items-center justify-center -mt-5 tap-highlight"
                >
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg glow-primary"
                  >
                    <Plus className="h-7 w-7 text-primary-foreground" strokeWidth={2.5} />
                  </motion.div>
                </Link>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center gap-0.5 px-4 py-2 tap-highlight relative"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="flex flex-col items-center gap-0.5"
                >
                  <div className="relative">
                    <Icon
                      className={cn(
                        "h-6 w-6 transition-colors duration-200",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    {isActive && (
                      <motion.div
                        layoutId="navIndicator"
                        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-medium transition-colors duration-200",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
