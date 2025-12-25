"use client"

import { useTheme } from "next-themes"
import { useEffect } from "react"

export function ThemeColorMeta() {
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const themeColor = resolvedTheme === "dark" ? "#15120F" : "#F5F1EB"

    // Update or create the theme-color meta tag
    let metaThemeColor = document.querySelector('meta[name="theme-color"]')

    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", themeColor)
    } else {
      metaThemeColor = document.createElement("meta")
      metaThemeColor.setAttribute("name", "theme-color")
      metaThemeColor.setAttribute("content", themeColor)
      document.head.appendChild(metaThemeColor)
    }
  }, [resolvedTheme])

  return null
}
