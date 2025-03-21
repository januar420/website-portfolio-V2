"use client"

import { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"
import { checkWebGLSupport } from "@/utils/webgl-utils"
import { useHardwareCapabilities } from "./hardware-optimized-renderer"

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  color: string
}

export default function PremiumParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()
  const [isWebGLSupported, setIsWebGLSupported] = useState(true)
  const [isReducedMotion, setIsReducedMotion] = useState(false)
  const [particleCount, setParticleCount] = useState(0)
  const animationRef = useRef<number | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const lastFrameTimeRef = useRef<number>(0)
  const frameCountRef = useRef<number>(0)
  const fpsRef = useRef<number>(60)
  const lastRenderTimeRef = useRef<number>(0)
  const { gpuInfo, cpuInfo, deviceCategory, detailLevels, optimizationParams } = useHardwareCapabilities()

  // Periksa dulu apakah ada hardware yang terdeteksi secara throttled
  const isThrottled = cpuInfo?.throttled || false
  
  // Periksa kategori perangkat
  const isLowEndDevice = deviceCategory === "low-end"
  const isHighEndDevice = deviceCategory === "high-end"
  
  // Periksa vendor GPU
  const isAMD = gpuInfo?.vendor === "amd"
  
  // Periksa preferensi reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setIsReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  // Periksa dukungan WebGL
  useEffect(() => {
    const webglSupport = checkWebGLSupport()
    setIsWebGLSupported(webglSupport.supported)

    if (!webglSupport.supported) {
      console.warn("WebGL not supported:", webglSupport.reason)
    }
  }, [])

  useEffect(() => {
    // Pastikan hardware terdeteksi terlebih dahulu
    if (!gpuInfo || !cpuInfo || !detailLevels) return
    
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set dimensi canvas dengan mempertimbangkan device pixel ratio
    const setCanvasDimensions = () => {
      const dpr = window.devicePixelRatio || 1
      const displayWidth = window.innerWidth
      const displayHeight = window.innerHeight

      // Sesuaikan DPR berdasarkan kategori perangkat
      let adjustedDpr: number
      
      if (isLowEndDevice || isThrottled) {
        adjustedDpr = Math.min(dpr, 1) // Cap DPR pada 1 untuk perangkat low-end
      } else if (isAMD) {
        adjustedDpr = Math.min(dpr, 1.5) // Cap DPR pada 1.5 untuk GPU AMD
      } else if (isHighEndDevice) {
        adjustedDpr = dpr // Gunakan DPR penuh untuk perangkat high-end
      } else {
        adjustedDpr = Math.min(dpr, 2) // Cap DPR pada 2 untuk perangkat lain
      }

      canvas.width = displayWidth * adjustedDpr
      canvas.height = displayHeight * adjustedDpr

      canvas.style.width = `${displayWidth}px`
      canvas.style.height = `${displayHeight}px`

      ctx.scale(adjustedDpr, adjustedDpr)

      // Sesuaikan jumlah partikel berdasarkan ukuran layar, performa, dan hardware
      // Gunakan nilai dari detailLevels jika tersedia
      let baseParticleCount = detailLevels.particleCount || 
                             Math.min(Math.floor((window.innerWidth * window.innerHeight) / 15000), 100)
      
      // Kurangi jumlah partikel berdasarkan kategori perangkat
      if (isLowEndDevice || isThrottled) {
        baseParticleCount = Math.floor(baseParticleCount * 0.4) // Kurangi 60% untuk perangkat low-end
      } else if (isAMD) {
        baseParticleCount = Math.floor(baseParticleCount * 0.7) // Kurangi 30% untuk GPU AMD
      } else if (!isHighEndDevice) {
        baseParticleCount = Math.floor(baseParticleCount * 0.85) // Kurangi 15% untuk mid-range
      }
      
      // Pastikan jumlah partikel tidak terlalu sedikit
      setParticleCount(Math.max(baseParticleCount, 10))
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Buat partikel
    const createParticles = () => {
      const isDark = theme === "dark"
      const particles: Particle[] = []

      // Sesuaikan jumlah partikel berdasarkan preferensi reduced motion
      const count = isReducedMotion ? Math.floor(particleCount / 3) : particleCount

      // Sesuaikan lebih lanjut berdasarkan kapabilitas hardware
      const adjustedCount = isLowEndDevice ? Math.floor(count * 0.6) : 
                           isThrottled ? Math.floor(count * 0.7) :
                           isAMD ? Math.floor(count * 0.8) : count

      for (let i = 0; i < adjustedCount; i++) {
        // Partikel lebih lambat untuk perangkat terbatas
        const speedMultiplier = isLowEndDevice ? 0.5 : 
                               isThrottled ? 0.6 : 
                               isAMD ? 0.7 : 1.0

        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          speedX: (Math.random() - 0.5) * (isReducedMotion ? 0.1 : 0.3) * speedMultiplier,
          speedY: (Math.random() - 0.5) * (isReducedMotion ? 0.1 : 0.3) * speedMultiplier,
          opacity: Math.random() * 0.5 + 0.1,
          color: isDark ? "255, 255, 255" : "0, 0, 0",
        })
      }

      particlesRef.current = particles
    }

    // Loop animasi dengan monitoring performa
    const animate = (timestamp: number) => {
      // Hitung FPS untuk monitoring performa
      if (lastFrameTimeRef.current) {
        const deltaTime = timestamp - lastFrameTimeRef.current
        frameCountRef.current++

        if (frameCountRef.current >= 10) {
          fpsRef.current = 1000 / (deltaTime / frameCountRef.current)
          frameCountRef.current = 0

          // Jika FPS turun terlalu rendah, kurangi jumlah partikel
          if (fpsRef.current < 30 && particleCount > 20) {
            setParticleCount((prev) => Math.max(prev - 10, 20))
            createParticles()
          }
        }
      }
      lastFrameTimeRef.current = timestamp

      // Kontrol frame rate sesuai dengan pengaturan optimasi
      const targetFPS = optimizationParams?.maxFPS || 
                       (isLowEndDevice ? 30 : isThrottled ? 45 : 60)
      
      const minFrameTime = 1000 / targetFPS
      const elapsed = timestamp - lastRenderTimeRef.current
      
      // Lewati frame jika frame rate masih terlalu tinggi
      if (elapsed < minFrameTime) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }
      
      lastRenderTimeRef.current = timestamp
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Lewati rendering jika tab tidak terlihat atau reduced motion disukai
      if (document.hidden || (isReducedMotion && Math.random() > 0.1)) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }

      // Update dan gambar partikel
      for (let i = 0; i < particlesRef.current.length; i++) {
        const p = particlesRef.current[i]

        p.x += p.speedX
        p.y += p.speedY

        // Wrap around edges
        if (p.x > canvas.width) p.x = 0
        if (p.x < 0) p.x = canvas.width
        if (p.y > canvas.height) p.y = 0
        if (p.y < 0) p.y = canvas.height

        // Gambar partikel
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`
        ctx.fill()

        // Gambar koneksi (batasi koneksi untuk performa lebih baik)
        // Sesuaikan batas koneksi berdasarkan kapabilitas hardware
        const connectionLimit = isLowEndDevice ? 1 : 
                               isThrottled ? 2 : 
                               isAMD ? 2 : 
                               isReducedMotion ? 3 : 
                               isHighEndDevice ? 6 : 4
        
        let connectionsDrawn = 0

        for (let j = i + 1; j < particlesRef.current.length && connectionsDrawn < connectionLimit; j++) {
          const p2 = particlesRef.current[j]
          const dx = p.x - p2.x
          const dy = p.y - p2.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          // Sesuaikan jarak koneksi berdasarkan kategori perangkat
          const connectionDistance = isLowEndDevice ? 60 : 
                                   isThrottled ? 70 :
                                   isAMD ? 80 : 
                                   isHighEndDevice ? 120 : 100

          if (distance < connectionDistance) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(${p.color}, ${p.opacity * 0.5 * (1 - distance / connectionDistance)})`
            ctx.lineWidth = 0.5
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
            connectionsDrawn++
          }
        }
      }

      // Batasi frame rate untuk perangkat dengan kemampuan terbatas
      if (isLowEndDevice) {
        setTimeout(() => {
          animationRef.current = requestAnimationFrame(animate)
        }, 1000 / 20) // Cap di 20 FPS untuk low-end
      } else if (isThrottled || isAMD) {
        setTimeout(() => {
          animationRef.current = requestAnimationFrame(animate)
        }, 1000 / 30) // Cap di 30 FPS untuk throttled atau AMD
      } else {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    // Mulai animasi jika WebGL didukung
    if (isWebGLSupported) {
      createParticles()
      animationRef.current = requestAnimationFrame(animate)
    } else {
      // Fallback untuk perangkat tanpa WebGL
      ctx.fillStyle = theme === "dark" ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.03)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    // Update warna partikel saat theme berubah
    const updateParticleColors = () => {
      const isDark = theme === "dark"
      particlesRef.current.forEach((p) => {
        p.color = isDark ? "255, 255, 255" : "0, 0, 0"
      })
    }

    // Tangani perubahan visibilitas untuk menjeda animasi saat tab tidak terlihat
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Jeda animasi
        if (animationRef.current !== null) {
          cancelAnimationFrame(animationRef.current)
          animationRef.current = null
        }
      } else {
        // Lanjutkan animasi
        if (animationRef.current === null) {
          lastFrameTimeRef.current = performance.now()
          lastRenderTimeRef.current = performance.now()
          animationRef.current = requestAnimationFrame(animate)
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    // Clean up
    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [theme, isReducedMotion, particleCount, gpuInfo, cpuInfo, deviceCategory, isWebGLSupported, isLowEndDevice, isHighEndDevice, isAMD, isThrottled, detailLevels, optimizationParams])

  // Render 
  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
      data-device-category={deviceCategory}
    />
  )
}

