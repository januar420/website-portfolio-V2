/**
 * GPU detection and optimization utilities
 * Provides vendor-specific optimizations for different GPU types
 */

export type GPUVendor = "amd" | "nvidia" | "intel" | "apple" | "mobile" | "unknown"

export interface GPUInfo {
  vendor: GPUVendor
  renderer: string
  isIntegrated: boolean
  isMobile: boolean
  isAppleSilicon: boolean
  isLowEnd: boolean
  recommendedSettings: WebGLContextAttributes
}

/**
 * Detects GPU vendor and capabilities from WebGL context
 */
export function detectGPU(): GPUInfo {
  // Default values
  let vendor: GPUVendor = "unknown"
  let renderer = ""
  let isIntegrated = false
  let isMobile = false
  let isAppleSilicon = false
  let isLowEnd = false

  try {
    // Create temporary canvas for detection
    const canvas = document.createElement("canvas")
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")

    if (!gl) {
      console.warn("WebGL not available for GPU detection")
      return createGPUInfo(vendor, renderer, isIntegrated, isMobile, isAppleSilicon, isLowEnd)
    }

    // Get renderer info
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info")
    if (debugInfo) {
      const vendorString = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || ""
      renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || ""

      // Log for debugging
      console.log("GPU Vendor:", vendorString)
      console.log("GPU Renderer:", renderer)

      // Detect vendor
      const vendorLower = vendorString.toLowerCase()
      const rendererLower = renderer.toLowerCase()

      if (vendorLower.includes("amd") || rendererLower.includes("amd") || rendererLower.includes("radeon")) {
        vendor = "amd"
      } else if (
        vendorLower.includes("nvidia") ||
        rendererLower.includes("nvidia") ||
        rendererLower.includes("geforce")
      ) {
        vendor = "nvidia"
      } else if (vendorLower.includes("intel") || rendererLower.includes("intel") || rendererLower.includes("iris")) {
        vendor = "intel"
        isIntegrated = true
      } else if (vendorLower.includes("apple") || rendererLower.includes("apple")) {
        vendor = "apple"
        isAppleSilicon = rendererLower.includes("apple gpu")
      }

      // Detect if integrated/mobile GPU
      isIntegrated =
        isIntegrated ||
        rendererLower.includes("integrated") ||
        rendererLower.includes("uhd") ||
        rendererLower.includes("iris")

      isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        rendererLower.includes("mobile") ||
        rendererLower.includes("adreno") ||
        rendererLower.includes("mali") ||
        rendererLower.includes("powervr")

      // Detect low-end hardware
      isLowEnd =
        isMobile ||
        isIntegrated ||
        rendererLower.includes("webgl") || // Software rendering
        gl.getParameter(gl.MAX_TEXTURE_SIZE) < 8192 ||
        gl.getParameter(gl.MAX_VERTEX_ATTRIBS) < 16
    }

    // Clean up
    gl.getExtension("WEBGL_lose_context")?.loseContext()
  } catch (e) {
    console.error("Error detecting GPU:", e)
  }

  return createGPUInfo(vendor, renderer, isIntegrated, isMobile, isAppleSilicon, isLowEnd)
}

/**
 * Creates a GPUInfo object with recommended settings based on detected hardware
 */
function createGPUInfo(
  vendor: GPUVendor,
  renderer: string,
  isIntegrated: boolean,
  isMobile: boolean,
  isAppleSilicon: boolean,
  isLowEnd: boolean,
): GPUInfo {
  // Base recommended settings
  const recommendedSettings: WebGLContextAttributes = {
    alpha: false,
    antialias: !isLowEnd,
    depth: true,
    stencil: false,
    preserveDrawingBuffer: false,
    powerPreference: isLowEnd ? "low-power" : "high-performance",
    failIfMajorPerformanceCaveat: false,
    desynchronized: false,
    premultipliedAlpha: false,
  }

  // Apply vendor-specific optimizations
  switch (vendor) {
    case "amd":
      // AMD-specific optimizations
      recommendedSettings.antialias = !isLowEnd && window.innerWidth >= 1200
      recommendedSettings.powerPreference = "high-performance"
      recommendedSettings.preserveDrawingBuffer = true // Helps with AMD context recovery
      break

    case "nvidia":
      // NVIDIA-specific optimizations
      recommendedSettings.powerPreference = "high-performance"
      recommendedSettings.antialias = !isLowEnd
      break

    case "intel":
      // Intel-specific optimizations
      recommendedSettings.powerPreference = isIntegrated ? "low-power" : "high-performance"
      recommendedSettings.antialias = !isLowEnd && window.innerWidth >= 1200
      recommendedSettings.preserveDrawingBuffer = true // Helps with Intel context stability
      break

    case "apple":
      // Apple-specific optimizations
      recommendedSettings.powerPreference = isAppleSilicon ? "high-performance" : "low-power"
      recommendedSettings.antialias = !isMobile
      break

    default:
      // Unknown/other vendor
      recommendedSettings.antialias = !isLowEnd && window.innerWidth >= 1200
      recommendedSettings.powerPreference = isLowEnd ? "low-power" : "default"
      break
  }

  // Mobile-specific adjustments
  if (isMobile) {
    recommendedSettings.antialias = false
    recommendedSettings.powerPreference = "low-power"
    recommendedSettings.depth = true
    recommendedSettings.stencil = false
  }

  return {
    vendor,
    renderer,
    isIntegrated,
    isMobile,
    isAppleSilicon,
    isLowEnd,
    recommendedSettings,
  }
}

/**
 * Get recommended Three.js parameters based on GPU vendor
 */
export function getThreeJsOptimizationParams(gpuInfo: GPUInfo) {
  const { vendor, isLowEnd, isMobile } = gpuInfo

  // Base parameters
  const params = {
    precision: isLowEnd ? "lowp" : "mediump",
    logarithmicDepthBuffer: false,
    maxLights: isLowEnd ? 2 : 4,
    shadowMapSize: isLowEnd ? 1024 : 2048,
    anisotropy: isLowEnd ? 1 : 4,
    maxFPS: isMobile ? 30 : 60,
    batchGeometry: true,
    useShaderCache: true,
    useVertexTextures: !isLowEnd,
    maxMorphTargets: isLowEnd ? 4 : 8,
    maxMorphNormals: isLowEnd ? 4 : 8,
  }

  // Vendor-specific adjustments
  switch (vendor) {
    case "amd":
      // AMD optimizations
      params.precision = isLowEnd ? "lowp" : "mediump" // AMD GPUs can struggle with highp
      params.logarithmicDepthBuffer = false // Can cause issues on some AMD drivers
      params.useShaderCache = true // Important for AMD shader compilation
      params.maxFPS = isMobile ? 30 : 60 // Limit FPS to prevent TDR issues
      break

    case "nvidia":
      // NVIDIA optimizations
      params.precision = "highp" // NVIDIA GPUs handle highp well
      params.logarithmicDepthBuffer = !isLowEnd // Good for complex scenes on NVIDIA
      params.anisotropy = isLowEnd ? 2 : 8 // NVIDIA handles anisotropic filtering well
      break

    case "intel":
      // Intel optimizations
      params.precision = "mediump" // Best balance for Intel
      params.logarithmicDepthBuffer = false // Can cause issues on Intel
      params.maxLights = isLowEnd ? 2 : 3 // Reduce light count on Intel
      params.shadowMapSize = isLowEnd ? 512 : 1024 // Smaller shadow maps for Intel
      break

    case "apple":
      // Apple optimizations
      params.precision = "mediump"
      params.logarithmicDepthBuffer = false // Can cause issues on Apple GPUs
      params.useVertexTextures = false // Can be problematic on some Apple devices
      break
  }

  return params
}

/**
 * Get recommended geometry detail levels based on GPU capabilities
 */
export function getRecommendedDetailLevels(gpuInfo: GPUInfo) {
  const { isLowEnd, isMobile, vendor } = gpuInfo

  // Base detail levels
  const detailLevels = {
    sphereSegments: isLowEnd ? 16 : 32,
    torusSegments: isLowEnd ? 8 : 16,
    particleCount: isLowEnd ? 50 : 100,
    maxDrawCalls: isLowEnd ? 100 : 500,
    textureSize: isLowEnd ? 1024 : 2048,
    useInstancing: !isLowEnd,
    useMorphTargets: !isLowEnd,
    useSkeletalAnimation: !isLowEnd,
    distortAmount: isLowEnd ? 0.2 : 0.4,
  }

  // Vendor-specific adjustments
  switch (vendor) {
    case "amd":
      // AMD tends to perform better with fewer, larger batches
      detailLevels.sphereSegments = isLowEnd ? 16 : 24
      detailLevels.torusSegments = isLowEnd ? 8 : 12
      detailLevels.particleCount = Math.floor(detailLevels.particleCount * 0.8)
      detailLevels.maxDrawCalls = Math.floor(detailLevels.maxDrawCalls * 0.7)
      break

    case "nvidia":
      // NVIDIA can handle more detailed geometry
      detailLevels.sphereSegments = isLowEnd ? 20 : 36
      detailLevels.torusSegments = isLowEnd ? 12 : 20
      detailLevels.particleCount = Math.floor(detailLevels.particleCount * 1.2)
      break

    case "intel":
      // Intel integrated GPUs need more conservative settings
      detailLevels.sphereSegments = isLowEnd ? 12 : 20
      detailLevels.torusSegments = isLowEnd ? 6 : 10
      detailLevels.particleCount = Math.floor(detailLevels.particleCount * 0.6)
      detailLevels.maxDrawCalls = Math.floor(detailLevels.maxDrawCalls * 0.5)
      detailLevels.distortAmount = isLowEnd ? 0.1 : 0.3
      break
  }

  // Mobile adjustments override vendor-specific settings
  if (isMobile) {
    detailLevels.sphereSegments = 12
    detailLevels.torusSegments = 6
    detailLevels.particleCount = 30
    detailLevels.maxDrawCalls = 50
    detailLevels.textureSize = 1024
    detailLevels.useInstancing = false
    detailLevels.useMorphTargets = false
    detailLevels.useSkeletalAnimation = false
    detailLevels.distortAmount = 0.1
  }

  return detailLevels
}

