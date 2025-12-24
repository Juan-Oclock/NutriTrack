/**
 * Haptic feedback utility for mobile interactions
 * Uses the Vibration API when available
 */

type HapticType = "light" | "medium" | "heavy" | "success" | "error"

const HAPTIC_PATTERNS: Record<HapticType, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 50,
  success: [10, 50, 10],
  error: [50, 100, 50],
}

/**
 * Check if haptic feedback is enabled in user settings
 * This reads from localStorage for quick access
 */
function isHapticEnabled(): boolean {
  if (typeof window === "undefined") return false

  // Check localStorage cache (set by settings page)
  const cached = localStorage.getItem("haptic_feedback")
  if (cached !== null) {
    return cached === "true"
  }

  // Default to true if not set
  return true
}

/**
 * Trigger haptic feedback
 * @param type - The type of haptic feedback
 */
export function haptic(type: HapticType = "light"): void {
  if (typeof window === "undefined") return
  if (!isHapticEnabled()) return

  // Check if Vibration API is supported
  if (!("vibrate" in navigator)) return

  try {
    const pattern = HAPTIC_PATTERNS[type]
    navigator.vibrate(pattern)
  } catch {
    // Silently fail if vibration not supported
  }
}

/**
 * Light tap feedback for button presses
 */
export function hapticTap(): void {
  haptic("light")
}

/**
 * Medium feedback for selections
 */
export function hapticSelect(): void {
  haptic("medium")
}

/**
 * Success feedback for completed actions
 */
export function hapticSuccess(): void {
  haptic("success")
}

/**
 * Error feedback for failed actions
 */
export function hapticError(): void {
  haptic("error")
}

/**
 * Update the haptic feedback setting in localStorage
 * Call this when the user changes the setting
 */
export function setHapticEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return
  localStorage.setItem("haptic_feedback", String(enabled))
}
