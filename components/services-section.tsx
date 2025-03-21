"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Code, Layers, Smartphone, Globe, Zap, Shield } from "lucide-react"
import { useLanguage } from "./language-provider"

const services = [
  /**
  {
    icon: Code,
    title: "Web Development",
    description: "Custom websites built with cutting-edge technologies for optimal performance.",
  },
  */
  {
    icon: Layers,
    titleKey: "services.uiux.title",
    descriptionKey: "services.uiux.description",
  },
  /**
  {
    icon: Smartphone,
    title: "Mobile Apps",
    description: "Native and cross-platform mobile applications for iOS and Android.",
  },
  */
  {
    icon: Globe,
    titleKey: "services.digitalMarketing.title",
    descriptionKey: "services.digitalMarketing.description",
  },
  {
    icon: Zap,
    titleKey: "services.performance.title",
    descriptionKey: "services.performance.description",
  },
  {
    icon: Shield,
    titleKey: "services.security.title",
    descriptionKey: "services.security.description",
  },
]

export default function ServicesSection() {
  const { t } = useLanguage()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section id="services" className="py-20 bg-background/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground"
          >
            {t("services.title")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-foreground/70 max-w-2xl mx-auto"
          >
            {t("services.subtitle")}
          </motion.p>
        </div>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary-foreground/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-card/30 backdrop-blur-md border border-card/20 p-8 rounded-xl h-full transform transition-all duration-300 group-hover:translate-y-[-5px] group-hover:shadow-xl">
                <div className="mb-4 p-3 bg-primary/10 rounded-lg inline-block">
                  <service.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{t(service.titleKey)}</h3>
                <p className="text-foreground/70">{t(service.descriptionKey)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

