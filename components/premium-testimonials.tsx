"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShieldCheck, ChevronLeft, ChevronRight, CheckCircle2, Scale, Users, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useLanguage } from "./language-provider"

const ProfessionalValues = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [autoplay, setAutoplay] = useState(true)
  const { t, language } = useLanguage()

  // Definisi nilai-nilai profesional dengan kunci terjemahan
  const professionalValues = [
    {
      id: 1,
      titleKey: "values.security.title",
      icon: "shield",
      image: "/placeholder.svg",
      contentKey: "values.security.content",
      keyPoints: [
        { key: "values.security.point1" },
        { key: "values.security.point2" },
        { key: "values.security.point3" }
      ]
    },
    {
      id: 2,
      titleKey: "values.scalability.title",
      icon: "scale",
      image: "/placeholder.svg",
      contentKey: "values.scalability.content",
      keyPoints: [
        { key: "values.scalability.point1" },
        { key: "values.scalability.point2" },
        { key: "values.scalability.point3" }
      ]
    },
    {
      id: 3,
      titleKey: "values.collaboration.title",
      icon: "users",
      image: "/placeholder.svg",
      contentKey: "values.collaboration.content",
      keyPoints: [
        { key: "values.collaboration.point1" },
        { key: "values.collaboration.point2" },
        { key: "values.collaboration.point3" }
      ]
    },
    {
      id: 4,
      titleKey: "values.innovation.title",
      icon: "lightbulb",
      image: "/placeholder.svg",
      contentKey: "values.innovation.content",
      keyPoints: [
        { key: "values.innovation.point1" },
        { key: "values.innovation.point2" },
        { key: "values.innovation.point3" }
      ]
    }
  ]

  // Mengatur interval untuk animasi otomatis
  useEffect(() => {
    if (!autoplay) return

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % professionalValues.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [autoplay, professionalValues.length])

  const nextValue = () => {
    setAutoplay(false)
    setActiveIndex((prev) => (prev + 1) % professionalValues.length)
  }

  const prevValue = () => {
    setAutoplay(false)
    setActiveIndex((prev) => (prev - 1 + professionalValues.length) % professionalValues.length)
  }

  // Helper function untuk menampilkan ikon yang sesuai
  const IconComponent = ({ icon }: { icon: string }) => {
    switch (icon) {
      case 'shield':
        return <ShieldCheck className="h-16 w-16 text-primary/70" />
      case 'scale':
        return <Scale className="h-16 w-16 text-primary/70" />
      case 'users':
        return <Users className="h-16 w-16 text-primary/70" />
      case 'lightbulb':
        return <Lightbulb className="h-16 w-16 text-primary/70" />
      default:
        return <ShieldCheck className="h-16 w-16 text-primary/70" />
    }
  }

  return (
    <section className="py-20 bg-background/50 relative overflow-hidden">
      {/* Background elements for glassmorphism effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 -left-32 w-64 h-64 rounded-full bg-primary/10 blur-3xl"></div>
        <div className="absolute top-40 right-20 w-80 h-80 rounded-full bg-primary/20 blur-[100px]"></div>
        <div className="absolute bottom-20 left-1/4 w-80 h-80 rounded-full bg-primary-foreground/10 blur-[80px]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground">
            {t("values.title")}
          </h2>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
            {t("values.subtitle")}
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="absolute -top-10 -left-10 text-primary/10">
            <ShieldCheck className="h-20 w-20" />
          </div>

          <div className="absolute -bottom-10 -right-10 text-primary/10 transform rotate-180">
            <ShieldCheck className="h-20 w-20" />
          </div>

          <div className="relative glassmorphism-3d rounded-xl p-8 md:p-12 overflow-hidden">
            {/* Gradient background overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary-foreground/5 z-0"></div>
            
            {/* Shimmering effect */}
            <div className="absolute inset-0 animate-subtle-pulse z-0"></div>

            <div className="relative z-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col md:flex-row items-center gap-8"
                >
                  <div className="md:w-1/3 flex flex-col items-center">
                    <div className="relative w-32 h-32 rounded-xl overflow-hidden mb-4 glassmorphism-dark animate-subtle-float">
                      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative z-10 transform transition-transform duration-500 hover:scale-110">
                          <div className="absolute -inset-3 bg-primary/5 rounded-full blur-md"></div>
                          <IconComponent icon={professionalValues[activeIndex].icon} />
                        </div>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-center mb-3">
                      {t(professionalValues[activeIndex].titleKey)}
                    </h3>
                    
                    <div className="mt-2 flex flex-col gap-2 w-full">
                      {professionalValues[activeIndex].keyPoints.map((point, idx) => (
                        <div key={idx} className="flex items-start gap-2 group">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0 group-hover:text-primary/100 transition-colors duration-300" />
                          <span className="text-sm text-foreground/80 group-hover:text-foreground/100 transition-colors duration-300">{t(point.key)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="md:w-2/3">
                    <p className="text-lg leading-relaxed mb-6">
                      {t(professionalValues[activeIndex].contentKey)}
                    </p>
                    
                    <div className="p-5 glassmorphism-card rounded-lg transition-all duration-300 hover:shadow-md">
                      <p className="text-sm text-foreground/70 italic">
                        "{t("values.commitment")}"
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex justify-center mt-8 space-x-2">
              {professionalValues.map((_, index) => (
                <button
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 hover:bg-primary/80 ${
                    activeIndex === index ? "w-8 bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]" : "w-2 bg-primary/30"
                  }`}
                  onClick={() => {
                    setAutoplay(false)
                    setActiveIndex(index)
                  }}
                />
              ))}
            </div>
          </div>

          <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2 flex justify-between pointer-events-none px-4">
            <Button
              variant="ghost"
              size="icon"
              className="glassmorphism rounded-full h-12 w-12 pointer-events-auto hover:bg-background/60 transition-all duration-300"
              onClick={prevValue}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="glassmorphism rounded-full h-12 w-12 pointer-events-auto hover:bg-background/60 transition-all duration-300"
              onClick={nextValue}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes subtle-pulse {
          0% { opacity: 0.5; }
          50% { opacity: 0.7; }
          100% { opacity: 0.5; }
        }
        .animate-subtle-pulse {
          animation: subtle-pulse 8s infinite;
        }
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(var(--primary-rgb), 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(var(--primary-rgb), 0.05) 1px, transparent 1px);
          background-size: 8px 8px;
        }
      `}</style>
    </section>
  )
}

export default ProfessionalValues

