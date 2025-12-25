"use client"

/**
 * SafeAreaTop - A sticky element that covers the iOS status bar area
 * This prevents content from visually overlapping with the notch/dynamic island
 * when scrolling in PWA mode.
 */
export function SafeAreaTop() {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 bg-background"
      style={{
        height: 'env(safe-area-inset-top, 0px)',
        // Ensure it's always visible and covers the status bar
        minHeight: 'env(safe-area-inset-top, 0px)',
      }}
      aria-hidden="true"
    />
  )
}
