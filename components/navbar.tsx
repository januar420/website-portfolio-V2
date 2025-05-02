"use client"

import type React from "react"

import { useState, useEffect, Fragment } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { AnimatePresence, motion } from "framer-motion"
import { 
  Menu, X, Sun, Moon, Globe, Check, ChevronDown,
  Languages, Map, ArrowLeft, ArrowRight, Smartphone, 
  ExternalLink
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "./language-provider"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Logo from "./logo"
import { CommandPalette } from "@/components/command-palette"

// Menambahkan informasi tambahan untuk bahasa, termasuk bendera dan regional info
const languageDetails: Record<string, { code: string, flag: string, region: string, direction: "ltr" | "rtl", nativeName: string }> = {
  en: { 
    code: "en", 
    flag: "🇺🇸", 
    region: "United States", 
    direction: "ltr",
    nativeName: "English" 
  },
  id: { 
    code: "id", 
    flag: "🇮🇩", 
    region: "Indonesia", 
    direction: "ltr",
    nativeName: "Bahasa Indonesia" 
  },
  es: { 
    code: "es", 
    flag: "🇪🇸", 
    region: "Spain", 
    direction: "ltr",
    nativeName: "Español" 
  },
  fr: { 
    code: "fr", 
    flag: "🇫🇷", 
    region: "France", 
    direction: "ltr",
    nativeName: "Français" 
  },
  de: { 
    code: "de", 
    flag: "🇩🇪", 
    region: "Germany", 
    direction: "ltr",
    nativeName: "Deutsch" 
  },
  zh: { 
    code: "zh", 
    flag: "🇨🇳", 
    region: "China", 
    direction: "ltr",
    nativeName: "中文" 
  },
  ja: { 
    code: "ja", 
    flag: "🇯🇵", 
    region: "Japan", 
    direction: "ltr",
    nativeName: "日本語" 
  },
  ko: { 
    code: "ko", 
    flag: "🇰🇷", 
    region: "Korea", 
    direction: "ltr",
    nativeName: "한국어" 
  },
  ar: { 
    code: "ar", 
    flag: "🇸🇦", 
    region: "Saudi Arabia", 
    direction: "rtl",
    nativeName: "العربية" 
  }
};

// Komponen LanguageSwitcher baru yang lebih modern
function LanguageSwitcher() {
  const { language, mounted: languageMounted, t, getAllLanguages, changeLanguage } = useLanguage()
  const { theme } = useTheme()
  const [showTooltip, setShowTooltip] = useState(false)
  
  // Dapatkan detail bahasa yang sedang aktif
  const currentLanguage = languageDetails[language] || languageDetails.en
  const availableLanguages = getAllLanguages()
  
  // Bagi bahasa ke dalam region
  const regions = {
    asia: availableLanguages.filter(lang => 
      ['id', 'zh', 'ja', 'ko'].includes(lang.code)
    ),
    europe: availableLanguages.filter(lang => 
      ['en', 'es', 'fr', 'de'].includes(lang.code)
    ),
    other: availableLanguages.filter(lang => 
      !['id', 'zh', 'ja', 'ko', 'en', 'es', 'fr', 'de'].includes(lang.code)
    )
  }
  
  // Efek hover animation
  const hoverAnimation = {
    scale: 1.05,
    transition: { type: "spring", stiffness: 400, damping: 17 }
  }
  
  return (
    <TooltipProvider>
      <Tooltip open={showTooltip} onOpenChange={setShowTooltip}>
        <DropdownMenu>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`rounded-full hover:bg-primary/10 transition-all duration-300 p-2 relative ${
                  theme === 'light' ? 'text-foreground hover:text-primary border border-transparent hover:border-primary/20' : ''
                }`}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(false)}
              >
                <div className="relative">
                  <Languages className="h-5 w-5 transition-transform duration-300 hover:rotate-12" />
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 flex items-center justify-center">
                    <span className="text-[10px] font-bold">{currentLanguage.flag}</span>
                  </div>
                </div>
                <span className="sr-only">Ganti Bahasa</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          
          <TooltipContent 
            side="bottom" 
            className="bg-background/90 backdrop-blur-md border border-border/30 px-3 py-2"
          >
            <div className="flex items-center text-xs">
              <Globe className="h-3 w-3 mr-1.5 text-primary" />
              <span>{currentLanguage.nativeName}</span>
              <Badge variant="outline" className="ml-2 text-[10px] px-1 py-0 h-4">
                {currentLanguage.flag}
              </Badge>
            </div>
          </TooltipContent>
          
          <DropdownMenuContent 
            align="end" 
            className="w-60 bg-background/95 backdrop-blur-lg border border-border/30 shadow-lg rounded-lg overflow-hidden animate-in fade-in-80 slide-in-from-top-5 dropdown-menu-content"
          >
            <DropdownMenuLabel className="flex items-center gap-2 text-sm font-medium text-foreground border-b border-border/10 pb-2">
              <Languages className="h-4 w-4 text-primary" />
              <span>{t("language.selectLanguage")}</span>
            </DropdownMenuLabel>
            
            <div className="p-2">
              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-1.5 font-medium px-2">
                  {languageMounted && currentLanguage ? t("nav.currently") || "Currently using" : "Language"}:
                </p>
                <div className="flex items-center gap-2 p-2 rounded-md bg-primary/10">
                  <span className="text-lg mr-1">{currentLanguage.flag}</span>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{currentLanguage.nativeName}</span>
                    <span className="text-xs text-muted-foreground">{currentLanguage.region}</span>
                  </div>
                  <Badge variant="outline" className="ml-auto text-xs border-primary/20 text-primary">
                    {currentLanguage.direction === "rtl" ? "RTL" : "LTR"}
                  </Badge>
                </div>
              </div>
              
              <DropdownMenuSeparator className="bg-border/20 my-1" />
              
              <DropdownMenuGroup>
                <p className="text-xs text-muted-foreground mb-1 font-medium px-2">
                  {t("nav.select_language") || "Select language"}:
                </p>
                
                {/* European Languages */}
                {regions.europe.length > 0 && (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="flex items-center">
                      <Map className="h-4 w-4 mr-2" />
                      <span className="text-sm">Europe & Americas</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent className="min-w-[180px] bg-background/95 backdrop-blur-lg dropdown-menu-content">
                        {regions.europe.map((lang) => {
                          const details = languageDetails[lang.code] || { flag: "🌐", region: "", nativeName: lang.name };
                          return (
                            <DropdownMenuItem 
                              key={lang.code}
                              onClick={() => changeLanguage(lang.code)}
                              className={`flex items-center justify-between py-1.5 text-sm transition-colors hover:text-primary group ${
                                languageMounted && language === lang.code 
                                  ? "bg-primary/10 text-primary font-medium" 
                                  : ""
                              }`}
                            >
                              <motion.div 
                                className="flex items-center gap-2"
                                whileHover={hoverAnimation}
                              >
                                <span className="text-base">{details.flag}</span>
                                <div className="flex flex-col">
                                  <span>{details.nativeName}</span>
                                  <span className="text-xs text-muted-foreground">{details.region}</span>
                                </div>
                              </motion.div>
                              {languageMounted && language === lang.code && (
                                <Check className="h-4 w-4 ml-2 text-primary" />
                              )}
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                )}
                
                {/* Asian Languages */}
                {regions.asia.length > 0 && (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="flex items-center">
                      <Map className="h-4 w-4 mr-2" />
                      <span className="text-sm">Asia & Pacific</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent className="min-w-[180px] bg-background/95 backdrop-blur-lg dropdown-menu-content">
                        {regions.asia.map((lang) => {
                          const details = languageDetails[lang.code] || { flag: "🌐", region: "", nativeName: lang.name };
                          return (
                            <DropdownMenuItem 
                              key={lang.code}
                              onClick={() => changeLanguage(lang.code)}
                              className={`flex items-center justify-between py-1.5 text-sm transition-colors hover:text-primary group ${
                                languageMounted && language === lang.code 
                                  ? "bg-primary/10 text-primary font-medium" 
                                  : ""
                              }`}
                            >
                              <motion.div 
                                className="flex items-center gap-2"
                                whileHover={hoverAnimation}
                              >
                                <span className="text-base">{details.flag}</span>
                                <div className="flex flex-col">
                                  <span>{details.nativeName}</span>
                                  <span className="text-xs text-muted-foreground">{details.region}</span>
                                </div>
                              </motion.div>
                              {languageMounted && language === lang.code && (
                                <Check className="h-4 w-4 ml-2 text-primary" />
                              )}
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                )}
                
                {/* Other Languages */}
                {regions.other.length > 0 && (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="flex items-center">
                      <Map className="h-4 w-4 mr-2" />
                      <span className="text-sm">Other Regions</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent className="min-w-[180px] bg-background/95 backdrop-blur-lg dropdown-menu-content">
                        {regions.other.map((lang) => {
                          const details = languageDetails[lang.code] || { flag: "🌐", region: "", nativeName: lang.name };
                          return (
                            <DropdownMenuItem 
                              key={lang.code}
                              onClick={() => changeLanguage(lang.code)}
                              className={`flex items-center justify-between py-1.5 text-sm transition-colors hover:text-primary group ${
                                languageMounted && language === lang.code 
                                  ? "bg-primary/10 text-primary font-medium" 
                                  : ""
                              }`}
                            >
                              <motion.div 
                                className="flex items-center gap-2"
                                whileHover={hoverAnimation}
                              >
                                <span className="text-base">{details.flag}</span>
                                <div className="flex flex-col">
                                  <span>{details.nativeName}</span>
                                  <span className="text-xs text-muted-foreground">{details.region}</span>
                                </div>
                              </motion.div>
                              {languageMounted && language === lang.code && (
                                <Check className="h-4 w-4 ml-2 text-primary" />
                              )}
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                )}
                
                {/* Show all languages in a simpler view for smaller screens */}
                <DropdownMenuSeparator className="bg-border/20 my-1" />
                <p className="text-xs text-muted-foreground mt-1 mb-1 font-medium px-2">
                  {t("nav.all_languages") || "All languages"}:
                </p>
                <div className="max-h-48 overflow-y-auto px-1 py-1 custom-scrollbar">
                  {availableLanguages.map((lang) => {
                    const details = languageDetails[lang.code] || { flag: "🌐", region: "", nativeName: lang.name };
                    return (
                      <DropdownMenuItem 
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={`flex items-center justify-between py-1.5 text-sm transition-colors hover:text-primary group ${
                          languageMounted && language === lang.code 
                            ? "bg-primary/10 text-primary font-medium" 
                            : ""
                        }`}
                      >
                        <motion.div 
                          className="flex items-center gap-2"
                          whileHover={hoverAnimation}
                        >
                          <span className="text-base">{details.flag}</span>
                          <span>{details.nativeName}</span>
                        </motion.div>
                        {languageMounted && language === lang.code && (
                          <Check className="h-4 w-4 ml-2 text-primary" />
                        )}
                      </DropdownMenuItem>
                    );
                  })}
                </div>
              </DropdownMenuGroup>
              
              <DropdownMenuSeparator className="bg-border/20 my-1" />
              
              <div className="px-2 py-1.5">
                <p className="text-xs text-muted-foreground mb-2 italic">
                  {t("nav.language_note") || "This site is translated by the community."}
                </p>
                <a 
                  href="https://github.com/januar420/portfolio-website" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs flex items-center text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  {t("nav.help_translate") || "Help translate this site"}
                </a>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </Tooltip>
    </TooltipProvider>
  )
}

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
  const [activeSection, setActiveSection] = useState<string>("")

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
      
      // Detect active section based on scroll position
      const sections = navItems
        .map(item => {
          const id = item.href.replace('/#', '')
          return id !== '/' ? document.getElementById(id) : null
        })
        .filter(Boolean)
        
      const currentSection = sections.reduce((closest, section) => {
        if (!section) return closest
        
        const sectionTop = section.offsetTop - 100
        const viewportDistance = Math.abs(sectionTop - window.scrollY)
        
        return (!closest || viewportDistance < closest.distance) 
          ? { id: section.id, distance: viewportDistance }
          : closest
      }, null as { id: string, distance: number } | null)
      
      if (currentSection) {
        setActiveSection(currentSection.id)
      } else if (window.scrollY < 100) {
        setActiveSection('home')
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
        
        // Update active section
        setActiveSection(sectionId)
      }
    }
  }

  // Compute opacity and blur with a smoother curve
  let opacity = 0;
  let blur = 0;
  
  // Hitung opacity dan blur hanya setelah komponen mounted
  if (mounted) {
    opacity = Math.min(Math.pow(scrollY / 500, 0.8), 0.85);
    blur = Math.min(scrollY / 80, 16);
  }

  // Animation variants for the navigation menu
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.1
      }
    }
  }
  
  const itemVariants = {
    hidden: { y: -10, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  return (
    <>
      <style jsx global>{`
        .dropdown-menu-content {
          ${theme === 'light' ? `
            --tw-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            --tw-shadow-colored: 0 4px 6px -1px var(--tw-shadow-color), 0 2px 4px -1px var(--tw-shadow-color);
            box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
            border-color: rgba(var(--border-rgb), 0.2);
          ` : ''}
        }
      `}</style>
      <header
        suppressHydrationWarning
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b"
        style={mounted ? {
          backgroundColor: theme === 'dark' 
            ? `rgba(var(--background-rgb), ${Math.max(opacity, 0.2)})` 
            : `rgba(var(--background-rgb), ${Math.max(opacity + 0.1, 0.85)})`,
          backdropFilter: `blur(${blur}px)`,
          borderColor: scrollY > 20 
            ? (theme === 'dark' 
                ? `rgba(var(--border-rgb), ${Math.min(opacity * 1.2, 0.1)})` 
                : `rgba(var(--border-rgb), 0.15)`)
            : 'transparent',
          boxShadow: scrollY > 50 
            ? (theme === 'dark'
                ? `0 4px 30px rgba(var(--foreground-rgb), ${Math.min(opacity * 0.04, 0.08)})`
                : `0 4px 15px rgba(0, 0, 0, 0.05)`)
            : 'none'
        } : {
          // Nilai default untuk server-side rendering
          backgroundColor: 'transparent',
          backdropFilter: 'none',
          borderColor: 'transparent',
          boxShadow: 'none'
        }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <Logo />
            </motion.div>

            <motion.nav 
              className="hidden md:flex items-center space-x-6"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              {navItems.map((item) => {
                const isActive = 
                  (item.href === "/" && activeSection === "home") || 
                  (item.href.replace("/#", "") === activeSection)
                
                return (
                  <motion.div key={item.key} variants={itemVariants}>
                    <Link
                      href={item.href}
                      className={`relative group py-1 text-base font-medium transition-colors ${
                        isActive 
                          ? "text-foreground" 
                          : "text-foreground/70 hover:text-foreground"
                      }`}
                      onClick={(e) => scrollToSection(e, item.href)}
                    >
                      <span className="relative z-10">{t(item.key)}</span>
                      
                      {/* Fancy gradient underline */}
                      <span 
                        className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-primary/80 via-primary to-primary-foreground/80 rounded-full transition-all duration-300 ${
                          isActive ? "w-full" : "w-0 group-hover:w-full"
                        }`} 
                      />
                      
                      {/* Subtle glow effect on hover */}
                      <span 
                        className="absolute inset-0 -z-10 scale-75 opacity-0 blur-md bg-primary/10 rounded-full transition-all duration-300 group-hover:opacity-100 group-hover:scale-100" 
                      />
                    </Link>
                  </motion.div>
                )
              })}
              
              {/* Development menu items */}
              {isDevelopment && devItems.map((item) => (
                <motion.div key={item.name} variants={itemVariants}>
                  <Link
                    href={item.href}
                    className="text-amber-500 hover:text-amber-400 transition-colors"
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
            </motion.nav>

            <motion.div 
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <CommandPalette />
              
              <LanguageSwitcher />

              <Button
                variant="ghost"
                size="icon"
                className={`rounded-full hover:bg-primary/10 transition-all duration-300 p-2 ${
                  theme === 'light' ? 'text-foreground hover:text-primary border border-transparent hover:border-primary/20' : ''
                }`}
                onClick={() => {
                  const newTheme = theme === "dark" ? "light" : "dark"
                  setTheme(newTheme)
                }}
              >
                {/* Hanya render ikon ketika komponen sudah mounted di client */}
                {mounted ? (
                  theme === "dark" ? (
                    <Sun className="h-5 w-5 transition-transform duration-300 hover:rotate-45" />
                  ) : (
                    <Moon className="h-5 w-5 transition-transform duration-300 hover:-rotate-12" />
                  )
                ) : (
                  // Placeholder dengan ukuran sama selama server rendering
                  <div className="h-5 w-5" />
                )}
                <span className="sr-only">Change Theme</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className={`md:hidden rounded-full transition-all duration-300 p-1 ${
                  theme === 'light' 
                    ? 'hover:bg-primary/10 text-foreground hover:text-primary border border-transparent hover:border-primary/20' 
                    : 'hover:bg-primary/10'
                }`}
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open Menu</span>
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mounted && mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`fixed inset-0 z-40 backdrop-blur-md ${
                theme === 'dark' ? 'bg-background/60' : 'bg-background/80'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`fixed inset-y-0 right-0 w-full max-w-xs backdrop-blur-xl border-l border-border/30 p-6 flex flex-col z-50 shadow-xl ${
                theme === 'dark' ? 'bg-background/95' : 'bg-background/98'
              }`}
            >
              <div className="flex items-center justify-between">
                <Logo />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`rounded-full transition-all duration-300 ${
                    theme === 'light' 
                      ? 'hover:bg-primary/10 text-foreground hover:text-primary border border-transparent hover:border-primary/20' 
                      : 'hover:bg-primary/10'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <motion.nav 
                className="flex flex-col space-y-4 mt-10"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                {navItems.map((item) => {
                  const isActive = 
                    (item.href === "/" && activeSection === "home") || 
                    (item.href.replace("/#", "") === activeSection)
                  
                  return (
                    <motion.div key={item.key} variants={itemVariants}>
                      <Link
                        href={item.href}
                        className={`group relative px-3 py-2.5 flex items-center text-lg font-medium rounded-lg transition-all duration-300 ${
                          isActive 
                            ? "text-primary bg-primary/10" 
                            : "text-foreground/70 hover:text-foreground hover:bg-primary/5"
                        }`}
                        onClick={(e) => {
                          scrollToSection(e, item.href)
                          setMobileMenuOpen(false)
                        }}
                      >
                        <span className="z-10">{t(item.key)}</span>
                        <span className={`absolute left-0 top-0 h-full w-1 bg-primary rounded-l-md transition-all duration-300 ${
                          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-50"
                        }`} />
                      </Link>
                    </motion.div>
                  )
                })}
              </motion.nav>
              
              <div className="mt-auto pt-6 border-t border-border/10">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-foreground/60">© 2024 Januar Galuh Prabakti</p>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full hover:bg-primary/10 h-8 w-8"
                      onClick={() => {
                        const newTheme = theme === "dark" ? "light" : "dark"
                        setTheme(newTheme)
                      }}
                    >
                      {mounted ? (
                        theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
                      ) : (
                        <div className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 h-8 w-8">
                          <Languages className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 dropdown-menu-content">
                        {getAllLanguages().map((lang) => (
                          <DropdownMenuItem 
                            key={lang.code}
                            onClick={() => changeLanguage(lang.code)}
                          >
                            <span>{lang.name}</span>
                            {languageMounted && language === lang.code && (
                              <Check className="h-4 w-4 ml-2" />
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

