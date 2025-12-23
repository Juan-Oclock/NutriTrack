"use client"

import { useRouter } from "next/navigation"
import { Bell, Search, ChevronLeft } from "lucide-react"
import { motion } from "framer-motion"

interface HeaderProps {
  title?: string
  showBack?: boolean
  showSearch?: boolean
  showNotifications?: boolean
  rightContent?: React.ReactNode
}

export function Header({
  title,
  showBack = false,
  showSearch = false,
  showNotifications = false,
  rightContent,
}: HeaderProps) {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-40 glass border-b border-border/50 safe-area-top">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          {showBack && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => router.back()}
              className="h-10 w-10 -ml-2 rounded-xl flex items-center justify-center hover:bg-muted transition-colors tap-highlight"
            >
              <ChevronLeft className="h-5 w-5" />
            </motion.button>
          )}
          {title && (
            <h1 className="text-lg font-semibold truncate">{title}</h1>
          )}
        </div>

        <div className="flex items-center gap-1">
          {showSearch && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="h-10 w-10 rounded-xl flex items-center justify-center hover:bg-muted transition-colors tap-highlight"
            >
              <Search className="h-5 w-5" />
            </motion.button>
          )}
          {showNotifications && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="h-10 w-10 rounded-xl flex items-center justify-center hover:bg-muted transition-colors tap-highlight relative"
            >
              <Bell className="h-5 w-5" />
            </motion.button>
          )}
          {rightContent}
        </div>
      </div>
    </header>
  )
}
