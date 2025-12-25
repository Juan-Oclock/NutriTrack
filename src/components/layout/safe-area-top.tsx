"use client"

import { useEffect, useState } from "react"

/**
 * SafeAreaTop - A fixed element that covers the iOS status bar area
 * This prevents content from visually overlapping with the notch/dynamic island
 * when scrolling in PWA mode.
 *
 * Uses CSS env() with a JavaScript fallback for PWA standalone mode.
 */
export function SafeAreaTop() {
  const [isPWA, setIsPWA] = useState(false)

  useEffect(() => {
    // Detect if running as installed PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    setIsPWA(isStandalone)
  }, [])

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 bg-background"
      style={{
        height: 'env(safe-area-inset-top, 0px)',
        // PWA fallback: use a minimum height when in standalone mode
        // This ensures coverage even if env() isn't properly evaluated
        minHeight: isPWA ? '47px' : undefined,
      }}
      aria-hidden="true"
    />
  )
}

/**
 * Hook to get safe area inset value for use in components
 */
export function useSafeAreaTop(): string {
  const [isPWA, setIsPWA] = useState(false)

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    setIsPWA(isStandalone)
  }, [])

  // Return CSS calc that uses env() with a fallback for PWA mode
  return isPWA
    ? 'max(env(safe-area-inset-top, 47px), 47px)'
    : 'env(safe-area-inset-top, 0px)'
}
