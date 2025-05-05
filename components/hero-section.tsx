"use client"

import { patchForCanvas } from '@/app/utils/patch-hero-section'
// Apply patch segera untuk mencegah error
if (typeof window !== 'undefined') {
  patchForCanvas();
}

import React, { useRef, useEffect, useState, useMemo, Suspense } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { Canvas, useThree } from "@react-three/fiber"
import {
  OrbitControls,
  Environment,
  Float,
  MeshDistortMaterial,
  useDetectGPU,
  AdaptiveDpr,
  BakeShadows,
  useProgress,
  Html,
  Preload,
  useTexture,
} from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { useLanguage } from "./language-provider"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"
import { useHardwareCapabilities } from "./hardware-optimized-renderer"
import * as THREE from "three"
import { useInView } from "react-intersection-observer"
import dynamic from "next/dynamic"

// Interface untuk props
interface HeroSectionProps {
  mainHeadingText?: string;
}

// Loading indicator komponn dalam Canvas menggunakan Html dari drei
function CanvasLoadingIndicator() {
  const { progress, loaded, total } = useProgress()
  const [visible, setVisible] = useState(true)
  
  // Sembunyikan indikator setelah loading mencapai 100%
  useEffect(() => {
    if (progress >= 100) {
      // Berikan jeda untuk memastikan semua elemen sudah tampil
      const timer = setTimeout(() => {
        setVisible(false)
      }, 500) // Sembunyikan setelah 500ms untuk transisi yang halus
      return () => clearTimeout(timer)
    }
  }, [progress])
  
  if (!visible) return null
  
  return (
    <Html center position={[0, 0, 0]} className="pointer-events-none">
      <div className="loading-progress text-center text-xs font-mono bg-background/70 px-3 py-1 rounded-md">
        {Math.round(progress)}% ({loaded}/{total})
      </div>
    </Html>
  )
}

// Context loss detection and recovery component
function ContextLossDetector() {
  const { gl } = useThree()
  const { deviceCategory } = useHardwareCapabilities()

  useEffect(() => {
    // Handle context loss
    const handleContextLost = (event: Event) => {
      event.preventDefault()
      console.warn("WebGL context lost. Attempting to recover...")
      toast({
        title: "Masalah rendering terdeteksi",
        description: "Mencoba memulihkan scene 3D...",
        variant: "destructive",
      })
    }

    // Handle context restoration
    const handleContextRestored = () => {
      console.log("WebGL context restored successfully")
      toast({
        title: "Rendering dipulihkan",
        description: "Scene 3D berhasil dipulihkan",
        variant: "success",
      })
    }

    // Add event listeners to the canvas
    const canvas = gl.domElement
    canvas.addEventListener("webglcontextlost", handleContextLost)
    canvas.addEventListener("webglcontextrestored", handleContextRestored)

    return () => {
      // Clean up event listeners
      canvas.removeEventListener("webglcontextlost", handleContextLost)
      canvas.removeEventListener("webglcontextrestored", handleContextRestored)
    }
  }, [gl])

  return null
}

// Hardware-specific optimizer component
function HardwareOptimizer() {
  const { gl, scene, camera } = useThree()
  const { gpuInfo, cpuInfo, deviceCategory } = useHardwareCapabilities()
  
  const isLowEndDevice = deviceCategory === "low-end"
  const isAMD = gpuInfo?.vendor === "amd"
  const isThrottled = cpuInfo?.throttled || false

  useEffect(() => {
    // WebGL context optimizations
    const glContext = gl.getContext() as WebGLRenderingContext

    // Try to get extensions
    const instancedArrays = glContext.getExtension("ANGLE_instanced_arrays")
    const drawBuffers = glContext.getExtension("WEBGL_draw_buffers")

    // Log available extensions for debugging
    console.log("Hardware Optimizer: Using instanced arrays:", !!instancedArrays)
    console.log("Hardware Optimizer: Using draw buffers:", !!drawBuffers)

    // Optimize scene based on device category
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        // Modifikasi materials
        const material = object.material as any;
        if (material) {
          // Disable fitur yang bisa menyebabkan masalah pada perangkat terbatas
          if ("flatShading" in material) {
            material.flatShading = isLowEndDevice || isAMD
          }
          if ("precision" in material) {
            material.precision = isLowEndDevice ? "lowp" : isAMD ? "mediump" : "highp"
          }
          if ("fog" in material) {
            material.fog = !isLowEndDevice && !isAMD
          }
        }

        // Optimize geometry
        const geometry = object.geometry
        if (geometry && "attributes" in geometry) {
          // Ensure geometry is properly disposed
          object.onBeforeRender = () => {
            // This is a no-op function that ensures the object is included in the render loop
          }
        }
      }
    })

    // Set up periodic cleanup untuk mencegah memory leaks
    const intervalId = setInterval(() => {
      // Force garbage collection hint (not guaranteed but can help)
      if ("gc" in window) {
        ;(window as any).gc()
      }
    }, 60000) // Run every minute

    return () => {
      clearInterval(intervalId)
    }
  }, [gl, scene, camera, isLowEndDevice, isAMD, isThrottled])

  return null
}

// Update the TechSphere component to be more efficient
function TechSphere() {
  const gpuTier = useDetectGPU()
  const { gpuInfo, cpuInfo, deviceCategory, detailLevels } = useHardwareCapabilities()
  
  const isLowEndDevice = deviceCategory === "low-end"
  const isHighEndDevice = deviceCategory === "high-end"
  const isAMD = gpuInfo?.vendor === "amd"
  const isThrottled = cpuInfo?.throttled || false

  // Tentukan level kompleksitas berdasarkan kapabilitas hardware
  const complexity = useMemo(() => {
    if (detailLevels) {
      return {
        sphereDetail: Math.max(8, detailLevels.sphereSegments || 0),
        torusDetail: Math.max(6, detailLevels.torusSegments || 0),
        distortAmount: isLowEndDevice ? 0.1 : isThrottled ? 0.15 : 0.3,
      }
    }

    // Fallback ke tier-based settings jika deteksi gagal
    if (isLowEndDevice) {
      return { sphereDetail: 12, torusDetail: 6, distortAmount: 0.1 }
    } else if (isThrottled || isAMD) {
      return { sphereDetail: 24, torusDetail: 8, distortAmount: 0.15 }
    } else if (isHighEndDevice) {
      return { sphereDetail: 48, torusDetail: 16, distortAmount: 0.3 }
    }

    // Default settings
    return { sphereDetail: 32, torusDetail: 12, distortAmount: 0.2 }
  }, [detailLevels, isLowEndDevice, isThrottled, isAMD, isHighEndDevice])

  // Optimasi material berdasarkan hardware
  const materialProps = useMemo(() => {
    if (isLowEndDevice) {
      return {
        roughness: 0.5,
        metalness: 0.5,
        flatShading: true,
        precision: "lowp" as const,
        toneMapped: false,
        fog: false,
      }
    } else if (isAMD || isThrottled) {
      return {
        roughness: 0.4,
        metalness: 0.6,
        flatShading: true,
        precision: "mediump" as const,
        toneMapped: false,
        fog: false,
      }
    } else if (isHighEndDevice) {
      return {
        roughness: 0.1,
        metalness: 0.9,
        flatShading: false,
        precision: "highp" as const,
        toneMapped: true,
        fog: true,
      }
    }

    // Default material properties
    return {
      roughness: 0.2,
      metalness: 0.8,
      flatShading: false,
      precision: "highp" as const,
      toneMapped: true,
      fog: true,
    }
  }, [isLowEndDevice, isAMD, isThrottled, isHighEndDevice])

  // Tentukan frame rate berdasarkan kapabilitas perangkat
  const floatSpeed = isLowEndDevice ? 0.6 : isThrottled || isAMD ? 0.8 : 1.2
  
  return (
    <Float
      speed={floatSpeed}
      rotationIntensity={isLowEndDevice ? 0.2 : 0.4}
      floatIntensity={isLowEndDevice ? 0.2 : 0.4}
    >
      <mesh>
        <sphereGeometry args={[1.5, complexity.sphereDetail, complexity.sphereDetail]} />
        <MeshDistortMaterial
          color="#ffffff"
          attach="material"
          distort={complexity.distortAmount}
          speed={floatSpeed}
          {...materialProps}
        />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[2.2, 0.2, complexity.torusDetail, isLowEndDevice ? 40 : 80]} />
        <meshStandardMaterial color="#ffffff" emissive="#6b6b6b" {...materialProps} transparent opacity={0.7} />
      </mesh>
      <mesh rotation={[Math.PI / 2, Math.PI / 4, 0]}>
        <torusGeometry args={[2.2, 0.2, complexity.torusDetail, isLowEndDevice ? 40 : 80]} />
        <meshStandardMaterial color="#ffffff" emissive="#6b6b6b" {...materialProps} transparent opacity={0.7} />
      </mesh>
    </Float>
  )
}

// Frame rate limiter yang lebih baik
function FrameRateLimiter() {
  const { cpuInfo, deviceCategory } = useHardwareCapabilities()
  const three = useThree()
  
  const isLowEndDevice = deviceCategory === "low-end"
  const isThrottled = cpuInfo?.throttled || false

  // Gunakan ref untuk track apakah DPR sudah diset untuk mencegah update berulang
  const hasDprBeenSet = React.useRef(false)

  useEffect(() => {
    // Tentukan target FPS berdasarkan kapabilitas perangkat
    const targetFPS = isLowEndDevice ? 20 : isThrottled ? 30 : 60
    
    // Set DPR hanya sekali
    if (three.gl && !hasDprBeenSet.current) {
      // Set pixel ratio pada renderer
      const dpr = isLowEndDevice ? 0.75 : isThrottled ? 1.0 : window.devicePixelRatio
      three.gl.setPixelRatio(Math.min(dpr, 1.5))
      hasDprBeenSet.current = true
      
      // Log FPS target untuk debugging
      console.log(`FrameRateLimiter: Targeting ${targetFPS} FPS with DPR ${Math.min(dpr, 1.5)}`)
    }

    return undefined
  }, [isLowEndDevice, isThrottled, three.gl])

  return null
}

// Fallback content jika canvas error
function FallbackContent() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-primary/20 to-primary-foreground/20">
      <div className="text-center">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <div className="w-16 h-16 rounded-full bg-primary/20"></div>
        </div>
        <p className="text-foreground/70">Loading 3D scene...</p>
      </div>
    </div>
  )
}

// Komponen fallback environment jika preset gagal dimuat
function FallbackEnvironment() {
  // Gunakan file gambar yang sudah ada sebagai texture
  const envTexture = useTexture("/Photo_Profile_3.jpg")
  
  // Buat texture menjadi environment map
  const envMap = useMemo(() => {
    const renderer = new THREE.WebGLRenderer()
    const pmremGenerator = new THREE.PMREMGenerator(renderer)
    pmremGenerator.compileEquirectangularShader()
    
    // Buat environment map dari texture
    const envMap = pmremGenerator.fromEquirectangular(envTexture).texture
    
    // Bersihkan resources
    envTexture.dispose()
    pmremGenerator.dispose()
    renderer.dispose()
    
    return envMap
  }, [envTexture])
  
  return (
    <primitive object={envMap} attach="environment" />
  )
}

// Komponen utama HeroSection
export default function HeroSection({ mainHeadingText }: HeroSectionProps) {
  const { t } = useLanguage()
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLHeadingElement>(null)
  const [canvasError, setCanvasError] = useState(false)
  const [canvasKey, setCanvasKey] = useState(0)
  const [sceneLoaded, setSceneLoaded] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const { 
    gpuInfo, 
    cpuInfo, 
    optimizationParams, 
    detailLevels, 
    isInitialized,
    deviceCategory 
  } = useHardwareCapabilities()

  const isLowEndDevice = deviceCategory === "low-end"
  const isHighEndDevice = deviceCategory === "high-end"
  const isAMD = gpuInfo?.vendor === "amd"
  const isThrottled = cpuInfo?.throttled || false

  // Handle mouse movement for parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      const { clientX, clientY } = e
      const { left, top, width, height } = containerRef.current.getBoundingClientRect()

      const x = (clientX - left) / width - 0.5
      const y = (clientY - top) / height - 0.5

      containerRef.current.style.setProperty("--mouse-x", `${x * 20}px`)
      containerRef.current.style.setProperty("--mouse-y", `${y * 20}px`)

      // Parallax effect for text
      if (textRef.current) {
        textRef.current.style.transform = `translate(${x * -30}px, ${y * -30}px)`
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Handle canvas errors and recovery
  const handleCanvasError = () => {
    console.error("Three.js Canvas error")
    setCanvasError(true)

    toast({
      title: "Error rendering 3D",
      description: "Kami mengalami masalah dengan scene 3D. Mencoba memulihkan...",
      variant: "destructive",
    })

    // Attempt to recover by remounting the canvas
    setTimeout(() => {
      setCanvasKey((prev) => prev + 1)
      setCanvasError(false)
    }, 2000)
  }

  // Get optimized WebGL context attributes based on hardware capabilities
  const glAttributes = useMemo(() => {
    if (!gpuInfo) {
      return {
        powerPreference: "default" as const,
        antialias: false,
        stencil: false,
        depth: true,
        preserveDrawingBuffer: false,
      }
    }
    
    return gpuInfo.recommendedSettings;
  }, [gpuInfo])

  // Determine if we should use performance optimizations
  const usePerformanceMode = useMemo(() => {
    return isLowEndDevice || isThrottled || isAMD || false;
  }, [isLowEndDevice, isThrottled, isAMD])

  const handleSceneLoad = () => {
    setSceneLoaded(true);
    console.log("Scene 3D berhasil dimuat");
  };

  // Monitor progress untuk komponen luar Canvas
  const { progress } = useProgress()
  useEffect(() => {
    setLoadingProgress(progress)
    
    // Tandai scene sebagai loaded ketika progress mencapai 100%
    if (progress >= 100) {
      const timer = setTimeout(() => {
        setSceneLoaded(true)
      }, 500) // Jeda 500ms untuk memastikan komponen telah muncul
      return () => clearTimeout(timer)
    }
  }, [progress])

  // Patch sebelum render Canvas
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Apply canvas patch di setiap render untuk memastikan kompatibilitas
      patchForCanvas();
    }
  }, []);

  // Kompononen Canvas dengan Suspense untuk loading
  const Scene3D = () => (
    <Canvas
      key={canvasKey}
      camera={{ position: [0, 0, 6], fov: 45 }}
      onCreated={handleSceneLoad}
      gl={glAttributes}
      dpr={[0.5, usePerformanceMode ? 1.0 : 1.5]} // Lower DPR range
      frameloop={usePerformanceMode ? "demand" : "always"} // Only render when needed for low-end devices
      performance={{ 
        min: usePerformanceMode ? 0.3 : 0.5, 
        max: usePerformanceMode ? 0.7 : 1.0 
      }}
    >
      {/* Lighting dioptimasi berdasarkan performa */}
      <ambientLight intensity={0.5} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        intensity={1}
        castShadow={!usePerformanceMode}
      />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />

      <TechSphere />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={usePerformanceMode ? 0.3 : 0.5}
        makeDefault
      />

      {/* Gunakan Suspense untuk handling error pada Environment */}
      <Suspense fallback={<FallbackEnvironment />}>
        <Environment 
          preset="warehouse" 
          background={false}
        />
      </Suspense>
      
      <ContextLossDetector />

      {/* Tambahkan hardware-specific optimizations */}
      <HardwareOptimizer />

      {/* Performance optimizations */}
      <AdaptiveDpr pixelated />
      {usePerformanceMode && <BakeShadows />}

      {/* Frame rate limiter */}
      {(isLowEndDevice || isThrottled || isAMD) && <FrameRateLimiter />}
      
      {/* Preload assets */}
      <Preload all />
      
      {/* Loading indicator dalam Canvas dengan Html */}
      <CanvasLoadingIndicator />
    </Canvas>
  );

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={
        {
          "--mouse-x": "0px",
          "--mouse-y": "0px",
        } as React.CSSProperties
      }
    >
      <div className="absolute inset-0 z-0">
        {!canvasError && isInitialized ? (
          <>
            {/* Apply patch sebelum Canvas dirender tanpa mengembalikan hasilnya */}
            {typeof window !== 'undefined' && (
              <>{patchForCanvas() && null}</>
            )}
            
            {/* Bungkus dengan Suspense untuk error handling yang lebih baik di React 19 */}
            <Suspense fallback={<FallbackContent />}>
              <Scene3D />
            </Suspense>
            
            {/* Loading indicator komponen di luar Canvas dengan animasi fade out */}
            {!sceneLoaded && (
              <div className="absolute bottom-5 left-0 right-0 text-center text-xs font-mono z-10 transition-opacity duration-300" 
                   style={{ opacity: loadingProgress < 100 ? 1 : 0 }}>
                {Math.round(loadingProgress)}% loaded
              </div>
            )}
          </>
        ) : (
          <FallbackContent />
        )}
      </div>

      <div className="container mx-auto px-4 z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1
              ref={textRef}
              className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground transition-transform duration-200"
            >
              {mainHeadingText || t("hero.title")}
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p className="text-xl md:text-2xl mb-8 text-foreground/80">
              {t("hero.subtitle")}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Button
              size="lg"
              className="btn-premium text-lg px-8 py-6 cursor-button"
              style={{
                transform: `translate(calc(var(--mouse-x) * -0.1), calc(var(--mouse-y) * -0.1))`,
              }}
            >
              {t("hero.cta")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <Link href="/resume">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full text-lg px-8 py-6 border-primary/50 hover:border-primary hover:bg-primary/5 transition-all duration-300 transform hover:scale-105 cursor-button"
                style={{
                  transform: `translate(calc(var(--mouse-x) * -0.1), calc(var(--mouse-y) * -0.1))`,
                }}
              >
                View Resume
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

