"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function PremiumCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [cursorVariant, setCursorVariant] = useState("default")
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only enable custom cursor on desktop
    if (window.innerWidth < 768) return

    const mouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      })

      if (!isVisible) setIsVisible(true)
    }

    const handleMouseEnter = () => {
      setCursorVariant("default")
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
    }

    const handleLinkHover = () => {
      setCursorVariant("link")
    }

    const handleLinkLeave = () => {
      setCursorVariant("default")
    }

    const handleButtonHover = () => {
      setCursorVariant("button")
    }

    const handleButtonLeave = () => {
      setCursorVariant("default")
    }

    window.addEventListener("mousemove", mouseMove)
    document.addEventListener("mouseenter", handleMouseEnter)
    document.addEventListener("mouseleave", handleMouseLeave)

    // Add event listeners to all links and buttons
    const links = document.querySelectorAll("a, button, .cursor-link")
    links.forEach((link) => {
      link.addEventListener("mouseenter", handleLinkHover)
      link.addEventListener("mouseleave", handleLinkLeave)
    })

    const buttons = document.querySelectorAll(".btn-premium, .cursor-button")
    buttons.forEach((button) => {
      button.addEventListener("mouseenter", handleButtonHover)
      button.addEventListener("mouseleave", handleButtonLeave)
    })

    return () => {
      window.removeEventListener("mousemove", mouseMove)
      document.removeEventListener("mouseenter", handleMouseEnter)
      document.removeEventListener("mouseleave", handleMouseLeave)

      links.forEach((link) => {
        link.removeEventListener("mouseenter", handleLinkHover)
        link.removeEventListener("mouseleave", handleLinkLeave)
      })

      buttons.forEach((button) => {
        button.removeEventListener("mouseenter", handleButtonHover)
        button.removeEventListener("mouseleave", handleButtonLeave)
      })
    }
  }, [isVisible])

  const variants = {
    default: {
      x: mousePosition.x - 16,
      y: mousePosition.y - 16,
      height: 32,
      width: 32,
      backgroundColor: "rgba(var(--primary-rgb), 0.1)",
      borderColor: "rgba(var(--primary-rgb), 0.3)",
      mixBlendMode: "difference",
    },
    link: {
      x: mousePosition.x - 24,
      y: mousePosition.y - 24,
      height: 48,
      width: 48,
      backgroundColor: "rgba(var(--primary-rgb), 0.15)",
      borderColor: "rgba(var(--primary-rgb), 0.5)",
      mixBlendMode: "difference",
    },
    button: {
      x: mousePosition.x - 32,
      y: mousePosition.y - 32,
      height: 64,
      width: 64,
      backgroundColor: "rgba(var(--primary-rgb), 0.05)",
      borderColor: "rgba(var(--primary-rgb), 0.2)",
      mixBlendMode: "difference",
    },
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <motion.div
            className="fixed top-0 left-0 z-[100] rounded-full border pointer-events-none hidden md:block"
            variants={variants}
            animate={cursorVariant}
            transition={{ type: "spring", stiffness: 500, damping: 28, mass: 0.5 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="fixed top-0 left-0 z-[100] rounded-full bg-primary pointer-events-none hidden md:block"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              x: mousePosition.x - 4,
              y: mousePosition.y - 4,
            }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 1000, damping: 28, mass: 0.1 }}
            style={{ height: 8, width: 8 }}
          />
        </>
      )}
    </AnimatePresence>
  )
}

