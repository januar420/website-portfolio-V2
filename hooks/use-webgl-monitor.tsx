"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "@/hooks/use-toast"

interface WebGLMonitorOptions {
  onContextLost?: () => void
  onContextRestored?: () => void
  logPerformance?: boolean
  performanceInterval?: number
}

interface WebGLMonitorResult {
  isSupported: boolean
  hasLostContext: boolean
  performanceIssues: boolean
  fps: number | null
  memoryUsage: number | null
  resetContext: () => void
}

/**
 * Custom hook to monitor WebGL context and performance
 */
export function useWebGLMonitor(options: WebGLMonitorOptions = {}): WebGLMonitorResult {
  const [isSupported, setIsSupported] = useState(true)
  const [hasLostContext, setHasLostContext] = useState(false)
  const [performanceIssues, setPerformanceIssues] = useState(false)
  const [fps, setFps] = useState<number | null>(null)
  const [memoryUsage, setMemoryUsage] = useState<number | null>(null)

  const { onContextLost, onContextRestored, logPerformance = true, performanceInterval = 5000 } = options

  // Check WebGL support
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas")
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")

      if (!gl) {
        setIsSupported(false)
        console.warn("WebGL is not supported by this browser")
        toast({
          title: "WebGL not supported",
          description: "Your browser doesn't support 3D graphics. Some visual elements may not display correctly.",
          variant: "destructive",
        })
      }
    } catch (e) {
      setIsSupported(false)
      console.error("Error checking WebGL support:", e)
    }
  }, [])

  // Monitor for context loss events
  useEffect(() => {
    const handleContextLost = (e: Event) => {
      e.preventDefault()
      setHasLostContext(true)
      console.warn("WebGL context lost")

      toast({
        title: "3D rendering paused",
        description: "WebGL context lost. Attempting to recover...",
        variant: "destructive",
      })

      if (onContextLost) {
        onContextLost()
      }
    }

    const handleContextRestored = () => {
      setHasLostContext(false)
      console.log("WebGL context restored")

      toast({
        title: "3D rendering restored",
        description: "WebGL context has been successfully restored.",
        variant: "success",
      })

      if (onContextRestored) {
        onContextRestored()
      }
    }

    // Add global event listeners
    window.addEventListener("webglcontextlost", handleContextLost)
    window.addEventListener("webglcontextrestored", handleContextRestored)

    return () => {
      window.removeEventListener("webglcontextlost", handleContextLost)
      window.removeEventListener("webglcontextrestored", handleContextRestored)
    }
  }, [onContextLost, onContextRestored])

  // Monitor performance if enabled
  useEffect(() => {
    if (!logPerformance || !isSupported) return

    let frameCount = 0
    let lastTime = performance.now()
    let animationFrameId: number

    const measurePerformance = () => {
      const now = performance.now()
      frameCount++

      if (now - lastTime >= 1000) {
        const currentFps = Math.round((frameCount * 1000) / (now - lastTime))
        setFps(currentFps)

        // Check for performance issues
        if (currentFps < 30) {
          setPerformanceIssues(true)
          console.warn(`Low FPS detected: ${currentFps}`)
        } else {
          setPerformanceIssues(false)
        }

        frameCount = 0
        lastTime = now
      }

      animationFrameId = requestAnimationFrame(measurePerformance)
    }

    // Start performance monitoring
    animationFrameId = requestAnimationFrame(measurePerformance)

    // Periodically log memory usage (Chrome only)
    const memoryInterval = setInterval(() => {
      if ((window as any).performance && (window as any).performance.memory) {
        const memoryInfo = (window as any).performance.memory
        const usedHeapSize = Math.round(memoryInfo.usedJSHeapSize / (1024 * 1024))
        setMemoryUsage(usedHeapSize)

        // Check for memory issues
        if (usedHeapSize > 500) {
          // 500MB threshold
          console.warn(`High memory usage: ${usedHeapSize}MB`)
        }
      }
    }, performanceInterval)

    return () => {
      cancelAnimationFrame(animationFrameId)
      clearInterval(memoryInterval)
    }
  }, [logPerformance, isSupported, performanceInterval])

  // Function to attempt to reset the WebGL context
  const resetContext = useCallback(() => {
    if (hasLostContext) {
      console.log("Attempting to reset WebGL context...")

      // Force a refresh of WebGL contexts
      const canvases = document.querySelectorAll("canvas")
      canvases.forEach((canvas) => {
        // Try to get and reset the context
        const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
        if (gl && "getExtension" in gl) {
          const ext = gl.getExtension("WEBGL_lose_context")
          if (ext) {
            ext.restoreContext()
          }
        }
      })

      toast({
        title: "Resetting 3D rendering",
        description: "Attempting to restore the WebGL context...",
      })
    }
  }, [hasLostContext])

  return {
    isSupported,
    hasLostContext,
    performanceIssues,
    fps,
    memoryUsage,
    resetContext,
  }
}

