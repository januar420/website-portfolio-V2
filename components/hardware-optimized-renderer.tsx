"use client"

import { useEffect, useState, createContext, useContext, type ReactNode } from "react"
import {
  detectGPU,
  type GPUInfo,
  getThreeJsOptimizationParams as getGPUOptimizationParams,
  getRecommendedDetailLevels as getGPUDetailLevels,
} from "@/utils/gpu-detection"
import {
  detectCPU,
  type CPUInfo,
  getCPUOptimizedThreeParams,
  getCPUOptimizedDetailLevels,
  getMergedOptimizationParams,
  getMergedDetailLevels
} from "@/utils/cpu-detection"
import { toast } from "@/hooks/use-toast"

// Context untuk berbagi informasi hardware dan pengaturan optimasi ke seluruh komponen
interface HardwareContextType {
  gpuInfo: GPUInfo | null
  cpuInfo: CPUInfo | null
  optimizationParams: any | null
  detailLevels: any | null
  isInitialized: boolean
  deviceCategory: "high-end" | "mid-range" | "low-end"
}

const HardwareContext = createContext<HardwareContextType>({
  gpuInfo: null,
  cpuInfo: null,
  optimizationParams: null,
  detailLevels: null,
  isInitialized: false,
  deviceCategory: "mid-range"
})

export const useHardwareCapabilities = () => useContext(HardwareContext)

interface HardwareOptimizedRendererProps {
  children: ReactNode
  showToasts?: boolean
}

export default function HardwareOptimizedRenderer({ 
  children, 
  showToasts = true 
}: HardwareOptimizedRendererProps) {
  const [gpuInfo, setGpuInfo] = useState<GPUInfo | null>(null)
  const [cpuInfo, setCpuInfo] = useState<CPUInfo | null>(null)
  const [optimizationParams, setOptimizationParams] = useState<any | null>(null)
  const [detailLevels, setDetailLevels] = useState<any | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [deviceCategory, setDeviceCategory] = useState<"high-end" | "mid-range" | "low-end">("mid-range")

  useEffect(() => {
    // Deteksi hardware pada komponen mount
    try {
      // 1. Deteksi GPU
      const gpuData = detectGPU()
      setGpuInfo(gpuData)
      
      // 2. Deteksi CPU
      const cpuData = detectCPU()
      setCpuInfo(cpuData)
      
      // 3. Dapatkan parameter optimasi berdasarkan kedua hardware
      const gpuParams = getGPUOptimizationParams(gpuData)
      const cpuParams = getCPUOptimizedThreeParams(cpuData)
      
      // 4. Gabungkan parameter optimasi
      const mergedParams = getMergedOptimizationParams(cpuParams, gpuParams)
      setOptimizationParams(mergedParams)
      
      // 5. Gabungkan level detail
      const gpuDetails = getGPUDetailLevels(gpuData)
      const cpuDetails = getCPUOptimizedDetailLevels(cpuData)
      const mergedDetails = getMergedDetailLevels(cpuDetails, gpuDetails)
      setDetailLevels(mergedDetails)
      
      // 6. Tentukan kategori perangkat secara keseluruhan
      determineDeviceCategory(gpuData, cpuData);

      // Log informasi debugging
      console.log("GPU Detected:", gpuData.vendor, gpuData.renderer)
      console.log("CPU Detected:", cpuData.cores, "cores", cpuData.architecture, cpuData.throttled ? "(throttled)" : "")
      console.log("Optimized Parameters:", mergedParams)
      console.log("Detail Levels:", mergedDetails)
      console.log("Device Category:", deviceCategory)

      // Tampilkan toast dengan informasi hardware jika diaktifkan
      if (showToasts) {
        showHardwareInfoToast(gpuData, cpuData, deviceCategory);
      }

      // Set flag inisialisasi
      setIsInitialized(true)
    } catch (error) {
      console.error("Error initializing hardware detection:", error)

      // Set nilai default pada error
      const defaultGpuInfo = {
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
      
      const defaultCpuInfo = {
        cores: 2,
        logicalCores: 2,
        architecture: "unknown" as const,
        isLowEnd: true,
        isHighEnd: false,
        platform: "unknown" as const,
        concurrencyLevel: 1,
        supportsSIMD: false,
        throttled: false
      }

      setGpuInfo(defaultGpuInfo)
      setCpuInfo(defaultCpuInfo)
      setDeviceCategory("low-end")
      
      // Gunakan parameter default
      const gpuParams = getGPUOptimizationParams(defaultGpuInfo)
      const cpuParams = getCPUOptimizedThreeParams(defaultCpuInfo)
      const mergedParams = getMergedOptimizationParams(cpuParams, gpuParams)
      setOptimizationParams(mergedParams)
      
      const gpuDetails = getGPUDetailLevels(defaultGpuInfo)
      const cpuDetails = getCPUOptimizedDetailLevels(defaultCpuInfo)
      const mergedDetails = getMergedDetailLevels(cpuDetails, gpuDetails)
      setDetailLevels(mergedDetails)
      
      setIsInitialized(true)

      if (showToasts) {
        toast({
          title: "Deteksi Hardware Gagal",
          description: "Menggunakan pengaturan aman. Beberapa elemen visual mungkin disederhanakan.",
          variant: "destructive",
        })
      }
    }
  }, [showToasts, deviceCategory])

  // Tentukan kategori perangkat berdasarkan CPU dan GPU
  const determineDeviceCategory = (gpu: GPUInfo, cpu: CPUInfo) => {
    // Perangkat low-end jika salah satu komponen low-end
    if (gpu.isLowEnd || cpu.isLowEnd) {
      setDeviceCategory("low-end");
      return;
    }
    
    // Perangkat high-end jika keduanya high-end (dan CPU tidak throttled)
    if (cpu.isHighEnd && !cpu.throttled && !gpu.isIntegrated) {
      setDeviceCategory("high-end");
      return;
    }
    
    // Default: mid-range
    setDeviceCategory("mid-range");
  };

  // Tampilkan toast dengan informasi hardware
  const showHardwareInfoToast = (gpu: GPUInfo, cpu: CPUInfo, category: string) => {
    let title = "";
    let description = "";
    let variant: "default" | "destructive" | "success" = "default";
    
    switch (category) {
      case "high-end":
        title = "Perangkat High-End Terdeteksi";
        description = `Mode performa maksimum diaktifkan: ${gpu.vendor} GPU, ${cpu.logicalCores}-core CPU.`;
        variant = "success";
        break;
      case "low-end":
        title = "Mode Hemat Sumber Daya";
        description = "Mengoptimalkan pengaturan untuk perangkat dengan kemampuan terbatas.";
        variant = "default";
        break;
      default:
        title = "Mode Seimbang";
        description = `Pengaturan dioptimalkan untuk: ${gpu.vendor} GPU, ${cpu.logicalCores}-core CPU.`;
        variant = "default";
    }
    
    toast({ title, description, variant });
  };

  // Monitor untuk kehilangan context WebGL
  useEffect(() => {
    if (!isInitialized) return

    const handleContextLoss = (e: Event) => {
      e.preventDefault()
      console.warn("WebGL context lost detected by Hardware Optimizer")

      if (showToasts) {
        toast({
          title: "Kehilangan Context Graphics",
          description: "Mencoba memulihkan rendering 3D...",
          variant: "destructive",
        })
      }

      // Terapkan pengaturan lebih konservatif saat kehilangan context
      if (gpuInfo && cpuInfo) {
        const conservativeGpuInfo = {
          ...gpuInfo,
          isLowEnd: true,
        }
        
        const conservativeCpuInfo = {
          ...cpuInfo,
          isLowEnd: true,
          throttled: true
        }

        // Regenerasi parameter dengan batasan lebih ketat
        const gpuParams = getGPUOptimizationParams(conservativeGpuInfo)
        const cpuParams = getCPUOptimizedThreeParams(conservativeCpuInfo)
        const mergedParams = getMergedOptimizationParams(cpuParams, gpuParams)
        setOptimizationParams(mergedParams)
        
        const gpuDetails = getGPUDetailLevels(conservativeGpuInfo)
        const cpuDetails = getCPUOptimizedDetailLevels(conservativeCpuInfo)
        const mergedDetails = getMergedDetailLevels(cpuDetails, gpuDetails)
        setDetailLevels(mergedDetails)
        
        setDeviceCategory("low-end")
      }
    }

    const handleContextRestored = () => {
      console.log("WebGL context restored detected by Hardware Optimizer")

      if (showToasts) {
        toast({
          title: "Context Graphics Dipulihkan",
          description: "Rendering 3D telah dipulihkan.",
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
  }, [isInitialized, gpuInfo, cpuInfo, showToasts])

  return (
    <HardwareContext.Provider 
      value={{ 
        gpuInfo, 
        cpuInfo, 
        optimizationParams, 
        detailLevels, 
        isInitialized,
        deviceCategory
      }}
    >
      {children}
    </HardwareContext.Provider>
  )
} 