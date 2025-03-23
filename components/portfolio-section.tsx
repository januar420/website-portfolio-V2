"use client"

import { useRef, useState, useEffect } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useLanguage } from "./language-provider"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ExternalLink, Filter, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Fungsi untuk memvalidasi URL gambar
const isValidImageUrl = (url: string): boolean => {
  // Daftar hostname yang diizinkan
  const allowedHostnames = [
    'images.unsplash.com',
    'plus.unsplash.com',
    'i.imgur.com',
    'imgur.com',
    'github.com',
    'githubusercontent.com',
    'raw.githubusercontent.com',
    'google.com'
  ]
  
  try {
    const urlObj = new URL(url)
    return allowedHostnames.some(host => urlObj.hostname === host || urlObj.hostname.endsWith(`.${host}`))
  } catch {
    return false
  }
}

// Enhanced project data with more details
const projects = [
  {
    id: 1,
    title: "Linux Server Hardening",
    category: "System Security",
    tags: ["Linux", "Firewall", "SELinux", "Security Hardening"],
    image: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?q=80&w=1074&auto=format&fit=crop",
    description:
      "Implementasi sistem keamanan tingkat lanjut pada server Linux dengan konfigurasi firewall, SELinux, dan best practices keamanan untuk melindungi infrastruktur perusahaan.",
    client: "Enterprise Security Systems",
    date: "2023",
    link: "#",
    features: [
      "Konfigurasi firewall kompleks untuk meminimalisir serangan",
      "Implementasi SELinux dengan kebijakan khusus",
      "Pengaturan audit dan logging untuk monitoring keamanan",
      "Hardening protokol SSH dengan autentikasi kunci publik"
    ],
    outcome: "Peningkatan keamanan sebesar 78% dengan pengurangan titik kerentanan server dan waktu respons terhadap potensi ancaman.",
    duration: "3 bulan",
  },
  {
    id: 2,
    title: "Network Monitoring Solution",
    category: "Network Security",
    tags: ["Linux", "Intrusion Detection", "Traffic Analysis", "Monitoring"],
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1034&auto=format&fit=crop",
    description:
      "Sistem pemantauan jaringan komprehensif dengan kemampuan deteksi intrusi dan analisis traffic real-time untuk mengidentifikasi ancaman dan aktivitas mencurigakan.",
    client: "SecureNet Solutions",
    date: "2023",
    link: "#",
    features: [
      "Analisis lalu lintas jaringan real-time dengan alert otomatis",
      "Dashboard visual untuk monitoring performa jaringan",
      "Deteksi anomali berbasis machine learning",
      "Integrasi dengan sistem ticketing untuk respons cepat"
    ],
    outcome: "Pengurangan waktu deteksi ancaman sebesar 65% dan peningkatan visibilitas aktivitas jaringan untuk tim keamanan.",
    duration: "4 bulan",
  },
  {
    id: 3,
    title: "Automated Backup System",
    category: "System Administration",
    tags: ["Linux", "Bash Scripting", "Automation", "Data Protection"],
    image: "https://images.unsplash.com/photo-1563206767-5b18f218e8de?q=80&w=1169&auto=format&fit=crop",
    description:
      "Sistem backup otomatis dengan skrip Bash yang terjadwal untuk memastikan redundansi data dan pemulihan cepat setelah kegagalan sistem.",
    client: "DataSafe Technologies",
    date: "2023",
    link: "#",
    features: [
      "Backup inkremental otomatis dengan rotasi berbasis kebijakan",
      "Enkripsi data untuk backup eksternal dan cloud",
      "Kompresi cerdas untuk mengoptimalkan penyimpanan",
      "Pengujian integritas backup secara otomatis"
    ],
    outcome: "Pengurangan 90% waktu pemulihan dari kegagalan sistem dengan zero data loss dalam pengujian disaster recovery.",
    duration: "2 bulan",
  },
  {
    id: 4,
    title: "Secure Access Management",
    category: "Cybersecurity",
    tags: ["Linux", "Authentication", "Access Control", "Security Policies"],
    image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=1287&auto=format&fit=crop",
    description:
      "Implementasi sistem manajemen akses dengan otentikasi multi-faktor dan kebijakan kontrol akses terperinci untuk melindungi sumber daya sensitif.",
    client: "ProtectIT Services",
    date: "2022",
    link: "#",
    features: [
      "Implementasi otentikasi multi-faktor untuk akses sistem kritis",
      "Manajemen sentralisasi identitas dengan LDAP/Active Directory",
      "Kebijakan akses berbasis peran (RBAC) yang terperinci",
      "Audit trail untuk semua aktivitas akses"
    ],
    outcome: "Peningkatan keamanan akses sebesar 85% dengan pengurangan insiden pelanggaran akses tidak sah.",
    duration: "5 bulan",
  },
  {
    id: 5,
    title: "Virtual Private Server Deployment",
    category: "System Administration",
    tags: ["Linux", "Virtualization", "Cloud Infrastructure", "Server Management"],
    image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=1169&auto=format&fit=crop",
    description:
      "Penyebaran dan konfigurasi server privat virtual untuk hosting aplikasi dengan optimasi performa dan keamanan tingkat tinggi.",
    client: "CloudNet Solutions",
    date: "2023",
    link: "#",
    features: [
      "Konfigurasi VPS dengan resource allocation optimal",
      "Implementasi load balancing untuk high availability",
      "Optimasi kernel untuk performa aplikasi spesifik",
      "Setup monitoring dan alerting komprehensif"
    ],
    outcome: "Peningkatan kecepatan respons aplikasi sebesar 40% dan stabilitas sistem 99.9% uptime.",
    duration: "1 bulan",
  },
  {
    id: 6,
    title: "Security Incident Response System",
    category: "Cybersecurity",
    tags: ["Linux", "Incident Response", "Threat Detection", "Log Analysis"],
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1170&auto=format&fit=crop",
    description:
      "Platform respons insiden keamanan dengan kemampuan deteksi ancaman otomatis, analisis log, dan protokol remediasi untuk penanganan cepat terhadap pelanggaran keamanan.",
    client: "RapidResponse Security",
    date: "2022",
    link: "#",
    features: [
      "Deteksi ancaman berbasis AI dengan pengenalan pola",
      "Agregasi dan korelasi log dari berbagai sumber sistem",
      "Alur kerja respons otomatis untuk ancaman umum",
      "Dokumentasi dan pelaporan insiden terintegrasi"
    ],
    outcome: "Pengurangan waktu respons terhadap insiden keamanan sebesar 75% dan peningkatan kemampuan deteksi terhadap serangan zero-day.",
    duration: "6 bulan",
  },
]

// Extract all unique categories and tags
const allCategories = ["All", ...new Set(projects.map((project) => project.category))]
const allTags = [...new Set(projects.flatMap((project) => project.tags))]

export default function PortfolioSection() {
  const { t, language } = useLanguage()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  const [activeIndex, setActiveIndex] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredProjects, setFilteredProjects] = useState(projects)
  const [selectedProject, setSelectedProject] = useState<(typeof projects)[0] | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Filter projects based on category, tags, and search query
  useEffect(() => {
    let filtered = projects

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter((project) => project.category === selectedCategory)
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter((project) => selectedTags.every((tag) => project.tags.includes(tag)))
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query) ||
          project.category.toLowerCase().includes(query) ||
          project.tags.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    setFilteredProjects(filtered)

    // Reset active index if filtered projects change
    if (filtered.length > 0) {
      setActiveIndex(0)
    }
  }, [selectedCategory, selectedTags, searchQuery, language])
  
  // Memperbarui proyek yang dipilih saat bahasa berubah atau filteredProjects berubah
  useEffect(() => {
    if (selectedProject && filteredProjects.length > 0) {
      // Cari proyek yang sama ID-nya dalam filteredProjects
      const updatedProject = filteredProjects.find(project => project.id === selectedProject.id);
      if (updatedProject) {
        setSelectedProject(updatedProject);
      }
    }
  }, [language, filteredProjects, selectedProject?.id]);

  const nextProject = () => {
    setActiveIndex((prev) => (prev + 1) % filteredProjects.length)
  }

  const prevProject = () => {
    setActiveIndex((prev) => (prev - 1 + filteredProjects.length) % filteredProjects.length)
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const openProjectDetails = (project: (typeof projects)[0]) => {
    setSelectedProject(project)
    setIsModalOpen(true)
  }

  return (
    <section id="portfolio" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground"
          >
            {t("portfolio.title")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-foreground/70 max-w-2xl mx-auto"
          >
            {t("portfolio.subtitle")}
          </motion.p>
        </div>

        {/* Search and Filter Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-10"
        >
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/50" />
              <Input
                type="text"
                placeholder={t("portfolio.search")}
                className="pl-10 bg-background/50 border-input/50 focus:border-primary/50 transition-all rounded-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {allCategories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  className={`rounded-full whitespace-nowrap ${
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "border-primary/30 hover:border-primary/60"
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === "All" ? t("portfolio.filter.all") : category}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-2">
            <div className="flex items-center mr-2">
              <Filter className="h-4 w-4 mr-1 text-foreground/70" />
              <span className="text-sm text-foreground/70">{t("portfolio.filterByTags")}</span>
            </div>
            {allTags.slice(0, 8).map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className={`cursor-pointer ${
                  selectedTags.includes(tag)
                    ? "bg-primary text-primary-foreground"
                    : "bg-background/50 hover:bg-background/80"
                }`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
            {allTags.length > 8 && (
              <Dialog>
                <DialogTrigger asChild>
                  <Badge variant="outline" className="cursor-pointer bg-background/50 hover:bg-background/80">
                    {t("portfolio.moreTags").replace("{0}", (allTags.length - 8).toString())}
                  </Badge>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("portfolio.allTags")}</DialogTitle>
                    <DialogDescription>{t("portfolio.selectTagsToFilter")}</DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {allTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className={`cursor-pointer ${
                          selectedTags.includes(tag)
                            ? "bg-primary text-primary-foreground"
                            : "bg-background/50 hover:bg-background/80"
                        }`}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {selectedTags.length > 0 && (
            <div className="flex items-center">
              <Button
                variant="link"
                size="sm"
                className="text-primary/70 p-0 h-auto"
                onClick={() => setSelectedTags([])}
              >
                {t("portfolio.clearFilters")}
              </Button>
            </div>
          )}
        </motion.div>

        <div ref={ref} className="relative">
          {filteredProjects.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <p className="text-foreground/70 mb-4">{t("portfolio.noProjectsMatch")}</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCategory("All")
                  setSelectedTags([])
                  setSearchQuery("")
                }}
              >
                {t("portfolio.resetFilters")}
              </Button>
            </motion.div>
          ) : (
            <>
              <div className="flex justify-between absolute top-1/2 left-0 right-0 z-10 transform -translate-y-1/2 px-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-background/60 backdrop-blur-md rounded-full h-12 w-12 shadow-md hover:shadow-lg hover:bg-background/80 transition-all duration-300"
                  onClick={prevProject}
                  disabled={filteredProjects.length <= 1}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-background/60 backdrop-blur-md rounded-full h-12 w-12 shadow-md hover:shadow-lg hover:bg-background/80 transition-all duration-300"
                  onClick={nextProject}
                  disabled={filteredProjects.length <= 1}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>

              <div className="overflow-hidden">
                <motion.div
                  className="flex"
                  animate={{ x: `-${activeIndex * 100}%` }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  {filteredProjects.map((project, index) => (
                    <div key={project.id} className="w-full flex-shrink-0 px-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div className="relative overflow-hidden rounded-xl group aspect-video md:aspect-auto bg-card/10 shadow-md transition-all duration-300 hover:shadow-lg">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary-foreground/30 opacity-0 group-hover:opacity-100 transition-all duration-500 z-10 flex items-center justify-center backdrop-blur-sm">
                            <Button
                              variant="outline"
                              className="bg-background/80 backdrop-blur-sm border-white/20 text-white hover:bg-background/90 transform transition-transform duration-300 scale-90 md:scale-100 group-hover:scale-110 shadow-lg"
                              onClick={() => openProjectDetails(project)}
                            >
                              {t("portfolio.viewDetails")}
                            </Button>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent z-[1] opacity-60 group-hover:opacity-80 transition-opacity"></div>
                          <div className="absolute bottom-3 left-3 z-[2]">
                            <Badge className="bg-primary/90 text-primary-foreground text-xs shadow-md">
                              {project.duration}
                            </Badge>
                          </div>
                          <Image
                            src={
                              project.image && project.image.startsWith('http') 
                              ? (isValidImageUrl(project.image) ? project.image : "/placeholder.svg") 
                              : (project.image || "/placeholder.svg")
                            }
                            alt={project.title}
                            width={800}
                            height={600}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                            style={{ 
                              maxHeight: '400px',
                              objectPosition: 'center'
                            }}
                            sizes="(max-width: 768px) 100vw, 50vw"
                            priority={index === 0}
                            unoptimized={project.image?.startsWith('http')}
                            onError={() => {
                              const imgElement = document.getElementById(`project-img-${project.id}`);
                              if (imgElement) {
                                imgElement.setAttribute('src', '/placeholder.svg');
                              }
                            }}
                            id={`project-img-${project.id}`}
                          />
                        </div>
                        <div>
                          <div className="flex items-center mb-2">
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 mr-2 shadow-sm">
                              {project.category}
                            </Badge>
                            <span className="text-xs text-foreground/60 flex items-center">
                              <span className="h-1 w-1 rounded-full bg-primary/60 mr-2"></span>
                              {project.date}
                            </span>
                          </div>
                          <h3 className="text-2xl md:text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground">
                            {project.title}
                          </h3>
                          <p className="text-foreground/70 mb-4 leading-relaxed">{project.description}</p>
                          
                          <div className="mb-4 bg-card/10 backdrop-blur-sm p-3 rounded-lg border border-primary/5 shadow-sm">
                            <p className="text-sm font-medium text-primary/90 mb-1">Hasil:</p>
                            <p className="text-sm text-foreground/80 italic">{project.outcome}</p>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-6">
                            {project.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="bg-primary/5 border-primary/20 shadow-sm">
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex gap-4">
                            <Button 
                              className="rounded-full btn-premium shadow-md hover:shadow-lg transition-all duration-300" 
                              onClick={() => openProjectDetails(project)}
                            >
                              {t("portfolio.viewProject")}
                            </Button>
                            <Button
                              variant="outline"
                              className="rounded-full border-primary/30 hover:border-primary/60 shadow-sm hover:shadow-md transition-all duration-300"
                              asChild
                            >
                              <a href={project.link} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                {t("portfolio.liveDemo")}
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>

              <div className="flex justify-center mt-8 space-x-2">
                {filteredProjects.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`relative h-2 rounded-full transition-all duration-500 ${
                      activeIndex === index ? "w-8 bg-primary shadow-sm" : "w-2 bg-primary/30 hover:bg-primary/50"
                    }`}
                    aria-label={`Go to project ${index + 1}`}
                  >
                    {activeIndex === index && (
                      <span
                        className="absolute inset-0 bg-primary/50 rounded-full animate-pulse"
                      />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Project Details Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto bg-background border border-border p-0 sm:p-6">
            {selectedProject && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedProject.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="text-foreground relative"
                >
                  <div className="p-4 sm:p-0">
                    <DialogHeader className="mb-6">
                      <DialogTitle className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground pr-8">
                        {selectedProject.title}
                      </DialogTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline" className="bg-primary/10 text-primary">
                          {selectedProject.category}
                        </Badge>
                        <span>•</span>
                        <span>{selectedProject.date}</span>
                        <span>•</span>
                        <span className="text-foreground/60 text-sm">{selectedProject.duration}</span>
                      </div>
                    </DialogHeader>

                    <div className="mt-6">
                      <div className="relative aspect-video overflow-hidden rounded-lg mb-6 border border-border/20 shadow-md">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10 opacity-60"></div>
                        <Image
                          src={selectedProject.image || "/placeholder.svg"}
                          alt={selectedProject.title}
                          fill
                          className="object-cover transition-transform duration-500 hover:scale-105"
                          sizes="(max-width: 768px) 90vw, 70vw"
                          priority
                        />
                        <div className="absolute bottom-3 left-3 z-20">
                          <Badge className="bg-primary/90 text-primary-foreground shadow-md">
                            {selectedProject.client}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                          <div className="bg-card/20 backdrop-blur-sm rounded-lg p-5 mb-6 border border-primary/10 shadow-md hover:shadow-lg transition-all duration-300">
                            <h4 className="text-lg font-semibold mb-3 flex items-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {t("portfolio.projectOverview")}
                            </h4>
                            <p className="text-foreground/70 mb-4 leading-relaxed">{selectedProject.description}</p>
                            
                            <div className="p-3 bg-primary/5 rounded-md border border-primary/10 mt-4">
                              <p className="font-medium text-primary/90">Hasil Proyek:</p>
                              <p className="text-foreground/80 mt-1">{selectedProject.outcome}</p>
                            </div>
                          </div>

                          <div className="bg-card/20 backdrop-blur-sm rounded-lg p-5 border border-primary/10 shadow-md hover:shadow-lg transition-all duration-300">
                            <h4 className="text-lg font-semibold mb-3 flex items-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              {t("portfolio.keyFeatures")}
                            </h4>
                            <ul className="space-y-3">
                              {selectedProject.features.map((feature, idx) => (
                                <li key={idx} className="flex items-start">
                                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-3 mt-0.5 shadow-sm">
                                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                                  </div>
                                  <p className="text-foreground/80">{feature}</p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div>
                          <div className="bg-card/30 backdrop-blur-md border border-card/20 p-5 rounded-lg mb-4 shadow-md hover:shadow-lg transition-all duration-300">
                            <h4 className="text-md font-semibold mb-4 border-b border-primary/10 pb-2 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-primary/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {t("portfolio.projectDetails")}
                            </h4>
                            <div className="space-y-4">
                              <div>
                                <div className="flex items-center mb-1">
                                  <div className="w-1 h-1 rounded-full bg-primary mr-2"></div>
                                  <p className="text-sm font-medium text-foreground/70">{t("portfolio.client")}</p>
                                </div>
                                <p className="pl-3 font-medium text-primary">{selectedProject.client}</p>
                              </div>
                              <div>
                                <div className="flex items-center mb-1">
                                  <div className="w-1 h-1 rounded-full bg-primary mr-2"></div>
                                  <p className="text-sm font-medium text-foreground/70">{t("portfolio.date")}</p>
                                </div>
                                <p className="pl-3">{selectedProject.date} <span className="text-sm text-foreground/60">({selectedProject.duration})</span></p>
                              </div>
                              <div>
                                <div className="flex items-center mb-1">
                                  <div className="w-1 h-1 rounded-full bg-primary mr-2"></div>
                                  <p className="text-sm font-medium text-foreground/70">Category</p>
                                </div>
                                <p className="pl-3">{selectedProject.category}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-card/30 backdrop-blur-md border border-card/20 p-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
                            <h4 className="text-md font-semibold mb-4 border-b border-primary/10 pb-2 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-primary/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                              </svg>
                              {t("portfolio.technologies")}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedProject.tags.map((tag) => (
                                <Badge 
                                  key={tag} 
                                  variant="outline" 
                                  className="bg-primary/5 border-primary/20 text-foreground hover:bg-primary/10 transition-colors py-1.5 shadow-sm"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="mt-6">
                            <Button className="w-full rounded-full btn-premium shadow-md hover:shadow-lg transition-all duration-300" asChild>
                              <a href={selectedProject.link} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                {t("portfolio.liveDemo")}
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  )
}

