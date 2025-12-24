"use client"

import { useState, useRef, useEffect } from "react"
import { Bell, Check, Download, Utensils, X, CheckCheck, RefreshCw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useNotifications } from "@/hooks/use-notifications"
import { usePwaUpdate } from "@/hooks/use-pwa-update"
import { cn } from "@/lib/utils"
import type { Notification } from "@/types/database"

function useIsInstalledPWA() {
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
    const isIOSStandalone = ("standalone" in window.navigator) && (window.navigator as Navigator & { standalone: boolean }).standalone
    setIsInstalled(isStandalone || isIOSStandalone)
  }, [])

  return isInstalled
}

function formatTimeAgo(date: string): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return then.toLocaleDateString()
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "app_update":
      return Download
    case "meal_reminder":
      return Utensils
    default:
      return Bell
  }
}

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
}

function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const Icon = getNotificationIcon(notification.type)

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className={cn(
        "p-3 rounded-xl flex gap-3 relative group transition-colors",
        notification.is_read
          ? "bg-transparent"
          : "bg-primary/5"
      )}
    >
      <div
        className={cn(
          "h-9 w-9 rounded-lg flex items-center justify-center shrink-0",
          notification.type === "app_update"
            ? "bg-blue-500/10 text-blue-500"
            : notification.type === "meal_reminder"
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm leading-tight">{notification.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-[10px] text-muted-foreground/60 mt-1">
          {formatTimeAgo(notification.created_at)}
        </p>
      </div>

      <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!notification.is_read && (
          <button
            onClick={() => onMarkAsRead(notification.id)}
            className="h-7 w-7 rounded-lg bg-muted/50 hover:bg-muted flex items-center justify-center"
            title="Mark as read"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          onClick={() => onDelete(notification.id)}
          className="h-7 w-7 rounded-lg bg-muted/50 hover:bg-destructive/10 hover:text-destructive flex items-center justify-center"
          title="Delete"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {!notification.is_read && (
        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-primary" />
      )}
    </motion.div>
  )
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const isInstalledPWA = useIsInstalledPWA()

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications()

  const { hasUpdate, updateApp, dismissUpdate } = usePwaUpdate()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const totalUnread = unreadCount + (hasUpdate ? 1 : 0)

  return (
    <div className="relative">
      <motion.button
        ref={buttonRef}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 w-10 rounded-xl bg-card elevation-1 flex items-center justify-center tap-highlight relative"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-muted-foreground" />
        {totalUnread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center"
          >
            {totalUnread > 99 ? "99+" : totalUnread}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute right-0 top-full mt-2 w-80 max-h-[70vh] rounded-2xl bg-card elevation-3 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              <h3 className="font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(70vh-60px)]">
              {/* Update notification (always at top if available) */}
              {hasUpdate && (
                <div className="p-2 border-b border-border/50">
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-blue-500/10"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                        <Download className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-blue-600 dark:text-blue-400">
                          Update Available
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {isInstalledPWA
                            ? "Close and reopen the app to get the latest version"
                            : "Refresh the page to get the latest version"
                          }
                        </p>
                        {!isInstalledPWA && (
                          <button
                            onClick={updateApp}
                            className="mt-2 flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            <RefreshCw className="h-3 w-3" />
                            Refresh now
                          </button>
                        )}
                      </div>
                      <button
                        onClick={dismissUpdate}
                        className="h-6 w-6 rounded-md hover:bg-blue-500/20 flex items-center justify-center shrink-0"
                      >
                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Notification list */}
              {notifications.length > 0 ? (
                <div className="p-2 space-y-1">
                  <AnimatePresence mode="popLayout">
                    {notifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={markAsRead}
                        onDelete={deleteNotification}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                !hasUpdate && (
                  <div className="p-8 text-center">
                    <Bell className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No notifications yet
                    </p>
                  </div>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
