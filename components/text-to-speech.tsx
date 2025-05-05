"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Volume2, Pause, Play, VolumeX, Settings } from "lucide-react"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLanguage } from "./language-provider"

interface TextToSpeechProps {
  text: string
  className?: string
}

export default function TextToSpeech({ text, className }: TextToSpeechProps) {
  const { language } = useLanguage()
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(80)
  const [rate, setRate] = useState(1)
  const [pitch, setPitch] = useState(1)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<string>("")
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  
  // Inisialisasi text-to-speech ketika komponen dimuat
  useEffect(() => {
    const synth = window.speechSynthesis
    
    // Fungsi untuk mendapatkan daftar suara (voice)
    const getVoices = () => {
      const availableVoices = synth.getVoices()
      setVoices(availableVoices)
      
      // Pilih voice default berdasarkan bahasa saat ini
      if (availableVoices.length > 0) {
        const langPrefix = language.slice(0, 2).toLowerCase()
        const matchingVoice = availableVoices.find(voice => 
          voice.lang.toLowerCase().startsWith(langPrefix) || 
          voice.lang.toLowerCase() === langPrefix
        )
        
        if (matchingVoice) {
          setSelectedVoice(matchingVoice.name)
        } else {
          // Jika tidak ada yang cocok, gunakan default
          setSelectedVoice(availableVoices[0].name)
        }
      }
    }
    
    // Ambil daftar suara
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = getVoices
    }
    
    getVoices()
    
    // Cleanup saat komponen unmount
    return () => {
      if (utteranceRef.current && isPlaying) {
        synth.cancel()
      }
    }
  }, [language])
  
  const startSpeech = () => {
    if (!text || !window.speechSynthesis) return
    
    // Hentikan speech yang sedang berlangsung
    window.speechSynthesis.cancel()
    
    // Buat utterance baru
    const utterance = new SpeechSynthesisUtterance(text)
    utteranceRef.current = utterance
    
    // Set properti utterance
    if (selectedVoice) {
      const voice = voices.find(v => v.name === selectedVoice)
      if (voice) utterance.voice = voice
    }
    
    utterance.volume = volume / 100
    utterance.rate = rate
    utterance.pitch = pitch
    
    // Set event handlers
    utterance.onstart = () => {
      setIsPlaying(true)
      setIsPaused(false)
    }
    
    utterance.onend = () => {
      setIsPlaying(false)
      setIsPaused(false)
    }
    
    utterance.onerror = () => {
      setIsPlaying(false)
      setIsPaused(false)
    }
    
    // Mulai speech
    window.speechSynthesis.speak(utterance)
  }
  
  const pauseSpeech = () => {
    if (!window.speechSynthesis) return
    
    if (!isPaused) {
      window.speechSynthesis.pause()
      setIsPaused(true)
    } else {
      window.speechSynthesis.resume()
      setIsPaused(false)
    }
  }
  
  const stopSpeech = () => {
    if (!window.speechSynthesis) return
    
    window.speechSynthesis.cancel()
    setIsPlaying(false)
    setIsPaused(false)
  }
  
  const toggleMute = () => {
    if (!utteranceRef.current) return
    
    if (!isMuted) {
      utteranceRef.current.volume = 0
      setIsMuted(true)
    } else {
      utteranceRef.current.volume = volume / 100
      setIsMuted(false)
    }
  }
  
  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
    if (utteranceRef.current) {
      utteranceRef.current.volume = value[0] / 100
    }
    
    if (value[0] === 0) {
      setIsMuted(true)
    } else if (isMuted) {
      setIsMuted(false)
    }
  }
  
  const handleRateChange = (value: number[]) => {
    setRate(value[0])
    if (utteranceRef.current) {
      utteranceRef.current.rate = value[0]
    }
  }
  
  const handlePitchChange = (value: number[]) => {
    setPitch(value[0])
    if (utteranceRef.current) {
      utteranceRef.current.pitch = value[0]
    }
  }
  
  const handleVoiceChange = (value: string) => {
    setSelectedVoice(value)
    
    // Jika sedang berlangsung, update suara dan mulai ulang
    if (isPlaying) {
      stopSpeech()
      setTimeout(() => {
        startSpeech()
      }, 100)
    }
  }
  
  // Cek jika browser mendukung speechSynthesis
  const isSpeechSupported = typeof window !== "undefined" && "speechSynthesis" in window
  
  if (!isSpeechSupported) {
    return null // Jangan tampilkan apa-apa jika tidak didukung
  }
  
  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
      {!isPlaying ? (
        <Button
          size="sm"
          variant="outline"
          className="flex items-center gap-1"
          onClick={startSpeech}
        >
          <Play className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:inline-block">
            Bacakan Teks
          </span>
        </Button>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className="flex items-center gap-1"
          onClick={isPaused ? pauseSpeech : pauseSpeech}
        >
          {isPaused ? (
            <Play className="h-3.5 w-3.5" />
          ) : (
            <Pause className="h-3.5 w-3.5" />
          )}
          <span className="sr-only sm:not-sr-only sm:inline-block">
            {isPaused ? "Lanjutkan" : "Jeda"}
          </span>
        </Button>
      )}
      
      {isPlaying && (
        <>
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-8 w-8 p-0" 
            onClick={toggleMute}
          >
            {isMuted ? (
              <VolumeX className="h-3.5 w-3.5" />
            ) : (
              <Volume2 className="h-3.5 w-3.5" />
            )}
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <Settings className="h-3.5 w-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Pengaturan Suara</h4>
                  <p className="text-sm text-muted-foreground">
                    Sesuaikan volume, kecepatan, dan nada suara
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="voice" className="text-sm font-medium leading-none col-span-1">
                      Suara
                    </label>
                    <div className="col-span-3">
                      <Select value={selectedVoice} onValueChange={handleVoiceChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih suara" />
                        </SelectTrigger>
                        <SelectContent className="max-h-40">
                          {voices.map((voice) => (
                            <SelectItem key={voice.name} value={voice.name}>
                              {voice.name} ({voice.lang})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="volume" className="text-sm font-medium leading-none col-span-1">
                      Volume
                    </label>
                    <div className="col-span-3 flex items-center gap-2">
                      <Slider
                        id="volume"
                        value={[volume]}
                        min={0}
                        max={100}
                        step={5}
                        onValueChange={handleVolumeChange}
                      />
                      <span className="w-8 text-sm text-right">{volume}%</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="rate" className="text-sm font-medium leading-none col-span-1">
                      Kecepatan
                    </label>
                    <div className="col-span-3 flex items-center gap-2">
                      <Slider
                        id="rate"
                        value={[rate]}
                        min={0.5}
                        max={2}
                        step={0.1}
                        onValueChange={handleRateChange}
                      />
                      <span className="w-8 text-sm text-right">{rate}x</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="pitch" className="text-sm font-medium leading-none col-span-1">
                      Nada
                    </label>
                    <div className="col-span-3 flex items-center gap-2">
                      <Slider
                        id="pitch"
                        value={[pitch]}
                        min={0.5}
                        max={2}
                        step={0.1}
                        onValueChange={handlePitchChange}
                      />
                      <span className="w-8 text-sm text-right">{pitch}x</span>
                    </div>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </>
      )}
    </div>
  )
} 