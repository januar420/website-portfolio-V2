"use client"

import { useEffect, useState, createContext, useContext, type ReactNode } from "react"
import {
  detectGPU,
  type GPUInfo,
  getThreeJsOptimizationParams,
  getRecommendedDetailLevels,
} from "@/utils/gpu-detection"
import { toast } from "@/hooks/use-toast"

// Context to share GPU information across components
interface GPUContextType {
  gpuInfo: GPUInfo | null
  threeJsParams: ReturnType<typeof getThreeJsOptimizationParams> | null
  detailLevels: ReturnType<typeof getRecommendedDetailLevels> | null
  isInitialized: boolean
}

const GPUContext = createContext<GPUContextType>({
  gpuInfo: null,
  threeJsParams: null,
  detailLevels: null,
  isInitialized: false,
})

export const useGPUInfo = () => useContext(GPUContext)

interface GPUOptimizedRendererProps {
  children: ReactNode
  showToasts?: boolean
}

export default function GPUOptimizedRenderer({ children, showToasts = true }: GPUOptimizedRendererProps) {
  const [gpuInfo, setGpuInfo] = useState<GPUInfo | null>(null)
  const [threeJsParams, setThreeJsParams] = useState<ReturnType<typeof getThreeJsOptimizationParams> | null>(null)
  const [detailLevels, setDetailLevels] = useState<ReturnType<typeof getRecommendedDetailLevels> | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Detect GPU on component mount
    try {
      const info = detectGPU()
      setGpuInfo(info)

      // Get optimized parameters
      const params = getThreeJsOptimizationParams(info)
      setThreeJsParams(params)

      // Get detail levels
      const details = getRecommendedDetailLevels(info)
      setDetailLevels(details)

      // Log information for debugging
      console.log("GPU Detected:", info.vendor, info.renderer)
      console.log("Optimized Parameters:", params)
      console.log("Detail Levels:", details)

      // Show toast with GPU information if enabled
      if (showToasts) {
        // Prepare vendor-specific message
        let vendorMessage = ""
        switch (info.vendor) {
          case "amd":
            vendorMessage = "AMD GPU detected. Applying optimized settings for Radeon graphics."
            break
          case "nvidia":
            vendorMessage = "NVIDIA GPU detected. Applying optimized settings for GeForce graphics."
            break
          case "intel":
            vendorMessage = "Intel GPU detected. Applying optimized settings for Intel graphics."
            break
          case "apple":
            vendorMessage = "Apple GPU detected. Applying optimized settings for Apple graphics."
            break
          default:
            vendorMessage = "GPU detected. Applying optimized settings."
        }

        // Show toast with appropriate variant based on GPU capability
        toast({
          title: "Graphics Optimization",
          description: vendorMessage,
          variant: info.isLowEnd ? "default" : "success",
        })
      }

      // Set initialization flag
      setIsInitialized(true)
    } catch (error) {
      console.error("Error initializing GPU detection:", error)

      // Set default values on error
      const defaultInfo = {
        vendor: "unknown" as const,
        renderer: "unknown",
        isIntegrated: false,
        isMobile: false,
        isAppleSilicon: false,
        isLowEnd: true,
        recommendedSettings: {
          alpha: false,
          antialias: false,
          depth: true,
          stencil: false,
          preserveDrawingBuffer: false,
          powerPreference: "default" as const,
          failIfMajorPerformanceCaveat: false,
        },
      }

      setGpuInfo(defaultInfo)
      setThreeJsParams(getThreeJsOptimizationParams(defaultInfo))
      setDetailLevels(getRecommendedDetailLevels(defaultInfo))
      setIsInitialized(true)

      if (showToasts) {
        toast({
          title: "Graphics Detection Failed",
          description: "Using fallback graphics settings. Some visual elements may be simplified.",
          variant: "destructive",
        })
      }
    }
  }, [showToasts])

  // Monitor for WebGL context loss
  useEffect(() => {
    if (!isInitialized) return

    const handleContextLoss = (e: Event) => {
      e.preventDefault()
      console.warn("WebGL context lost detected by GPU Optimizer")

      if (showToasts) {
        toast({
          title: "Graphics Context Lost",
          description: "Attempting to recover 3D rendering...",
          variant: "destructive",
        })
      }

      // Apply more conservative settings on context loss
      if (gpuInfo) {
        const conservativeInfo = {
          ...gpuInfo,
          isLowEnd: true,
        }

        setThreeJsParams(getThreeJsOptimizationParams(conservativeInfo))
        setDetailLevels(getRecommendedDetailLevels(conservativeInfo))
      }
    }

    const handleContextRestored = () => {
      console.log("WebGL context restored detected by GPU Optimizer")

      if (showToasts) {
        toast({
          title: "Graphics Context Restored",
          description: "3D rendering has been recovered.",
          variant: "success",
        })
      }
    }

    window.addEventListener("webglcontextlost", handleContextLoss)
    window.addEventListener("webglcontextrestored", handleContextRestored)

    return () => {
      window.removeEventListener("webglcontextlost", handleContextLoss)
      window.removeEventListener("webglcontextrestored", handleContextRestored)
    }
  }, [isInitialized, gpuInfo, showToasts])

  return (
    <GPUContext.Provider value={{ gpuInfo, threeJsParams, detailLevels, isInitialized }}>
      {children}
    </GPUContext.Provider>
  )
}

