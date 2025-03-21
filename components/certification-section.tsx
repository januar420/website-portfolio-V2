"use client"

import { useRef, useState, useEffect } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useLanguage } from "./language-provider"
import { Button } from "@/components/ui/button"
import { 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink, 
  Filter, 
  Search, 
  FileText, 
  X, 
  Award, 
  Calendar, 
  Tag, 
  BookOpen, 
  Medal, 
  Star,
  GraduationCap 
} from "lucide-react"
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

// Data sertifikasi dengan detail yang diperbarui
const certifications = [
  {
    id: 1,
    title: "Certified Network Security Practitioner (CNSP)",
    category: "Network Security",
    tags: ["Network Security", "Certification", "Cybersecurity", "Security Protocols"],
    filename: "Januar Galuh Certified Network Security Practitioner (CNSP).pdf",
    description: {
      en: "Professional certification in network security practices covering the fundamental principles of network security, protocols, and techniques for protecting network infrastructure. This certification validates expertise in implementing and maintaining secure network environments.",
      id: "Sertifikasi profesional dalam praktik keamanan jaringan yang mencakup prinsip-prinsip dasar keamanan jaringan, protokol, dan teknik-teknik perlindungan infrastruktur jaringan. Sertifikasi ini memvalidasi keahlian dalam mengimplementasikan dan memelihara lingkungan jaringan yang aman."
    },
    issuedBy: "The SecOps Group",
    date: "20 January, 2025",
    thumbnail: "/placeholder.svg",
    imageSrc: "/images/certifications/high-quality/cnsp.jpg",
    highlights: ["Network Defense Strategies", "Security Protocol Implementation", "Threat Analysis", "Infrastructure Protection"],
  },
  {
    id: 2,
    title: "CC Certified in Cybersecurity (CC)",
    category: "Cybersecurity Certification",
    tags: ["Cybersecurity", "Certification", "Security Protocols", "Industry Standard"],
    filename: "CC Certified in Cybersecurity (CC).pdf",
    description: {
      en: "Certificate of expertise in cybersecurity fundamentals and implementation focusing on protecting systems, applications, and IT infrastructure from various security threats. This globally recognized certification demonstrates proficiency in cybersecurity core concepts and practices.",
      id: "Sertifikat keahlian dalam dasar-dasar dan implementasi keamanan siber yang fokus pada perlindungan sistem, aplikasi, dan infrastruktur TI dari berbagai ancaman keamanan. Sertifikasi yang diakui secara global ini menunjukkan kemahiran dalam konsep dan praktik inti keamanan siber."
    },
    issuedBy: "(ISC)²",
    date: "20 January, 2025",
    thumbnail: "/placeholder.svg",
    imageSrc: "/images/certifications/high-quality/cybersecurity.jpg",
    highlights: ["Cybersecurity Fundamentals", "Risk Management", "Security Best Practices", "Compliance Standards"],
  },
  {
    id: 3,
    title: "CC Course Conclusion & Final Assessment",
    category: "Cybersecurity Training",
    tags: ["Cybersecurity", "Assessment", "Security Fundamentals", "Course Completion"],
    filename: "CC Course Conclusion & Final Assessment.pdf",
    description: {
      en: "Completion certification for the cybersecurity course covering fundamental principles in identifying, preventing, and responding to cyber security threats. This certificate recognizes successful completion of comprehensive training in cybersecurity essentials.",
      id: "Sertifikasi penyelesaian kursus keamanan siber yang mencakup prinsip-prinsip fundamental dalam mengidentifikasi, mencegah, dan menanggapi ancaman keamanan siber. Sertifikat ini mengakui penyelesaian yang berhasil dari pelatihan komprehensif dalam dasar-dasar keamanan siber."
    },
    issuedBy: "(ISC)²",
    date: "20 January, 2025",
    thumbnail: "/placeholder.svg",
    imageSrc: "/images/certifications/high-quality/course-conclusion.jpg",
    highlights: ["Comprehensive Assessment", "Security Awareness", "Practical Knowledge", "Threat Recognition"],
  },
  {
    id: 4,
    title: "CC Domain 5: Security Operations",
    category: "Security Operations",
    tags: ["Security Operations", "Threat Detection", "Incident Response", "Security Monitoring"],
    filename: "CC Domain 5 Security Operations.pdf",
    description: {
      en: "Certification in security operations that equips professionals with skills to identify, analyze, and respond to security threats through operational procedures. Focuses on the implementation of security controls, monitoring, and continuous security improvement.",
      id: "Sertifikasi dalam operasi keamanan yang membekali profesional dengan keterampilan untuk mengidentifikasi, menganalisis, dan merespon ancaman keamanan melalui prosedur operasional. Berfokus pada implementasi kontrol keamanan, pemantauan, dan peningkatan keamanan berkelanjutan."
    },
    issuedBy: "(ISC)²",
    date: "16 December, 2024",
    thumbnail: "/placeholder.svg",
    imageSrc: "/images/certifications/high-quality/security-operations.jpg",
    highlights: ["Security Monitoring", "Incident Handling", "Vulnerability Management", "Security Controls"],
  },
  {
    id: 5,
    title: "CC Domain 4: Network Security",
    category: "Network Security",
    tags: ["Network Security", "Network Protection", "Security Testing", "Infrastructure Security"],
    filename: "CC  Domain 4 Network Security.pdf",
    description: {
      en: "Certification in network security covering methodologies, protocols, and techniques for securing network infrastructure and protecting against network-based attacks. Establishes expertise in designing and maintaining secure network architectures.",
      id: "Sertifikasi dalam keamanan jaringan yang mencakup metodologi, protokol, dan teknik untuk mengamankan infrastruktur jaringan dan melindungi dari serangan berbasis jaringan. Membangun keahlian dalam merancang dan memelihara arsitektur jaringan yang aman."
    },
    issuedBy: "(ISC)²",
    date: "14 December, 2024",
    thumbnail: "/placeholder.svg",
    imageSrc: "/images/certifications/high-quality/network-security.jpg",
    highlights: ["Network Defense", "Protocol Security", "Boundary Protection", "Traffic Analysis"],
  },
  {
    id: 6,
    title: "CC Domain 3: Access Control Concepts",
    category: "Access Control",
    tags: ["Access Control", "Authentication", "Authorization", "Identity Management"],
    filename: "CC Domain 3 Access Control Concepts.pdf",
    description: {
      en: "Certification in access control concepts focusing on principles, mechanisms, and best practices in managing access to systems and information resources. Covers authentication, authorization, and accountability in securing digital assets.",
      id: "Sertifikasi dalam konsep kontrol akses yang berfokus pada prinsip, mekanisme, dan praktik terbaik dalam mengelola akses ke sistem dan sumber daya informasi. Mencakup autentikasi, otorisasi, dan akuntabilitas dalam mengamankan aset digital."
    },
    issuedBy: "(ISC)²",
    date: "14 December, 2024",
    thumbnail: "/placeholder.svg",
    imageSrc: "/images/certifications/high-quality/access-control.jpg",
    highlights: ["Identity Management", "Access Governance", "Authentication Systems", "Privilege Management"],
  },
  {
    id: 7,
    title: "CC Domain 2: Incident Response",
    category: "Incident Response",
    tags: ["Incident Response", "Disaster Recovery", "Business Continuity", "Crisis Management"],
    filename: "CC Domain 2 Incident Response, Business Continuity And Disaster Recovery Concepts.pdf",
    description: {
      en: "Certification in incident response and business continuity focusing on methodologies for effective incident handling, disaster recovery planning, and ensuring operational resilience in the face of security breaches or system failures.",
      id: "Sertifikasi dalam respons insiden dan kelangsungan bisnis yang berfokus pada metodologi untuk penanganan insiden yang efektif, perencanaan pemulihan bencana, dan memastikan ketahanan operasional menghadapi pelanggaran keamanan atau kegagalan sistem."
    },
    issuedBy: "(ISC)²",
    date: "April 2023",
    thumbnail: "/placeholder.svg",
    imageSrc: "/images/certifications/high-quality/incident-response.jpg",
    highlights: ["Incident Handling", "Recovery Planning", "Business Continuity", "Crisis Communication"],
  },
  {
    id: 8,
    title: "CC Domain 1: Security Principles",
    category: "Security Fundamentals",
    tags: ["Security Principles", "Cybersecurity Fundamentals", "Security Concepts", "Security Architecture"],
    filename: "CC Domain 1 Security Principles.pdf",
    description: {
      en: "Certification in fundamental security principles that forms the foundation for understanding and implementing cybersecurity practices and strategies. Establishes core knowledge in security concepts, models, and best practices essential for any security professional.",
      id: "Sertifikasi dalam prinsip-prinsip keamanan dasar yang membentuk fondasi untuk memahami dan menerapkan praktik dan strategi keamanan siber. Membangun pengetahuan inti dalam konsep, model, dan praktik terbaik keamanan yang penting bagi setiap profesional keamanan."
    },
    issuedBy: "(ISC)²",
    date: "Maret 2023",
    thumbnail: "/placeholder.svg",
    imageSrc: "/images/certifications/high-quality/security-principles.jpg",
    highlights: ["Security Models", "Defense in Depth", "Confidentiality", "Integrity & Availability"],
  }
]

// Extract all unique categories and tags
const allCategories = ["All", ...new Set(certifications.map((cert) => cert.category))]
const allTags = [...new Set(certifications.flatMap((cert) => cert.tags))]

export default function CertificationSection() {
  const { t, language } = useLanguage()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  const [activeIndex, setActiveIndex] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredCertifications, setFilteredCertifications] = useState(certifications)
  const [selectedCertification, setSelectedCertification] = useState<(typeof certifications)[0] | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCertIndex, setSelectedCertIndex] = useState<number>(0)

  // Helper function to get the description in the current language
  const getLocalizedDescription = (cert: (typeof certifications)[0]) => {
    return cert.description[language as keyof typeof cert.description] || cert.description.en
  }

  // Filter certifications based on category, tags, and search query
  useEffect(() => {
    console.log("Language changed or filter updated:", language);
    
    let filtered = certifications

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter((cert) => cert.category === selectedCategory)
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter((cert) => selectedTags.every((tag) => cert.tags.includes(tag)))
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (cert) =>
          cert.title.toLowerCase().includes(query) ||
          getLocalizedDescription(cert).toLowerCase().includes(query) ||
          cert.category.toLowerCase().includes(query) ||
          cert.tags.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    // Simpan index yang aktif sebelum kita mengubah array filteredCertifications
    let currentActiveItem = null;
    if (filteredCertifications.length > 0 && activeIndex < filteredCertifications.length) {
      currentActiveItem = filteredCertifications[activeIndex];
      console.log("Current active item:", currentActiveItem?.title, "at index:", activeIndex);
    }

    setFilteredCertifications(filtered)

    // Jangan reset active index saat bahasa berubah
    if (filtered.length > 0) {
      if (currentActiveItem) {
        // Coba temukan indeks yang sama di array baru
        const newIndex = filtered.findIndex(cert => cert.id === currentActiveItem.id);
        console.log("Found new index:", newIndex, "for ID:", currentActiveItem.id);
        
        if (newIndex >= 0) {
          console.log("Setting active index to:", newIndex);
          setActiveIndex(newIndex);
        } else {
          // Jika tidak ditemukan, gunakan indeks 0
          console.log("Item not found in filtered list, reset to index 0");
          setActiveIndex(0);
        }
      } else {
        console.log("No current active item, setting index to 0");
        setActiveIndex(0);
      }
    }
  }, [selectedCategory, selectedTags, searchQuery, language])

  // Memperbarui sertifikasi yang dipilih saat bahasa berubah atau filteredCertifications berubah
  useEffect(() => {
    if (selectedCertification && filteredCertifications.length > 0) {
      // Cari sertifikasi yang sama ID-nya dalam filteredCertifications
      const updatedCert = filteredCertifications.find(cert => cert.id === selectedCertification.id);
      if (updatedCert) {
        setSelectedCertification(updatedCert);
      }
    }
  }, [language, filteredCertifications, selectedCertification?.id]);

  const nextCertification = () => {
    // Calculating the maximum allowed index to ensure we don't exceed the number of slides
    const maxIndex = Math.min(5, Math.ceil(filteredCertifications.length / 1) - 1);
    const nextIdx = activeIndex + 1;
    
    // Only update if we're still within bounds
    if (nextIdx <= maxIndex) {
      setActiveIndex(nextIdx);
    } else {
      // Loop back to the beginning if we've reached the end
      setActiveIndex(0);
    }
  }

  const prevCertification = () => {
    // Calculating the maximum allowed index
    const maxIndex = Math.min(5, Math.ceil(filteredCertifications.length / 1) - 1);
    const prevIdx = activeIndex - 1;
    
    // Only update if we're still within bounds
    if (prevIdx >= 0) {
      setActiveIndex(prevIdx);
    } else {
      // Loop to the end if we're at the beginning
      setActiveIndex(maxIndex);
    }
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const openCertificationDetails = (cert: (typeof certifications)[0]) => {
    setSelectedCertification(cert)
    setIsDialogOpen(true)
    setIsModalOpen(true)
    
    // Set the index of the selected certification
    const index = filteredCertifications.findIndex(c => c.id === cert.id)
    setSelectedCertIndex(index >= 0 ? index : 0)
    
    console.log("Opening certificate details:", cert.title);
  }

  const viewPdf = (filename: string) => {
    try {
      // Periksa apakah filename adalah milik Domain 4 Network Security
      const isNetworkSecurityFile = filename.includes("CC Domain 4 Network Security");
      
      // Gunakan nama file alternatif khusus untuk Network Security dengan spasi ganda
      let finalFilename = filename;
      if (isNetworkSecurityFile) {
        // Perhatikan ada spasi ganda setelah "CC" (sesuai dengan nama file asli)
        finalFilename = "CC  Domain 4 Network Security.pdf";
        console.log("Using corrected filename for Network Security:", finalFilename);
      }
      
      // Buat URL untuk API route
      const pdfPath = `/api/pdf?file=${encodeURIComponent(finalFilename)}`;
      console.log("Opening PDF with API route:", pdfPath);
      
      if (isDialogOpen) {
        setIsDialogOpen(false);
        setTimeout(() => {
          window.open(pdfPath, '_blank');
        }, 300);
      } else {
        window.open(pdfPath, '_blank');
      }
    } catch (error) {
      console.error('Error opening PDF file:', error);
      // Tampilkan toast error jika tersedia
      if (typeof window !== "undefined") {
        alert('Tidak dapat membuka file PDF. Silakan coba lagi.');
      }
    }
  }

  // Add navigation functions for the modal
  const goToNextCertificate = () => {
    if (filteredCertifications.length <= 1) return
    
    const nextIndex = (selectedCertIndex + 1) % filteredCertifications.length
    setSelectedCertIndex(nextIndex)
    setSelectedCertification(filteredCertifications[nextIndex])
  }
  
  const goToPrevCertificate = () => {
    if (filteredCertifications.length <= 1) return
    
    const prevIndex = selectedCertIndex === 0 
      ? filteredCertifications.length - 1 
      : selectedCertIndex - 1
    setSelectedCertIndex(prevIndex)
    setSelectedCertification(filteredCertifications[prevIndex])
  }
  
  // Handling swipe gestures for the dialog
  const handleSwipe = (event: any, info: any) => {
    if (filteredCertifications.length <= 1) return;
    
    // Check the swipe direction
    if (info.offset.x > 100) {
      // Swiped right, go to previous
      goToPrevCertificate();
    } else if (info.offset.x < -100) {
      // Swiped left, go to next
      goToNextCertificate();
    }
  }

  return (
    <section id="certifications" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground"
          >
            {t("certifications.title")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-foreground/70 max-w-2xl mx-auto"
          >
            {t("certifications.subtitle")}
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
                placeholder={t("certifications.searchPlaceholder")}
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
                  {category === "All" ? t("certifications.all") : category}
                </Button>
              ))}
            </div>
          </div>

          {/* Tag Filters */}
          <div className="flex flex-wrap gap-2 mb-2">
            <div className="flex items-center mr-2">
              <Filter className="h-4 w-4 mr-1 text-foreground/70" />
              <span className="text-sm text-foreground/70">{t("certifications.filterByTags")}:</span>
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
                    {t("certifications.moreTags").replace("{0}", (allTags.length - 8).toString())}
                  </Badge>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("certifications.allTags")}</DialogTitle>
                    <DialogDescription>{t("certifications.selectTagsToFilter")}</DialogDescription>
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
                {t("certifications.clearFilters")}
              </Button>
            </div>
          )}
        </motion.div>

        <div ref={ref} className="relative">
          {filteredCertifications.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <p className="text-foreground/70 mb-4">{t("certifications.noMatch")}</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCategory("All")
                  setSelectedTags([])
                  setSearchQuery("")
                }}
              >
                {t("certifications.resetFilters")}
              </Button>
            </motion.div>
          ) : (
            <>
              <div className="flex justify-between absolute top-1/2 left-0 right-0 z-10 transform -translate-y-1/2 px-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-background/50 backdrop-blur-md rounded-full h-12 w-12"
                  onClick={prevCertification}
                  disabled={filteredCertifications.length <= 1}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-background/50 backdrop-blur-md rounded-full h-12 w-12"
                  onClick={nextCertification}
                  disabled={filteredCertifications.length <= 1}
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
                  {filteredCertifications.map((cert, index) => (
                    <div key={cert.id} className="w-full flex-shrink-0 px-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div className="relative overflow-hidden rounded-xl group aspect-video md:aspect-auto bg-card/10 flex items-center justify-center">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary-foreground/30 opacity-0 group-hover:opacity-100 transition-all duration-500 z-10 flex items-center justify-center backdrop-blur-sm">
                            <Button
                              variant="outline"
                              className="bg-background/80 backdrop-blur-sm border-white/20 text-white hover:bg-background/90 transform transition-transform duration-300 scale-90 md:scale-100 group-hover:scale-110 shadow-lg"
                              onClick={() => openCertificationDetails(cert)}
                            >
                              {t("certifications.viewDetails")}
                            </Button>
                          </div>
                          <div className="relative w-full h-full md:min-h-[240px] flex items-center justify-center overflow-hidden p-4">
                            <Image
                              src={cert.imageSrc}
                              alt={cert.title}
                              width={500}
                              height={350}
                              className="w-auto h-auto max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500 shadow-xl rounded-md"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center mb-2">
                            <span className="text-sm text-primary font-medium mr-2">{cert.category}</span>
                            <span className="text-xs text-foreground/50">{cert.date}</span>
                          </div>
                          <h3 className="text-2xl md:text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground">
                            {cert.title}
                          </h3>
                          <p className="text-foreground/70 mb-6">{getLocalizedDescription(cert)}</p>

                          <div className="flex flex-wrap gap-2 mb-6">
                            {cert.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="bg-primary/5 border-primary/20">
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex gap-4">
                            <Button className="rounded-full btn-premium" onClick={() => openCertificationDetails(cert)}>
                              {t("certifications.viewDetails")}
                            </Button>
                            <Button
                              variant="outline"
                              className="rounded-full border-primary/30 hover:border-primary/60"
                              onClick={() => viewPdf(cert.filename)}
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              {t("certifications.openPdf")}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Navigation Circles - Moved to here */}
              <div className="flex justify-center mt-8 space-x-2">
                {[...Array(Math.min(6, filteredCertifications.length))].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`relative h-2 rounded-full transition-all duration-500 ${
                      activeIndex === index ? "w-8 bg-primary shadow-sm" : "w-2 bg-primary/30 hover:bg-primary/50"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
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
      </div>

      <Dialog open={isModalOpen} onOpenChange={(open) => {
        setIsModalOpen(open);
        if (!open) {
          setIsDialogOpen(false);
          console.log("Dialog closed");
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background border border-border p-0 sm:p-6">
          {selectedCertification && (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCertification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="text-foreground relative"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleSwipe}
              >
                <div className="p-4 sm:p-0">
                  <DialogHeader className="mb-6">
                    <DialogTitle className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground pr-8">
                      {selectedCertification.title}
                    </DialogTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className="bg-primary/10 text-primary">
                        {selectedCertification.category}
                      </Badge>
                      <span>•</span>
                      <span>{selectedCertification.date}</span>
                    </div>
                  </DialogHeader>

                  <div className="mt-6 relative">
                    {/* Navigation Controls for Modal */}
                    {filteredCertifications.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 sm:h-10 sm:w-10 bg-background/80 backdrop-blur-sm border border-border/50 rounded-full shadow-md opacity-80 hover:opacity-100 transition-opacity"
                          onClick={goToPrevCertificate}
                          aria-label="Previous certificate"
                        >
                          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 sm:h-10 sm:w-10 bg-background/80 backdrop-blur-sm border border-border/50 rounded-full shadow-md opacity-80 hover:opacity-100 transition-opacity"
                          onClick={goToNextCertificate}
                          aria-label="Next certificate"
                        >
                          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                      </>
                    )}
                    
                    <div className="relative overflow-hidden rounded-lg mb-6 bg-card/10">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary-foreground/5"></div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 sm:p-6 relative z-10">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-full h-48 md:h-64 relative bg-black/5 backdrop-blur-sm rounded-lg overflow-hidden shadow-xl border border-primary/10">
                            <div className="absolute inset-0 flex items-center justify-center p-4">
                              <Image
                                src={selectedCertification.imageSrc}
                                alt={selectedCertification.title}
                                width={600}
                                height={400}
                                className="w-auto h-auto max-w-full max-h-full object-contain transition-transform duration-500 hover:scale-105 rounded-md shadow-md"
                              />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 py-2 px-3 bg-gradient-to-t from-black/70 to-transparent">
                              <p className="text-white text-xs truncate font-medium">{selectedCertification.filename}</p>
                            </div>
                          </div>
                          <div className="mt-4 flex flex-col w-full space-y-2">
                            <Button 
                              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transition-all duration-300 hover:shadow-lg"
                              onClick={() => viewPdf(selectedCertification.filename)}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              {t("certifications.openPdf")}
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex flex-col justify-center">
                          <div className="bg-card/30 backdrop-blur-md border border-card/20 p-4 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground">{t("certifications.quickDetails")}</h3>
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 shadow-sm">
                                  {selectedCertification.category}
                                </Badge>
                                <Badge variant="outline" className="bg-primary/5 text-foreground/70 border-primary/20 shadow-sm">
                                  {selectedCertification.date}
                                </Badge>
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Award className="h-4 w-4 text-primary/70" />
                                  <p className="text-sm font-medium text-foreground/70">{t("certifications.issuedBy")}</p>
                                </div>
                                <p className="pl-6 font-medium">{selectedCertification.issuedBy}</p>
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <FileText className="h-4 w-4 text-primary/70" />
                                  <p className="text-sm font-medium text-foreground/70">{t("certifications.fileDetails")}</p>
                                </div>
                                <p className="pl-6 text-xs text-foreground/60">PDF • {selectedCertification.filename}</p>
                              </div>
                            </div>
                          </div>

                          {selectedCertification.highlights && (
                            <div className="mt-4 bg-card/30 backdrop-blur-md border border-card/20 p-4 rounded-lg shadow-md">
                              <h3 className="text-sm font-semibold mb-3 flex items-center text-foreground/80">
                                <Medal className="h-4 w-4 mr-2 text-primary/70" />
                                Key Highlights
                              </h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {selectedCertification.highlights.map((highlight, idx) => (
                                  <div key={idx} className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary/70"></div>
                                    <p className="text-sm text-foreground/70">{highlight}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2">
                        <div className="bg-card/20 backdrop-blur-sm rounded-lg p-5 mb-6 border border-primary/10 shadow-md hover:shadow-lg transition-all duration-300">
                          <h4 className="text-lg font-semibold mb-3 flex items-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground">
                            <BookOpen className="h-5 w-5 mr-2 text-primary" />
                            {t("certifications.description")}
                          </h4>
                          <p className="text-foreground/70 mb-4 leading-relaxed">{getLocalizedDescription(selectedCertification)}</p>
                        </div>

                        <div className="bg-card/20 backdrop-blur-sm rounded-lg p-5 border border-primary/10 shadow-md hover:shadow-lg transition-all duration-300">
                          <h4 className="text-lg font-semibold mb-4 flex items-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground">
                            <GraduationCap className="h-5 w-5 mr-2 text-primary" />
                            {t("certifications.competencies")}
                          </h4>
                          <ul className="space-y-3">
                            <li className="flex items-start">
                              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-3 mt-0.5 shadow-sm">
                                <div className="h-2 w-2 rounded-full bg-primary"></div>
                              </div>
                              <div>
                                <p className="text-foreground/80 font-medium">{t("certifications.competency1")}</p>
                                <p className="text-sm text-foreground/60 mt-1">Understanding the core principles that guide security decisions and implementations</p>
                              </div>
                            </li>
                            <li className="flex items-start">
                              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-3 mt-0.5 shadow-sm">
                                <div className="h-2 w-2 rounded-full bg-primary"></div>
                              </div>
                              <div>
                                <p className="text-foreground/80 font-medium">{t("certifications.competency2")}</p>
                                <p className="text-sm text-foreground/60 mt-1">Applying proactive measures to reduce vulnerabilities before they can be exploited</p>
                              </div>
                            </li>
                            <li className="flex items-start">
                              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-3 mt-0.5 shadow-sm">
                                <div className="h-2 w-2 rounded-full bg-primary"></div>
                              </div>
                              <div>
                                <p className="text-foreground/80 font-medium">{t("certifications.competency3")}</p>
                                <p className="text-sm text-foreground/60 mt-1">Selecting and configuring appropriate security technologies based on requirements</p>
                              </div>
                            </li>
                            <li className="flex items-start">
                              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-3 mt-0.5 shadow-sm">
                                <div className="h-2 w-2 rounded-full bg-primary"></div>
                              </div>
                              <div>
                                <p className="text-foreground/80 font-medium">{t("certifications.competency4")}</p>
                                <p className="text-sm text-foreground/60 mt-1">Following structured approaches to contain, investigate, and remediate security incidents</p>
                              </div>
                            </li>
                          </ul>
                        </div>

                        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                          <Button
                            variant="outline"
                            className="rounded-full border-primary/30 hover:border-primary/60 w-full sm:w-auto shadow-sm hover:shadow-md transition-all duration-300"
                            onClick={() => setIsModalOpen(false)}
                          >
                            {t("certifications.back")}
                          </Button>
                          
                          {filteredCertifications.length > 1 && (
                            <div className="flex justify-center space-x-1.5 mx-2 order-first sm:order-none w-full">
                              {filteredCertifications.map((_, index) => (
                                <button
                                  key={index}
                                  onClick={() => {
                                    setSelectedCertIndex(index);
                                    setSelectedCertification(filteredCertifications[index]);
                                  }}
                                  className={`h-2 transition-all duration-300 rounded-full ${
                                    selectedCertIndex === index 
                                      ? "w-6 sm:w-8 bg-primary shadow-sm" 
                                      : "w-2 bg-primary/30 hover:bg-primary/50"
                                  }`}
                                  aria-label={`Go to certificate ${index + 1}`}
                                />
                              ))}
                            </div>
                          )}
                          
                          <Button
                            className="rounded-full btn-premium w-full sm:w-auto shadow-md hover:shadow-lg transition-all duration-300"
                            onClick={() => {
                              viewPdf(selectedCertification.filename);
                              setIsModalOpen(false);
                            }}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            {t("certifications.openPdf")}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <div className="bg-card/30 backdrop-blur-md border border-card/20 p-5 rounded-lg mb-4 shadow-md hover:shadow-lg transition-all duration-300">
                          <h4 className="text-md font-semibold mb-4 border-b border-primary/10 pb-2 flex items-center">
                            <Tag className="h-4 w-4 mr-2 text-primary/80" />
                            {t("certifications.details")}
                          </h4>
                          <div className="space-y-4">
                            <div>
                              <div className="flex items-center mb-1">
                                <div className="w-1 h-1 rounded-full bg-primary mr-2"></div>
                                <p className="text-sm font-medium text-foreground/70">{t("certifications.issuedBy")}</p>
                              </div>
                              <p className="pl-3 font-medium text-primary">{selectedCertification.issuedBy}</p>
                            </div>
                            <div>
                              <div className="flex items-center mb-1">
                                <div className="w-1 h-1 rounded-full bg-primary mr-2"></div>
                                <p className="text-sm font-medium text-foreground/70">{t("certifications.date")}</p>
                              </div>
                              <p className="pl-3">{selectedCertification.date}</p>
                            </div>
                            <div>
                              <div className="flex items-center mb-1">
                                <div className="w-1 h-1 rounded-full bg-primary mr-2"></div>
                                <p className="text-sm font-medium text-foreground/70">{t("certifications.category")}</p>
                              </div>
                              <p className="pl-3">{selectedCertification.category}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-card/30 backdrop-blur-md border border-card/20 p-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
                          <h4 className="text-md font-semibold mb-4 border-b border-primary/10 pb-2 flex items-center">
                            <Star className="h-4 w-4 mr-2 text-primary/80" />
                            {t("certifications.expertise")}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedCertification.tags.map((tag) => (
                              <Badge 
                                key={tag} 
                                variant="outline" 
                                className="bg-primary/5 border-primary/20 text-foreground hover:bg-primary/10 transition-colors py-1.5 shadow-sm"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="mt-6 pt-4 border-t border-primary/10">
                            <h4 className="text-sm font-medium text-foreground/70 mb-2 flex items-center">
                              <BookOpen className="h-4 w-4 mr-2 text-primary/70" />
                              {t("certifications.quickLinks")}
                            </h4>
                            <div className="space-y-2">
                              <Button 
                                variant="ghost" 
                                className="w-full justify-start p-2 h-auto text-sm hover:bg-primary/5 group"
                                onClick={() => viewPdf(selectedCertification.filename)}
                              >
                                <FileText className="h-4 w-4 mr-2 text-primary group-hover:scale-110 transition-transform duration-300" />
                                {t("certifications.viewCertificate")}
                              </Button>
                            </div>
                          </div>
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
    </section>
  )
} 