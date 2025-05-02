"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, Volume2, VolumeX, Music } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { toast } from "@/hooks/use-toast"

export default function PremiumAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const [isVisible, setIsVisible] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [isAudioAvailable, setIsAudioAvailable] = useState(true)
  
  // Reference untuk timer debounce
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // References for Web Audio API
  const audioContextRef = useRef<AudioContext | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const oscillatorsRef = useRef<OscillatorNode[]>([])

  // Initialize Web Audio API
  useEffect(() => {
    // Only initialize on client side
    if (typeof window === "undefined") return

    try {
      // Create audio context
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContextClass) {
        console.warn("Web Audio API not supported in this browser")
        setIsAudioAvailable(false)
        return
      }

      // Initialize audio context on user interaction to comply with autoplay policies
      const initializeAudio = () => {
        if (audioContextRef.current) return

        try {
          setIsInitializing(true)
          
          // Create audio context
          const audioContext = new AudioContextClass()
          audioContextRef.current = audioContext

          // Create main gain node (volume control)
          const gainNode = audioContext.createGain()
          gainNode.gain.value = volume
          gainNode.connect(audioContext.destination)
          gainNodeRef.current = gainNode

          console.log("Audio context initialized successfully")
          setIsInitializing(false)
        } catch (error) {
          console.error("Failed to initialize audio context:", error)
          setIsAudioAvailable(false)
          setIsInitializing(false)
          toast({
            title: "Audio Unavailable",
            description: "Could not initialize audio system. Ambient sound is disabled.",
            variant: "destructive",
          })
        }
      }

      // Add event listeners to initialize audio on user interaction
      const handleUserInteraction = () => {
        initializeAudio()
        // Remove event listeners after initialization
        document.removeEventListener("click", handleUserInteraction)
        document.removeEventListener("touchstart", handleUserInteraction)
        document.removeEventListener("keydown", handleUserInteraction)
      }

      document.addEventListener("click", handleUserInteraction)
      document.addEventListener("touchstart", handleUserInteraction)
      document.addEventListener("keydown", handleUserInteraction)

      return () => {
        // Clean up event listeners
        document.removeEventListener("click", handleUserInteraction)
        document.removeEventListener("touchstart", handleUserInteraction)
        document.removeEventListener("keydown", handleUserInteraction)

        // Clean up debounce timer
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current)
        }

        // Stop and clean up audio
        stopAmbientSound()

        // Close audio context
        if (audioContextRef.current && audioContextRef.current.state !== "closed") {
          audioContextRef.current.close()
        }
      }
    } catch (error) {
      console.error("Error setting up audio system:", error)
      setIsAudioAvailable(false)
    }
  }, [])

  // Update volume when it changes
  useEffect(() => {
    if (!gainNodeRef.current || !audioContextRef.current) return

    // Apply volume (accounting for mute state)
    const effectiveVolume = isMuted ? 0 : volume
    const currentTime = audioContextRef.current.currentTime || 0

    // Smoothly change volume to avoid clicks
    try {
      gainNodeRef.current.gain.setValueAtTime(gainNodeRef.current.gain.value, currentTime)
      gainNodeRef.current.gain.linearRampToValueAtTime(effectiveVolume, currentTime + 0.1)
    } catch (error) {
      console.error("Error updating volume:", error)
    }
  }, [volume, isMuted])

  /**
   * Membuat ambient sound dengan kombinasi oscillator untuk menghasilkan suara yang harmonis
   */
  const createAmbientSound = () => {
    // Validasi audio context dan gain node
    if (!audioContextRef.current || !gainNodeRef.current) {
      console.warn("Cannot create ambient sound: Audio context not initialized")
      return
    }

    // Bersihkan oscillator yang ada sebelum membuat yang baru
    stopAmbientSound()

    try {
      // Helper function untuk membuat oscillator dengan parameter tertentu
      const createOscillator = (type: OscillatorType, frequency: number, detune: number, gain: number) => {
        const ctx = audioContextRef.current!
        const oscillator = ctx.createOscillator()
        
        // Set parameter dasar oscillator
        oscillator.type = type
        oscillator.frequency.value = frequency
        oscillator.detune.value = detune

        // Buat gain node khusus untuk oscillator ini
        const oscillatorGain = ctx.createGain()
        oscillatorGain.gain.value = 0 // Mulai dari 0 untuk fade in
        
        // Fade in untuk menghindari click/pop
        oscillatorGain.gain.setValueAtTime(0, ctx.currentTime)
        oscillatorGain.gain.linearRampToValueAtTime(gain, ctx.currentTime + 0.5)

        // Sambungkan oscillator ke sistem audio
        oscillator.connect(oscillatorGain)
        oscillatorGain.connect(gainNodeRef.current!)

        // Mulai oscillator
        oscillator.start()

        return oscillator
      }

      // Membuat kombinasi oscillator untuk suara ambient yang lebih kaya
      const oscillators = [
        // Nada dasar
        createOscillator("sine", 220, 0, 0.12),
        // Harmonik
        createOscillator("sine", 220 * 1.5, 5, 0.06),
        createOscillator("sine", 220 * 2, -5, 0.04),
        // Suara latar dengan pergerakan lembut
        createOscillator("sine", 220 * 0.5, 2, 0.08),
        // Tambahan untuk nuansa yang lebih kaya
        createOscillator("triangle", 110, 3, 0.03),
      ]

      // Simpan oscillator untuk pembersihan nanti
      oscillatorsRef.current = oscillators
      
      console.log("Ambient sound created with", oscillators.length, "oscillators")
    } catch (error) {
      console.error("Failed to create ambient sound:", error)
      toast({
        title: "Audio Playback Error",
        description: "Failed to generate ambient sound.",
        variant: "destructive",
      })
    }
  }

  /**
   * Menghentikan dan membersihkan semua oscillator ambient sound
   */
  const stopAmbientSound = () => {
    if (oscillatorsRef.current.length === 0) return
    
    try {
      const ctx = audioContextRef.current
      if (!ctx) return
      
      // Hentikan dan disconnect semua oscillator dengan fade out
      oscillatorsRef.current.forEach((oscillator) => {
        try {
          // Dapatkan gain node yang terhubung dengan oscillator
          const connections = oscillator.numberOfOutputs > 0 ? 
            (oscillator as any).connections || [oscillator] : 
            [oscillator]
            
          // Fade out setiap koneksi jika memungkinkan
          connections.forEach((node: any) => {
            if (node.gain) {
              node.gain.setValueAtTime(node.gain.value, ctx.currentTime)
              node.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2)
            }
          })
          
          // Jadwalkan stop setelah fade out selesai
          setTimeout(() => {
            try {
              oscillator.stop()
              oscillator.disconnect()
            } catch (e) {
              // Ignore already stopped oscillators
            }
          }, 250)
        } catch (error) {
          // Fallback to immediate stop if fade out fails
          try {
            oscillator.stop()
            oscillator.disconnect()
          } catch (e) {
            // Ignore already stopped oscillators
          }
        }
      })

      // Clear oscillators array
      oscillatorsRef.current = []
      console.log("Ambient sound stopped and cleaned up")
    } catch (error) {
      console.error("Error stopping ambient sound:", error)
    }
  }

  /**
   * Beralih antara memutar dan menghentikan ambient sound dengan debounce
   * untuk mencegah multiple klik
   */
  const togglePlay = () => {
    // Debounce untuk mencegah multiple klik
    if (debounceTimerRef.current || isInitializing) return
    
    // Set debounce
    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null
    }, 300)
    
    // Jika audio tidak tersedia, tampilkan pesan
    if (!isAudioAvailable) {
      toast({
        title: "Audio Unavailable",
        description: "Your browser doesn't support audio playback or it has been disabled.",
        variant: "destructive",
      })
      return
    }
    
    // Jika audio context belum ada, inisialisasi terlebih dahulu
    if (!audioContextRef.current) {
      setIsInitializing(true)
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
        if (!AudioContextClass) {
          toast({
            title: "Audio Unavailable",
            description: "Your browser doesn't support Web Audio API. Ambient sound is disabled.",
            variant: "destructive",
          })
          setIsAudioAvailable(false)
          setIsInitializing(false)
          return
        }

        // Buat audio context baru
        const audioContext = new AudioContextClass()
        audioContextRef.current = audioContext

        // Buat gain node utama
        const gainNode = audioContext.createGain()
        gainNode.gain.value = isMuted ? 0 : volume
        gainNode.connect(audioContext.destination)
        gainNodeRef.current = gainNode
        
        setIsInitializing(false)
      } catch (error) {
        console.error("Failed to initialize audio context:", error)
        toast({
          title: "Audio Unavailable",
          description: "Could not initialize audio system. Ambient sound is disabled.",
          variant: "destructive",
        })
        setIsAudioAvailable(false)
        setIsInitializing(false)
        return
      }
    }

    // Jika audio context suspended (karena kebijakan autoplay), resume terlebih dahulu
    if (audioContextRef.current.state === "suspended") {
      setIsInitializing(true)
      audioContextRef.current
        .resume()
        .then(() => {
          if (!isPlaying) {
            createAmbientSound()
            setIsPlaying(true)
          }
          setIsInitializing(false)
        })
        .catch((error) => {
          console.error("Failed to resume audio context:", error)
          toast({
            title: "Audio Playback Failed",
            description: "Could not start audio playback. Try clicking elsewhere on the page first.",
            variant: "destructive",
          })
          setIsInitializing(false)
        })
      return
    }

    // Toggle play state
    if (isPlaying) {
      stopAmbientSound()
      setIsPlaying(false)
    } else {
      createAmbientSound()
      setIsPlaying(true)
    }
  }

  /**
   * Beralih antara mute dan unmute
   */
  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  /**
   * Menangani perubahan nilai volume
   */
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)

    // Otomatis set muted jika volume 0
    if (newVolume === 0) {
      setIsMuted(true)
    } else if (isMuted) {
      setIsMuted(false)
    }
  }

  // Button animation variants
  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.1 },
    tap: { scale: 0.95 },
    pulse: {
      scale: [1, 1.08, 1],
      opacity: [1, 0.8, 1],
      transition: { 
        repeat: Infinity,
        duration: 2,
      }
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative" onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}>
        <motion.div
          initial="initial"
          animate={isPlaying ? "pulse" : "initial"}
          whileHover="hover"
          whileTap="tap"
          variants={buttonVariants}
        >
          <Button
            variant="outline"
            size="icon"
            disabled={isInitializing || !isAudioAvailable}
            className={`
              rounded-full h-10 w-10 
              bg-background/80 backdrop-blur-md 
              ${isPlaying ? 'border-primary border-opacity-60' : 'border-primary/20'} 
              hover:border-primary/60 
              transition-all duration-300
              ${isInitializing ? 'animate-pulse' : ''}
              shadow-lg hover:shadow-primary/20
            `}
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause ambient sound" : "Play ambient sound"}
          >
            {isInitializing ? (
              <span className="h-4 w-4 block rounded-full border-2 border-primary border-t-transparent animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-4 w-4 text-primary" />
            ) : (
              <div className="relative">
                <Music className="h-4 w-4" />
                <motion.div 
                  className="absolute inset-0 bg-primary/20 rounded-full"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.5, 0], opacity: [0, 0.5, 0] }}
                  transition={{ repeat: Infinity, duration: 3, repeatDelay: 1 }}
                />
              </div>
            )}
          </Button>
        </motion.div>

        <AnimatePresence>
          {isVisible && (
            <motion.div
              className="absolute bottom-full right-0 mb-2 p-3 rounded-lg bg-background/90 backdrop-blur-md border border-primary/20 w-48 shadow-lg"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Music className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-medium">Ambient Sound</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 rounded-full hover:bg-primary/10"
                  onClick={toggleMute}
                  disabled={!isAudioAvailable || isInitializing}
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <VolumeX className="h-3 w-3 text-muted-foreground" />
                  ) : (
                    <Volume2 className="h-3 w-3 text-primary" />
                  )}
                </Button>
              </div>

              <Slider
                value={[isMuted ? 0 : volume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                disabled={!isAudioAvailable || isInitializing}
                className="w-full"
                aria-label="Volume"
              />

              <motion.div 
                className="mt-2 text-xs text-center rounded-md py-1 px-2"
                initial={{ backgroundColor: "rgba(var(--primary-rgb), 0.1)" }}
                animate={{ 
                  backgroundColor: isPlaying 
                    ? "rgba(var(--primary-rgb), 0.15)" 
                    : "rgba(var(--muted-rgb), 0.1)"
                }}
                transition={{ duration: 0.3 }}
              >
                <span className={isPlaying ? "text-primary" : "text-muted-foreground"}>
                  {isInitializing 
                    ? "Initializing..." 
                    : !isAudioAvailable 
                      ? "Not available" 
                      : isPlaying 
                        ? "Now Playing" 
                        : "Paused"}
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

