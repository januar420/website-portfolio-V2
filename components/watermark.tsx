"use client"

import { useEffect, useRef } from "react"

export default function Watermark() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Draw the watermark
    const drawWatermark = () => {
      if (!ctx) return

      // Get computed colors from CSS variables
      const computedStyle = getComputedStyle(document.documentElement)
      const primaryColor = computedStyle.getPropertyValue("--primary").trim()

      // Convert HSL to RGBA
      const primaryRGBA = hslToRgba(primaryColor, 0.03)

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Set watermark properties
      ctx.font = "16px Geist, sans-serif"
      ctx.fillStyle = primaryRGBA
      ctx.textAlign = "center"

      // Create pattern
      const text = "JANUAR GALUH PRABAKTI"
      const spacing = 150

      // Draw diagonal pattern
      for (let y = -canvas.height; y < canvas.height * 2; y += spacing) {
        for (let x = -canvas.width; x < canvas.width * 2; x += spacing) {
          ctx.save()
          ctx.translate(x, y)
          ctx.rotate(Math.PI / 4) // 45 degrees
          ctx.fillText(text, 0, 0)
          ctx.restore()
        }
      }
    }

    // Convert HSL to RGBA
    const hslToRgba = (hsl: string, alpha: number): string => {
      // Default fallback colors
      if (!hsl) return `rgba(0, 0, 0, ${alpha})`

      const isDarkMode = document.documentElement.classList.contains("dark")

      if (isDarkMode) {
        return `rgba(250, 250, 250, ${alpha})`
      } else {
        return `rgba(26, 26, 26, ${alpha})`
      }
    }

    // Initial draw
    drawWatermark()

    // Redraw on resize
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      drawWatermark()
    }

    window.addEventListener("resize", handleResize)

    // Redraw on theme change
    const observer = new MutationObserver(() => {
      drawWatermark()
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => {
      window.removeEventListener("resize", handleResize)
      observer.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" aria-hidden="true" />
}

