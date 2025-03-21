"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { AnimatePresence, motion } from "framer-motion"
import { Menu, X, Sun, Moon, Globe, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "./language-provider"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import Logo from "./logo"

// In the navItems array, ensure the contact link has the correct href
const navItems = [
  { key: "nav.home", href: "/" },
  { key: "nav.services", href: "/#services" },
  { key: "nav.portfolio", href: "/#portfolio" },
  { key: "nav.certifications", href: "/#certifications" },
  { key: "nav.resume", href: "/resume" },
  { key: "nav.contact", href: "/#contact" },
]

// Menambahkan item development yang hanya muncul saat mode development
const devItems: Array<{ name: string; href: string }> = [
  // { name: "🧪 EmailJS Test", href: "/test-emailjs" } // Dinonaktifkan
]

export default function Navbar() {
  const [scrollY, setScrollY] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, mounted: languageMounted, t, getAllLanguages, changeLanguage } = useLanguage()
  const [mounted, setMounted] = useState(false)
  const [isDevelopment, setIsDevelopment] = useState(false)

  // Setelah hydration, kita set mounted menjadi true
  useEffect(() => {
    setMounted(true)
    // Cek apakah dalam mode development (localhost)
    setIsDevelopment(
      typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || 
       window.location.hostname === '127.0.0.1')
    )
  }, [])

  useEffect(() => {
    // Store the current scroll position
    let lastScrollY = window.scrollY

    const handleScroll = () => {
      // Only update state if the scroll position has changed significantly
      if (Math.abs(window.scrollY - lastScrollY) > 10) {
        lastScrollY = window.scrollY
        setScrollY(lastScrollY)
      }
    }

    // Add the event listener with passive option for better performance
    window.addEventListener("scroll", handleScroll, { passive: true })

    // Call once to initialize
    handleScroll()

    // Clean up
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, []) // Empty dependency array ensures this only runs once on mount

  // Add a scroll handler function after the useEffect hook that handles scrollY
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Only handle internal links that start with #
    if (href.startsWith("/#")) {
      e.preventDefault()

      // If we're not on the home page, navigate to home first
      if (window.location.pathname !== "/") {
        window.location.href = href
        return
      }

      // Extract the section ID from the href
      const sectionId = href.replace("/#", "")
      const section = document.getElementById(sectionId)

      if (section) {
        // Smooth scroll to the section
        section.scrollIntoView({ behavior: "smooth" })

        // Update URL without reloading the page
        window.history.pushState({}, "", href)
      }
    }
  }

  const opacity = Math.min(scrollY / 500, 0.8)
  const blur = Math.min(scrollY / 100, 10)

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: `rgba(var(--background-rgb), ${opacity})`,
          backdropFilter: `blur(${blur}px)`,
        }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Logo />

            <nav className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="relative group text-foreground/70 hover:text-foreground transition-colors"
                  onClick={(e) => scrollToSection(e, item.href)}
                >
                  {t(item.key)}
                  <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-primary to-primary-foreground group-hover:w-full transition-all duration-300" />
                </Link>
              ))}
              
              {/* Development menu items */}
              {isDevelopment && devItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-amber-500 hover:text-amber-400 transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Globe className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{t("language.selectLanguage")}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {getAllLanguages().map((lang) => (
                    <DropdownMenuItem 
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className="flex items-center justify-between"
                    >
                      <span>{lang.name}</span>
                      {languageMounted && language === lang.code && <Check className="h-4 w-4 ml-2" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => {
                  const newTheme = theme === "dark" ? "light" : "dark"
                  setTheme(newTheme)
                }}
              >
                {/* Hanya render ikon ketika komponen sudah mounted di client */}
                {mounted ? (
                  theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />
                ) : (
                  // Placeholder dengan ukuran sama selama server rendering
                  <div className="h-5 w-5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-full"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ ease: "easeInOut", duration: 0.3 }}
              className="fixed inset-y-0 right-0 w-full max-w-xs bg-card/50 backdrop-blur-xl border-l border-border/10 p-6 flex flex-col z-50"
            >
              <div className="flex items-center justify-between">
                <Logo />
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <nav className="flex flex-col space-y-6 mt-12">
                {navItems.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    className="text-lg font-medium text-foreground/70 hover:text-foreground transition-colors"
                    onClick={(e) => {
                      scrollToSection(e, item.href)
                      setMobileMenuOpen(false)
                    }}
                  >
                    {t(item.key)}
                  </Link>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

