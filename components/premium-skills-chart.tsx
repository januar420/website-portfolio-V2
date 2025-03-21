"use client"

import { useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from "recharts"
import { Button } from "@/components/ui/button"
import { BarChart3, LineChartIcon, PieChart } from "lucide-react"
import { useLanguage } from "./language-provider"

// Tambahkan kunci terjemahan untuk tombol chart
type ButtonKeys = {
  [key: string]: string;
}

const buttonTextKeys: ButtonKeys = {
  "radar": "skills.chart.radarView",
  "bar": "skills.chart.barView",
  "progress": "skills.chart.progressView"
};

// Nama-nama skill yang dapat diterjemahkan
const skillsData = [
  {
    subject: "Linux Admin",
    subjectKey: "skills.linux",
    A: 75,
    fullMark: 100,
    description: "Installation, configuration, and management of Linux systems",
    descriptionKey: "skills.linux.description",
  },
  {
    subject: "System Security",
    subjectKey: "skills.security",
    A: 65,
    fullMark: 100,
    description: "Implementation of security measures and protocols",
    descriptionKey: "skills.security.description",
  },
  { 
    subject: "Virtualization", 
    subjectKey: "skills.virtualization",
    A: 80, 
    fullMark: 100, 
    description: "Setup and management of virtual environments",
    descriptionKey: "skills.virtualization.description",
  },
  { 
    subject: "Shell Scripting", 
    subjectKey: "skills.scripting",
    A: 70, 
    fullMark: 100, 
    description: "Automation of tasks through shell scripts",
    descriptionKey: "skills.scripting.description",
  },
  { 
    subject: "Documentation", 
    subjectKey: "skills.documentation",
    A: 90, 
    fullMark: 100, 
    description: "Creation of comprehensive technical documentation",
    descriptionKey: "skills.documentation.description",
  },
  { 
    subject: "Problem Solving", 
    subjectKey: "skills.problemSolving",
    A: 85, 
    fullMark: 100, 
    description: "Analytical approach to technical challenges",
    descriptionKey: "skills.problemSolving.description",
  },
]

const progressData = [
  { year: "2019", skill: 40, knowledge: 35, experience: 20 },
  { year: "2020", skill: 50, knowledge: 45, experience: 30 },
  { year: "2021", skill: 60, knowledge: 55, experience: 45 },
  { year: "2022", skill: 70, knowledge: 65, experience: 60 },
  { year: "2023", skill: 80, knowledge: 75, experience: 70 },
]

const categoryData = [
  { name: "System Administration", value: 80 },
  { name: "Security Implementation", value: 65 },
  { name: "Virtualization", value: 80 },
  { name: "Documentation", value: 90 },
  { name: "Automation", value: 70 },
  { name: "Problem Solving", value: 85 },
]

export default function PremiumSkillsChart() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const [chartType, setChartType] = useState("radar")
  const { t } = useLanguage()

  return (
    <section className="py-20 bg-background/50" ref={ref}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground"
          >
            {t("skills.title")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-foreground/70 max-w-2xl mx-auto"
          >
            {t("skills.subtitle")}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary-foreground/10 rounded-xl blur-xl"></div>
          <div className="relative bg-card/30 backdrop-blur-md border border-card/20 p-8 rounded-xl">
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center rounded-full border border-input p-1 bg-background/50">
                <Button
                  variant={chartType === "radar" ? "default" : "ghost"}
                  size="sm"
                  className={`rounded-full ${chartType === "radar" ? "bg-primary text-primary-foreground" : ""}`}
                  onClick={() => setChartType("radar")}
                >
                  <PieChart className="h-4 w-4 mr-2" />
                  {t(buttonTextKeys.radar)}
                </Button>
                <Button
                  variant={chartType === "bar" ? "default" : "ghost"}
                  size="sm"
                  className={`rounded-full ${chartType === "bar" ? "bg-primary text-primary-foreground" : ""}`}
                  onClick={() => setChartType("bar")}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  {t(buttonTextKeys.bar)}
                </Button>
                <Button
                  variant={chartType === "progress" ? "default" : "ghost"}
                  size="sm"
                  className={`rounded-full ${chartType === "progress" ? "bg-primary text-primary-foreground" : ""}`}
                  onClick={() => setChartType("progress")}
                >
                  <LineChartIcon className="h-4 w-4 mr-2" />
                  {t(buttonTextKeys.progress)}
                </Button>
              </div>
            </div>

            <div className="h-[400px] w-full">
              {chartType === "radar" && (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillsData}>
                    <PolarGrid stroke="rgba(var(--foreground-rgb), 0.2)" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: "rgba(var(--foreground-rgb), 0.8)", fontSize: 12 }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                    <Radar
                      name="Skill Level"
                      dataKey="A"
                      stroke="rgba(var(--primary-rgb), 0.8)"
                      fill="rgba(var(--primary-rgb), 0.3)"
                      fillOpacity={0.6}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(var(--background-rgb), 0.8)",
                        borderColor: "rgba(var(--primary-rgb), 0.3)",
                        borderRadius: "0.5rem",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      }}
                      formatter={(value, name) => [`${value}%`, "Proficiency"]}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              )}

              {chartType === "bar" && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--foreground-rgb), 0.1)" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "rgba(var(--foreground-rgb), 0.8)", fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      tick={{ fill: "rgba(var(--foreground-rgb), 0.8)", fontSize: 12 }}
                      domain={[0, 100]}
                      label={{
                        value: "Proficiency (%)",
                        angle: -90,
                        position: "insideLeft",
                        style: { textAnchor: "middle", fill: "rgba(var(--foreground-rgb), 0.8)" },
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(var(--background-rgb), 0.8)",
                        borderColor: "rgba(var(--primary-rgb), 0.3)",
                        borderRadius: "0.5rem",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      }}
                      formatter={(value) => [`${value}%`, "Proficiency"]}
                    />
                    <Bar
                      dataKey="value"
                      fill="rgba(var(--primary-rgb), 0.7)"
                      radius={[4, 4, 0, 0]}
                      animationDuration={1500}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}

              {chartType === "progress" && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--foreground-rgb), 0.1)" />
                    <XAxis dataKey="year" tick={{ fill: "rgba(var(--foreground-rgb), 0.8)", fontSize: 12 }} />
                    <YAxis
                      tick={{ fill: "rgba(var(--foreground-rgb), 0.8)", fontSize: 12 }}
                      domain={[0, 100]}
                      label={{
                        value: "Growth (%)",
                        angle: -90,
                        position: "insideLeft",
                        style: { textAnchor: "middle", fill: "rgba(var(--foreground-rgb), 0.8)" },
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(var(--background-rgb), 0.8)",
                        borderColor: "rgba(var(--primary-rgb), 0.3)",
                        borderRadius: "0.5rem",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      }}
                      formatter={(value) => [`${value}%`, ""]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="skill"
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      animationDuration={1500}
                    />
                    <Line
                      type="monotone"
                      dataKey="knowledge"
                      stroke="#82ca9d"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      animationDuration={1500}
                      animationBegin={300}
                    />
                    <Line
                      type="monotone"
                      dataKey="experience"
                      stroke="#ffc658"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      animationDuration={1500}
                      animationBegin={600}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
              {skillsData.map((skill, index) => (
                <div key={index} className="flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="text-sm font-medium">{t(skill.subjectKey) || skill.subject}</span>
                      <div className="group relative ml-1">
                        <div className="cursor-help w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary">
                          ?
                        </div>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-background/90 backdrop-blur-sm border border-primary/20 rounded shadow-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                          {t(skill.descriptionKey) || skill.description}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{skill.A}%</span>
                  </div>
                  <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-primary-foreground"
                      initial={{ width: 0 }}
                      animate={isInView ? { width: `${skill.A}%` } : {}}
                      transition={{ duration: 1, delay: 0.2 + 0.1 * index }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-primary/5 border border-primary/10 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">{t("skills.development.title") || "Professional Development"}</h3>
              <p className="text-foreground/70">
                {t("skills.development.description") || "Continuous learning and skill enhancement through specialized training, practical experience, and industry certifications. Committed to staying current with emerging technologies and best practices in IT and cybersecurity."}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

