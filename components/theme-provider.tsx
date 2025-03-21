"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps, useTheme } from "next-themes"

// Create a separate component for theme class application to avoid state update loops
function ThemeClassApplier() {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Hanya jalankan efek setelah hydration selesai
  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    // Jangan terapkan tema sebelum mounted
    if (!mounted) return

    // Apply the theme class directly to the document
    const root = document.documentElement

    // Remove both classes first
    root.classList.remove("light", "dark")

    // Add the appropriate class based on the current theme
    if (resolvedTheme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.add("light")
    }
  }, [resolvedTheme, mounted])

  return null
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)

  // Setelah mounted, atur state mounted untuk menunjukkan bahwa hydration selesai
  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <NextThemesProvider {...props}>
      <ThemeClassApplier />
      {children}
    </NextThemesProvider>
  )
}

