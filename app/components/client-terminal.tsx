"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"

// Gunakan dynamic import untuk LinuxTerminal
const LinuxTerminal = dynamic(() => import("@/components/linux-terminal"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[60vh] bg-zinc-900/95 rounded-lg border border-zinc-700/50 overflow-hidden shadow-xl flex items-center justify-center">
      <div className="text-green-500 font-mono text-sm">Loading terminal...</div>
    </div>
  ),
})

export default function ClientTerminal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  // Deteksi perangkat mobile
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : ""
      const mobile = Boolean(
        userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i)
      )
      setIsMobile(mobile || window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])
  
  if (isMobile) {
    return null
  }
  
  if (isOpen) {
    return (
      <div className="fixed bottom-0 right-0 z-50 p-4 w-full max-w-3xl h-[60vh]">
        <LinuxTerminal 
          initiallyOpen={true} 
          showGlowEffect={true}
        />
      </div>
    )
  }
  
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <Button
        onClick={() => setIsOpen(true)}
        className="rounded-full h-14 w-14 bg-primary/90 text-primary-foreground hover:bg-primary hover:text-primary-foreground shadow-xl"
        size="icon"
      >
        <Terminal className="h-6 w-6" />
      </Button>
    </div>
  )
} 