"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { toast } from "@/hooks/use-toast"

export default function PremiumAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const [isVisible, setIsVisible] = useState(false)

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
        return
      }

      // Initialize audio context on user interaction to comply with autoplay policies
      const initializeAudio = () => {
        if (audioContextRef.current) return

        try {
          // Create audio context
          const audioContext = new AudioContextClass()
          audioContextRef.current = audioContext

          // Create main gain node (volume control)
          const gainNode = audioContext.createGain()
          gainNode.gain.value = volume
          gainNode.connect(audioContext.destination)
          gainNodeRef.current = gainNode

          console.log("Audio context initialized successfully")
        } catch (error) {
          console.error("Failed to initialize audio context:", error)
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

        // Stop and clean up audio
        stopAmbientSound()

        // Close audio context
        if (audioContextRef.current && audioContextRef.current.state !== "closed") {
          audioContextRef.current.close()
        }
      }
    } catch (error) {
      console.error("Error setting up audio system:", error)
    }
  }, [])

  // Update volume when it changes
  useEffect(() => {
    if (!gainNodeRef.current) return

    // Apply volume (accounting for mute state)
    const effectiveVolume = isMuted ? 0 : volume

    // Smoothly change volume to avoid clicks
    gainNodeRef.current.gain.setValueAtTime(gainNodeRef.current.gain.value, audioContextRef.current?.currentTime || 0)
    gainNodeRef.current.gain.linearRampToValueAtTime(effectiveVolume, (audioContextRef.current?.currentTime || 0) + 0.1)
  }, [volume, isMuted])

  // Create ambient sound
  const createAmbientSound = () => {
    if (!audioContextRef.current || !gainNodeRef.current) return

    // Stop any existing oscillators
    stopAmbientSound()

    // Create multiple oscillators for a richer ambient sound
    const createOscillator = (type: OscillatorType, frequency: number, detune: number, gain: number) => {
      const oscillator = audioContextRef.current!.createOscillator()
      oscillator.type = type
      oscillator.frequency.value = frequency
      oscillator.detune.value = detune

      // Create individual gain for this oscillator
      const oscillatorGain = audioContextRef.current!.createGain()
      oscillatorGain.gain.value = gain

      // Connect oscillator -> oscillatorGain -> main gainNode
      oscillator.connect(oscillatorGain)
      oscillatorGain.connect(gainNodeRef.current!)

      // Start oscillator
      oscillator.start()

      return oscillator
    }

    // Create a pad-like ambient sound with multiple oscillators
    const oscillators = [
      // Base tone
      createOscillator("sine", 220, 0, 0.1),
      // Harmonics
      createOscillator("sine", 220 * 1.5, 5, 0.05),
      createOscillator("sine", 220 * 2, -5, 0.03),
      // Subtle movement
      createOscillator("sine", 220 * 0.5, 2, 0.07),
    ]

    // Store oscillators for later cleanup
    oscillatorsRef.current = oscillators
  }

  // Stop ambient sound
  const stopAmbientSound = () => {
    // Stop all oscillators
    oscillatorsRef.current.forEach((oscillator) => {
      try {
        oscillator.stop()
        oscillator.disconnect()
      } catch (error) {
        // Ignore errors from already stopped oscillators
      }
    })

    // Clear oscillators array
    oscillatorsRef.current = []
  }

  // Toggle play/pause
  const togglePlay = () => {
    if (!audioContextRef.current) {
      // Try to initialize audio context if not already done
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
        if (!AudioContextClass) {
          toast({
            title: "Audio Unavailable",
            description: "Your browser doesn't support Web Audio API. Ambient sound is disabled.",
            variant: "destructive",
          })
          return
        }

        // Create audio context
        const audioContext = new AudioContextClass()
        audioContextRef.current = audioContext

        // Create main gain node
        const gainNode = audioContext.createGain()
        gainNode.gain.value = isMuted ? 0 : volume
        gainNode.connect(audioContext.destination)
        gainNodeRef.current = gainNode
      } catch (error) {
        console.error("Failed to initialize audio context:", error)
        toast({
          title: "Audio Unavailable",
          description: "Could not initialize audio system. Ambient sound is disabled.",
          variant: "destructive",
        })
        return
      }
    }

    // Resume audio context if suspended (autoplay policy)
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current
        .resume()
        .then(() => {
          if (!isPlaying) {
            createAmbientSound()
            setIsPlaying(true)
          }
        })
        .catch((error) => {
          console.error("Failed to resume audio context:", error)
          toast({
            title: "Audio Playback Failed",
            description: "Could not start audio playback. Try clicking elsewhere on the page first.",
            variant: "destructive",
          })
        })
    } else {
      // Toggle play state
      if (isPlaying) {
        stopAmbientSound()
        setIsPlaying(false)
      } else {
        createAmbientSound()
        setIsPlaying(true)
      }
    }
  }

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)

    if (newVolume === 0) {
      setIsMuted(true)
    } else if (isMuted) {
      setIsMuted(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative" onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-10 w-10 bg-background/80 backdrop-blur-md border-primary/20 hover:border-primary/50 cursor-button"
          onClick={togglePlay}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>

        <AnimatePresence>
          {isVisible && (
            <motion.div
              className="absolute bottom-full right-0 mb-2 p-3 rounded-lg bg-background/80 backdrop-blur-md border border-primary/20 w-48"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium">Ambient Sound</span>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={toggleMute}>
                  {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                </Button>
              </div>

              <Slider
                value={[isMuted ? 0 : volume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                className="w-full"
              />

              <div className="mt-2 text-xs text-foreground/60 text-center">{isPlaying ? "Now Playing" : "Paused"}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

