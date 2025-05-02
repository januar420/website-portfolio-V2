"use client"

import { useEffect, useState } from "react"
import { motion, useScroll, useSpring } from "framer-motion"

export default function ScrollIndicator() {
  const [isScrolled, setIsScrolled] = useState(false)
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY
      if (offset > 200) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      {/* Progress bar di bagian atas layar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-50"
        style={{ scaleX, transformOrigin: "0%" }}
      />
      
      {/* Indikator posisi scroll dengan animasi fade in */}
      <motion.div 
        className="fixed bottom-6 right-6 bg-background/80 backdrop-blur-sm border border-border rounded-full p-2 z-50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: isScrolled ? 1 : 0,
          y: isScrolled ? 0 : 20
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-xs font-mono flex items-center justify-center gap-2">
          <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center">
            <motion.div style={{ rotate: scrollYProgress.get() * 360 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </motion.div>
          </div>
          <motion.span className="hidden sm:block">
            {Math.round(scrollYProgress.get() * 100)}%
          </motion.span>
        </div>
      </motion.div>
    </>
  )
} 