"use client"

import { useRef, useState, useEffect } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import { Award, Zap, TrendingUp, Target, ChevronDown, ChevronUp, CheckCircle, Clock, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useLanguage } from "@/components/language-provider"
import { Language } from "@/types/translations"
import { cn } from "@/lib/utils"

// Data achievements dengan dukungan multi-bahasa (key internasionalisasi)
const achievements = [
  {
    icon: Award,
    titleKey: "achievements.excellence.title",
    defaultTitle: "Excellence in IT",
    valueKey: "achievements.excellence.value",
    defaultValue: "5+",
    descriptionKey: "achievements.excellence.description",
    defaultDescription: "Years of continuous learning and professional development",
    color: "from-blue-500 to-purple-500",
    detailsKeys: [
      "achievements.excellence.detail1",
      "achievements.excellence.detail2",
      "achievements.excellence.detail3",
      "achievements.excellence.detail4"
    ],
    defaultDetails: [
      "Self-directed learning in Linux administration and system security",
      "Completion of specialized online courses and workshops",
      "Practical application of knowledge in professional settings",
      "Consistent skill enhancement through hands-on projects",
    ],
    progress: 85,
  },
  {
    icon: Zap,
    titleKey: "achievements.optimization.title",
    defaultTitle: "System Optimization",
    valueKey: "achievements.optimization.value",
    defaultValue: "100%",
    descriptionKey: "achievements.optimization.description",
    defaultDescription: "Success rate in system administration and security implementation",
    color: "from-amber-500 to-red-500",
    detailsKeys: [
      "achievements.optimization.detail1",
      "achievements.optimization.detail2",
      "achievements.optimization.detail3",
      "achievements.optimization.detail4"
    ],
    defaultDetails: [
      "Successful implementation of security protocols and measures",
      "Optimization of system performance and resource utilization",
      "Effective troubleshooting and problem resolution",
      "Proactive maintenance and system monitoring",
    ],
    progress: 100,
  },
  {
    icon: TrendingUp,
    titleKey: "achievements.efficiency.title",
    defaultTitle: "Process Efficiency",
    valueKey: "achievements.efficiency.value",
    defaultValue: "30%",
    descriptionKey: "achievements.efficiency.description",
    defaultDescription: "Average improvement in operational efficiency for clients",
    color: "from-green-500 to-emerald-500",
    detailsKeys: [
      "achievements.efficiency.detail1",
      "achievements.efficiency.detail2",
      "achievements.efficiency.detail3",
      "achievements.efficiency.detail4"
    ],
    defaultDetails: [
      "Streamlining of workflows and operational processes",
      "Implementation of automation for routine tasks",
      "Reduction in system downtime and performance issues",
      "Enhanced productivity through optimized IT infrastructure",
    ],
    progress: 75,
  },
  {
    icon: Target,
    titleKey: "achievements.delivery.title",
    defaultTitle: "Project Delivery",
    valueKey: "achievements.delivery.value",
    defaultValue: "100%",
    descriptionKey: "achievements.delivery.description",
    defaultDescription: "On-time completion rate for all assigned projects",
    color: "from-indigo-500 to-blue-500",
    detailsKeys: [
      "achievements.delivery.detail1",
      "achievements.delivery.detail2",
      "achievements.delivery.detail3",
      "achievements.delivery.detail4"
    ],
    defaultDetails: [
      "Consistent adherence to project timelines and deadlines",
      "Effective project planning and resource allocation",
      "Clear communication and stakeholder management",
      "Quality assurance and thorough testing before delivery",
    ],
    progress: 100,
  },
]

// Data untuk bagian Continuous Professional Growth dengan dukungan multi-bahasa
const continuousGrowthContent = {
  titleKey: "growth.title",
  defaultTitle: "Continuous Professional Growth",
  descriptionKey: "growth.description",
  defaultDescription: "My commitment to excellence is reflected in a consistent track record of achievement and growth. Through dedicated self-learning, practical application, and a passion for technology, I've developed a comprehensive skill set that enables me to deliver exceptional results.",
  updatedDateKey: "growth.lastUpdated",
  defaultUpdatedDate: "Last updated: March 2024",
  rateKey: "growth.successRate",
  defaultRate: "Success Rate",
  rateValueKey: "growth.rateValue",
  defaultRateValue: "90%",
  languageSpecificContent: {
    id: {
      quickNotes: [
        "Meningkatkan kemampuan dalam administrasi Linux",
        "Mengoptimalkan keamanan jaringan untuk infrastruktur IT",
        "Mempelajari metodologi baru dalam penanganan insiden keamanan"
      ]
    },
    en: {
      quickNotes: [
        "Enhanced capabilities in Linux administration",
        "Optimized network security for IT infrastructure",
        "Learned new methodologies in security incident handling"
      ]
    },
    es: {
      quickNotes: [
        "Capacidades mejoradas en administración de Linux",
        "Seguridad de red optimizada para infraestructura de TI",
        "Aprendizaje de nuevas metodologías en manejo de incidentes de seguridad"
      ]
    },
    fr: {
      quickNotes: [
        "Capacités améliorées en administration Linux",
        "Sécurité réseau optimisée pour l'infrastructure informatique",
        "Apprentissage de nouvelles méthodologies de gestion des incidents de sécurité"
      ]
    },
    de: { quickNotes: [] },
    zh: { quickNotes: [] },
    ja: { quickNotes: [] },
    ko: { quickNotes: [] },
    ar: { quickNotes: [] }
  }
}

export default function PremiumAchievements() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const { t, language } = useLanguage()
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  // State untuk partikel
  const [particles, setParticles] = useState<{ top: string, left: string }[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Tandai bahwa kita sekarang di client
    setIsClient(true)
    
    // Buat array dengan posisi partikel acak
    const newParticles = Array(5).fill(null).map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
    }))
    
    setParticles(newParticles)
  }, []) // Effect ini hanya dijalankan sekali setelah mount

  const toggleCard = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  // Mendapatkan catatan cepat spesifik untuk bahasa yang dipilih
  const getLanguageSpecificNotes = () => {
    const defaultLanguage = 'en' as Language;
    const supportedLanguages = Object.keys(continuousGrowthContent.languageSpecificContent) as Language[];
    
    // Periksa apakah bahasa saat ini didukung
    const isLanguageSupported = supportedLanguages.includes(language);
    
    // Coba dapatkan catatan untuk bahasa saat ini, atau gunakan bahasa default jika tidak tersedia
    return isLanguageSupported 
      ? continuousGrowthContent.languageSpecificContent[language]?.quickNotes 
      : continuousGrowthContent.languageSpecificContent[defaultLanguage].quickNotes;
  }

  return (
    <section className="py-20 bg-background" ref={ref}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground"
          >
            {t("achievements.title") || "Professional Achievements"}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-foreground/70 max-w-2xl mx-auto"
          >
            {t("achievements.subtitle") || "Measurable results and milestones from my professional journey"}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {achievements.map((achievement, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary-foreground/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-card/30 backdrop-blur-md border border-card/20 p-8 rounded-xl h-full transform transition-all duration-300 group-hover:translate-y-[-5px] group-hover:shadow-xl">
                <div className="mb-6">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${achievement.color} flex items-center justify-center`}
                  >
                    <achievement.icon className="h-8 w-8 text-white" />
                  </div>
                </div>

                <h3 className="text-xl font-semibold mb-2">
                  {t(achievement.titleKey) || achievement.defaultTitle}
                </h3>

                <div className="flex items-baseline mb-4">
                  <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground">
                    {t(achievement.valueKey) || achievement.defaultValue}
                  </span>
                </div>

                <p className="text-foreground/70 mb-4">
                  {t(achievement.descriptionKey) || achievement.defaultDescription}
                </p>

                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span>{t("achievements.progress") || "Progress"}</span>
                    <span>{achievement.progress}%</span>
                  </div>
                  <Progress value={achievement.progress} className="h-2" />
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full flex items-center justify-center text-primary hover:text-primary hover:bg-primary/5"
                  onClick={() => toggleCard(index)}
                >
                  {expandedIndex === index ? (
                    <>
                      <span>{t("achievements.lessDetails") || "Less Details"}</span>
                      <ChevronUp className="ml-1 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <span>{t("achievements.moreDetails") || "More Details"}</span>
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </>
                  )}
                </Button>

                <AnimatePresence>
                  {expandedIndex === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 border-t border-[hsl(var(--border)_/_0.3)] mt-4">
                        <h4 className="text-sm uppercase tracking-wider text-foreground/60 mb-2 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-primary" />
                          {t("achievements.keyHighlights") || "Key Highlights"}
                        </h4>
                        <ul className="space-y-2">
                          {achievement.detailsKeys.map((detailKey, idx) => (
                            <li key={idx} className="text-foreground/80 text-sm flex items-start">
                              <div className="p-1 bg-primary/10 rounded-full mr-2 mt-0.5">
                                <div className="w-1 h-1 bg-primary rounded-full"></div>
                              </div>
                              {t(detailKey) || achievement.defaultDetails[idx]}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary-foreground/10 rounded-xl blur-xl"></div>
          <div className="relative bg-card/30 backdrop-blur-md border border-card/20 p-8 rounded-xl">
            <div className="flex items-center mb-6">
              <motion.h3 
                className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground"
                animate={{ opacity: 1 }}
              >
                {t(continuousGrowthContent.titleKey) || continuousGrowthContent.defaultTitle}
              </motion.h3>
            </div>
            
            <div className="flex flex-col md:flex-row items-start justify-between gap-8">
              <div className="md:w-2/3">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={language}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-foreground/70 mb-6 leading-relaxed">
                      {t(continuousGrowthContent.descriptionKey) || continuousGrowthContent.defaultDescription}
                    </p>
                    
                    {/* Quick notes specific to selected language */}
                    <div className="mt-6 p-5 bg-primary/5 rounded-lg border border-primary/10 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      <h4 className="font-medium mb-3 text-primary/90 flex items-center">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                          <Check className="h-3.5 w-3.5 text-primary" />
                        </div>
                        {t("growth.quickNotes") || "Professional Focus Areas"}
                      </h4>
                      
                      <ul className="space-y-2.5">
                        {getLanguageSpecificNotes()?.map((note: string, idx: number) => (
                          <motion.li 
                            key={idx} 
                            className="flex items-start text-sm"
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 * idx }}
                          >
                            <div className="p-1 bg-primary/10 rounded-full mr-2.5 mt-0.5 flex-shrink-0 transform transition-transform duration-300 group-hover:scale-110">
                              <Check className="h-3 w-3 text-primary" />
                            </div>
                            <span className="text-foreground/80">{note}</span>
                          </motion.li>
                        ))}
                      </ul>
                      
                      <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-gradient-to-br from-primary/5 to-primary-foreground/10 rounded-full blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-500"></div>
                    </div>
                    
                    <div className="flex items-center text-foreground/60 text-sm mt-4">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{t(continuousGrowthContent.updatedDateKey) || continuousGrowthContent.defaultUpdatedDate}</span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="md:w-1/3 flex justify-center">
                <motion.div 
                  className="relative w-40 h-40"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-primary-foreground/20 animate-pulse"></div>
                  {/* Lingkaran dekoratif animasi */}
                  <div className="absolute -inset-3 rounded-full border border-primary/10 z-0 opacity-50"></div>
                  <div className="absolute -inset-6 rounded-full border border-primary/5 z-0 opacity-30"></div>
                  
                  <motion.div 
                    className="absolute inset-2 rounded-full bg-background flex items-center justify-center overflow-hidden"
                    animate={{ boxShadow: ["0 0 0 rgba(0,0,0,0)", "0 0 10px rgba(var(--primary),0.3)", "0 0 0 rgba(0,0,0,0)"] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <div className="text-center">
                      <div className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground">
                        {t(continuousGrowthContent.rateValueKey) || continuousGrowthContent.defaultRateValue}
                      </div>
                      <div className="text-sm text-foreground/70 mt-1">
                        {t(continuousGrowthContent.rateKey) || continuousGrowthContent.defaultRate}
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Particle effects */}
                  <div className="absolute inset-0 overflow-visible">
                    {isClient && particles.map((particle, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1.5 h-1.5 bg-primary/50 rounded-full"
                        style={{
                          top: particle.top,
                          left: particle.left,
                        }}
                        animate={{
                          y: [0, -20, 0],
                          opacity: [0, 0.8, 0],
                          scale: [0, 1, 0]
                        }}
                        transition={{
                          duration: 2 + Math.random() * 2,
                          repeat: Infinity,
                          delay: Math.random() * 2,
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

