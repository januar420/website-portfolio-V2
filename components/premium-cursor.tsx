"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"

export default function PremiumCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [cursorVariant, setCursorVariant] = useState("default")
  const [isVisible, setIsVisible] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    const mouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      })
    }

    window.addEventListener("mousemove", mouseMove)
    setIsVisible(true)

    return () => {
      window.removeEventListener("mousemove", mouseMove)
    }
  }, [])

  const handleMouseEnter = () => {
    setIsVisible(true)
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

  useEffect(() => {
    document.documentElement.classList.add("use-custom-cursor")

    // Track mouse enter/leave events on the document
    document.addEventListener("mouseenter", handleMouseEnter)
    document.addEventListener("mouseleave", handleMouseLeave)

    // Add event listeners to all links
    const links = document.querySelectorAll("a, button, [role='button']")
    links.forEach((link) => {
      link.addEventListener("mouseenter", handleLinkHover)
      link.addEventListener("mouseleave", handleLinkLeave)
    })

    // Add event listeners to buttons with specific cursor class
    const buttons = document.querySelectorAll(".cursor-button")
    buttons.forEach((button) => {
      button.addEventListener("mouseenter", handleButtonHover)
      button.addEventListener("mouseleave", handleButtonLeave)
    })

    return () => {
      document.documentElement.classList.remove("use-custom-cursor")
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
  }, [])

  // Definisikan variants dengan tipe yang tepat
  const variants = {
    default: {
      x: mousePosition.x - 16,
      y: mousePosition.y - 16,
      height: 32,
      width: 32,
      backgroundColor: "transparent",
      borderColor: "rgba(var(--primary-rgb), 0.4)",
      mixBlendMode: "difference" as const,
    },
    link: {
      x: mousePosition.x - 24,
      y: mousePosition.y - 24,
      height: 48,
      width: 48,
      backgroundColor: "rgba(var(--primary-rgb), 0.1)",
      borderColor: "rgba(var(--primary-rgb), 0.4)",
      mixBlendMode: "difference" as const,
    },
    button: {
      x: mousePosition.x - 32,
      y: mousePosition.y - 32,
      height: 64,
      width: 64,
      backgroundColor: "rgba(var(--primary-rgb), 0.05)",
      borderColor: "rgba(var(--primary-rgb), 0.2)",
      mixBlendMode: "difference" as const,
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

