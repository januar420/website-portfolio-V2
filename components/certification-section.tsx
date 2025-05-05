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
  GraduationCap,
  Book
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
import CertificationPdfViewer from "@/components/certification-pdf-viewer"

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

  // Dalam komponen CertificationSection, tambahkan function helper untuk mendapatkan URL PDF publik
  const getPdfPublicUrl = (filename: string): string => {
    // Mapping dari nama file asli ke path publik di /pdfs/certificates/
    const pdfMapping: Record<string, string> = {
      "Certified Network Security Practitioner (CNSP).pdf": "/pdfs/certificates/cnsp.pdf",
      "Januar Galuh Certified Network Security Practitioner (CNSP).pdf": "/pdfs/certificates/cnsp.pdf",
      "CC Certified in Cybersecurity (CC).pdf": "/pdfs/certificates/cc.pdf",
      "CC Course Conclusion & Final Assessment.pdf": "/pdfs/certificates/cc-conclusion.pdf",
      "CC Domain 5 Security Operations.pdf": "/pdfs/certificates/cc-domain5.pdf",
      "CC  Domain 4 Network Security.pdf": "/pdfs/certificates/cc-domain4.pdf",
      "CC Domain 4 Network Security.pdf": "/pdfs/certificates/cc-domain4.pdf",
      "CC Domain 3 Access Control Concepts.pdf": "/pdfs/certificates/cc-domain3.pdf",
      "CC Domain 2 Incident Response, Business Continuity And Disaster Recovery Concepts.pdf": "/pdfs/certificates/cc-domain2.pdf",
      "CC Domain 1 Security Principles.pdf": "/pdfs/certificates/cc-domain1.pdf",
    };
    
    // Tambahkan timestamp untuk mencegah cache
    const timestamp = Date.now();
    const publicPath = pdfMapping[filename] || `/pdfs/certificates/sample.pdf`;
    
    // Return path dengan timestamp untuk mencegah caching
    return `${publicPath}?t=${timestamp}`;
  }

  const viewPdf = (filename: string) => {
    try {
      // Dapatkan URL publik PDF
      const pdfUrl = getPdfPublicUrl(filename);
      console.log("Opening PDF:", pdfUrl);
      
      // Tutup dialog jika terbuka
      if (isDialogOpen) {
        setIsDialogOpen(false);
        setTimeout(() => {
          // Open PDF in a new tab
          const newWindow = window.open(pdfUrl, '_blank');
          if (!newWindow) {
            console.warn('Popup blocker mungkin mencegah pembukaan PDF');
            alert(t("certifications.popupBlockerWarning") || 'Popup blocker mungkin mencegah pembukaan PDF. Silakan izinkan popup untuk situs ini.');
          }
        }, 300);
      } else {
        // Open PDF in a new tab
        const newWindow = window.open(pdfUrl, '_blank');
        if (!newWindow) {
          console.warn('Popup blocker mungkin mencegah pembukaan PDF');
          alert(t("certifications.popupBlockerWarning") || 'Popup blocker mungkin mencegah pembukaan PDF. Silakan izinkan popup untuk situs ini.');
        }
      }
    } catch (error) {
      console.error('Error opening PDF file:', error);
      if (typeof window !== "undefined") {
        alert(t("certifications.pdfError") || 'Tidak dapat membuka file PDF. Silakan coba lagi.');
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
                              onClick={() => {
                                viewPdf(cert.filename);
                              }}
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

      {isModalOpen && selectedCertification && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent 
            className="max-w-4xl w-[95%] p-0 max-h-[90vh] flex flex-col overflow-hidden"
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault();
                console.log("Dialog escape key pressed");
                setIsDialogOpen(false);
              }
            }}
            onPointerDownOutside={(e) => {
              console.log("Dialog pointer down outside");
              e.preventDefault();
              setIsDialogOpen(false);
            }}
          >
            <motion.div
              className="flex flex-col h-full"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleSwipe}
            >
              <DialogHeader className="p-6 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-primary/20 p-2">
                      <Award className="w-5 h-5 text-primary" />
                    </div>
                    <DialogTitle className="text-xl font-bold">{selectedCertification.title}</DialogTitle>
                  </div>
                  
                  <div className="flex gap-1">
                    {filteredCertifications.length > 1 && (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation()
                            goToPrevCertificate()
                          }}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon" 
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation()
                            goToNextCertificate()
                          }}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <DialogDescription className="text-sm flex items-center mt-2">
                  <Calendar className="h-4 w-4 mr-1.5 text-muted-foreground" />
                  <span>{selectedCertification.date} | {selectedCertification.issuedBy}</span>
                </DialogDescription>
              </DialogHeader>
              
              <div className="p-4 md:p-6 pt-0 grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-auto">
                <div className="flex flex-col">
                  <div className="flex flex-col gap-4 flex-1">
                    <div className="relative rounded-lg border border-border overflow-hidden aspect-[4/3]">
                      <Image
                        src={selectedCertification.imageSrc}
                        alt={selectedCertification.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-background/5 backdrop-blur-[1px]"></div>
                      
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <h3 className="text-white font-medium text-sm">{selectedCertification.title}</h3>
                        <p className="text-white/80 text-xs">{selectedCertification.issuedBy}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold mb-2 flex items-center">
                        <Book className="h-5 w-5 mr-2 text-primary" />
                        {t("certifications.description")}
                      </h3>
                      <p className="text-muted-foreground">
                        {getLocalizedDescription(selectedCertification)}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold mb-2 flex items-center">
                        <Star className="h-5 w-5 mr-2 text-primary" />
                        {t("certifications.highlights")}
                      </h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {selectedCertification.highlights.map((highlight, index) => (
                          <li key={index}>{highlight}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mt-auto">
                      <h3 className="text-lg font-bold mb-2 flex items-center">
                        <Tag className="h-5 w-5 mr-2 text-primary" />
                        {t("certifications.tags")}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedCertification.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <Button 
                      className="flex-1 gap-1" 
                      onClick={() => viewPdf(selectedCertification.filename)}
                    >
                      <FileText className="h-4 w-4" />
                      {t("certifications.openPdf")}
                    </Button>
                  </div>
                </div>
                
                <div className="bg-muted rounded-lg p-4 flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full relative">
                    <CertificationPdfViewer 
                      pdfUrl={getPdfPublicUrl(selectedCertification.filename)}
                      isOpen={true}
                      onClose={() => {
                        console.log("PDF viewer closed from section");
                        setIsDialogOpen(false);
                      }}
                      title={selectedCertification.title}
                      issuedBy={selectedCertification.issuedBy}
                      date={selectedCertification.date}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </section>
  )
} 