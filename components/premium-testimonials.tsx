"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Quote, ChevronLeft, ChevronRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

const testimonials = [
  {
    id: 1,
    name: "Alexander Mitchell",
    position: "CTO, TechVision Inc.",
    image: "/placeholder.svg?height=100&width=100",
    content:
      "Januar's expertise in Linux administration and system security has been invaluable to our organization. His attention to detail and proactive approach to problem-solving sets him apart from other professionals in the field.",
    rating: 5,
  },
  {
    id: 2,
    name: "Sophia Reynolds",
    position: "Director of Operations, DataSecure",
    image: "/placeholder.svg?height=100&width=100",
    content:
      "Working with Januar has been a game-changer for our IT infrastructure. His deep knowledge of virtualization and system administration helped us optimize our operations and enhance our security protocols.",
    rating: 5,
  },
  {
    id: 3,
    name: "Marcus Chen",
    position: "Project Manager, InnovateTech",
    image: "/placeholder.svg?height=100&width=100",
    content:
      "Januar's ability to quickly adapt to new technologies and his commitment to continuous learning make him an exceptional IT professional. His contributions to our projects have consistently exceeded expectations.",
    rating: 5,
  },
]

export default function PremiumTestimonials() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [autoplay, setAutoplay] = useState(true)

  useEffect(() => {
    if (!autoplay) return

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [autoplay])

  const nextTestimonial = () => {
    setAutoplay(false)
    setActiveIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setAutoplay(false)
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section className="py-20 bg-background/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground">
            Client Testimonials
          </h2>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
            What industry professionals say about my work and expertise
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="absolute -top-10 -left-10 text-primary/10">
            <Quote className="h-20 w-20" />
          </div>

          <div className="absolute -bottom-10 -right-10 text-primary/10 transform rotate-180">
            <Quote className="h-20 w-20" />
          </div>

          <div className="relative bg-card/30 backdrop-blur-md border border-card/20 p-8 md:p-12 rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary-foreground/5 z-0"></div>

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
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20 mb-4">
                      <Image
                        src={testimonials[activeIndex].image || "/placeholder.svg"}
                        alt={testimonials[activeIndex].name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <h3 className="text-xl font-bold text-center">{testimonials[activeIndex].name}</h3>
                    <p className="text-sm text-foreground/70 text-center mb-2">{testimonials[activeIndex].position}</p>

                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < testimonials[activeIndex].rating
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-foreground/20"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="md:w-2/3">
                    <p className="text-lg italic leading-relaxed">"{testimonials[activeIndex].content}"</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeIndex === index ? "w-8 bg-primary" : "w-2 bg-primary/30"
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
              className="bg-background/50 backdrop-blur-md rounded-full h-12 w-12 pointer-events-auto"
              onClick={prevTestimonial}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="bg-background/50 backdrop-blur-md rounded-full h-12 w-12 pointer-events-auto"
              onClick={nextTestimonial}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

