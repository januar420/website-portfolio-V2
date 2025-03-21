"use client"

import { useRef, useState } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import { Award, Zap, TrendingUp, Target, ChevronDown, ChevronUp, CheckCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

const achievements = [
  {
    icon: Award,
    title: "Excellence in IT",
    value: "5+",
    description: "Years of continuous learning and professional development",
    color: "from-blue-500 to-purple-500",
    details: [
      "Self-directed learning in Linux administration and system security",
      "Completion of specialized online courses and workshops",
      "Practical application of knowledge in professional settings",
      "Consistent skill enhancement through hands-on projects",
    ],
    progress: 85,
  },
  {
    icon: Zap,
    title: "System Optimization",
    value: "100%",
    description: "Success rate in system administration and security implementation",
    color: "from-amber-500 to-red-500",
    details: [
      "Successful implementation of security protocols and measures",
      "Optimization of system performance and resource utilization",
      "Effective troubleshooting and problem resolution",
      "Proactive maintenance and system monitoring",
    ],
    progress: 100,
  },
  {
    icon: TrendingUp,
    title: "Process Efficiency",
    value: "30%",
    description: "Average improvement in operational efficiency for clients",
    color: "from-green-500 to-emerald-500",
    details: [
      "Streamlining of workflows and operational processes",
      "Implementation of automation for routine tasks",
      "Reduction in system downtime and performance issues",
      "Enhanced productivity through optimized IT infrastructure",
    ],
    progress: 75,
  },
  {
    icon: Target,
    title: "Project Delivery",
    value: "100%",
    description: "On-time completion rate for all assigned projects",
    color: "from-indigo-500 to-blue-500",
    details: [
      "Consistent adherence to project timelines and deadlines",
      "Effective project planning and resource allocation",
      "Clear communication and stakeholder management",
      "Quality assurance and thorough testing before delivery",
    ],
    progress: 100,
  },
]

export default function PremiumAchievements() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  const [expandedCard, setExpandedCard] = useState<number | null>(null)

  const toggleCard = (index: number) => {
    setExpandedCard(expandedCard === index ? null : index)
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
            Professional Achievements
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-foreground/70 max-w-2xl mx-auto"
          >
            Measurable results and milestones from my professional journey
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

                <h3 className="text-xl font-semibold mb-2">{achievement.title}</h3>

                <div className="flex items-baseline mb-4">
                  <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground">
                    {achievement.value}
                  </span>
                </div>

                <p className="text-foreground/70 mb-4">{achievement.description}</p>

                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Progress</span>
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
                  {expandedCard === index ? (
                    <>
                      <span>Less Details</span>
                      <ChevronUp className="ml-1 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <span>More Details</span>
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </>
                  )}
                </Button>

                <AnimatePresence>
                  {expandedCard === index && (
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
                          Key Highlights
                        </h4>
                        <ul className="space-y-2">
                          {achievement.details.map((detail, idx) => (
                            <li key={idx} className="text-foreground/80 text-sm flex items-start">
                              <div className="p-1 bg-primary/10 rounded-full mr-2 mt-0.5">
                                <div className="w-1 h-1 bg-primary rounded-full"></div>
                              </div>
                              {detail}
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
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="md:w-2/3">
                <h3 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground">
                  Continuous Professional Growth
                </h3>
                <p className="text-foreground/70 mb-6">
                  My commitment to excellence is reflected in a consistent track record of achievement and growth.
                  Through dedicated self-learning, practical application, and a passion for technology, I've developed a
                  comprehensive skill set that enables me to deliver exceptional results.
                </p>
                <div className="flex items-center text-foreground/60 text-sm">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Last updated: March 2025</span>
                </div>
              </div>

              <div className="md:w-1/3 flex justify-center">
                <div className="relative w-40 h-40">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-primary-foreground/20 animate-pulse"></div>
                  <div className="absolute inset-2 rounded-full bg-background flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground">
                        90%
                      </div>
                      <div className="text-sm text-foreground/70 mt-1">Success Rate</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

