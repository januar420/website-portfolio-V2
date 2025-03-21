"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { 
  Language, 
  TranslationKeys, 
  TranslationsType, 
  LanguageNames 
} from "@/types/translations"
import { mergeTranslations, additionalTranslations } from "@/utils/translations"

type LanguageContextType = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
  getAllLanguages: () => { code: Language; name: string }[]
  changeLanguage: (lang: Language) => void
  mounted: boolean
}

// Daftar nama bahasa untuk UI selector
const languageNames: LanguageNames = {
  en: "English",
  id: "Bahasa Indonesia",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  zh: "中文",
  ja: "日本語",
  ko: "한국어",
  ar: "العربية"
}

// Terjemahan dalam berbagai bahasa
const baseTranslations: TranslationsType = {
  en: {
    "hero.title": "IT & Cyber Security Enthusiast",
    "hero.subtitle": "Specialized in System Security, Linux Administration & Network Protection",
    "hero.cta": "Get Started",
    "services.title": "What I Do",
    "services.subtitle": "Specialized expertise and professional services",
    "services.uiux.title": "UI/UX Design",
    "services.uiux.description": "Crafting intuitive user interfaces and seamless user experiences for digital products.",
    "services.digitalMarketing.title": "Digital Marketing",
    "services.digitalMarketing.description": "Strategic marketing solutions to boost your online presence and reach.",
    "services.performance.title": "Performance Optimization",
    "services.performance.description": "Speed up your digital platforms for better user experience and SEO.",
    "services.security.title": "Cybersecurity",
    "services.security.description": "Implementing robust security measures to protect digital assets and sensitive information.",
    "portfolio.title": "My Portfolio",
    "portfolio.subtitle": "Pioneering advanced solutions at the convergence of IT, Linux systems, and cybersecurity architecture – where technical excellence meets visionary innovation and strategic growth",
    "portfolio.search": "Search projects...",
    "portfolio.filter.all": "All",
    "portfolio.viewDetails": "View Details",
    "portfolio.viewProject": "View Project",
    "portfolio.liveDemo": "Live Demo",
    "portfolio.projectOverview": "Project Overview",
    "portfolio.keyFeatures": "Key Features",
    "portfolio.projectDetails": "Project Details",
    "portfolio.client": "Client",
    "portfolio.date": "Date",
    "portfolio.technologies": "Technologies",
    "portfolio.resetFilters": "Reset Filters",
    "portfolio.noProjectsMatch": "No projects match your filters.",
    "portfolio.filterByTags": "Filter by tags",
    "portfolio.allTags": "All Tags",
    "portfolio.selectTagsToFilter": "Select tags to filter projects",
    "portfolio.clearFilters": "Clear filters",
    "portfolio.moreTags": "+{0} more",
    "certifications.title": "My Certifications",
    "certifications.subtitle": "Professional certificates and achievements in cybersecurity and related fields",
    "certifications.viewDetails": "View Details",
    "certifications.openPdf": "Open PDF",
    "certifications.description": "Description",
    "certifications.competencies": "Key Competencies",
    "certifications.competency1": "Understanding security principles and best practices",
    "certifications.competency2": "Identifying and mitigating security vulnerabilities",
    "certifications.competency3": "Implementing security controls and technologies",
    "certifications.competency4": "Responding to security incidents and threats",
    "certifications.details": "Certificate Details",
    "certifications.issuedBy": "Issued By",
    "certifications.date": "Issue Date",
    "certifications.category": "Category",
    "certifications.expertise": "Areas of Expertise",
    "certifications.searchPlaceholder": "Search certifications...",
    "certifications.all": "All",
    "certifications.noMatch": "No certifications match your filters",
    "certifications.resetFilters": "Reset Filters",
    "certifications.quickLinks": "Quick Links",
    "certifications.latest": "Latest Certificates",
    "certifications.popular": "Popular Certificates",
    "certifications.filterByTags": "Filter by tags",
    "certifications.allTags": "All Tags",
    "certifications.selectTagsToFilter": "Select tags to filter certifications",
    "certifications.clearFilters": "Clear filters",
    "certifications.moreTags": "+{0} more",
    "skills.title": "Skills Analysis",
    "skills.subtitle": "Comprehensive visualization of technical expertise and professional growth",
    "skills.chart.radarView": "Radar View",
    "skills.chart.barView": "Bar View",
    "skills.chart.progressView": "Progress View",
    "skills.linux": "Linux Admin",
    "skills.linux.description": "Installation, configuration, and management of Linux systems",
    "skills.security": "System Security",
    "skills.security.description": "Implementation of security measures and protocols",
    "skills.virtualization": "Virtualization",
    "skills.virtualization.description": "Setup and management of virtual environments",
    "skills.scripting": "Shell Scripting",
    "skills.scripting.description": "Automation of tasks through shell scripts",
    "skills.documentation": "Documentation",
    "skills.documentation.description": "Creation of comprehensive technical documentation",
    "skills.problemSolving": "Problem Solving",
    "skills.problemSolving.description": "Analytical approach to technical challenges",
    "skills.development.title": "Web Development",
    "skills.development.description": "Building responsive and interactive web applications using modern frameworks and technologies.",
    "skills.design.title": "Web Design",
    "skills.design.description": "Creating visually appealing and user-friendly interfaces with a focus on user experience.",
    "skills.consulting.title": "IT Consulting",
    "skills.consulting.description": "Providing expert advice on technology solutions, system architecture, and digital transformation.",
    "contact.title": "Get in Touch",
    "contact.subtitle": "Let's discuss how we can help your business grow",
    "contact.name": "Name",
    "contact.email": "Email",
    "contact.message": "Message",
    "contact.send": "Send Message",
    "contact.form.title": "Send Message",
    "contact.form.description": "Fill out the form below to send a message via email or WhatsApp.",
    "contact.form.name": "Name",
    "contact.form.namePlaceholder": "Your name",
    "contact.form.email": "Email",
    "contact.form.emailPlaceholder": "your.email@example.com",
    "contact.form.subject": "Subject",
    "contact.form.subjectPlaceholder": "Topic of your message",
    "contact.form.message": "Message",
    "contact.form.messagePlaceholder": "Write your message here...",
    "contact.form.sending": "Sending...",
    "contact.form.whatsapp": "Send via WhatsApp",
    "contact.form.emailBtn": "Send Directly",
    "contact.form.emailClient": "Email Client",
    "contact.form.success": "Email Sent Successfully",
    "contact.form.error": "Failed to Send Email",
    "nav.home": "Home",
    "nav.services": "Services",
    "nav.portfolio": "Portfolio",
    "nav.resume": "Resume",
    "nav.contact": "Contact",
    "nav.certifications": "Certifications",
    "language.selectLanguage": "Select Language",
    "certifications.viewCertificate": "View Certificate",
    "certifications.fileDetails": "File Information",
    "certifications.quickDetails": "Certificate Info",
    "certifications.close": "Close",
    "certifications.back": "Back"
  },
  id: {
    "hero.title": "Praktisi IT & Keamanan Siber",
    "hero.subtitle": "Spesialis Keamanan Sistem, Administrasi Linux & Proteksi Jaringan",
    "hero.cta": "Mulai Sekarang",
    "services.title": "Apa yang Saya Lakukan",
    "services.subtitle": "Keahlian khusus dan layanan profesional",
    "services.uiux.title": "Desain UI/UX",
    "services.uiux.description": "Merancang antarmuka pengguna yang intuitif dan pengalaman pengguna yang lancar untuk produk digital.",
    "services.digitalMarketing.title": "Pemasaran Digital",
    "services.digitalMarketing.description": "Solusi pemasaran strategis untuk meningkatkan kehadiran online dan jangkauan Anda.",
    "services.performance.title": "Optimalisasi Kinerja",
    "services.performance.description": "Percepat platform digital Anda untuk pengalaman pengguna dan SEO yang lebih baik.",
    "services.security.title": "Keamanan Siber",
    "services.security.description": "Menerapkan langkah-langkah keamanan yang kuat untuk melindungi aset digital dan informasi sensitif.",
    "portfolio.title": "Portofolio Saya",
    "portfolio.subtitle": "Mempelopori solusi canggih di pertemuan IT, sistem Linux, dan arsitektur keamanan siber – tempat keunggulan teknis bertemu dengan inovasi visioner dan pertumbuhan strategis",
    "portfolio.search": "Cari proyek...",
    "portfolio.filter.all": "Semua",
    "portfolio.viewDetails": "Lihat Detail",
    "portfolio.viewProject": "Lihat Proyek",
    "portfolio.liveDemo": "Demo Langsung",
    "portfolio.projectOverview": "Ikhtisar Proyek",
    "portfolio.keyFeatures": "Fitur Utama",
    "portfolio.projectDetails": "Detail Proyek",
    "portfolio.client": "Klien",
    "portfolio.date": "Tanggal",
    "portfolio.technologies": "Teknologi",
    "portfolio.resetFilters": "Reset Filter",
    "portfolio.noProjectsMatch": "Tidak ada proyek yang cocok dengan filter Anda.",
    "portfolio.filterByTags": "Filter berdasarkan tag",
    "portfolio.allTags": "Semua Tag",
    "portfolio.selectTagsToFilter": "Pilih tag untuk menyaring sertifikasi",
    "portfolio.clearFilters": "Hapus filter",
    "portfolio.moreTags": "+{0} lainnya",
    "certifications.title": "Sertifikasi Saya",
    "certifications.subtitle": "Sertifikat profesional dan pencapaian di bidang keamanan siber dan bidang terkait",
    "certifications.viewDetails": "Lihat Detail",
    "certifications.openPdf": "Buka PDF",
    "certifications.description": "Deskripsi",
    "certifications.competencies": "Kompetensi Utama",
    "certifications.competency1": "Memahami prinsip dan praktik terbaik keamanan",
    "certifications.competency2": "Mengidentifikasi dan memitigasi kerentanan keamanan",
    "certifications.competency3": "Mengimplementasikan kontrol dan teknologi keamanan",
    "certifications.competency4": "Menanggapi insiden dan ancaman keamanan",
    "certifications.details": "Detail Sertifikat",
    "certifications.issuedBy": "Dikeluarkan Oleh",
    "certifications.date": "Tanggal Penerbitan",
    "certifications.category": "Kategori",
    "certifications.expertise": "Bidang Keahlian",
    "certifications.searchPlaceholder": "Cari sertifikasi...",
    "certifications.all": "Semua",
    "certifications.noMatch": "Tidak ada sertifikasi yang sesuai dengan filter Anda",
    "certifications.resetFilters": "Reset Filter",
    "certifications.quickLinks": "Tautan Cepat",
    "certifications.latest": "Sertifikat Terbaru",
    "certifications.popular": "Sertifikat Populer",
    "certifications.filterByTags": "Filter berdasarkan tag",
    "certifications.allTags": "Semua Tag",
    "certifications.selectTagsToFilter": "Pilih tag untuk menyaring sertifikasi",
    "certifications.clearFilters": "Hapus filter",
    "certifications.moreTags": "+{0} more",
    "skills.title": "Analisis Keahlian",
    "skills.subtitle": "Visualisasi komprehensif dari keahlian teknis dan pertumbuhan profesional",
    "skills.chart.radarView": "Tampilan Radar",
    "skills.chart.barView": "Tampilan Batang",
    "skills.chart.progressView": "Tampilan Progres",
    "skills.linux": "Admin Linux",
    "skills.linux.description": "Instalasi, konfigurasi, dan manajemen sistem Linux",
    "skills.security": "Keamanan Sistem",
    "skills.security.description": "Implementasi langkah-langkah keamanan dan protokol",
    "skills.virtualization": "Virtualisasi",
    "skills.virtualization.description": "Penyiapan dan pengelolaan lingkungan virtual",
    "skills.scripting": "Shell Scripting",
    "skills.scripting.description": "Otomatisasi tugas melalui skrip shell",
    "skills.documentation": "Dokumentasi",
    "skills.documentation.description": "Pembuatan dokumentasi teknis yang komprehensif",
    "skills.problemSolving": "Pemecahan Masalah",
    "skills.problemSolving.description": "Pendekatan analitis untuk tantangan teknis",
    "skills.development.title": "Pengembangan Profesional",
    "skills.development.description": "Pembelajaran berkelanjutan dan peningkatan keterampilan melalui pelatihan khusus, pengalaman praktis, dan sertifikasi industri. Berkomitmen untuk tetap mengikuti teknologi dan praktik terbaik terbaru di bidang IT dan keamanan siber.",
    "contact.title": "Hubungi Kami",
    "contact.subtitle": "Mari diskusikan bagaimana kami dapat membantu bisnis Anda berkembang",
    "contact.name": "Nama",
    "contact.email": "Email",
    "contact.message": "Pesan",
    "contact.send": "Kirim Pesan",
    "contact.form.title": "Kirim Pesan",
    "contact.form.description": "Isi formulir di bawah ini untuk mengirim pesan via email atau WhatsApp.",
    "contact.form.name": "Nama",
    "contact.form.namePlaceholder": "Nama Anda",
    "contact.form.email": "Email",
    "contact.form.emailPlaceholder": "email@contoh.com",
    "contact.form.subject": "Subjek",
    "contact.form.subjectPlaceholder": "Topik pesan Anda",
    "contact.form.message": "Pesan",
    "contact.form.messagePlaceholder": "Tulis pesan Anda di sini...",
    "contact.form.sending": "Mengirim...",
    "contact.form.whatsapp": "Kirim via WhatsApp",
    "contact.form.emailBtn": "Kirim Langsung",
    "contact.form.emailClient": "Email Client",
    "contact.form.success": "Email Berhasil Terkirim",
    "contact.form.error": "Gagal Mengirim Email",
    "nav.home": "Beranda",
    "nav.services": "Layanan",
    "nav.portfolio": "Portofolio",
    "nav.resume": "Resume",
    "nav.contact": "Kontak",
    "nav.certifications": "Sertifikasi",
    "language.selectLanguage": "Pilih Bahasa",
    "certifications.viewCertificate": "Lihat Sertifikat",
    "certifications.fileDetails": "Informasi File",
    "certifications.quickDetails": "Info Sertifikat",
    "certifications.close": "Tutup",
    "certifications.back": "Kembali"
  },
  // Contoh terjemahan bahasa Spanyol (sebagian)
  es: {
    "hero.title": "Entusiasta de IT & Ciberseguridad",
    "hero.subtitle": "Especializado en Seguridad de Sistemas, Administración Linux y Protección de Redes",
    "hero.cta": "Comenzar",
    "services.title": "Mis Servicios",
    "services.subtitle": "Soluciones integrales adaptadas a sus necesidades",
    "services.uiux.title": "Diseño UI/UX",
    "services.uiux.description": "Experiencias de usuario intuitivas y atractivas que cautivan y convierten.",
    "services.digitalMarketing.title": "Marketing Digital",
    "services.digitalMarketing.description": "Soluciones estratégicas de marketing para impulsar su presencia y alcance en línea.",
    "services.performance.title": "Optimización de Rendimiento",
    "services.performance.description": "Acelere sus plataformas digitales para una mejor experiencia de usuario y SEO.",
    "services.security.title": "Soluciones de Seguridad",
    "services.security.description": "Proteja sus activos digitales con nuestras medidas de seguridad integrales.",
    "portfolio.title": "Mi Portafolio",
    "portfolio.subtitle": "Innovando soluciones avanzadas en la convergencia de IT, sistemas Linux y arquitectura de ciberseguridad - donde la excelencia técnica se encuentra con la innovación visionaria y el crecimiento estratégico",
    "portfolio.technologies": "Tecnologías",
    "skills.title": "Análisis de Habilidades",
    "skills.subtitle": "Visualización integral de experiencia técnica y crecimiento profesional",
    "skills.chart.radarView": "Vista Radar",
    "skills.chart.barView": "Vista de Barras",
    "skills.chart.progressView": "Vista de Progreso",
    "skills.linux": "Admin de Linux",
    "skills.linux.description": "Instalación, configuración y gestión de sistemas Linux",
    "skills.security": "Seguridad de Sistemas",
    "skills.security.description": "Implementación de medidas y protocolos de seguridad",
    "skills.virtualization": "Virtualización",
    "skills.virtualization.description": "Configuración y gestión de entornos virtuales",
    "skills.scripting": "Scripting Shell",
    "skills.scripting.description": "Automatización de tareas mediante scripts shell",
    "skills.documentation": "Documentación",
    "skills.documentation.description": "Creación de documentación técnica completa",
    "skills.problemSolving": "Resolución de Problemas",
    "skills.problemSolving.description": "Enfoque analítico para desafíos técnicos",
    "skills.development.title": "Desarrollo Profesional",
    "skills.development.description": "Aprendizaje continuo y mejora de habilidades a través de formación especializada, experiencia práctica y certificaciones de la industria. Comprometido a mantenerse actualizado con las tecnologías emergentes y las mejores prácticas en TI y ciberseguridad.",
    "nav.home": "Inicio",
    "nav.services": "Servicios",
    "nav.portfolio": "Portafolio",
    "nav.resume": "Currículum",
    "nav.contact": "Contacto",
    "language.selectLanguage": "Seleccionar Idioma"
  }
  // Dapat ditambahkan bahasa lain di sini
}

// Gabungkan terjemahan dari berbagai sumber
const translations: TranslationsType = mergeTranslations(baseTranslations, additionalTranslations)

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Menyimpan preferensi bahasa di localStorage
  const [language, setLanguage] = useState<Language>("en")
  const [mounted, setMounted] = useState(false)

  // Set mounted state setelah hydration dan ambil preferensi bahasa dari localStorage
  useEffect(() => {
    setMounted(true)
    
    // Ambil preferensi bahasa dari localStorage jika ada
    const savedLanguage = localStorage.getItem("selectedLanguage") as Language
    if (savedLanguage && Object.keys(translations).includes(savedLanguage)) {
      setLanguage(savedLanguage)
    } else {
      // Deteksi bahasa browser sebagai fallback
      const browserLanguage = navigator.language.split('-')[0] as Language
      if (Object.keys(translations).includes(browserLanguage)) {
        setLanguage(browserLanguage)
      }
    }
  }, [])

  // Fungsi untuk mengganti bahasa dan menyimpannya ke localStorage
  const changeLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("selectedLanguage", lang)
  }

  // Fungsi untuk mendapatkan daftar semua bahasa yang tersedia
  const getAllLanguages = () => {
    return Object.keys(translations).map((code) => ({
      code: code as Language,
      name: languageNames[code as Language] || code
    }))
  }

  // Fungsi untuk menerjemahkan teks dengan fallback yang lebih baik
  const t = (key: string) => {
    // Cek apakah kunci ada di terjemahan bahasa yang dipilih
    if (translations[language]?.[key as TranslationKeys]) {
      return translations[language]![key as TranslationKeys]!
    }
    
    // Fallback ke bahasa Inggris jika tidak ditemukan
    if (translations.en?.[key as TranslationKeys]) {
      return translations.en[key as TranslationKeys]!
    }
    
    // Jika tidak ditemukan sama sekali, kembalikan kunci asli
    return key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, mounted, getAllLanguages, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

