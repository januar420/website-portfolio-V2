"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export default function PremiumScrollIndicator() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = window.scrollY / totalHeight
      setScrollProgress(progress)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50 hidden lg:block">
      <div className="h-40 w-1 bg-foreground/10 rounded-full relative">
        <motion.div
          className="absolute top-0 w-1 bg-gradient-to-b from-primary to-primary-foreground rounded-full"
          style={{ height: `${scrollProgress * 100}%` }}
        />
      </div>

      <div className="mt-4 w-8 h-8 rounded-full border border-foreground/20 flex items-center justify-center">
        <motion.div
          className="text-xs font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
        >
          {Math.round(scrollProgress * 100)}%
        </motion.div>
      </div>
    </div>
  )
}

