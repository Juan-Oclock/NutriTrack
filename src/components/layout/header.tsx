"use client"

import { useRouter } from "next/navigation"
import { Bell, Search, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

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
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border safe-area-top">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="-ml-2"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          {title && (
            <h1 className="text-lg font-semibold truncate">{title}</h1>
          )}
        </div>

        <div className="flex items-center gap-2">
          {showSearch && (
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
          )}
          {showNotifications && (
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
          )}
          {rightContent}
        </div>
      </div>
    </header>
  )
}
