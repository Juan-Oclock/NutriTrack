"use client"

import { useEffect, useState, useCallback } from "react"

interface UsePwaUpdateReturn {
  hasUpdate: boolean
  isChecking: boolean
  updateApp: () => void
  dismissUpdate: () => void
}

export function usePwaUpdate(): UsePwaUpdateReturn {
  const [hasUpdate, setHasUpdate] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return
    }

    const checkForUpdates = async () => {
      try {
        setIsChecking(true)
        const registration = await navigator.serviceWorker.getRegistration()

        if (registration) {
          // Check if there's already a waiting worker
          if (registration.waiting) {
            setWaitingWorker(registration.waiting)
            setHasUpdate(true)
          }

          // Listen for new updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  // New update available
                  setWaitingWorker(newWorker)
                  setHasUpdate(true)
                }
              })
            }
          })

          // Manually check for updates
          registration.update().catch(() => {
            // Ignore update check errors
          })
        }
      } catch {
        // Ignore errors
      } finally {
        setIsChecking(false)
      }
    }

    checkForUpdates()

    // Listen for controller changes (when a new SW takes over)
    const handleControllerChange = () => {
      // Reload to get the new version
      window.location.reload()
    }

    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange)

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange)
    }
  }, [])

  const updateApp = useCallback(() => {
    if (waitingWorker) {
      // Tell the waiting worker to skip waiting and become active
      waitingWorker.postMessage({ type: "SKIP_WAITING" })
      setHasUpdate(false)
    }
  }, [waitingWorker])

  const dismissUpdate = useCallback(() => {
    setHasUpdate(false)
  }, [])

  return {
    hasUpdate,
    isChecking,
    updateApp,
    dismissUpdate,
  }
}
